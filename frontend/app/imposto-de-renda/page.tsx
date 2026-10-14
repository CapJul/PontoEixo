'use client';

import React, { useState } from 'react';

// Mock de dados mastigados para a declaração (Ano Base 2025)
const dadosIRPF = {
  anoBase: 2025,
  resumo: {
    rendimentoBrutoTotal: 182400.00,
    deducoesTotal: 4700.00,
    rendimentoLiquido: 177700.00,
    impostoRetido: 15300.00,
  },
  // A Receita exige lançar PF e PJ em locais diferentes
  fontesPagadoras: [
    {
      id: 'ir-01',
      tipo: 'PJ', // Vai para a ficha: Rendimentos Tributáveis Recebidos de PJ
      nome: 'Eventos & Cia Ltda',
      documento: '12.345.678/0001-99',
      imovel: 'Chácara Imperial - Salão',
      rendimentoBruto: 102000.00, // R$ 8.500 * 12
      deducoesIPTU: 3500.00,
      comissaoAdm: 0.00,
      rendimentoLiquido: 98500.00,
      irrf: 15300.00, // Imposto retido na fonte pela PJ
    },
    {
      id: 'ir-02',
      tipo: 'PF', // Vai para a ficha: Rendimentos Recebidos de PF/Exterior (Carnê-Leão)
      nome: 'Roberto dos Santos',
      documento: '123.456.789-00',
      imovel: 'Padaria Doce Vida',
      rendimentoBruto: 50400.00, // R$ 4.200 * 12
      deducoesIPTU: 1200.00,
      comissaoAdm: 0.00,
      rendimentoLiquido: 49200.00,
      irrf: 0.00, // PF não retém na fonte
    },
    {
      id: 'ir-03',
      tipo: 'PF',
      nome: 'Carlos Eduardo Souza',
      documento: '987.654.321-11',
      imovel: 'Celular Tech Store',
      rendimentoBruto: 30000.00, // R$ 2.500 * 12
      deducoesIPTU: 0.00,
      comissaoAdm: 0.00,
      rendimentoLiquido: 30000.00,
      irrf: 0.00,
    }
  ]
};

