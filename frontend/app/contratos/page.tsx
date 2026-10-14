'use client';

import React, { useState } from 'react';

// Mock de dados atualizado com telefones para o WhatsApp funcionar
const contratos = [
  {
    id: 'ct-001',
    inquilino: 'Sr. Roberto',
    telefone: '98999999999',
    propriedade: 'Padaria Doce Vida (São José de Ribamar)',
    valor: 'R$ 8.500,00',
    vencimentoAluguel: 'Dia 05',
    inicioContrato: '10/01/2023',
    fimContrato: '10/01/2026',
    reajuste: 'IPCA (Falta 2 meses)',
    status: 'ativo', 
    linkGov: null,
  },
  {
    id: 'ct-002',
    inquilino: 'Sr. Carlos',
    telefone: '98988888888',
    propriedade: 'Celular Tech Store (São Luís)',
    valor: 'R$ 2.500,00',
    vencimentoAluguel: 'Dia 10',
    inicioContrato: '15/10/2024',
    fimContrato: '15/10/2025',
    reajuste: 'IGP-M',
    status: 'pendente_assinatura',
    linkGov: 'https://assinador.iti.br/assinatura/',
  },
  {
    id: 'ct-003',
    inquilino: 'Alana Carla',
    telefone: '98977777777',
    propriedade: 'Rouparia Fashion Alana (São Luís)',
    valor: 'R$ 2.100,00',
    vencimentoAluguel: 'Dia 15',
    inicioContrato: '01/03/2022',
    fimContrato: '01/03/2024',
    reajuste: 'IPCA',
    status: 'encerrado',
    linkGov: null,
  }
];

export default function PontoEixoContratos() {
  const [filtro, setFiltro] = useState('todos');
  const [modalAtivo, setModalAtivo] = useState<'importar' | 'novo' | null>(null);

  // Funcionalidade do WhatsApp
  const abrirWhatsApp = (telefone: string, inquilino: string, propriedade: string) => {
    const mensagem = encodeURIComponent(`Olá, ${inquilino}. Aqui é da administração do PontoEixo. Entramos em contato referente ao contrato do espaço: ${propriedade}.`);
    window.open(`https://wa.me/55${telefone}?text=${mensagem}`, '_blank');
  };

  // Funcionalidade de Download (Simulada)
  const baixarSegundaVia = (inquilino: string) => {
    alert(`Iniciando o download do contrato de ${inquilino}...`);
  };

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans text-gray-900">
      
      {/* BARRA LATERAL */}
      <aside className="w-64 bg-white border-r border-gray-200 flex-col hidden md:flex z-40">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <h1 className="text-xl font-medium tracking-tight text-gray-900">
            Ponto<span className="font-bold text-blue-600">Eixo</span>
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <a href="/home" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            Visão 3D
          </a>
          <a href="/contratos" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium bg-blue-50 text-blue-700 transition-colors">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Contratos
          </a>
          <a href="/inquilinos" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            Inquilinos
          </a>
        </nav>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          
          {/* Cabeçalho da Seção */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Gestão de Contratos</h2>
              <p className="text-sm text-gray-500 mt-1">Gerencie documentos, acompanhe reajustes e colete assinaturas.</p>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setModalAtivo('importar')}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-all"
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                Importar PDF
              </button>
              <button 
                onClick={() => setModalAtivo('novo')}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                Novo Contrato
              </button>
            </div>
          </header>

          {/* Filtros */}
          <div className="flex gap-2 mb-6 border-b border-gray-200 pb-4">
            {[
              { id: 'todos', label: 'Todos os contratos' },
              { id: 'ativo', label: 'Ativos' },
              { id: 'pendente_assinatura', label: 'Aguardando assinatura' },
              { id: 'encerrado', label: 'Encerrados' }
            ].map((f) => (
              <button 
                key={f.id}
                onClick={() => setFiltro(f.id)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  filtro === f.id 
                  ? 'bg-gray-100 text-gray-900' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Lista de Contratos */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {contratos
              .filter(c => filtro === 'todos' || c.status === filtro)
              .map((contrato) => (
              <div key={contrato.id} className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col">
                
                <div className="p-5 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">{contrato.inquilino}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {contrato.propriedade}
                      </p>
                    </div>
                    
                    {/* Badges de Status (Padrão SaaS com Ring) */}
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                      contrato.status === 'ativo' ? 'bg-green-50 text-green-700 ring-green-600/20' : 
                      contrato.status === 'pendente_assinatura' ? 'bg-yellow-50 text-yellow-800 ring-yellow-600/20' : 
                      'bg-gray-50 text-gray-600 ring-gray-500/10'
                    }`}>
                      {contrato.status === 'pendente_assinatura' ? 'Pendente' : contrato.status.charAt(0).toUpperCase() + contrato.status.slice(1)}
                    </span>
                  </div>

                  {/* Grid de Informações Financeiras */}
                  <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-t border-gray-100">
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Aluguel</dt>
                      <dd className="mt-1 text-sm font-semibold text-gray-900">{contrato.valor}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Vencimento</dt>
                      <dd className="mt-1 text-sm text-gray-900">{contrato.vencimentoAluguel}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Vigência</dt>
                      <dd className="mt-1 text-sm text-gray-900">{contrato.inicioContrato} a {contrato.fimContrato}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Reajuste</dt>
                      <dd className={`mt-1 text-sm font-medium ${contrato.reajuste.includes('Falta') ? 'text-red-600' : 'text-gray-900'}`}>
                        {contrato.reajuste}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Footer do Card com Ações */}
                <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 flex flex-wrap items-center gap-3 rounded-b-lg">
                  <button 
                    onClick={() => baixarSegundaVia(contrato.inquilino)}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Baixar PDF
                  </button>

                  {contrato.status === 'pendente_assinatura' && contrato.linkGov && (
                    <a 
                      href={contrato.linkGov}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                      Assinar Gov.br
                    </a>
                  )}

                  <div className="flex-1"></div>

                  {/* Ações Secundárias */}
                  <button 
                    onClick={() => abrirWhatsApp(contrato.telefone, contrato.inquilino, contrato.propriedade)}
                    className="text-gray-400 hover:text-green-600 transition-colors" 
                    title="Cobrar via WhatsApp"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                  </button>
                  <button 
                    onClick={() => alert('Abrindo laudos de vistoria...')}
                    className="text-gray-400 hover:text-blue-600 transition-colors" 
                    title="Laudos de Vistoria"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>
      </main>

      {/* MODAL GLOBAL (Renderização Condicional) */}
      {modalAtivo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {modalAtivo === 'importar' ? 'Importar Contrato PDF' : 'Gerar Novo Contrato'}
              </h3>
              <button onClick={() => setModalAtivo(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6">
              {modalAtivo === 'importar' ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  <p className="mt-2 text-sm text-gray-600">Clique para selecionar ou arraste o PDF aqui</p>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setModalAtivo(null); alert('Contrato gerado!'); }}>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Inquilino</label>
                    <select className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                      <option>Selecione um inquilino...</option>
                      <option>Sr. Roberto</option>
                      <option>Sr. Carlos</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Propriedade</label>
                    <select className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                      <option>Selecione um espaço...</option>
                      <option>Padaria Doce Vida</option>
                    </select>
                  </div>
                  <button type="submit" className="w-full mt-4 bg-blue-600 text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Gerar Documento
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}