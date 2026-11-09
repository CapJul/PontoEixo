/**
 * Chamadas da API para login, cadastro e recuperação de senha.
 */

import { requisitar } from './api';
import { salvarSessao, type UsuarioSessao } from './sessao';

interface TokenAcesso {
  token_acesso: string;
  tipo_token: 'bearer';
  expira_em_segundos: number;
  usuario: UsuarioSessao;
}

interface TokenRedefinicao {
  token_redefinicao: string;
  tipo_token: 'bearer';
  expira_em_segundos: number;
}

interface Mensagem {
  mensagem: string;
}

export interface DadosCadastro {
  nome: string;
  email: string;
  senha: string;
  confirmacao_senha: string;
  aceite_termos: boolean;
}

/** Faz o login e já salva a sessão. */
export async function entrar(email: string, senha: string): Promise<void> {
  const resposta = await requisitar<TokenAcesso>('/auth/login', {
    metodo: 'POST',
    corpo: { email, senha },
    token: null,
  });
  salvarSessao(resposta.token_acesso, resposta.expira_em_segundos, resposta.usuario);
}

/** Cria a conta e já salva a sessão (a API devolve o token no cadastro). */
export async function cadastrar(dados: DadosCadastro): Promise<void> {
  const resposta = await requisitar<TokenAcesso>('/auth/cadastro', {
    metodo: 'POST',
    corpo: dados,
    token: null,
  });
  salvarSessao(resposta.token_acesso, resposta.expira_em_segundos, resposta.usuario);
}

/** Etapa 1: pede o envio do código de 6 dígitos por e-mail. */
export async function solicitarCodigo(email: string): Promise<string> {
  const resposta = await requisitar<Mensagem>('/auth/recuperar-senha/solicitar-codigo', {
    metodo: 'POST',
    corpo: { email },
    token: null,
  });
  return resposta.mensagem;
}

/** Etapa 2: confere o código e devolve o token que libera a troca de senha. */
export async function validarCodigo(email: string, codigo: string): Promise<string> {
  const resposta = await requisitar<TokenRedefinicao>('/auth/recuperar-senha/validar-codigo', {
    metodo: 'POST',
    corpo: { email, codigo },
    token: null,
  });
  return resposta.token_redefinicao;
}

/** Etapa 3: grava a nova senha usando o token da etapa 2. */
export async function redefinirSenha(
  tokenRedefinicao: string,
  novaSenha: string,
  confirmacaoSenha: string,
): Promise<string> {
  const resposta = await requisitar<Mensagem>('/auth/recuperar-senha/redefinir', {
    metodo: 'POST',
    corpo: { nova_senha: novaSenha, confirmacao_senha: confirmacaoSenha },
    token: tokenRedefinicao,
  });
  return resposta.mensagem;
}
