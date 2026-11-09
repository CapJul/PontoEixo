'use client';

import { useState, type FormEvent } from 'react';

import AvisoErro from '@/componentes/AvisoErro';
import { mensagemDeErro } from '@/lib/api';
import {
  ESCALA_PADRAO,
  ROTULOS_STATUS,
  ROTULOS_TIPO,
  type Imovel,
  type ImovelEntrada,
  type StatusImovel,
  type TipoImovel,
  type Vetor3D,
} from '@/lib/imoveis';

const CLASSE_CAMPO =
  'w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400';
const CLASSE_ROTULO = 'block text-sm font-medium text-slate-700 mb-1';

interface Props {
  /** Imóvel em edição; ausente para cadastrar um novo. */
  imovel?: Imovel;
  /** Posição sugerida no mapa (novo imóvel criado a partir de um clique). */
  localSugerido?: { latitude: number; longitude: number };
  /** Posição no 3D para um imóvel novo. */
  posicaoNova: Vetor3D;
  aoSalvar: (dados: ImovelEntrada) => Promise<void>;
  aoExcluir?: () => Promise<void>;
  aoFechar: () => void;
}

export default function FormularioImovel({
  imovel,
  localSugerido,
  posicaoNova,
  aoSalvar,
  aoExcluir,
  aoFechar,
}: Props) {
  const [campos, setCampos] = useState({
    nome: imovel?.nome ?? '',
    tipo: imovel?.tipo ?? ('ponto' as TipoImovel),
    status: imovel?.status ?? ('disponivel' as StatusImovel),
    valor_aluguel: imovel ? String(imovel.valor_aluguel) : '',
    endereco: imovel?.endereco ?? '',
    latitude: String(imovel?.latitude ?? localSugerido?.latitude ?? -2.53),
    longitude: String(imovel?.longitude ?? localSugerido?.longitude ?? -44.3),
  });
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const alterar = (campo: keyof typeof campos, valor: string) =>
    setCampos((atual) => ({ ...atual, [campo]: valor }));

  const executar = async (acao: () => Promise<void>) => {
    setErro(null);
    setEnviando(true);
    try {
      await acao();
    } catch (falha) {
      setErro(mensagemDeErro(falha));
      setEnviando(false);
    }
  };

  const salvar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const tipoMudou = imovel && imovel.tipo !== campos.tipo;
    return executar(() =>
      aoSalvar({
        nome: campos.nome,
        tipo: campos.tipo,
        status: campos.status,
        valor_aluguel: Number(campos.valor_aluguel.replace(',', '.')),
        endereco: campos.endereco.trim() || null,
        latitude: Number(campos.latitude),
        longitude: Number(campos.longitude),
        posicao_3d: imovel?.posicao_3d ?? posicaoNova,
        // Ao trocar o formato, o tamanho volta ao padrão do novo formato
        escala_3d: !imovel || tipoMudou ? ESCALA_PADRAO[campos.tipo] : imovel.escala_3d,
      }),
    );
  };

  const excluir = () => {
    if (!aoExcluir || !imovel) return;
    if (!window.confirm(`Excluir o imóvel "${imovel.nome}"? Esta ação não pode ser desfeita.`)) return;
    return executar(aoExcluir);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden max-h-full flex flex-col">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-semibold text-slate-900">{imovel ? 'Editar imóvel' : 'Novo imóvel'}</h3>
          <button onClick={aoFechar} aria-label="Fechar" className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>

        <form onSubmit={salvar} className="p-6 space-y-4 overflow-y-auto">
          <AvisoErro mensagem={erro} />

          <div>
            <label htmlFor="imovel-nome" className={CLASSE_ROTULO}>Nome</label>
            <input
              id="imovel-nome"
              required
              minLength={2}
              maxLength={150}
              value={campos.nome}
              onChange={(e) => alterar('nome', e.target.value)}
              className={CLASSE_CAMPO}
              placeholder="Ex.: Padaria Doce Vida"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="imovel-tipo" className={CLASSE_ROTULO}>Formato</label>
              <select
                id="imovel-tipo"
                value={campos.tipo}
                onChange={(e) => alterar('tipo', e.target.value)}
                className={CLASSE_CAMPO}
              >
                {Object.entries(ROTULOS_TIPO).map(([valor, rotulo]) => (
                  <option key={valor} value={valor}>{rotulo}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="imovel-status" className={CLASSE_ROTULO}>Status</label>
              <select
                id="imovel-status"
                value={campos.status}
                onChange={(e) => alterar('status', e.target.value)}
                className={CLASSE_CAMPO}
              >
                {Object.entries(ROTULOS_STATUS).map(([valor, rotulo]) => (
                  <option key={valor} value={valor}>{rotulo}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="imovel-valor" className={CLASSE_ROTULO}>Aluguel mensal (R$)</label>
            <input
              id="imovel-valor"
              required
              type="number"
              min="0"
              step="0.01"
              value={campos.valor_aluguel}
              onChange={(e) => alterar('valor_aluguel', e.target.value)}
              className={CLASSE_CAMPO}
              placeholder="8500.00"
            />
          </div>

          <div>
            <label htmlFor="imovel-endereco" className={CLASSE_ROTULO}>Endereço (opcional)</label>
            <input
              id="imovel-endereco"
              maxLength={255}
              value={campos.endereco}
              onChange={(e) => alterar('endereco', e.target.value)}
              className={CLASSE_CAMPO}
              placeholder="Av. dos Holandeses, 100 - São Luís/MA"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="imovel-latitude" className={CLASSE_ROTULO}>Latitude</label>
              <input
                id="imovel-latitude"
                required
                type="number"
                step="any"
                min="-90"
                max="90"
                value={campos.latitude}
                onChange={(e) => alterar('latitude', e.target.value)}
                className={CLASSE_CAMPO}
              />
            </div>
            <div>
              <label htmlFor="imovel-longitude" className={CLASSE_ROTULO}>Longitude</label>
              <input
                id="imovel-longitude"
                required
                type="number"
                step="any"
                min="-180"
                max="180"
                value={campos.longitude}
                onChange={(e) => alterar('longitude', e.target.value)}
                className={CLASSE_CAMPO}
              />
            </div>
          </div>
          <p className="text-xs text-slate-500">
            Dica: no Mapa Geográfico, clique no local do imóvel para cadastrar com as coordenadas preenchidas.
          </p>

          <div className="pt-2 flex gap-3">
            {imovel && aoExcluir && (
              <button
                type="button"
                onClick={excluir}
                disabled={enviando}
                className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-60"
              >
                Excluir
              </button>
            )}
            <button
              type="submit"
              disabled={enviando}
              className="flex-1 bg-blue-600 text-white font-medium py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {enviando ? 'Salvando...' : 'Salvar imóvel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
