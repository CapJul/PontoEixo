'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

import { encerrarSessao, useSessao } from '@/lib/sessao';

interface ItemMenu {
  href: string;
  rotulo: string;
  icone: ReactNode;
}

const ITENS_MENU: ItemMenu[] = [
  {
    href: '/home',
    rotulo: 'Visão Geral',
    icone: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
    ),
  },
  {
    href: '/contratos',
    rotulo: 'Contratos',
    icone: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
    ),
  },
  {
    href: '/inquilinos',
    rotulo: 'Inquilinos',
    icone: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
    ),
  },
  {
    href: '/imposto-de-renda',
    rotulo: 'Imposto de Renda',
    icone: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
    ),
  },
];

const CLASSE_ITEM = 'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors';
const CLASSE_ATIVO = 'bg-blue-50 text-blue-700 font-medium';
const CLASSE_INATIVO = 'text-slate-600 hover:bg-slate-50 hover:text-slate-900';

export default function MenuLateral() {
  const caminhoAtual = usePathname();
  const router = useRouter();
  const sessao = useSessao();

  const sair = () => {
    encerrarSessao();
    router.replace('/login');
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex z-50 shadow-sm print:hidden">
      <div className="p-6 border-b border-slate-100">
        <h1 className="text-2xl font-light tracking-tight text-slate-900">
          Ponto<span className="font-semibold text-blue-600">Eixo</span>
        </h1>
        {sessao && <p className="mt-1 text-xs text-slate-500 truncate">{sessao.usuario.nome}</p>}
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {ITENS_MENU.map((item) => {
          const ativo = caminhoAtual === item.href || caminhoAtual.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${CLASSE_ITEM} ${ativo ? CLASSE_ATIVO : CLASSE_INATIVO}`}
            >
              {item.icone}
              {item.rotulo}
            </Link>
          );
        })}
        <button type="button" onClick={sair} className={`w-full text-left ${CLASSE_ITEM} ${CLASSE_INATIVO}`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          Sair
        </button>
      </nav>
    </aside>
  );
}
