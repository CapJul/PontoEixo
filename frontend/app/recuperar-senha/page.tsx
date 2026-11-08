'use client';

import React, { useEffect, useRef, useState, type ClipboardEvent, type FormEvent, type KeyboardEvent } from 'react';
import Link from 'next/link';

import AvisoErro from '@/componentes/AvisoErro';
import { mensagemDeErro } from '@/lib/api';
import { redefinirSenha, solicitarCodigo, validarCodigo } from '@/lib/autenticacao';

// Igual ao intervalo mínimo entre envios configurado no backend (SegundosEntreEnviosCodigo)
const SEGUNDOS_PARA_REENVIO = 60;
const QUANTIDADE_DIGITOS = 6;

const CLASSE_CAMPO =
  'w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors';
const CLASSE_BOTAO_ESCURO =
  'w-full py-3 px-4 rounded-lg text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed';

/** Pontua a senha de 0 a 4 para o indicador de força. */
function calcularForcaSenha(senha: string): number {
  let pontos = 0;
  if (senha.length >= 8) pontos++;
  if (/[a-zA-Z]/.test(senha) && /\d/.test(senha)) pontos++;
  if (/[a-z]/.test(senha) && /[A-Z]/.test(senha)) pontos++;
  if (/[^a-zA-Z0-9]/.test(senha) || senha.length >= 12) pontos++;
  return pontos;
}

const ROTULOS_FORCA = ['Muito fraca', 'Fraca', 'Média', 'Boa', 'Forte'];
const CORES_FORCA = ['bg-red-500', 'bg-red-500', 'bg-amber-500', 'bg-green-500', 'bg-green-500'];

