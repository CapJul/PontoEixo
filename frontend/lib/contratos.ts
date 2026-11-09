/**
 * Contratos: tipos, regras de exibição e chamadas da API (rotas /contratos).
 */

import { baixarArquivo, requisitar } from './api';
import type { ImovelResumo, TipoPessoa } from './inquilinos';

export type IndiceReajuste = 'ipca' | 'igpm' | 'nenhum';
export type StatusContrato = 'ativo' | 'pendente_assinatura' | 'encerrado';

export interface ContratoEntrada {
  inquilino_id: number;
  imovel_id: number;
  valor_aluguel: number;
  dia_vencimento: number;
  data_inicio: string;
  data_fim: string;
  indice_reajuste: IndiceReajuste;
  status: StatusContrato;
  observacoes: string | null;
}

export interface InquilinoResumo {
  id: number;
  nome: string;
  tipo_pessoa: TipoPessoa;
  documento: string;
  telefone: string | null;
  email: string | null;
}

export interface Contrato extends ContratoEntrada {
  id: number;
  inquilino: InquilinoResumo;
  imovel: ImovelResumo;
  criado_em: string;
  atualizado_em: string;
}

export const ROTULOS_INDICE: Record<IndiceReajuste, string> = {
  ipca: 'IPCA',
  igpm: 'IGP-M',
  nenhum: 'Sem reajuste',
};

export const ROTULOS_STATUS_CONTRATO: Record<StatusContrato, string> = {
  ativo: 'Ativo',
  pendente_assinatura: 'Pendente',
  encerrado: 'Encerrado',
};

// Assinador gratuito do governo federal, para assinar o PDF com a conta gov.br
export const URL_ASSINADOR_GOV = 'https://assinador.iti.br/';

/** Converte "AAAA-MM-DD" em Date local (sem deslocamento de fuso). */
export function lerData(dataIso: string): Date {
  const [ano, mes, dia] = dataIso.slice(0, 10).split('-').map(Number);
  return new Date(ano, mes - 1, dia);
}

/** Date local -> "AAAA-MM-DD" */
export function dataParaIso(data: Date): string {
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${data.getFullYear()}-${mes}-${dia}`;
}

export function somarMeses(data: Date, meses: number): Date {
  const resultado = new Date(data.getFullYear(), data.getMonth() + meses, 1);
  const ultimoDia = new Date(resultado.getFullYear(), resultado.getMonth() + 1, 0).getDate();
  resultado.setDate(Math.min(data.getDate(), ultimoDia));
  return resultado;
}

export interface InfoReajuste {
  texto: string;
  /** true quando o reajuste acontece nos próximos 2 meses. */
  proximo: boolean;
}

/**
 * Próximo reajuste anual: o próximo aniversário do início do contrato que
 * ainda esteja dentro da vigência.
 */
export function calcularReajuste(contrato: Contrato, hoje = new Date()): InfoReajuste {
  if (contrato.indice_reajuste === 'nenhum') return { texto: 'Sem reajuste', proximo: false };

  const indice = ROTULOS_INDICE[contrato.indice_reajuste];
  if (contrato.status === 'encerrado') return { texto: indice, proximo: false };

  const inicio = lerData(contrato.data_inicio);
  const fim = lerData(contrato.data_fim);
  const hojeSemHora = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

  let aniversario = somarMeses(inicio, 12);
  while (aniversario <= hojeSemHora) aniversario = somarMeses(aniversario, 12);
  if (aniversario >= fim) return { texto: `${indice} (sem reajuste até o fim)`, proximo: false };

  const meses =
    (aniversario.getFullYear() - hojeSemHora.getFullYear()) * 12 +
    (aniversario.getMonth() - hojeSemHora.getMonth());
  if (meses <= 0) return { texto: `${indice} (este mês)`, proximo: true };
  return {
    texto: `${indice} (falta${meses > 1 ? 'm' : ''} ${meses} ${meses > 1 ? 'meses' : 'mês'})`,
    proximo: meses <= 2,
  };
}

export function listarContratos(): Promise<Contrato[]> {
  return requisitar<Contrato[]>('/contratos');
}

export function criarContrato(dados: ContratoEntrada): Promise<Contrato> {
  return requisitar<Contrato>('/contratos', { metodo: 'POST', corpo: dados });
}

export function atualizarContrato(id: number, dados: ContratoEntrada): Promise<Contrato> {
  return requisitar<Contrato>(`/contratos/${id}`, { metodo: 'PUT', corpo: dados });
}

export function removerContrato(id: number): Promise<void> {
  return requisitar<void>(`/contratos/${id}`, { metodo: 'DELETE' });
}

/** Baixa o PDF do contrato e dispara o download no navegador. */
export async function baixarPdfContrato(contrato: Contrato): Promise<void> {
  const arquivo = await baixarArquivo(`/contratos/${contrato.id}/pdf`);
  const url = URL.createObjectURL(arquivo);
  const link = document.createElement('a');
  link.href = url;
  link.download = `contrato-${contrato.id}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
