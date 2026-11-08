/**
 * Sessão do usuário no navegador.
 *
 * Guarda o token JWT devolvido pelo login/cadastro e os dados básicos do
 * usuário no localStorage. Os componentes leem a sessão com o hook
 * `useSessao`, que se atualiza sozinho quando ela muda (inclusive em outra aba).
 */

import { useSyncExternalStore } from 'react';

const CHAVE_SESSAO = 'pontoeixo.sessao';
const EVENTO_SESSAO = 'pontoeixo:sessao';

export interface UsuarioSessao {
  id: number;
  nome: string;
  email: string;
}

export interface Sessao {
  token: string;
  /** Momento (em milissegundos) em que o token deixa de valer. */
  expiraEm: number;
  usuario: UsuarioSessao;
}

// Cache do texto lido do localStorage, para que `useSyncExternalStore`
// receba sempre o mesmo objeto enquanto a sessão não mudar.
let textoEmCache: string | null = null;
let sessaoEmCache: Sessao | null = null;

function lerSessao(): Sessao | null {
  let texto: string | null = null;
  try {
    texto = window.localStorage.getItem(CHAVE_SESSAO);
  } catch {
    return null; // navegador bloqueando o armazenamento
  }

  if (texto !== textoEmCache) {
    textoEmCache = texto;
    try {
      sessaoEmCache = texto ? (JSON.parse(texto) as Sessao) : null;
    } catch {
      sessaoEmCache = null;
    }
  }

  // Token expirado conta como sessão inexistente
  if (sessaoEmCache && sessaoEmCache.expiraEm <= Date.now()) {
    return null;
  }
  return sessaoEmCache;
}

function avisarMudanca() {
  window.dispatchEvent(new Event(EVENTO_SESSAO));
}

/** Salva a sessão a partir da resposta de login ou cadastro da API. */
export function salvarSessao(token: string, expiraEmSegundos: number, usuario: UsuarioSessao) {
  const sessao: Sessao = {
    token,
    expiraEm: Date.now() + expiraEmSegundos * 1000,
    usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
  };
  try {
    window.localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
  } catch {
    // Sem armazenamento disponível: a sessão não sobrevive a um recarregamento
  }
  avisarMudanca();
}

/** Remove a sessão (logout ou token rejeitado pela API). */
export function encerrarSessao() {
  try {
    window.localStorage.removeItem(CHAVE_SESSAO);
  } catch {
    // nada a fazer
  }
  avisarMudanca();
}

/** Token de acesso atual, ou null se não houver sessão válida. */
export function obterToken(): string | null {
  if (typeof window === 'undefined') return null;
  return lerSessao()?.token ?? null;
}

function inscrever(aoMudar: () => void) {
  window.addEventListener(EVENTO_SESSAO, aoMudar);
  window.addEventListener('storage', aoMudar); // mudanças feitas em outra aba
  return () => {
    window.removeEventListener(EVENTO_SESSAO, aoMudar);
    window.removeEventListener('storage', aoMudar);
  };
}

/**
 * Hook com a sessão atual.
 *
 * Retorna `undefined` enquanto a página ainda não carregou no navegador
 * (renderização no servidor) e `null` quando o usuário não está logado.
 */
export function useSessao(): Sessao | null | undefined {
  return useSyncExternalStore<Sessao | null | undefined>(
    inscrever,
    lerSessao,
    () => undefined,
  );
}
