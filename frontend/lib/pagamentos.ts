/**
 * Pagamentos de aluguel: tipos e chamadas da API.
 */

import { requisitar } from './api';

export interface PagamentoEntrada {
  /** Mês de referência, no formato "AAAA-MM-01". */
  competencia: string;
  valor_pago: number;
  data_pagamento: string;
  irrf_retido: number;
  observacao: string | null;
}

export interface Pagamento extends PagamentoEntrada {
  id: number;
  contrato_id: number;
  criado_em: string;
}

export interface SituacaoFinanceira {
  situacao: 'em_dia' | 'inadimplente' | 'sem_cobranca';
  meses_em_aberto: number;
  dias_atraso: number;
  competencias_em_aberto: string[];
}

const MESES_ABREVIADOS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

/** "2026-03-01" -> "mar/2026" */
export function formatarCompetencia(competencia: string): string {
  const [ano, mes] = competencia.split('-');
  return `${MESES_ABREVIADOS[Number(mes) - 1]}/${ano}`;
}

/** Texto curto da situação: "Em dia", "Atraso: 12 dias (1 mês)"... */
export function textoSituacao(situacao: SituacaoFinanceira): string {
  if (situacao.situacao === 'em_dia') return 'Em dia';
  if (situacao.situacao === 'sem_cobranca') return 'Sem cobrança';
  const dias = `${situacao.dias_atraso} ${situacao.dias_atraso === 1 ? 'dia' : 'dias'}`;
  const meses = `${situacao.meses_em_aberto} ${situacao.meses_em_aberto === 1 ? 'mês' : 'meses'}`;
  return `Atraso: ${dias} (${meses} em aberto)`;
}

export function listarPagamentos(contratoId: number): Promise<Pagamento[]> {
  return requisitar<Pagamento[]>(`/contratos/${contratoId}/pagamentos`);
}

export function registrarPagamento(contratoId: number, dados: PagamentoEntrada): Promise<Pagamento> {
  return requisitar<Pagamento>(`/contratos/${contratoId}/pagamentos`, { metodo: 'POST', corpo: dados });
}

export function removerPagamento(id: number): Promise<void> {
  return requisitar<void>(`/pagamentos/${id}`, { metodo: 'DELETE' });
}
