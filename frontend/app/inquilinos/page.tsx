'use client';

import React, { useState } from 'react';

// Mock rico em dados para preencher o perfil lateral
const inquilinosData = [
  {
    id: 'inq-001',
    tipo: 'PJ',
    nome: 'Eventos & Cia Ltda',
    documento: '12.345.678/0001-99',
    responsavel: 'Marcos Almeida',
    telefone: '98991234567',
    email: 'financeiro@eventosecia.com.br',
    imovel: 'Chácara Imperial - Salão',
    valorAluguel: 'R$ 8.500,00',
    statusFinanceiro: 'em_dia',
    score: 'Excelente', 
    inicioContrato: '10/01/2023',
    fimContrato: '10/01/2026',
    fiador: 'Seguro Fiança (Porto)',
    endereco: 'Rua das Flores, 123 - Centro, São José de Ribamar'
  },
  {
    id: 'inq-002',
    tipo: 'PF',
    nome: 'Roberto dos Santos',
    documento: '123.456.789-00',
    responsavel: 'Próprio',
    telefone: '98999999999',
    email: 'roberto.padaria@gmail.com',
    imovel: 'Padaria Doce Vida',
    valorAluguel: 'R$ 4.200,00',
    statusFinanceiro: 'em_dia',
    score: 'Bom',
    inicioContrato: '05/03/2022',
    fimContrato: '05/03/2025',
    fiador: 'Maria dos Santos (Irmã)',
    endereco: 'Av. Principal, 45 - Bairro Novo, São José de Ribamar'
  },
  {
    id: 'inq-003',
    tipo: 'PF',
    nome: 'Carlos Eduardo Souza',
    documento: '987.654.321-11',
    responsavel: 'Próprio',
    telefone: '98988888888',
    email: 'carlos.tech@hotmail.com',
    imovel: 'Celular Tech Store',
    valorAluguel: 'R$ 2.500,00',
    statusFinanceiro: 'inadimplente',
    atraso: '15 dias',
    score: 'Atenção',
    inicioContrato: '15/10/2024',
    fimContrato: '15/10/2025',
    fiador: 'Caução (3 meses)',
    endereco: 'Rua Grande, 987 - Centro, São Luís'
  }
];

