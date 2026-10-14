'use client';

import React, { useState } from 'react';

export default function PontoEixoNovoInquilino() {
  const [tipoPessoa, setTipoPessoa] = useState<'PF' | 'PJ'>('PF');

  return (
    <div className="min-h-screen flex bg-[#F4F4F5] font-sans text-slate-800">
      
      {/* BARRA LATERAL (Cores mais sérias e sóbrias) */}
      <aside className="w-64 bg-white border-r border-slate-200 flex-col hidden md:flex z-40">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <h1 className="text-xl font-medium tracking-tight text-slate-900">
            Ponto<span className="font-bold text-slate-500">Eixo</span>
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <a href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            Visão 3D
          </a>
          <a href="/contratos" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Contratos
          </a>
          {/* Link Ativo com tom neutro escuro */}
          <a href="/inquilinos" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium bg-slate-100 text-slate-900 transition-colors">
            <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            Inquilinos
          </a>
        </nav>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          
          {/* Cabeçalho com botão de voltar */}
          <div className="mb-6 flex items-center gap-4">
            <a href="/inquilinos" className="p-2 rounded-md text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </a>
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Cadastrar Inquilino</h2>
              <p className="text-sm text-slate-500 mt-1">Preencha os dados completos para o dossiê do locatário.</p>
            </div>
          </div>

          {/* FORMULÁRIO PRINCIPAL */}
          <form className="bg-white border border-slate-200 rounded-lg shadow-sm" onSubmit={(e) => e.preventDefault()}>
            
            {/* TIPO DE PESSOA (PF / PJ) */}
            <div className="px-8 py-6 border-b border-slate-200 bg-slate-50/50 rounded-t-lg">
              <div className="flex items-center gap-6">
                <span className="text-sm font-medium text-slate-700">Tipo de Cadastro:</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="tipoPessoa" 
                    value="PF" 
                    checked={tipoPessoa === 'PF'}
                    onChange={() => setTipoPessoa('PF')}
                    className="w-4 h-4 text-slate-800 border-slate-300 focus:ring-slate-800" 
                  />
                  <span className="text-sm text-slate-800">Pessoa Física (PF)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="tipoPessoa" 
                    value="PJ" 
                    checked={tipoPessoa === 'PJ'}
                    onChange={() => setTipoPessoa('PJ')}
                    className="w-4 h-4 text-slate-800 border-slate-300 focus:ring-slate-800" 
                  />
                  <span className="text-sm text-slate-800">Pessoa Jurídica (PJ)</span>
                </label>
              </div>
            </div>

            <div className="px-8 py-8 space-y-10">
              
              {/* SEÇÃO 1: FOTO & DADOS PRINCIPAIS */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-5">1. Dados Principais</h3>
                
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Upload de Foto (Estilo Avatar) */}
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-28 h-28 rounded-full border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-100 hover:border-slate-400 transition-colors cursor-pointer overflow-hidden">
                      <svg className="w-8 h-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      <span className="text-[10px] font-medium uppercase">Add Foto</span>
                    </div>
                  </div>

                  {/* Grid de Inputs Pessoais */}
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        {tipoPessoa === 'PF' ? 'Nome Completo' : 'Razão Social'}
                      </label>
                      <input type="text" className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500 sm:text-sm" placeholder={tipoPessoa === 'PF' ? 'Ex: João da Silva' : 'Ex: Empresa XYZ Ltda'} />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        {tipoPessoa === 'PF' ? 'CPF' : 'CNPJ'}
                      </label>
                      <input type="text" className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500 sm:text-sm" placeholder={tipoPessoa === 'PF' ? '000.000.000-00' : '00.000.000/0001-00'} />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        {tipoPessoa === 'PF' ? 'RG / Órgão Emissor' : 'Inscrição Estadual'}
                      </label>
                      <input type="text" className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500 sm:text-sm" />
                    </div>

                    {/* Exibe Idade, Sexo e Estado Civil apenas se for PF */}
                    {tipoPessoa === 'PF' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Data de Nascimento</label>
                          <input type="date" className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500 sm:text-sm text-slate-700" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Sexo / Gênero</label>
                          <select className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500 sm:text-sm text-slate-700 bg-white">
                            <option value="">Selecione...</option>
                            <option value="M">Masculino</option>
                            <option value="F">Feminino</option>
                            <option value="O">Outro</option>
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-1">Estado Civil</label>
                          <select className="w-full md:w-1/2 border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500 sm:text-sm text-slate-700 bg-white">
                            <option value="">Selecione...</option>
                            <option value="solteiro">Solteiro(a)</option>
                            <option value="casado">Casado(a)</option>
                            <option value="divorciado">Divorciado(a)</option>
                            <option value="viuvo">Viúvo(a)</option>
                          </select>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <hr className="border-slate-200" />

              {/* SEÇÃO 2: CONTATO */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-5">2. Informações de Contato</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">E-mail Principal</label>
                    <input type="email" className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500 sm:text-sm" placeholder="email@exemplo.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Celular / WhatsApp</label>
                    <input type="text" className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500 sm:text-sm" placeholder="(00) 00000-0000" />
                  </div>
                </div>
              </div>

              <hr className="border-slate-200" />

              {/* SEÇÃO 3: VÍNCULO COM IMÓVEL */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-5">3. Vínculo de Locação</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-slate-50 border border-slate-200 p-5 rounded-md">
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Imóvel Destinado</label>
                    <select className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500 sm:text-sm text-slate-700 bg-white">
                      <option value="">Selecione um ponto comercial disponível...</option>
                      <option value="chacara-externa">Chácara Imperial - Área Externa</option>
                      <option value="salao-beleza">Salão de Beleza Estrela (São José de Ribamar)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Locação</label>
                    <select className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500 sm:text-sm text-slate-700 bg-white">
                      <option value="comercial">Comercial</option>
                      <option value="residencial">Residencial</option>
                      <option value="temporada">Temporada / Evento</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Garantia Locatícia</label>
                    <select className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500 sm:text-sm text-slate-700 bg-white">
                      <option value="">Selecione o tipo de garantia...</option>
                      <option value="fiador">Fiador (Com imóvel)</option>
                      <option value="caucao">Caução (Depósito)</option>
                      <option value="seguro">Seguro Fiança</option>
                      <option value="nenhuma">Nenhuma</option>
                    </select>
                  </div>

                </div>
              </div>

            </div>

            {/* RODAPÉ: BOTÕES DE AÇÃO */}
            <div className="px-8 py-5 border-t border-slate-200 bg-slate-50/50 rounded-b-lg flex items-center justify-end gap-3">
              <button 
                type="button" 
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="px-6 py-2 text-sm font-medium text-white bg-slate-800 border border-transparent rounded-md shadow-sm hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-800 transition-colors"
              >
                Salvar Inquilino
              </button>
            </div>

          </form>

        </div>
      </main>
    </div>
  );
}