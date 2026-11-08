'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import FormularioInquilino from '@/componentes/FormularioInquilino';
import MenuLateral from '@/componentes/MenuLateral';
import { cadastrarInquilino, type InquilinoEntrada } from '@/lib/inquilinos';

export default function PontoEixoNovoInquilino() {
  const router = useRouter();

  const salvar = async (dados: InquilinoEntrada) => {
    await cadastrarInquilino(dados);
    router.push('/inquilinos');
  };

  return (
    <div className="min-h-screen flex bg-[#F4F4F5] font-sans text-slate-800">
      
      <MenuLateral />

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          
          {/* Cabeçalho com botão de voltar */}
          <div className="mb-6 flex items-center gap-4">
            <Link href="/inquilinos" aria-label="Voltar" className="p-2 rounded-md text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </Link>
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Cadastrar Inquilino</h2>
              <p className="text-sm text-slate-500 mt-1">Preencha os dados completos para o dossiê do locatário.</p>
            </div>
          </div>

          <FormularioInquilino aoSalvar={salvar} />

        </div>
      </main>
    </div>
  );
}
