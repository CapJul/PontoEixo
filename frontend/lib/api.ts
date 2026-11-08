/**
 * Cliente HTTP da API PontoEixo.
 *
 * - A URL da API vem de NEXT_PUBLIC_API_URL (veja `.env.exemplo`).
 * - O token da sessão é enviado automaticamente no cabeçalho Authorization.
 * - Os erros do FastAPI viram um `ErroApi` com uma mensagem pronta para a tela.
 * - Se a API responder 401 em uma rota protegida, a sessão é encerrada (e o
 *   layout das páginas privadas leva o usuário para o login).
 */

import { encerrarSessao, obterToken } from './sessao';

export const URL_API = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000').replace(/\/$/, '');

export class ErroApi extends Error {
  constructor(
    mensagem: string,
    public readonly status: number,
  ) {
    super(mensagem);
    this.name = 'ErroApi';
  }
}

interface OpcoesRequisicao {
  metodo?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  corpo?: unknown;
  /**
   * Token a ser enviado. Por padrão usa o da sessão; passe `null` para não
   * enviar nenhum (rotas públicas) ou um token específico (ex.: redefinição de senha).
   */
  token?: string | null;
}

interface ErroValidacaoFastApi {
  loc?: (string | number)[];
  msg?: string;
}

/** Converte o corpo de erro do FastAPI em uma mensagem legível. */
function extrairMensagemErro(corpo: unknown, status: number): string {
  if (corpo && typeof corpo === 'object' && 'detail' in corpo) {
    const detalhe = (corpo as { detail: unknown }).detail;

    if (typeof detalhe === 'string') return detalhe;

    // Erros de validação (422): lista com um item por campo inválido
    if (Array.isArray(detalhe) && detalhe.length > 0) {
      return (detalhe as ErroValidacaoFastApi[])
        .map((erro) => (erro.msg ?? '').replace(/^Value error, /, ''))
        .filter(Boolean)
        .join(' ');
    }
  }

  if (status >= 500) return 'O servidor encontrou um erro. Tente novamente em instantes.';
  return 'Não foi possível concluir a operação.';
}

async function enviar(caminho: string, opcoes: OpcoesRequisicao = {}): Promise<Response> {
  const { metodo = 'GET', corpo } = opcoes;
  const usaTokenDaSessao = opcoes.token === undefined;
  const token = usaTokenDaSessao ? obterToken() : opcoes.token;

  const cabecalhos: Record<string, string> = { Accept: 'application/json' };
  if (corpo !== undefined) cabecalhos['Content-Type'] = 'application/json';
  if (token) cabecalhos.Authorization = `Bearer ${token}`;

  let resposta: Response;
  try {
    resposta = await fetch(`${URL_API}${caminho}`, {
      method: metodo,
      headers: cabecalhos,
      body: corpo === undefined ? undefined : JSON.stringify(corpo),
    });
  } catch {
    throw new ErroApi('Não foi possível conectar à API. Verifique se o servidor está no ar.', 0);
  }

  if (!resposta.ok) {
    const conteudo = await resposta.json().catch(() => null);
    const mensagem = extrairMensagemErro(conteudo, resposta.status);

    // Token da sessão expirado ou inválido: encerra a sessão, e o layout
    // das páginas privadas leva o usuário de volta para o login
    if (resposta.status === 401 && usaTokenDaSessao && token) {
      encerrarSessao();
    }

    throw new ErroApi(mensagem, resposta.status);
  }

  return resposta;
}

/** Faz uma requisição e devolve o JSON da resposta (ou undefined em 204). */
export async function requisitar<T>(caminho: string, opcoes: OpcoesRequisicao = {}): Promise<T> {
  const resposta = await enviar(caminho, opcoes);
  if (resposta.status === 204) return undefined as T;
  return (await resposta.json()) as T;
}

/** Mensagem amigável para qualquer erro capturado em um try/catch. */
export function mensagemDeErro(erro: unknown): string {
  if (erro instanceof ErroApi) return erro.message;
  return 'Ocorreu um erro inesperado.';
}