export default function PontoEixoEsqueceuSenha() {
  // Controle de etapas do fluxo de recuperação: 1 (E-mail) -> 2 (Código) -> 3 (Nova Senha)
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [digitos, setDigitos] = useState<string[]>(Array(QUANTIDADE_DIGITOS).fill(''));
  const [tokenRedefinicao, setTokenRedefinicao] = useState<string | null>(null);
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacaoSenha, setConfirmacaoSenha] = useState('');
  const [segundosReenvio, setSegundosReenvio] = useState(0);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [concluido, setConcluido] = useState(false);
  const camposCodigo = useRef<(HTMLInputElement | null)[]>([]);

  // Contagem regressiva do botão "Reenviar código": o intervalo só existe enquanto há tempo a contar
  const contandoReenvio = segundosReenvio > 0;
  useEffect(() => {
    if (!contandoReenvio) return;
    const intervalo = setInterval(() => setSegundosReenvio((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(intervalo);
  }, [contandoReenvio]);

  const executar = async (acao: () => Promise<void>) => {
    setErro(null);
    setEnviando(true);
    try {
      await acao();
    } catch (falha) {
      setErro(mensagemDeErro(falha));
    } finally {
      setEnviando(false);
    }
  };

  // PASSO 1
  const pedirCodigo = (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    return executar(async () => {
      const mensagem = await solicitarCodigo(email);
      setAviso(mensagem);
      setDigitos(Array(QUANTIDADE_DIGITOS).fill(''));
      setSegundosReenvio(SEGUNDOS_PARA_REENVIO);
      setStep(2);
    });
  };

  // PASSO 2
  const alterarDigito = (indice: number, valor: string) => {
    const digito = valor.replace(/\D/g, '').slice(-1);
    setDigitos((atuais) => atuais.map((d, i) => (i === indice ? digito : d)));
    if (digito && indice < QUANTIDADE_DIGITOS - 1) camposCodigo.current[indice + 1]?.focus();
  };

  const teclaNoDigito = (indice: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digitos[indice] && indice > 0) {
      camposCodigo.current[indice - 1]?.focus();
    }
  };

  const colarCodigo = (e: ClipboardEvent<HTMLInputElement>) => {
    const colado = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, QUANTIDADE_DIGITOS);
    if (!colado) return;
    e.preventDefault();
    setDigitos(Array.from({ length: QUANTIDADE_DIGITOS }, (_, i) => colado[i] ?? ''));
    camposCodigo.current[Math.min(colado.length, QUANTIDADE_DIGITOS - 1)]?.focus();
  };

  const conferirCodigo = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const codigo = digitos.join('');
    if (codigo.length !== QUANTIDADE_DIGITOS) {
      setErro('Digite os 6 dígitos do código.');
      return;
    }
    return executar(async () => {
      setTokenRedefinicao(await validarCodigo(email, codigo));
      setAviso(null);
      setStep(3);
    });
  };

  // PASSO 3
  const salvarNovaSenha = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (novaSenha !== confirmacaoSenha) {
      setErro('A nova senha e a confirmação de senha não conferem.');
      return;
    }
    return executar(async () => {
      setAviso(await redefinirSenha(tokenRedefinicao ?? '', novaSenha, confirmacaoSenha));
      setConcluido(true);
    });
  };

  const forca = calcularForcaSenha(novaSenha);

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
          <div className="mt-8 space-y-6">
            <AvisoErro mensagem={erro} />
            <AvisoErro mensagem={aviso} tipo="sucesso" />

            {/* PASSO 1: Solicitar Código */}
            {step === 1 && (
              <form className="space-y-6" onSubmit={pedirCodigo}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                    E-mail corporativo
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={CLASSE_CAMPO}
                    placeholder="seu@email.com"
                  />
                </div>
                <button type="submit" disabled={enviando} className={CLASSE_BOTAO_ESCURO}>
                  {enviando ? 'Enviando...' : 'Enviar código de verificação'}
                </button>
              </form>
            )}

            {/* PASSO 2: Validar Código (OTP) */}
            {step === 2 && (
              <form className="space-y-6" onSubmit={conferirCodigo}>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3 text-center">
                    Código de verificação
                  </label>
                  {/* Grid para inputs de 6 dígitos (OTP) */}
                  <div className="flex gap-2 sm:gap-3 justify-center">
                    {digitos.map((digito, indice) => (
                      <input
                        key={indice}
                        ref={(campo) => { camposCodigo.current[indice] = campo; }}
                        type="text"
                        inputMode="numeric"
                        autoComplete={indice === 0 ? 'one-time-code' : 'off'}
                        aria-label={`Dígito ${indice + 1}`}
                        maxLength={1}
                        value={digito}
                        onChange={(e) => alterarDigito(indice, e.target.value)}
                        onKeyDown={(e) => teclaNoDigito(indice, e)}
                        onPaste={colarCodigo}
                        className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-semibold rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors"
                        placeholder="•"
                      />
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={enviando}
                  className="w-full py-3 px-4 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {enviando ? 'Validando...' : 'Validar código'}
                </button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => pedirCodigo()}
                    disabled={segundosReenvio > 0 || enviando}
                    className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors disabled:hover:text-slate-500 disabled:cursor-not-allowed"
                  >
                    {segundosReenvio > 0
                      ? `Reenviar código (00:${String(segundosReenvio).padStart(2, '0')})`
                      : 'Reenviar código'}
                  </button>
                </div>
              </form>
            )}

            {/* PASSO 3: Redefinir Senha */}
            {step === 3 && !concluido && (
              <form className="space-y-5" onSubmit={salvarNovaSenha}>
                <div>
                  <label htmlFor="new-password" className="block text-sm font-medium text-slate-700 mb-1">
                    Nova senha
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    className={CLASSE_CAMPO}
                    placeholder="••••••••"
                  />
                  {/* Indicador de força da senha */}
                  <div className="flex gap-1 mt-2">
                    {[1, 2, 3, 4].map((nivel) => (
                      <div
                        key={nivel}
                        className={`h-1 w-full rounded-full ${forca >= nivel ? CORES_FORCA[forca] : 'bg-slate-200'}`}
                      ></div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {novaSenha
                      ? `Nível de segurança: ${ROTULOS_FORCA[forca]}`
                      : 'Use pelo menos 8 caracteres, com letras e números.'}
                  </p>
                </div>

                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700 mb-1">
                    Confirmar nova senha
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    required
                    autoComplete="new-password"
                    value={confirmacaoSenha}
                    onChange={(e) => setConfirmacaoSenha(e.target.value)}
                    className={CLASSE_CAMPO}
                    placeholder="••••••••"
                  />
                </div>
                <button type="submit" disabled={enviando} className={`${CLASSE_BOTAO_ESCURO} mt-2`}>
                  {enviando ? 'Salvando...' : 'Salvar nova senha'}
                </button>
              </form>
            )}

            {concluido && (
              <Link href="/login" className={`${CLASSE_BOTAO_ESCURO} block text-center`}>
                Ir para o login
              </Link>
            )}

          </div>

          {/* Voltar para o Login */}
          <p className="text-center text-sm text-slate-500 mt-8">
            Lembrou sua senha?{' '}
            <Link href="/login" className="font-semibold text-slate-900 hover:text-blue-600 transition-colors">
              Voltar para o login
            </Link>
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