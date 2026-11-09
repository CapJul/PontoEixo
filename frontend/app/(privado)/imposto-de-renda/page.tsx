'use client';

import React, { useCallback, useState } from 'react';

import AvisoErro from '@/componentes/AvisoErro';
import DeducoesImovel from '@/componentes/DeducoesImovel';
import MenuLateral from '@/componentes/MenuLateral';
import { formatarDocumento, formatarReais } from '@/lib/formatacao';
import { NOMES_MESES, obterRelatorio, type RelatorioIR } from '@/lib/impostoRenda';
import { useDadosApi } from '@/lib/useDadosApi';

type Aba = 'resumo' | 'carne-leao' | 'deducoes';

const ABAS: { id: Aba; label: string }[] = [
  { id: 'resumo', label: 'Resumo Anual (DIRPF)' },
  { id: 'carne-leao', label: 'Carnê-Leão Mensal' },
  { id: 'deducoes', label: 'Despesas Dedutíveis' },
];

// A declaração entregue em um ano se refere ao ano anterior (ano-base)
const ANO_BASE_PADRAO = new Date().getFullYear() - 1;

const ICONE_OK = (
  <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
);
const ICONE_COPIAR = (
  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
);

function BotaoCopiar({ id, texto, copiadoId, aoCopiar }: { id: string; texto: string; copiadoId: string | null; aoCopiar: (id: string, texto: string) => void }) {
  return (
    <button 
      onClick={() => aoCopiar(id, texto)}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors print:hidden"
    >
      {copiadoId === id ? <>{ICONE_OK} Copiado!</> : <>{ICONE_COPIAR} Copiar Dados</>}
    </button>
  );
}

