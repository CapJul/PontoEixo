/**
 * Imposto de renda: tipos e chamadas da API (rotas /imposto-de-renda).
 */

import { requisitar } from './api';
import type { TipoPessoa } from './inquilinos';

export interface ResumoIR {
  rendimento_bruto: number;
  deducoes: number;
  rendimento_liquido: number;
  irrf: number;
}

export interface FonteIR {
  inquilino_id: number;
  tipo_pessoa: TipoPessoa;
  nome: string;
  documento: string;
  imoveis: string[];
  rendimento_bruto: number;
  deducoes: number;
  rendimento_liquido: number;
  irrf: number;
  quantidade_pagamentos: number;
}

export interface MesCarneLeao {
  mes: number;
  rendimento_bruto: number;
  fontes: { nome: string; documento: string; valor: number }[];
}

export interface RelatorioIR {
  ano: number;
  titular: string;
  anos_disponiveis: number[];
  resumo: ResumoIR;
  fontes: FonteIR[];
  carne_leao: MesCarneLeao[];
  deducoes_nao_aproveitadas: number;
}

export interface DeducaoEntrada {
  valor_iptu: number;
  valor_condominio: number;
  valor_taxa_administracao: number;
}

export interface Deducao extends DeducaoEntrada {
  imovel_id: number;
  imovel_nome: string;
  ano: number;
}

export const NOMES_MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export function obterRelatorio(ano: number): Promise<RelatorioIR> {
  return requisitar<RelatorioIR>(`/imposto-de-renda/${ano}`);
}

export function listarDeducoes(ano: number): Promise<Deducao[]> {
  return requisitar<Deducao[]>(`/imposto-de-renda/${ano}/deducoes`);
}

export function salvarDeducao(ano: number, imovelId: number, dados: DeducaoEntrada): Promise<Deducao> {
  return requisitar<Deducao>(`/imposto-de-renda/${ano}/deducoes/${imovelId}`, { metodo: 'PUT', corpo: dados });
}
