/**
 * Inquilinos: tipos e chamadas da API (rotas /inquilinos).
 */

import { requisitar } from './api';

export type TipoPessoa = 'PF' | 'PJ';
export type Sexo = 'M' | 'F' | 'O';
export type EstadoCivil = 'solteiro' | 'casado' | 'divorciado' | 'viuvo';
export type TipoLocacao = 'comercial' | 'residencial' | 'temporada';
export type GarantiaLocaticia = 'fiador' | 'caucao' | 'seguro' | 'nenhuma';

export interface InquilinoEntrada {
  tipo_pessoa: TipoPessoa;
  nome: string;
  documento: string;
  rg_ou_inscricao_estadual: string | null;
  data_nascimento: string | null;
  sexo: Sexo | null;
  estado_civil: EstadoCivil | null;
  email: string | null;
  telefone: string | null;
  imovel_id: number | null;
  tipo_locacao: TipoLocacao;
  garantia: GarantiaLocaticia | null;
}

export interface ImovelResumo {
  id: number;
  nome: string;
  endereco: string | null;
  valor_aluguel: number;
}

export interface Inquilino extends InquilinoEntrada {
  id: number;
  imovel: ImovelResumo | null;
  criado_em: string;
  atualizado_em: string;
}

export const ROTULOS_GARANTIA: Record<GarantiaLocaticia, string> = {
  fiador: 'Fiador',
  caucao: 'Caução (depósito)',
  seguro: 'Seguro fiança',
  nenhuma: 'Sem garantia',
};

export const ROTULOS_LOCACAO: Record<TipoLocacao, string> = {
  comercial: 'Comercial',
  residencial: 'Residencial',
  temporada: 'Temporada / Evento',
};

export const ROTULOS_SEXO: Record<Sexo, string> = {
  M: 'Masculino',
  F: 'Feminino',
  O: 'Outro',
};

export const ROTULOS_ESTADO_CIVIL: Record<EstadoCivil, string> = {
  solteiro: 'Solteiro(a)',
  casado: 'Casado(a)',
  divorciado: 'Divorciado(a)',
  viuvo: 'Viúvo(a)',
};

export function listarInquilinos(): Promise<Inquilino[]> {
  return requisitar<Inquilino[]>('/inquilinos');
}

export function obterInquilino(id: number): Promise<Inquilino> {
  return requisitar<Inquilino>(`/inquilinos/${id}`);
}

export function cadastrarInquilino(dados: InquilinoEntrada): Promise<Inquilino> {
  return requisitar<Inquilino>('/inquilinos', { metodo: 'POST', corpo: dados });
}

export function atualizarInquilino(id: number, dados: InquilinoEntrada): Promise<Inquilino> {
  return requisitar<Inquilino>(`/inquilinos/${id}`, { metodo: 'PUT', corpo: dados });
}

export function removerInquilino(id: number): Promise<void> {
  return requisitar<void>(`/inquilinos/${id}`, { metodo: 'DELETE' });
}
