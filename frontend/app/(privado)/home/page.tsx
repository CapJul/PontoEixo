'use client';

import React, { Suspense, useState } from 'react';
import dynamic from 'next/dynamic';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Text } from '@react-three/drei';
import * as THREE from 'three';

import AvisoErro from '@/componentes/AvisoErro';
import FormularioImovel from '@/componentes/FormularioImovel';
import LimiteDeErro from '@/componentes/LimiteDeErro';
import MenuLateral from '@/componentes/MenuLateral';
import { mensagemDeErro } from '@/lib/api';
import { formatarReais } from '@/lib/formatacao';
import { useDadosApi } from '@/lib/useDadosApi';
import {
  CORES_STATUS,
  ESCALA_PADRAO,
  ROTULOS_STATUS,
  atualizarImovel,
  criarImovel,
  listarImoveis,
  paraEntrada,
  posicaoNaGrade,
  proximaPosicaoLivre,
  removerImovel,
  type Imovel,
  type ImovelEntrada,
  type StatusImovel,
  type TipoImovel,
  type Vetor3D,
} from '@/lib/imoveis';

// O Leaflet usa o `window`, então o mapa só é carregado no navegador
const MapaImoveis = dynamic(() => import('@/componentes/MapaImoveis'), {
  ssr: false,
  loading: () => <div className="flex-1 flex items-center justify-center text-sm text-slate-500">Carregando mapa...</div>,
});

// ---------------------------------------------------------
// COMPONENTES 3D
// ---------------------------------------------------------
function ModeloPontoComercial({ cor, escala }: { cor: string, escala: Vetor3D }) {
  return (
    <group scale={escala}>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={cor} />
      </mesh>
      <mesh position={[0, 1.05, 0.2]}>
        <boxGeometry args={[1.1, 0.1, 1.2]} />
        <meshStandardMaterial color={cor} />
      </mesh>
      <mesh position={[0, 0.4, 0.51]}>
        <boxGeometry args={[0.5, 0.8, 0.05]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.5} roughness={0.2} />
      </mesh>
    </group>
  );
}

