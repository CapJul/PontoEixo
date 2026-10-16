'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Text } from '@react-three/drei';
import MenuLateral from '@/componentes/MenuLateral';
import * as THREE from 'three';

// Importação do CSS do Leaflet para o mapa geográfico
import 'leaflet/dist/leaflet.css';

// ---------------------------------------------------------
// TIPAGENS E DADOS MOCKADOS UNIFICADOS
// ---------------------------------------------------------
type TipoConstrucao = 'ponto' | 'casa' | 'bloco';

interface Imovel {
  id: string;
  nome: string;
  status: string;
  cor: string;
  pos: [number, number, number]; // Posição no 3D
  escala: [number, number, number]; // Tamanho no 3D
  tipo: TipoConstrucao; // Formato no 3D
  latitude: number; // Posição no Mapa Geográfico
  longitude: number; // Posição no Mapa Geográfico
  valor: string; // Valor para o popup do Mapa Geográfico
}

// Estado inicial unindo 3D e Mapa Geográfico
const propriedadesIniciais: Imovel[] = [
  { id: 'padaria', nome: 'Padaria Doce Vida', status: 'alugado', cor: '#3b82f6', pos: [-3, 0, -2], escala: [1.5, 1.2, 1.5], tipo: 'ponto', latitude: -2.5564, longitude: -44.0537, valor: 'R$ 8.500/mês' },
  { id: 'salao', nome: 'Salão de Beleza Estrela', status: 'disponivel', cor: '#ef4444', pos: [0, 0, -2], escala: [1.5, 1.2, 1.5], tipo: 'ponto', latitude: -2.5600, longitude: -44.0600, valor: 'R$ 4.200/mês' },
  { id: 'rouparia', nome: 'Rouparia Alana', status: 'manutencao', cor: '#f59e0b', pos: [3, 0, -2], escala: [1.2, 1.2, 1.2], tipo: 'casa', latitude: -2.5400, longitude: -44.0450, valor: 'R$ 2.100/mês' },
  { id: 'loja', nome: 'Loja Centro', status: 'alugado', cor: '#3b82f6', pos: [6, 0, -2], escala: [1.2, 1.2, 1.2], tipo: 'ponto', latitude: -2.5350, longitude: -44.0400, valor: 'R$ 3.000/mês' },
  { id: 'galpao', nome: 'Galpão Tech', status: 'alugado', cor: '#3b82f6', pos: [0, 0, 2], escala: [4, 1.5, 2.5], tipo: 'bloco', latitude: -2.5297, longitude: -44.3028, valor: 'R$ 15.000/mês' },
];