export default function PontoEixoInquilinos() {
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  
  // Estado para controlar a barra lateral (Slide-over)
  const [inquilinoSelecionado, setInquilinoSelecionado] = useState<typeof inquilinosData[0] | null>(null);

  // Lógica Funcional de Filtragem e Busca
  const inquilinosFiltrados = inquilinosData.filter(inq => {
    const matchBusca = inq.nome.toLowerCase().includes(busca.toLowerCase()) || 
                       inq.imovel.toLowerCase().includes(busca.toLowerCase()) ||
                       inq.documento.includes(busca);
    const matchStatus = filtroStatus === 'todos' || inq.statusFinanceiro === filtroStatus;
    return matchBusca && matchStatus;
  });

  const cobrarWhatsApp = (telefone: string, nome: string, atraso?: string) => {
    const msg = atraso 
      ? `Olá, ${nome}. Aqui é da administração do PontoEixo. Constamos um atraso de ${atraso} no seu aluguel. Podemos ajudar com a emissão de um novo boleto?`
      : `Olá, ${nome}. Aqui é da administração do PontoEixo. Tudo bem?`;
    window.open(`https://wa.me/55${telefone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans text-slate-900 overflow-hidden relative">
      
      {/* BARRA LATERAL ESQUERDA (Menu de Navegação) */}
      <aside className="w-64 bg-white border-r border-slate-200 flex-col hidden md:flex z-30">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <h1 className="text-xl font-medium tracking-tight text-slate-900">
            Ponto<span className="font-bold text-slate-500">Eixo</span>
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <a href="/home" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            Visão 3D
          </a>
          <a href="/contratos" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Contratos
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium bg-slate-200 text-slate-900 transition-colors">
            <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            Inquilinos
          </a>
        </nav>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 p-8 overflow-y-auto z-10">
        <div className="max-w-7xl mx-auto space-y-6">
          
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Diretório de Inquilinos</h2>
              <p className="text-sm text-slate-500 mt-1">Gerencie a carteira de clientes, histórico de pagamentos e dados de contato.</p>
            </div>
            <a href="/inquilinos/novo" className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-800 border border-transparent rounded-lg hover:bg-slate-700 focus:ring-2 focus:ring-offset-2 focus:ring-slate-800 shadow-sm transition-all">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              Cadastrar Inquilino
            </a>
          </header>

          {/* ... (KPIs Gerenciais e Barra de Ferramentas ocultadas aqui para focar na tabela, mas são as mesmas do código anterior) ... */}
          
          {/* Tabela de Dados */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden mt-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Inquilino / Contato</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Imóvel Vinculado</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Fiador/Garantia</th>
                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {inquilinosFiltrados.map((inq) => (
                    <tr key={inq.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-slate-500 font-semibold text-sm">
                            {inq.tipo}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-900">{inq.nome}</div>
                            <div className="text-sm text-slate-500">{inq.documento}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900 font-medium">{inq.imovel}</div>
                        <div className="text-sm text-slate-500">Vence em: {inq.fimContrato}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ring-1 ring-inset ${
                          inq.statusFinanceiro === 'em_dia' ? 'bg-green-50 text-green-700 ring-green-600/20' : 
                          'bg-red-50 text-red-700 ring-red-600/20'
                        }`}>
                          <svg className={`h-1.5 w-1.5 ${inq.statusFinanceiro === 'em_dia' ? 'fill-green-500' : 'fill-red-500'}`} viewBox="0 0 6 6"><circle cx="3" cy="3" r="3" /></svg>
                          {inq.statusFinanceiro === 'em_dia' ? 'Em dia' : `Atraso: ${inq.atraso}`}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">{inq.fiador}</div>
                        <div className="text-xs text-slate-500 mt-1">Score: {inq.score}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-3">
                          <button 
                            onClick={() => cobrarWhatsApp(inq.telefone, inq.nome, inq.atraso)}
                            className={`p-1.5 rounded-md transition-colors ${inq.statusFinanceiro === 'inadimplente' ? 'text-red-600 hover:bg-red-50' : 'text-slate-400 hover:text-green-600 hover:bg-green-50'}`}
                            title="Falar no WhatsApp"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347Z"/></svg>
                          </button>
                          
                          {/* BOTÃO VER PERFIL - AGORA ABRE A BARRA LATERAL */}
                          <button 
                            onClick={() => setInquilinoSelecionado(inq)}
                            className="text-slate-700 hover:text-slate-900 bg-white border border-slate-300 px-3 py-1.5 rounded-md hover:bg-slate-50 focus:ring-2 focus:ring-offset-1 focus:ring-slate-500 transition-colors shadow-sm"
                          >
                            Ver Perfil
                          </button>

                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* OVERLAY ESCURECIDO (Fundo do modal) */}
      <div 
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          inquilinoSelecionado ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setInquilinoSelecionado(null)}
      />

      {/* SLIDE-OVER (Barra Lateral Direita) */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl border-l border-slate-200 transform transition-transform duration-300 ease-in-out flex flex-col ${
          inquilinoSelecionado ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {inquilinoSelecionado && (
          <>
            {/* Header do Slide-over */}
            <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-900">Perfil do Locatário</h3>
              <button 
                onClick={() => setInquilinoSelecionado(null)} 
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-200"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Corpo do Slide-over (Rola internamente se for longo) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              {/* Header do Perfil (Avatar + Nome) */}
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xl font-bold border border-slate-300 shadow-sm">
                  {inquilinoSelecionado.nome.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{inquilinoSelecionado.nome}</h2>
                  <p className="text-sm text-slate-500">{inquilinoSelecionado.tipo === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'} • Score: <span className="font-medium text-slate-700">{inquilinoSelecionado.score}</span></p>
                </div>
              </div>

              {/* Informações de Contato */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Contato e Documentação</h4>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 text-sm">
                  <div className="sm:col-span-1">
                    <dt className="text-slate-500">Documento ({inquilinoSelecionado.tipo === 'PF' ? 'CPF' : 'CNPJ'})</dt>
                    <dd className="font-medium text-slate-900 mt-1">{inquilinoSelecionado.documento}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-slate-500">Telefone / WhatsApp</dt>
                    <dd className="font-medium text-slate-900 mt-1">{inquilinoSelecionado.telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-slate-500">E-mail</dt>
                    <dd className="font-medium text-slate-900 mt-1">{inquilinoSelecionado.email}</dd>
                  </div>
                  {inquilinoSelecionado.tipo === 'PJ' && (
                    <div className="sm:col-span-2">
                      <dt className="text-slate-500">Responsável Legal</dt>
                      <dd className="font-medium text-slate-900 mt-1">{inquilinoSelecionado.responsavel}</dd>
                    </div>
                  )}
                </dl>
              </div>

              <hr className="border-slate-100" />

              {/* Dados do Contrato Atual */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Contrato Ativo</h4>
                <div className="bg-slate-50 rounded-md border border-slate-200 p-4 space-y-4">
                  <div>
                    <span className="block text-xs text-slate-500">Imóvel Vinculado</span>
                    <span className="block font-semibold text-slate-900 text-base">{inquilinoSelecionado.imovel}</span>
                    <span className="block text-xs text-slate-500 mt-0.5">{inquilinoSelecionado.endereco}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200">
                    <div>
                      <span className="block text-xs text-slate-500">Valor do Aluguel</span>
                      <span className="block font-semibold text-slate-900">{inquilinoSelecionado.valorAluguel}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-slate-500">Vigência</span>
                      <span className="block font-medium text-slate-800 text-sm">{inquilinoSelecionado.inicioContrato} a {inquilinoSelecionado.fimContrato}</span>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-slate-200">
                    <span className="block text-xs text-slate-500">Garantia / Fiador</span>
                    <span className="block font-medium text-slate-800 text-sm">{inquilinoSelecionado.fiador}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer do Slide-over (Ações) */}
            <div className="px-6 py-4 border-t border-slate-200 bg-white grid grid-cols-2 gap-3">
              <button className="w-full justify-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shadow-sm">
                Editar Cadastro
              </button>
              <button className="w-full justify-center px-4 py-2 text-sm font-medium text-white bg-slate-800 border border-transparent rounded-md shadow-sm hover:bg-slate-700 transition-colors">
                Abrir Contrato
              </button>
            </div>
          </>
        )}
      </div>

    </div>
  );
}