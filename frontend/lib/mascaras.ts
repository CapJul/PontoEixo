/** Máscaras aplicadas enquanto o usuário digita. */

/** CPF: 000.000.000-00 */
export function mascararCpf(valor: string): string {
  const numeros = valor.replace(/\D/g, '').slice(0, 11);
  return numeros
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2');
}

/**
 * CNPJ: 00.000.000/0000-00.
 * Aceita letras nos 12 primeiros caracteres (CNPJ alfanumérico da Receita).
 */
export function mascararCnpj(valor: string): string {
  const caracteres = valor.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 14);
  let resultado = caracteres.slice(0, 2);
  if (caracteres.length > 2) resultado += `.${caracteres.slice(2, 5)}`;
  if (caracteres.length > 5) resultado += `.${caracteres.slice(5, 8)}`;
  if (caracteres.length > 8) resultado += `/${caracteres.slice(8, 12)}`;
  if (caracteres.length > 12) resultado += `-${caracteres.slice(12, 14)}`;
  return resultado;
}

/** Telefone com DDD: (00) 00000-0000 ou (00) 0000-0000 */
export function mascararTelefone(valor: string): string {
  const numeros = valor.replace(/\D/g, '').slice(0, 11);
  if (numeros.length <= 2) return numeros.length ? `(${numeros}` : '';
  if (numeros.length <= 6) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
  if (numeros.length <= 10) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
  }
  return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
}