export default function PontoEixoImpostoRenda() {
  const [anoSelecionado, setAnoSelecionado] = useState(ANO_BASE_PADRAO);
  const [abaAtiva, setAbaAtiva] = useState<Aba>('resumo');
  const [copiadoId, setCopiadoId] = useState<string | null>(null);

  const buscar = useCallback(() => obterRelatorio(anoSelecionado), [anoSelecionado]);
  const { dados: relatorio, carregando, erro, recarregar } = useDadosApi<RelatorioIR | null>(buscar, null);

  // Copia os dados no formato usado pelo programa da Receita
  const copiarParaAreaDeTransferencia = (id: string, texto: string) => {
    navigator.clipboard.writeText(texto).catch(() => undefined);
    setCopiadoId(id);
    setTimeout(() => setCopiadoId(null), 2000);
  };

  const anos = relatorio?.anos_disponiveis ?? [ANO_BASE_PADRAO];
  const mesesComRendimento = relatorio?.carne_leao.filter(m => m.rendimento_bruto > 0) ?? [];
  const totalCarneLeao = mesesComRendimento.reduce((soma, m) => soma + m.rendimento_bruto, 0);

  return (
    <div className="min-h-screen flex bg-[#F4F4F5] font-sans text-slate-900">
      
      {/* BARRA LATERAL */}
      <MenuLateral />

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          
          {/* Cabeçalho */}
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Declaração de IRPF · Ano Base {anoSelecionado}</h2>
              <div className="flex items-center gap-3 mt-1.5">
                <p className="text-sm text-slate-500">Aluguéis recebidos no ano (regime de caixa).</p>
                {relatorio && (
                  <span className="bg-slate-200 text-slate-700 text-xs px-2.5 py-0.5 rounded-full font-medium">
                    Titular: {relatorio.titular}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3 print:hidden">
              <select 
                value={anoSelecionado}
                onChange={(e) => setAnoSelecionado(Number(e.target.value))}
                aria-label="Ano-base"
                className="pl-3 pr-8 py-2 text-sm border-slate-300 rounded-md focus:ring-slate-500 focus:border-slate-500 bg-white shadow-sm font-medium"
              >
                {[...new Set([...anos, anoSelecionado])].sort((a, b) => b - a).map((ano) => (
                  <option key={ano} value={ano}>
                    Ano Base {ano}{ano === ANO_BASE_PADRAO ? ' (Atual)' : ''}
                  </option>
                ))}
              </select>
              
              <button
                onClick={() => window.print()}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:ring-2 focus:ring-offset-1 focus:ring-slate-500 shadow-sm transition-all"
              >
                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Imprimir / PDF
              </button>
            </div>
          </header>

          {/* Abas de Navegação */}
          <div className="flex flex-wrap gap-1 bg-slate-200/50 p-1 rounded-lg w-max print:hidden">
            {ABAS.map((aba) => (
              <button
                key={aba.id}
                onClick={() => setAbaAtiva(aba.id)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${abaAtiva === aba.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                {aba.label}
              </button>
            ))}
          </div>

          <AvisoErro mensagem={erro} />

          {abaAtiva === 'deducoes' ? (
            <DeducoesImovel ano={anoSelecionado} aoAlterar={recarregar} />
          ) : !relatorio ? (
            <p className="text-sm text-slate-500">{carregando ? 'Carregando relatório...' : ''}</p>
          ) : (
          <>
          {/* INDICADORES TOTAIS (KPIs) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
              <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">Rendimento Bruto</dt>
              <dd className="mt-2 text-2xl font-semibold text-slate-900">{formatarReais(relatorio.resumo.rendimento_bruto)}</dd>
            </div>
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
              <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">Deduções (IPTU/Cond./Adm.)</dt>
              <dd className="mt-2 text-2xl font-semibold text-slate-700">- {formatarReais(relatorio.resumo.deducoes)}</dd>
            </div>
            <div className="bg-slate-800 p-5 rounded-lg border border-slate-900 shadow-sm">
              <dt className="text-xs font-medium text-slate-300 uppercase tracking-wider">Rendimento Líquido</dt>
              <dd className="mt-2 text-2xl font-semibold text-white">{formatarReais(relatorio.resumo.rendimento_liquido)}</dd>
            </div>
            <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
              <dt className="text-xs font-medium text-slate-500 uppercase tracking-wider">IRRF (Retido na Fonte)</dt>
              <dd className="mt-2 text-2xl font-semibold text-red-600">{formatarReais(relatorio.resumo.irrf)}</dd>
            </div>
          </div>

          {relatorio.deducoes_nao_aproveitadas > 0 && (
            <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-4 py-3">
              {formatarReais(relatorio.deducoes_nao_aproveitadas)} em despesas dedutíveis não foram usados porque
              superam o aluguel recebido do imóvel ou o imóvel não teve aluguel recebido em {relatorio.ano}.
            </p>
          )}

          {abaAtiva === 'resumo' && (
          /* LISTA DE FONTES PAGADORAS PRONTA PARA CÓPIA */
          <div className="space-y-6 pt-4">
            
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Fontes Pagadoras (Inquilinos)</h3>
              <p className="text-sm text-slate-500">Dados já deduzidos de despesas legais.</p>
            </div>

            {relatorio.fontes.length === 0 && (
              <div className="bg-white rounded-lg border border-slate-200 px-6 py-10 text-center text-sm text-slate-500">
                Nenhum aluguel recebido em {relatorio.ano}. Os valores aparecem aqui depois que você registra os pagamentos na tela de Contratos.
              </div>
            )}

            <div className="grid grid-cols-1 gap-5">
              {relatorio.fontes.map((fonte) => {
                const documento = formatarDocumento(fonte.documento);
                return (
                <div key={fonte.inquilino_id} className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden break-inside-avoid">
                  
                  {/* Cabeçalho do Card da Fonte Pagadora */}
                  <div className={`px-6 py-4 border-b border-slate-200 flex justify-between items-center ${fonte.tipo_pessoa === 'PJ' ? 'bg-blue-50/50' : 'bg-slate-50'}`}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${fonte.tipo_pessoa === 'PJ' ? 'bg-blue-200 text-blue-800' : 'bg-slate-200 text-slate-700'}`}>
                          {fonte.tipo_pessoa === 'PJ' ? 'Ficha: Rendimentos de PJ' : 'Ficha: Recebidos de PF (Carnê-Leão)'}
                        </span>
                      </div>
                      <h4 className="text-base font-semibold text-slate-900 mt-2">{fonte.nome}</h4>
                      <p className="text-sm text-slate-500 font-mono mt-0.5">{documento}</p>
                    </div>
                    
                    <BotaoCopiar
                      id={`fonte-${fonte.inquilino_id}`}
                      copiadoId={copiadoId}
                      aoCopiar={copiarParaAreaDeTransferencia}
                      texto={[
                        fonte.nome,
                        documento,
                        `Rendimento Bruto: ${formatarReais(fonte.rendimento_bruto)}`,
                        `Deduções: ${formatarReais(fonte.deducoes)}`,
                        `Rendimento Líquido: ${formatarReais(fonte.rendimento_liquido)}`,
                        ...(fonte.tipo_pessoa === 'PJ' ? [`IRRF: ${formatarReais(fonte.irrf)}`] : []),
                      ].join('\n')}
                    />
                  </div>

                  {/* Detalhamento dos Valores */}
                  <div className="px-6 py-5 bg-white">
                    <p className="text-xs text-slate-500 mb-4 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                      Origem: {fonte.imoveis.join(', ')} · {fonte.quantidade_pagamentos} {fonte.quantidade_pagamentos === 1 ? 'pagamento' : 'pagamentos'}
                    </p>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                      <div>
                        <span className="block text-xs font-medium text-slate-500">Aluguel Bruto Recebido</span>
                        <span className="block mt-1 text-sm text-slate-900 font-medium">{formatarReais(fonte.rendimento_bruto)}</span>
                      </div>
                      <div>
                        <span className="block text-xs font-medium text-slate-500">Deduções (IPTU/Cond./Adm.)</span>
                        <span className="block mt-1 text-sm text-slate-500">- {formatarReais(fonte.deducoes)}</span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded -mt-2 -mx-2">
                        <span className="block text-xs font-semibold text-slate-700">Rendimento Líquido (Declarar)</span>
                        <span className="block mt-1 text-base text-slate-900 font-bold">{formatarReais(fonte.rendimento_liquido)}</span>
                      </div>
                      {fonte.tipo_pessoa === 'PJ' && (
                        <div>
                          <span className="block text-xs font-medium text-slate-500">IRRF (Retido na Fonte)</span>
                          <span className="block mt-1 text-sm text-red-600 font-medium">{formatarReais(fonte.irrf)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                </div>
                );
              })}
            </div>

            {/* Aviso Informativo */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3 mt-8">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Dica de Preenchimento:</p>
                <p>Os rendimentos de <strong>Pessoa Jurídica (PJ)</strong> devem ser informados na ficha <em>&quot;Rendimentos Tributáveis Recebidos de PJ pelo Titular&quot;</em>. Já os de <strong>Pessoa Física (PF)</strong> vão na ficha <em>&quot;Rendimentos Tributáveis Recebidos de PF/Exterior&quot;</em>. Use os botões &quot;Copiar Dados&quot; para agilizar o preenchimento no software da Receita Federal.</p>
              </div>
            </div>

          </div>
          )}

          {abaAtiva === 'carne-leao' && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Rendimentos de Pessoas Físicas por Mês</h3>
              <p className="text-sm text-slate-500">Total no ano: {formatarReais(totalCarneLeao)}</p>
            </div>
            <p className="text-sm text-slate-500">
              Aluguéis recebidos de inquilinos PF devem ser lançados no Carnê-Leão no mês do recebimento. As despesas
              dedutíveis entram no mês em que foram pagas.
            </p>

            {mesesComRendimento.length === 0 ? (
              <div className="bg-white rounded-lg border border-slate-200 px-6 py-10 text-center text-sm text-slate-500">
                Nenhum aluguel recebido de pessoa física em {relatorio.ano}.
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      <th className="px-6 py-3">Mês</th>
                      <th className="px-6 py-3">Fontes (CPF)</th>
                      <th className="px-6 py-3">Rendimento</th>
                      <th className="px-6 py-3 print:hidden"><span className="sr-only">Ações</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {mesesComRendimento.map((mes) => (
                      <tr key={mes.mes}>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">{NOMES_MESES[mes.mes - 1]}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">
                          {mes.fontes.map((f) => (
                            <span key={f.documento} className="block">
                              {f.nome} <span className="text-slate-400 font-mono">({formatarDocumento(f.documento)})</span>: {formatarReais(f.valor)}
                            </span>
                          ))}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-900 whitespace-nowrap">{formatarReais(mes.rendimento_bruto)}</td>
                        <td className="px-6 py-4 text-right print:hidden">
                          <BotaoCopiar
                            id={`mes-${mes.mes}`}
                            copiadoId={copiadoId}
                            aoCopiar={copiarParaAreaDeTransferencia}
                            texto={[
                              `${NOMES_MESES[mes.mes - 1]}/${relatorio.ano}`,
                              ...mes.fontes.map((f) => `${f.nome} (${formatarDocumento(f.documento)}): ${formatarReais(f.valor)}`),
                              `Total: ${formatarReais(mes.rendimento_bruto)}`,
                            ].join('\n')}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          )}
          </>
          )}
        </div>
      </main>
    </div>
  );
}
