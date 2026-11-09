/** Funções de formatação usadas nas telas. */

const formatadorReais = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** 8500 -> "R$ 8.500,00" */
export function formatarReais(valor: number): string {
  return formatadorReais.format(valor);
}

/** "2026-03-15" -> "15/03/2026" (sem passar por fuso horário). */
export function formatarData(dataIso: string | null | undefined): string {
  if (!dataIso) return '—';
  const [ano, mes, dia] = dataIso.slice(0, 10).split('-');
  return `${dia}/${mes}/${ano}`;
}

/** Formata CPF (11 dígitos) ou CNPJ (14 caracteres) salvos sem máscara. */
export function formatarDocumento(documento: string): string {
  if (documento.length === 11) {
    return documento.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  if (documento.length === 14) {
    return documento.replace(/(\w{2})(\w{3})(\w{3})(\w{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  return documento;
}

/** "98987654321" -> "(98) 98765-4321" */
export function formatarTelefone(telefone: string | null | undefined): string {
  if (!telefone) return '—';
  if (telefone.length === 11) return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  if (telefone.length === 10) return telefone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  return telefone;
}