function ModeloCasa({ cor, escala }: { cor: string, escala: Vetor3D }) {
  return (
    <group scale={escala}>
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[1, 0.8, 1]} />
        <meshStandardMaterial color={cor} />
      </mesh>
      <mesh position={[0, 1.05, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[0.8, 0.5, 4]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      <mesh position={[0, 0.3, 0.51]}>
        <boxGeometry args={[0.3, 0.6, 0.05]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
    </group>
  );
}

function ModeloBloco({ cor, escala }: { cor: string, escala: Vetor3D }) {
  return (
    <mesh position={[0, escala[1] / 2, 0]}>
      <boxGeometry args={escala} />
      <meshStandardMaterial color={cor} />
    </mesh>
  );
}

function Predio({ imovel, posicao, selecionado, aoSelecionar }: { imovel: Imovel, posicao: Vetor3D, selecionado: boolean, aoSelecionar: () => void }) {
  const [hovered, setHovered] = useState(false);

  const escala = imovel.escala_3d ?? ESCALA_PADRAO[imovel.tipo];
  const corBase = CORES_STATUS[imovel.status];
  const cor = hovered ? new THREE.Color(corBase).lerp(new THREE.Color('white'), 0.2).getStyle() : corBase;
  const scaleMultiplier = selecionado ? 1.1 : hovered ? 1.05 : 1;

  return (
    <group
      position={posicao}
      onClick={(e) => { e.stopPropagation(); aoSelecionar(); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
      scale={scaleMultiplier}
    >
      {imovel.tipo === 'ponto' && <ModeloPontoComercial cor={cor} escala={escala} />}
      {imovel.tipo === 'casa' && <ModeloCasa cor={cor} escala={escala} />}
      {imovel.tipo === 'bloco' && <ModeloBloco cor={cor} escala={escala} />}

      {(hovered || selecionado) && (
        // O Text baixa a fonte da internet; se falhar, o nome só não aparece no 3D
        <LimiteDeErro><Suspense fallback={null}><Text position={[0, escala[1] + 1.2, 0]} fontSize={0.35} color="#0f172a" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#ffffff">
          {imovel.nome}
        </Text></Suspense></LimiteDeErro>
      )}
    </group>
  );
}

// Formulário aberto: novo imóvel (com local opcional vindo do mapa) ou edição
type EstadoFormulario =
  | { modo: 'novo'; local?: { latitude: number; longitude: number } }
  | { modo: 'editar'; imovel: Imovel }
  | null;

// ---------------------------------------------------------
// ECRÃ PRINCIPAL
// ---------------------------------------------------------
export default function PontoEixoDashboard() {
  const [visaoAtual, setVisaoAtual] = useState<'3d' | 'mapa'>('3d'); // ESTADO DA VISÃO (3D vs MAPA)
  const { dados: imoveis, setDados: setImoveis, carregando, erro: erroCarregamento } = useDadosApi(listarImoveis, [] as Imovel[]);
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const [idSelecionado, setIdSelecionado] = useState<number | null>(null);
  const [formulario, setFormulario] = useState<EstadoFormulario>(null);
  const erro = erroAcao ?? erroCarregamento;

  const imovelAtivo = imoveis.find(i => i.id === idSelecionado);

  // Posição no 3D: a salva no imóvel ou, se não houver, a de uma grade automática
  const posicaoDe = (imovel: Imovel, indice: number): Vetor3D => imovel.posicao_3d ?? posicaoNaGrade(indice);

  const substituirNaLista = (imovel: Imovel) =>
    setImoveis(prev => prev.map(i => (i.id === imovel.id ? imovel : i)));

  // Alterações rápidas do painel lateral (formato e status) já são salvas na API
  const alterarRapido = async (imovel: Imovel, indice: number, novosDados: { tipo?: TipoImovel; status?: StatusImovel }) => {
    const dados: ImovelEntrada = { ...paraEntrada(imovel), ...novosDados, posicao_3d: posicaoDe(imovel, indice) };
    if (novosDados.tipo) dados.escala_3d = ESCALA_PADRAO[novosDados.tipo];
    substituirNaLista({ ...imovel, ...dados }); // resposta imediata na tela
    try {
      substituirNaLista(await atualizarImovel(imovel.id, dados));
      setErroAcao(null);
    } catch (falha) {
      substituirNaLista(imovel); // desfaz se a API recusar
      setErroAcao(mensagemDeErro(falha));
    }
  };

  const salvarFormulario = async (dados: ImovelEntrada) => {
    if (formulario?.modo === 'editar') {
      substituirNaLista(await atualizarImovel(formulario.imovel.id, dados));
    } else {
      const novo = await criarImovel(dados);
      setImoveis(prev => [...prev, novo].sort((a, b) => a.nome.localeCompare(b.nome)));
      setIdSelecionado(novo.id);
    }
    setFormulario(null);
  };

  const excluirImovel = async (imovel: Imovel) => {
    await removerImovel(imovel.id);
    setImoveis(prev => prev.filter(i => i.id !== imovel.id));
    setIdSelecionado(null);
    setFormulario(null);
  };

  const indiceAtivo = imovelAtivo ? imoveis.indexOf(imovelAtivo) : -1;

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans text-slate-800">
      <MenuLateral />

      <main className="flex-1 relative flex flex-col bg-[#E8F0FE] overflow-hidden">

        {/* CABEÇALHO COM BOTÕES DE ALTERNÂNCIA (TOGGLE) E LEGENDA */}
        <header className="absolute top-0 left-0 right-0 p-8 z-[1000] flex flex-wrap gap-4 justify-between items-start pointer-events-none">
          <div className="flex flex-col items-start gap-3">
            <h2 className="text-3xl font-semibold text-slate-900 drop-shadow-sm bg-white/80 backdrop-blur-sm px-3 py-1 rounded-lg inline-block">
              Visão Panorâmica
            </h2>

            <div className="flex flex-wrap gap-3 pointer-events-auto">
              {/* Toggle de Visão */}
              <div className="bg-white/90 backdrop-blur-md p-1 rounded-lg inline-flex shadow-sm border border-slate-200">
                <button
                  onClick={() => setVisaoAtual('3d')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${visaoAtual === '3d' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  Planta 3D
                </button>
                <button
                  onClick={() => setVisaoAtual('mapa')}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${visaoAtual === 'mapa' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  Mapa Geográfico
                </button>
              </div>
              <button
                onClick={() => setFormulario({ modo: 'novo' })}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
              >
                + Novo imóvel
              </button>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-md px-4 py-3 rounded-xl border border-slate-200 shadow-sm pointer-events-auto flex gap-4 text-sm font-medium">
            {(Object.keys(CORES_STATUS) as StatusImovel[]).map((status) => (
              <div key={status} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CORES_STATUS[status] }}></div>
                {ROTULOS_STATUS[status]}
              </div>
            ))}
          </div>
        </header>

        {(erro || carregando || imoveis.length === 0) && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-md px-4">
            {erro ? (
              <AvisoErro mensagem={erro} />
            ) : (
              <div className="bg-white/95 rounded-xl border border-slate-200 shadow-sm px-4 py-3 text-sm text-slate-600 text-center">
                {carregando ? 'Carregando imóveis...' : 'Nenhum imóvel cadastrado ainda. Use "+ Novo imóvel" para começar.'}
              </div>
            )}
          </div>
        )}

        {/* ========================================== */}
        {/* VISÃO 1: CANVAS 3D                         */}
        {/* ========================================== */}
        {visaoAtual === '3d' && (
          <>
            {imovelAtivo && (
              <div className="absolute right-8 top-32 z-30 w-80 bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-slate-200 transition-all">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-lg font-bold text-slate-800">{imovelAtivo.nome}</h3>
                  <button onClick={() => setIdSelecionado(null)} aria-label="Fechar" className="text-slate-400 hover:text-slate-700">✕</button>
                </div>
                <p className="text-sm text-slate-500 mb-4">{formatarReais(imovelAtivo.valor_aluguel)}/mês</p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Formato do Edifício</label>
                    <div className="grid grid-cols-3 gap-2">
                      {([['ponto', 'Ponto'], ['casa', 'Casa'], ['bloco', 'Galpão']] as [TipoImovel, string][]).map(([tipo, rotulo]) => (
                        <button
                          key={tipo}
                          onClick={() => alterarRapido(imovelAtivo, indiceAtivo, { tipo })}
                          className={`py-2 text-xs font-semibold rounded-md border ${imovelAtivo.tipo === tipo ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-600'}`}
                        >
                          {rotulo}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Status / Cor da Fachada</label>
                    <div className="flex gap-2">
                      {(Object.keys(CORES_STATUS) as StatusImovel[]).map((status) => (
                        <button
                          key={status}
                          title={ROTULOS_STATUS[status]}
                          aria-label={ROTULOS_STATUS[status]}
                          onClick={() => alterarRapido(imovelAtivo, indiceAtivo, { status })}
                          className={`w-8 h-8 rounded-full border-2 ${imovelAtivo.status === status ? 'border-slate-800 scale-110' : 'border-transparent'}`}
                          style={{ backgroundColor: CORES_STATUS[status] }}
                        />
                      ))}
                    </div>
                  </div>
                  <hr className="border-slate-200" />
                  <button onClick={() => setFormulario({ modo: 'editar', imovel: imovelAtivo })} className="w-full bg-blue-600 text-white font-medium py-2 rounded-md hover:bg-blue-700 transition-colors">
                    Editar dados do imóvel
                  </button>
                </div>
              </div>
            )}

            <div className="flex-1 w-full cursor-grab active:cursor-grabbing z-0" onClick={() => setIdSelecionado(null)}>
              <Canvas camera={{ position: [0, 8, 12], fov: 50 }} shadows>
                <ambientLight intensity={0.6} />
                <directionalLight position={[10, 15, 10]} intensity={1.2} castShadow />
                {/* A iluminação "city" baixa uma textura da internet; sem ela, a cena continua com as luzes acima */}
                <LimiteDeErro>
                  <Suspense fallback={null}>
                    <Environment preset="city" />
                  </Suspense>
                </LimiteDeErro>
                {imoveis.map((imovel, indice) => (
                  <Predio key={imovel.id} imovel={imovel} posicao={posicaoDe(imovel, indice)} selecionado={idSelecionado === imovel.id} aoSelecionar={() => setIdSelecionado(imovel.id)} />
                ))}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} onClick={(e) => { e.stopPropagation(); setIdSelecionado(null); }}>
                  <planeGeometry args={[30, 30]} />
                  <meshStandardMaterial color="#cbd5e1" />
                </mesh>
                <ContactShadows resolution={512} scale={30} blur={2.5} opacity={0.6} far={10} color="#0f172a" />
                <OrbitControls makeDefault minPolarAngle={Math.PI / 6} maxPolarAngle={Math.PI / 2.1} minDistance={5} maxDistance={25} />
              </Canvas>
            </div>
          </>
        )}

        {/* ========================================== */}
        {/* VISÃO 2: MAPA GEOGRÁFICO (OPENSTREETMAP)   */}
        {/* ========================================== */}
        {visaoAtual === 'mapa' && (
          <div className="flex-1 w-full z-0 flex">
            <MapaImoveis
              imoveis={imoveis}
              aoEditar={(imovel) => setFormulario({ modo: 'editar', imovel })}
              aoClicarNoMapa={(latitude, longitude) => setFormulario({ modo: 'novo', local: { latitude, longitude } })}
            />
          </div>
        )}

      </main>

      {formulario && (
        <FormularioImovel
          key={formulario.modo === 'editar' ? formulario.imovel.id : 'novo'}
          imovel={formulario.modo === 'editar' ? formulario.imovel : undefined}
          localSugerido={formulario.modo === 'novo' ? formulario.local : undefined}
          posicaoNova={proximaPosicaoLivre(imoveis.map(posicaoDe))}
          aoSalvar={salvarFormulario}
          aoExcluir={formulario.modo === 'editar' ? () => excluirImovel(formulario.imovel) : undefined}
          aoFechar={() => setFormulario(null)}
        />
      )}
    </div>
  );
}
