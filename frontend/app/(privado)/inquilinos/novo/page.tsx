'use client';

import MenuLateral from '@/componentes/MenuLateral';
import React, { useState } from 'react';

export default function PontoEixoNovoInquilino() {
  const [fotoUpload, setFotoUpload] = useState<string | null>(null);
  const [tipoPessoa, setTipoPessoa] = useState<'PF' | 'PJ'>('PF');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (fotoUpload) {
        URL.revokeObjectURL(fotoUpload);
      }
      setFotoUpload(URL.createObjectURL(file));
    }
  };

  const handleRemoveFoto = () => {
    if (fotoUpload) {
      URL.revokeObjectURL(fotoUpload);
    }
    setFotoUpload(null);
  };

  return (
    <div className="min-h-screen flex bg-[#F4F4F5] font-sans text-slate-800">
      
      <MenuLateral />

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
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-5">
                  1. Dados Principais
                </h3>
                
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Upload de Foto (Estilo Avatar) */}
                  <div className="flex flex-col items-center gap-3">
                    {/* Adicionado 'relative' aqui para o input absolute funcionar corretamente */}
                    <div className="relative w-28 h-28 rounded-full border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-slate-400 hover:bg-slate-100 hover:border-slate-400 transition-colors cursor-pointer overflow-hidden">
                      
                      {/* Input invisível cobrindo todo o círculo */}
                      <input 
                        type="file" 
                        onChange={handleImageChange} 
                        accept="image/*" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                      />
                      
                      {
                        fotoUpload ? (
                          <img src={fotoUpload} alt="Foto do Inquilino" className="w-full h-full object-cover" />
                        ) : (
                          <>
                            <svg className="w-10 h-10 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 014-4h10a4 4 0 014 4v5H3v-5zM12 7a4 4 0 100-8 4 4 0 000 8z" /></svg>
                            <span className="text-xs text-slate-500">Add Foto</span>
                          </>
                        )
                      }
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