"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

import AvisoErro from "@/componentes/AvisoErro";
import { mensagemDeErro } from "@/lib/api";
import { entrar } from "@/lib/autenticacao";
import { useRedirecionarSeLogado } from "@/lib/useRedirecionarSeLogado";

export default function PontoEixoLogin() {
  // Ao salvar a sessão, este hook leva o usuário para a home
  useRedirecionarSeLogado();

  const [dadosFormulario, setDadosFormulario] = useState({
    email: "",
    senha: "",
  });
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const enviar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      await entrar(dadosFormulario.email, dadosFormulario.senha);
    } catch (falha) {
      setErro(mensagemDeErro(falha));
      setEnviando(false);
    }
  };

  return (
    <main className="min-h-screen grid grid-cols-1 md:grid-cols-2 font-sans text-slate-800">

      {/* COLUNA 1: Formulário de Login (Esquerda) - Mantida inalterada */}
      <section className="flex flex-col justify-center items-center px-8 sm:px-16 lg:px-24 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h1 className="text-4xl font-light tracking-tight text-slate-900 mb-2">
              Ponto<span className="font-semibold text-blue-600">Eixo</span>
            </h1>
            <p className="text-slate-500 text-sm">
              Acesse sua conta para gerenciar contratos, inquilinos e visualizar seus espaços comerciais.
            </p>
          </div>

          <form className="space-y-6 mt-8" onSubmit={enviar}>
            <AvisoErro mensagem={erro} />
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                  E-mail corporativo
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors duration-200"
                  placeholder="seu@email.com"
                  onChange={(e) => setDadosFormulario({...dadosFormulario, email: e.target.value})}
                  value={dadosFormulario.email} 
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                    Senha
                  </label>
                  <Link href="/recuperar-senha" className="text-xs font-medium text-blue-600 hover:text-blue-500 transition-colors">
                    Esqueceu a senha?
                  </Link>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors duration-200"
                  placeholder="••••••••"
                  onChange={(e) => setDadosFormulario({...dadosFormulario, senha: e.target.value})}
                  value={dadosFormulario.senha}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={enviando}
              className="w-full flex justify-center py-3 px-4 rounded-lg text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {enviando ? "Entrando..." : "Entrar no PontoEixo"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Ainda não é parceiro?{' '}
            <Link href="/cadastro" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
              Crie sua conta
            </Link>
          </p>
        </div>
      </section>

      {/* COLUNA 2: Painel Visual com Textura e Símbolo (Direita) */}
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

        {/* NOVO: Elemento Gráfico Central (Símbolo Ponto + Eixo) */}
        <div className="relative z-20 flex-1 flex flex-col items-center justify-center mb-8">
          <div className="relative w-48 h-48 flex items-center justify-center">
            {/* Círculo de fundo suave para destacar o ícone */}
            <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl"></div>

          </div>
        </div>

      </section>
    </main>
  );
}