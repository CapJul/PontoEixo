import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useSessao } from './sessao';

/** Nas telas públicas (login, cadastro), leva quem já está logado para a home. */
export function useRedirecionarSeLogado() {
  const router = useRouter();
  const sessao = useSessao();

  useEffect(() => {
    if (sessao) router.replace('/home');
  }, [sessao, router]);
}
