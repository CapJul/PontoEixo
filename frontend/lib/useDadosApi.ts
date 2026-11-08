import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react';

import { mensagemDeErro } from './api';
import { obterToken } from './sessao';

interface DadosApi<T> {
  dados: T;
  setDados: Dispatch<SetStateAction<T>>;
  carregando: boolean;
  erro: string | null;
  /** Busca os dados de novo (ex.: depois de salvar algo que mudou a lista). */
  recarregar: () => void;
}

/**
 * Carrega dados da API ao abrir a página.
 *
 * @param buscar função que faz a requisição; recriá-la (ex.: com outro filtro
 *   via useCallback) dispara uma nova busca.
 * @param valorInicial valor usado enquanto a primeira resposta não chega.
 */
export function useDadosApi<T>(buscar: () => Promise<T>, valorInicial: T): DadosApi<T> {
  const [dados, setDados] = useState<T>(valorInicial);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    // Sem sessão não há o que buscar: o layout privado já está levando ao login
    if (!obterToken()) return;

    let ativo = true; // ignora respostas que chegam depois de sair da página
    buscar()
      .then((resultado) => {
        if (!ativo) return;
        setDados(resultado);
        setErro(null);
      })
      .catch((falha) => {
        if (ativo) setErro(mensagemDeErro(falha));
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [buscar, versao]);

  const recarregar = useCallback(() => setVersao((v) => v + 1), []);

  return { dados, setDados, carregando, erro, recarregar };
}