export default function PontoEixoImpostoRenda() {
  const [anoSelecionado, setAnoSelecionado] = useState('2025');
  const [abaAtiva, setAbaAtiva] = useState<'resumo' | 'carne-leao'>('resumo');
  const [copiadoId, setCopiadoId] = useState<string | null>(null);

  // Função para simular a cópia dos dados para colar direto no programa da Receita
  const copiarParaAreaDeTransferencia = (id: string, texto: string) => {
    navigator.clipboard.writeText(texto);
    setCopiadoId(id);
    setTimeout(() => setCopiadoId(null), 2000);
  };

  return (
    <div className="min-h-screen flex bg-[#F4F4F5] font-sans text-slate-900">
      
      {/* BARRA LATERAL */}
      <aside className="w-64 bg-white border-r border-slate-200 flex-col hidden md:flex z-40">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <h1 className="text-xl font-medium tracking-tight text-slate-900">
            Ponto<span className="font-bold text-slate-500">Eixo</span>
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <a href="/home" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            Visão 3D
          </a>
          <a href="/contratos" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Contratos
          </a>
          <a href="/inquilinos" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            Inquilinos
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium bg-slate-200 text-slate-900 transition-colors">
            <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Imposto de Renda
          </a>
        </nav>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Cabeçalho */}
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Declaração de IRPF</h2>
              <div className="flex items-center gap-3 mt-1.5">
                <p className="text-sm text-slate-500">Relatório consolidado para o leão.</p>
                <span className="bg-slate-200 text-slate-700 text-xs px-2.5 py-0.5 rounded-full font-medium">
                  Titular: Júlio César Costa da Silva
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <select 
                value={anoSelecionado}
                onChange={(e) => setAnoSelecionado(e.target.value)}
                className="pl-3 pr-8 py-2 text-sm border-slate-300 rounded-md focus:ring-slate-500 focus:border-slate-500 bg-white shadow-sm font-medium"
              >
                <option value="2026">Ano Base 2026</option>
                <option value="2025">Ano Base 2025 (Atual)</option>
                <option value="2024">Ano Base 2024</option>
              </select>
              
              <button className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:ring-2 focus:ring-offset-1 focus:ring-slate-500 shadow-sm transition-all">
                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Exportar PDF
              </button>
            </div>
          </header>

          {/* Abas de Navegação */}
          <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-lg w-max">
            <button
              onClick={() => setAbaAtiva('resumo')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${abaAtiva === 'resumo' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Resumo Anual (DIRPF)
            </button>
            <button
              onClick={() => setAbaAtiva('carne-leao')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${abaAtiva === 'carne-leao' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Carnê-Leão Mensal
            </button>
          </div>

          {/* INDICADORES TOTAIS (KPIs) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
              <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">Rendimento Bruto</dt>
              <dd className="mt-2 text-2xl font-semibold text-slate-900">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dadosIRPF.resumo.rendimentoBrutoTotal)}
              </dd>
            </div>
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
              <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">Deduções (IPTU/Cond.)</dt>
              <dd className="mt-2 text-2xl font-semibold text-slate-700">
                - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dadosIRPF.resumo.deducoesTotal)}
              </dd>
            </div>
            <div className="bg-slate-800 p-5 rounded-lg border border-slate-900 shadow-sm">
              <dt className="text-xs font-medium text-slate-300 uppercase tracking-wider">Rendimento Líquido</dt>
              <dd className="mt-2 text-2xl font-semibold text-white">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dadosIRPF.resumo.rendimentoLiquido)}
              </dd>
            </div>
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
              <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">IRRF (Retido na Fonte)</dt>
              <dd className="mt-2 text-2xl font-semibold text-red-600">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(dadosIRPF.resumo.impostoRetido)}
              </dd>
            </div>
          </div>

          {/* LISTA DE FONTES PAGADORAS PRONTA PARA CÓPIA */}
          <div className="space-y-6 pt-4">
            
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Fontes Pagadoras (Inquilinos)</h3>
              <p className="text-sm text-slate-500">Dados já deduzidos de despesas legais.</p>
            </div>

            <div className="grid grid-cols-1 gap-5">
              {dadosIRPF.fontesPagadoras.map((fonte) => (
                <div key={fonte.id} className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                  
                  {/* Cabeçalho do Card da Fonte Pagadora */}
                  <div className={`px-6 py-4 border-b border-slate-200 flex justify-between items-center ${fonte.tipo === 'PJ' ? 'bg-blue-50/50' : 'bg-slate-50'}`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${fonte.tipo === 'PJ' ? 'bg-blue-200 text-blue-800' : 'bg-slate-200 text-slate-700'}`}>
                          {fonte.tipo === 'PJ' ? 'Ficha: Rendimentos de PJ' : 'Ficha: Recebidos de PF (Carnê-Leão)'}
                        </span>
                      </div>
                      <h4 className="text-base font-semibold text-slate-900 mt-2">{fonte.nome}</h4>
                      <p className="text-sm text-slate-500 font-mono mt-0.5">{fonte.documento}</p>
                    </div>
                    
                    <button 
                      onClick={() => copiarParaAreaDeTransferencia(fonte.id, `${fonte.nome}\n${fonte.documento}\nRendimento Líquido: ${fonte.rendimentoLiquido}\nIRRF: ${fonte.irrf}`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
                    >
                      {copiadoId === fonte.id ? (
                        <><svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> Copiado!</>
                      ) : (
                        <><svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> Copiar Dados</>
                      )}
                    </button>
                  </div>

                  {/* Detalhamento dos Valores */}
                  <div className="px-6 py-5 bg-white">
                    <p className="text-xs text-slate-500 mb-4 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                      Origem: {fonte.imovel}
                    </p>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                      <div>
                        <span className="block text-xs font-medium text-slate-500">Aluguel Bruto Recebido</span>
                        <span className="block mt-1 text-sm text-slate-900 font-medium">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(fonte.rendimentoBruto)}
                        </span>
                      </div>
                      <div>
                        <span className="block text-xs font-medium text-slate-500">Deduções (IPTU/Condomínio)</span>
                        <span className="block mt-1 text-sm text-slate-500">
                          - {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(fonte.deducoesIPTU + fonte.comissaoAdm)}
                        </span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded -mt-2 -mx-2">
                        <span className="block text-xs font-semibold text-slate-700">Rendimento Líquido (Declarar)</span>
                        <span className="block mt-1 text-base text-slate-900 font-bold">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(fonte.rendimentoLiquido)}
                        </span>
                      </div>
                      {fonte.tipo === 'PJ' && (
                        <div>
                          <span className="block text-xs font-medium text-slate-500">IRRF (Retido na Fonte)</span>
                          <span className="block mt-1 text-sm text-red-600 font-medium">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(fonte.irrf)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                </div>
              ))}
            </div>

            {/* Aviso Informativo */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3 mt-8">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Dica de Preenchimento:</p>
                <p>Os rendimentos de <strong>Pessoa Jurídica (PJ)</strong> devem ser informados na ficha <em>"Rendimentos Tributáveis Recebidos de PJ pelo Titular"</em>. Já os de <strong>Pessoa Física (PF)</strong> vão na ficha <em>"Rendimentos Tributáveis Recebidos de PF/Exterior"</em>. Use os botões "Copiar Dados" para agilizar o preenchimento no software da Receita Federal.</p>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}