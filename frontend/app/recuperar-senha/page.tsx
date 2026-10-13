'use client';

import React, { useState } from 'react';

export default function PontoEixoEsqueceuSenha() {
  // Controle de etapas do fluxo de recuperação: 1 (E-mail) -> 2 (Código) -> 3 (Nova Senha)
  const [step, setStep] = useState<1 | 2 | 3>(1);

  return (
    <main className="min-h-screen grid grid-cols-1 md:grid-cols-2 font-sans text-slate-800">
      
      {/* COLUNA 1: Fluxo de Recuperação (Esquerda) */}
      <section className="flex flex-col justify-center items-center px-8 sm:px-16 lg:px-24 bg-white py-12 md:py-0">
        <div className="w-full max-w-md space-y-8">
          
          {/* Cabeçalho Dinâmico */}
          <div>
            <h1 className="text-4xl font-light tracking-tight text-slate-900 mb-2">
              Recuperar <span className="font-semibold text-blue-600">Acesso</span>
            </h1>
            <p className="text-slate-500 text-sm">
              {step === 1 && "Informe seu e-mail corporativo para receber as instruções de redefinição de senha."}
              {step === 2 && "Enviamos um código de segurança de 6 dígitos para o seu e-mail. Insira-o abaixo."}
              {step === 3 && "Crie uma nova senha forte para proteger seus dados e contratos."}
            </p>
          </div>

          {/* Renderização Condicional dos Passos */}
          <div className="mt-8">
            
            {/* PASSO 1: Solicitar Código */}
            {step === 1 && (
              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                    E-mail corporativo
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors"
                    placeholder="seu@email.com"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-lg text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all shadow-md"
                >
                  Enviar código de verificação
                </button>
              </form>
            )}

            {/* PASSO 2: Validar Código (OTP) */}
            {step === 2 && (
              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setStep(3); }}>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3 text-center">
                    Código de verificação
                  </label>
                  {/* Grid para inputs de 6 dígitos (OTP) */}
                  <div className="flex gap-2 sm:gap-3 justify-center">
                    {[1, 2, 3, 4, 5, 6].map((digit) => (
                      <input
                        key={digit}
                        type="text"
                        maxLength={1}
                        className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-semibold rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors"
                        placeholder="•"
                      />
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-all shadow-md"
                >
                  Validar código
                </button>
                <div className="text-center">
                  <button type="button" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
                    Reenviar código (00:59)
                  </button>
                </div>
              </form>
            )}

            {/* PASSO 3: Redefinir Senha */}
            {step === 3 && (
              <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); alert('Senha alterada com sucesso!'); }}>
                <div>
                  <label htmlFor="new-password" className="block text-sm font-medium text-slate-700 mb-1">
                    Nova senha
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors"
                    placeholder="••••••••"
                  />
                  {/* Indicador de força de senha simulado */}
                  <div className="flex gap-1 mt-2">
                    <div className="h-1 w-full bg-green-500 rounded-full"></div>
                    <div className="h-1 w-full bg-green-500 rounded-full"></div>
                    <div className="h-1 w-full bg-green-500 rounded-full"></div>
                    <div className="h-1 w-full bg-slate-200 rounded-full"></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Nível de segurança: Forte</p>
                </div>

                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700 mb-1">
                    Confirmar nova senha
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors"
                    placeholder="••••••••"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 px-4 mt-2 rounded-lg text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all shadow-md"
                >
                  Salvar nova senha
                </button>
              </form>
            )}

          </div>

          {/* Voltar para o Login */}
          <p className="text-center text-sm text-slate-500 mt-8">
            Lembrou sua senha?{' '}
            <a href="/login" className="font-semibold text-slate-900 hover:text-blue-600 transition-colors">
              Voltar para o login
            </a>
          </p>
        </div>
      </section>

      {/* COLUNA 2: Painel Visual Focado em Segurança (Direita) */}
      <section className="relative hidden md:flex flex-col justify-between p-12 overflow-hidden">
        
        {/* Fundo Azul Suave */}
        <div className="absolute inset-0 bg-[#E8F0FE] z-0"></div>
        
        {/* Textura de Papel Amassado */}
        <div 
          className="absolute inset-0 z-10 opacity-50 mix-blend-multiply pointer-events-none"
          style={{
            backgroundImage: "url('https://www.transparenttextures.com/patterns/crumpled-paper.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        ></div>

        <div className="absolute inset-0 bg-gradient-to-t from-[#D2E3FC]/90 via-[#D2E3FC]/20 to-transparent z-10 pointer-events-none"></div>

        {/* Elemento Gráfico Central: Escudo/Cadeado Minimalista */}
        <div className="relative z-20 flex-1 flex flex-col items-center justify-center mb-8">
          <div className="relative w-48 h-48 flex items-center justify-center">
            <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl"></div>
            
            <svg 
              className="w-32 h-32 text-blue-600 drop-shadow-lg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              {/* Escudo de Segurança */}
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" className="fill-blue-500/5" />
              {/* Cadeado centralizado */}
              <rect x="9" y="11" width="6" height="6" rx="1" className="stroke-2" />
              <path d="M10 11V9a2 2 0 014 0v2" className="stroke-2" />
            </svg>
          </div>
        </div>

        {/* Conteúdo de Texto sobreposto focado em proteção */}
        <div className="relative z-20 flex flex-col justify-end">
          <div className="bg-white/40 backdrop-blur-md p-8 rounded-2xl border border-white/60 shadow-xl max-w-lg mx-auto w-full">
            <h2 className="text-2xl font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Segurança em nível corporativo
            </h2>
            <p className="text-slate-800 leading-relaxed text-sm">
              No PontoEixo, a privacidade dos seus contratos e os dados dos seus locatários são protegidos com os mais altos padrões de segurança. Recupere seu acesso de forma rápida e segura.
            </p>
          </div>
        </div>

      </section>
    </main>
  );
}