// ---------------------------------------------------------
// COMPONENTES 3D
// ---------------------------------------------------------
function ModeloPontoComercial({ cor, escala }: { cor: string, escala: [number, number, number] }) {
  return (
    <group scale={escala as any}>
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

function ModeloCasa({ cor, escala }: { cor: string, escala: [number, number, number] }) {
  return (
    <group scale={escala as any}>
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

function ModeloBloco({ cor, escala }: { cor: string, escala: [number, number, number] }) {
  return (
    <mesh position={[0, escala[1] / 2, 0]}>
      <boxGeometry args={escala as any} />
      <meshStandardMaterial color={cor} />
    </mesh>
  );
}

function Predio({ imovel, selecionado, aoSelecionar }: { imovel: Imovel, selecionado: boolean, aoSelecionar: () => void }) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);

  const scaleMultiplier = selecionado ? 1.1 : hovered ? 1.05 : 1;
  const hoverColor = new THREE.Color(imovel.cor).lerp(new THREE.Color('white'), 0.2);

  return (
    <group 
      position={imovel.pos as any} 
      onClick={(e) => { e.stopPropagation(); aoSelecionar(); }}
      onDoubleClick={() => router.push(`/pontos/${imovel.id}`)}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
      scale={scaleMultiplier}
    >
      {imovel.tipo === 'ponto' && <ModeloPontoComercial cor={hovered ? hoverColor.getStyle() : imovel.cor} escala={imovel.escala} />}
      {imovel.tipo === 'casa' && <ModeloCasa cor={hovered ? hoverColor.getStyle() : imovel.cor} escala={imovel.escala} />}
      {imovel.tipo === 'bloco' && <ModeloBloco cor={hovered ? hoverColor.getStyle() : imovel.cor} escala={imovel.escala} />}

      {(hovered || selecionado) && (
        <Text position={[0, imovel.escala[1] + 1.2, 0]} fontSize={0.35} color="#0f172a" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#ffffff">
          {imovel.nome}
        </Text>
      )}
    </group>
  );
}

// ---------------------------------------------------------
// ECRÃ PRINCIPAL
// ---------------------------------------------------------
export default function PontoEixoDashboard() {
  const router = useRouter();
  const [visaoAtual, setVisaoAtual] = useState<'3d' | 'mapa'>('3d'); // ESTADO DA VISÃO (3D vs MAPA)
  const [imoveis, setImoveis] = useState<Imovel[]>(propriedadesIniciais);
  const [idSelecionado, setIdSelecionado] = useState<string | null>(null);
  
  // Estados para o Mapa Geográfico
  const [isMounted, setIsMounted] = useState(false);
  const [popupInfo, setPopupInfo] = useState<Imovel | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const imovelAtivo = imoveis.find(i => i.id === idSelecionado);
  const atualizarImovel = (id: string, novosDados: Partial<Imovel>) => {
    setImoveis(prev => prev.map(imovel => imovel.id === id ? { ...imovel, ...novosDados } : imovel));
  };

  // Importação dinâmica do Leaflet (Para não dar erro no Next.js)
  let MapContainer: any, TileLayer: any, Marker: any, Popup: any, L: any;
  if (isMounted) {
    const reactLeaflet = require('react-leaflet');
    MapContainer = reactLeaflet.MapContainer;
    TileLayer = reactLeaflet.TileLayer;
    Marker = reactLeaflet.Marker;
    Popup = reactLeaflet.Popup;
    L = require('leaflet');
  }

  const criarIconeLeaflet = (cor: string) => {
    if (!L) return null;
    return L.divIcon({
      className: 'custom-icon',
      html: `<div style="background-color: ${cor}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.4); transition: transform 0.2s;"></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  if (!isMounted) return <div className="min-h-screen bg-slate-50" />; // Evita hydration error

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans text-slate-800">
      <MenuLateral />

      <main className="flex-1 relative flex flex-col bg-[#E8F0FE] overflow-hidden">
        
        {/* CABEÇALHO COM BOTÕES DE ALTERNÂNCIA (TOGGLE) E LEGENDA */}
        <header className="absolute top-0 left-0 right-0 p-8 z-[1000] flex justify-between items-start pointer-events-none">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900 drop-shadow-sm bg-white/80 backdrop-blur-sm px-3 py-1 rounded-lg inline-block">
              Visão Panorâmica
            </h2>
            
            {/* Toggle de Visão */}
            <div className="translate-y-12 -translate-x-70 bg-white/90 backdrop-blur-md p-1 rounded-lg inline-flex shadow-sm pointer-events-auto border border-slate-200">
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
          </div>
          
          <div className="bg-white/90 backdrop-blur-md px-4 py-3 rounded-xl border border-slate-200 shadow-sm pointer-events-auto flex gap-4 text-sm font-medium">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div>Alugado</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div>Disponível</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"></div>Manutenção</div>
          </div>
        </header>

        {/* ========================================== */}
        {/* VISÃO 1: CANVAS 3D                         */}
        {/* ========================================== */}
        {visaoAtual === '3d' && (
          <>
            {imovelAtivo && (
              <div className="absolute right-8 top-32 z-30 w-80 bg-white/95 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-slate-200 transition-all">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-slate-800">{imovelAtivo.nome}</h3>
                  <button onClick={() => setIdSelecionado(null)} className="text-slate-400 hover:text-slate-700">✕</button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Formato do Edifício</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button onClick={() => atualizarImovel(imovelAtivo.id, { tipo: 'ponto' })} className={`py-2 text-xs font-semibold rounded-md border ${imovelAtivo.tipo === 'ponto' ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-600'}`}>Ponto</button>
                      <button onClick={() => atualizarImovel(imovelAtivo.id, { tipo: 'casa' })} className={`py-2 text-xs font-semibold rounded-md border ${imovelAtivo.tipo === 'casa' ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-600'}`}>Casa</button>
                      <button onClick={() => atualizarImovel(imovelAtivo.id, { tipo: 'bloco' })} className={`py-2 text-xs font-semibold rounded-md border ${imovelAtivo.tipo === 'bloco' ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-600'}`}>Galpão</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Status / Cor da Fachada</label>
                    <div className="flex gap-2">
                      <button onClick={() => atualizarImovel(imovelAtivo.id, { cor: '#3b82f6', status: 'alugado' })} className={`w-8 h-8 rounded-full border-2 ${imovelAtivo.cor === '#3b82f6' ? 'border-slate-800 scale-110' : 'border-transparent'}`} style={{ backgroundColor: '#3b82f6' }} />
                      <button onClick={() => atualizarImovel(imovelAtivo.id, { cor: '#ef4444', status: 'disponivel' })} className={`w-8 h-8 rounded-full border-2 ${imovelAtivo.cor === '#ef4444' ? 'border-slate-800 scale-110' : 'border-transparent'}`} style={{ backgroundColor: '#ef4444' }} />
                      <button onClick={() => atualizarImovel(imovelAtivo.id, { cor: '#f59e0b', status: 'manutencao' })} className={`w-8 h-8 rounded-full border-2 ${imovelAtivo.cor === '#f59e0b' ? 'border-slate-800 scale-110' : 'border-transparent'}`} style={{ backgroundColor: '#f59e0b' }} />
                    </div>
                  </div>
                  <hr className="border-slate-200" />
                  <button onClick={() => router.push(`/pontos/${imovelAtivo.id}`)} className="w-full bg-blue-600 text-white font-medium py-2 rounded-md hover:bg-blue-700 transition-colors">
                    Abrir Detalhes do Imóvel
                  </button>
                </div>
              </div>
            )}

            <div className="flex-1 w-full cursor-grab active:cursor-grabbing z-0" onClick={() => setIdSelecionado(null)}>
              <Canvas camera={{ position: [0, 8, 12], fov: 50 }} shadows>
                <ambientLight intensity={0.6} />
                <directionalLight position={[10, 15, 10]} intensity={1.2} castShadow />
                <Environment preset="city" />
                {imoveis.map((imovel) => (
                  <Predio key={imovel.id} imovel={imovel} selecionado={idSelecionado === imovel.id} aoSelecionar={() => setIdSelecionado(imovel.id)} />
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
        {visaoAtual === 'mapa' && MapContainer && (
          <div className="flex-1 w-full z-0">
            <MapContainer center={[-2.5400, -44.1800]} zoom={11} style={{ width: '100%', height: '100%' }} zoomControl={false}>
              <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {imoveis.map((imovel) => (
                <Marker key={imovel.id} position={[imovel.latitude, imovel.longitude]} icon={criarIconeLeaflet(imovel.cor)} eventHandlers={{ click: () => setPopupInfo(imovel), dblclick: () => router.push(`/pontos/${imovel.id}`) }} />
              ))}
              {popupInfo && (
                <Popup position={[popupInfo.latitude, popupInfo.longitude]} onClose={() => setPopupInfo(null)} offset={[0, -10]}>
                  <div className="min-w-[180px] p-1">
                    <h3 className="font-bold text-slate-900 text-lg m-0">{popupInfo.nome}</h3>
                    <p className="text-slate-500 text-xs mb-3 mt-1 uppercase">{popupInfo.tipo}</p>
                    <div className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-200 mb-3">
                      <span className="text-xs font-semibold text-slate-500 uppercase">Valor</span>
                      <span className="font-bold text-slate-800">{popupInfo.valor}</span>
                    </div>
                    <button onClick={() => router.push(`/pontos/${popupInfo.id}`)} className="w-full bg-blue-600 text-white text-sm font-medium py-2 rounded hover:bg-blue-700 transition-colors">
                      Abrir Detalhes
                    </button>
                  </div>
                </Popup>
              )}
            </MapContainer>
          </div>
        )}

      </main>
    </div>
  );
}