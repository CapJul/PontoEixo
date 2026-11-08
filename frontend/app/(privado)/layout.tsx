'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

import { useSessao } from '@/lib/sessao';

/**
 * Layout das páginas que exigem login (home, contratos, inquilinos, IR...).
 *
 * Sem sessão válida, o usuário é levado para a tela de login.
 */
export default function LayoutPrivado({ children }: { children: ReactNode }) {
  const router = useRouter();
  const sessao = useSessao();

  useEffect(() => {
    if (sessao === null) router.replace('/login');
  }, [sessao, router]);

  // `undefined`: ainda carregando no navegador; `null`: redirecionando
  if (!sessao) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-sm text-slate-500">
        Carregando...
      </div>
    );
  }

  return <>{children}</>;
}
