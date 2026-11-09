'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

import { useSessao } from '@/lib/sessao';

/**
 * Protege as páginas privadas: sem sessão válida, leva o usuário para o login.
 *
 * O conteúdo é sempre montado (o Next precisa dele para validar a navegação),
 * mas fica escondido até a sessão ser confirmada no navegador. As buscas na
 * API só acontecem quando há token (veja `useDadosApi`).
 */
export default function GuardaSessao({ children }: { children: ReactNode }) {
  const router = useRouter();
  const sessao = useSessao();

  useEffect(() => {
    if (sessao === null) router.replace('/login');
  }, [sessao, router]);

  return (
    <>
      {!sessao && (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-sm text-slate-500">
          Carregando...
        </div>
      )}
      <div className={sessao ? 'contents' : 'hidden'}>{children}</div>
    </>
  );
}
