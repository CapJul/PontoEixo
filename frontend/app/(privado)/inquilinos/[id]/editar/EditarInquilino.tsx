'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

import AvisoErro from '@/componentes/AvisoErro';
import FormularioInquilino from '@/componentes/FormularioInquilino';
import MenuLateral from '@/componentes/MenuLateral';
import { atualizarInquilino, obterInquilino, type Inquilino, type InquilinoEntrada } from '@/lib/inquilinos';
import { useDadosApi } from '@/lib/useDadosApi';

export default function EditarInquilino() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const inquilinoId = Number(id);

  const buscar = useCallback(() => obterInquilino(inquilinoId), [inquilinoId]);
  const { dados: inquilino, carregando, erro } = useDadosApi<Inquilino | null>(buscar, null);

  const salvar = async (dados: InquilinoEntrada) => {
    await atualizarInquilino(inquilinoId, dados);
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
              <h2 className="text-2xl font-semibold text-slate-900">Editar Inquilino</h2>
              <p className="text-sm text-slate-500 mt-1">Atualize os dados do dossiê do locatário.</p>
            </div>
          </div>

          {erro && <AvisoErro mensagem={erro} />}
          {carregando && <p className="text-sm text-slate-500">Carregando...</p>}
          {inquilino && <FormularioInquilino key={inquilino.id} inquilino={inquilino} aoSalvar={salvar} />}

        </div>
      </main>
    </div>
  );
}
