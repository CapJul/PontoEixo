/**
 * Imóveis: tipos e chamadas da API (rotas /imoveis).
 */

import { requisitar } from './api';

export type TipoImovel = 'ponto' | 'casa' | 'bloco';
export type StatusImovel = 'alugado' | 'disponivel' | 'manutencao';
export type Vetor3D = [number, number, number];

export interface ImovelEntrada {
  nome: string;
  tipo: TipoImovel;
  status: StatusImovel;
  valor_aluguel: number;
  endereco: string | null;
  latitude: number;
  longitude: number;
  posicao_3d: Vetor3D | null;
  escala_3d: Vetor3D | null;
}

export interface Imovel extends ImovelEntrada {
  id: number;
  criado_em: string;
  atualizado_em: string;
}

export const ROTULOS_TIPO: Record<TipoImovel, string> = {
  ponto: 'Ponto comercial',
  casa: 'Casa',
  bloco: 'Galpão',
};

export const ROTULOS_STATUS: Record<StatusImovel, string> = {
  alugado: 'Alugado',
  disponivel: 'Disponível',
  manutencao: 'Manutenção',
};

/** Cor da fachada (3D) e do marcador (mapa) de acordo com o status. */
export const CORES_STATUS: Record<StatusImovel, string> = {
  alugado: '#3b82f6',
  disponivel: '#ef4444',
  manutencao: '#f59e0b',
};

/** Tamanho padrão no 3D de cada formato de imóvel. */
export const ESCALA_PADRAO: Record<TipoImovel, Vetor3D> = {
  ponto: [1.5, 1.2, 1.5],
  casa: [1.2, 1.2, 1.2],
  bloco: [4, 1.5, 2.5],
};

/**
 * Posição no 3D para imóveis que ainda não têm uma salva: organiza em fileiras
 * de 4 imóveis, centralizadas na planta.
 */
export function posicaoNaGrade(indice: number): Vetor3D {
  const porFileira = 4;
  const espacamento = 3.5;
  const coluna = indice % porFileira;
  const fileira = Math.floor(indice / porFileira);
  return [(coluna - (porFileira - 1) / 2) * espacamento, 0, (fileira - 1) * espacamento];
}

/** Primeira posição da grade que ainda não está ocupada por nenhum imóvel. */
export function proximaPosicaoLivre(ocupadas: Vetor3D[]): Vetor3D {
  const ocupada = (p: Vetor3D) => ocupadas.some((o) => o[0] === p[0] && o[2] === p[2]);
  let indice = 0;
  while (ocupada(posicaoNaGrade(indice))) indice++;
  return posicaoNaGrade(indice);
}

export function listarImoveis(): Promise<Imovel[]> {
  return requisitar<Imovel[]>('/imoveis');
}

export function criarImovel(dados: ImovelEntrada): Promise<Imovel> {
  return requisitar<Imovel>('/imoveis', { metodo: 'POST', corpo: dados });
}

export function atualizarImovel(id: number, dados: ImovelEntrada): Promise<Imovel> {
  return requisitar<Imovel>(`/imoveis/${id}`, { metodo: 'PUT', corpo: dados });
}

export function removerImovel(id: number): Promise<void> {
  return requisitar<void>(`/imoveis/${id}`, { metodo: 'DELETE' });
}

/** Separa só os campos aceitos pela API (descarta id e datas). */
export function paraEntrada(imovel: Imovel): ImovelEntrada {
  return {
    nome: imovel.nome,
    tipo: imovel.tipo,
    status: imovel.status,
    valor_aluguel: imovel.valor_aluguel,
    endereco: imovel.endereco,
    latitude: imovel.latitude,
    longitude: imovel.longitude,
    posicao_3d: imovel.posicao_3d,
    escala_3d: imovel.escala_3d,
  };
}
