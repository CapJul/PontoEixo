'use client';

import React, { useState } from 'react';

export default function PontoEixoOperacionalMVP() {
  // Estados para simular interações do MVP
  const [alarmeAtivo, setAlarmeAtivo] = useState(true);
  const [senhaGerada, setSenhaGerada] = useState<string | null>(null);
  const [linkCopiado, setLinkCopiado] = useState(false);

  const gerarSenhaTemporaria = () => {
    setSenhaGerada(Math.floor(100000 + Math.random() * 900000).toString());
    setTimeout(() => setSenhaGerada(null), 8000); // Some após 8s
  };

  const copiarLinkMagico = () => {
    setLinkCopiado(true);
    setTimeout(() => setLinkCopiado(false), 2000);
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans text-slate-900">
      
      {/* BARRA LATERAL */}
      <aside className="w-64 bg-white border-r border-slate-200 flex-col hidden md:flex z-40">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <h1 className="text-xl font-medium tracking-tight text-slate-900">
            Ponto<span className="font-bold text-slate-500">Eixo</span>
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <a href="/home" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            Visão 3D
          </a>
          <a href="/contratos" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Contratos
          </a>
          {/* Aba Ativa */}
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium bg-slate-200 text-slate-900 transition-colors">
            <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Operacional (MVP)
          </a>
        </nav>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          
          <header className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-900">Central de Operações</h2>
            <p className="text-sm text-slate-500 mt-1">Integração de acesso, eventos, manutenção e comunicação direta.</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* COLUNA ESQUERDA (Locação Híbrida e Reajuste) */}
            <div className="space-y-6 lg:col-span-2">
              
              {/* 1. MÓDULO DE LOCAÇÃO HÍBRIDA (Eventos / Temporada) */}
              <section className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Gestão de Eventos (Locação Curta)
                  </h3>
                  <select className="text-sm border-slate-200 rounded-md focus:ring-slate-500 text-slate-600 bg-slate-50 py-1">
                    <option>Chácara Imperial</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-slate-100 bg-slate-50 rounded-md p-4">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Próxima Reserva</p>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-sm font-medium text-slate-900">Confraternização Empresa XYZ</p>
                        <p className="text-xs text-slate-500 mt-1">24 a 26 de Outubro</p>
                      </div>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-medium">Confirmado</span>
                    </div>
                  </div>
                  <div className="border border-slate-100 bg-slate-50 rounded-md p-4 flex flex-col justify-center items-center gap-2 border-dashed">
                    <p className="text-sm text-slate-500">Nenhum bloqueio para o próximo fim de semana.</p>
                    <button className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors">
                      + Bloquear Datas / Nova Reserva
                    </button>
                  </div>
                </div>
              </section>

              {/* 2. ASSISTENTE DE NEGOCIAÇÃO E PORTAL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Assistente de Reajuste */}
                <section className="bg-amber-50 rounded-lg border border-amber-200 shadow-sm p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <svg className="w-16 h-16 text-amber-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                  </div>
                  <h3 className="text-sm font-semibold text-amber-900 uppercase tracking-wider mb-2">Assistente de Reajuste</h3>
                  <p className="text-sm text-amber-800 font-medium">Contrato: Padaria Doce Vida</p>
                  <p className="text-xs text-amber-700 mt-1 mb-4">O IPCA acumulado bateu 4.5%. O novo valor sugerido é de <span className="font-bold">R$ 4.389,00</span>.</p>
                  <button className="w-full bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium py-2 rounded-md transition-colors shadow-sm">
                    Enviar Notificação Amigável
                  </button>
                </section>

                {/* Portal do Inquilino Fricção Zero */}
                <section className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-2">Portal Fricção Zero</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">Envie um link mágico para o inquilino acessar boletos e chamados sem precisar de senha.</p>
                  </div>
                  <button 
                    onClick={copiarLinkMagico}
                    className="w-full mt-4 flex items-center justify-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium py-2 rounded-md transition-colors shadow-sm"
                  >
                    {linkCopiado ? (
                      <><svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> Link Copiado!</>
                    ) : (
                      <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg> Gerar Link Mágico</>
                    )}
                  </button>
                </section>

              </div>
            </div>

            {/* COLUNA DIREITA (IoT Hub e Manutenção) */}
            <div className="space-y-6">
              
              {/* 3. HUB DE SEGURANÇA E ACESSO (IoT) */}
              <section className="bg-slate-900 rounded-lg border border-slate-800 shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-semibold flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    Hub de Acesso IoT
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Online</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Status de Câmera/Sensor */}
                  <div className="flex items-center justify-between bg-slate-800 p-3 rounded-md border border-slate-700">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                      <div>
                        <p className="text-xs font-medium">Câmera Externa Wi-Fi</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Nenhum movimento detectado</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-green-400">Ativa</span>
                  </div>

                  {/* Controle de Sirene/Alarme */}
                  <div className="flex items-center justify-between bg-slate-800 p-3 rounded-md border border-slate-700">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                      <div>
                        <p className="text-xs font-medium">Sirene e Sensor PIR</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Armado (Chácara Vazia)</p>
                      </div>
                    </div>
                    {/* Toggle Switch */}
                    <button 
                      onClick={() => setAlarmeAtivo(!alarmeAtivo)}
                      className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors ${alarmeAtivo ? 'bg-blue-500' : 'bg-slate-600'}`}
                    >
                      <div className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform ${alarmeAtivo ? 'translate-x-5' : 'translate-x-0'}`}></div>
                    </button>
                  </div>

                  {/* Fechadura ESP32 */}
                  <div className="pt-2">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Fechadura Inteligente (ESP32)</p>
                    {senhaGerada ? (
                      <div className="bg-slate-800 p-4 rounded-md border border-slate-700 text-center animate-pulse">
                        <p className="text-xs text-slate-400 mb-1">Senha válida por 24h:</p>
                        <p className="text-2xl font-mono font-bold tracking-widest text-blue-400">{senhaGerada}</p>
                      </div>
                    ) : (
                      <button 
                        onClick={gerarSenhaTemporaria}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-md transition-colors"
                      >
                        Gerar Senha Temporária
                      </button>
                    )}
                  </div>
                </div>
              </section>

              {/* 4. HISTÓRICO DE MANUTENÇÃO (Prontuário) */}
              <section className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Prontuário do Imóvel</h3>
                
                <div className="space-y-4">
                  {/* Item Manutenção 1 */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Manutenção no Portão</p>
                      <p className="text-xs text-slate-500 mt-0.5">Troca de micro switch e relé. Guardado recibo na nuvem.</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-1">12 OUT 2026</p>
                    </div>
                  </div>

                  {/* Item Manutenção 2 */}
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Dedetização Anual</p>
                      <p className="text-xs text-slate-500 mt-0.5">Aplicação externa e interna. Custo: R$ 450,00.</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-1">05 SET 2026</p>
                    </div>
                  </div>
                </div>

                <button className="w-full mt-4 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded py-2 transition-colors">
                  Ver Histórico Completo
                </button>
              </section>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}