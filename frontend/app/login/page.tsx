"use client";
export default function PontoEixoLogin() {
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

          <form className="space-y-6 mt-8" onSubmit={(e) => e.preventDefault()}>
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
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                    Senha
                  </label>
                  <a href="#" className="text-xs font-medium text-blue-600 hover:text-blue-500 transition-colors">
                    Esqueceu a senha?
                  </a>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors duration-200"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 rounded-lg text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all shadow-md"
            >
              Entrar no PontoEixo
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Ainda não é parceiro?{' '}
            <a href="/cadastro" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors">
              Crie sua conta
            </a>
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
            
            {/* SVG Customizado: Representa perspectiva 3D, eixos e um ponto focal */}
            <svg 
              className="w-32 h-32 text-blue-600 drop-shadow-lg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              {/* Eixos 3D Isométricos (O "Eixo") */}
              <path d="M12 22v-9" className="opacity-60" />
              <path d="M12 13l-9-5" className="opacity-60" />
              <path d="M12 13l9-5" className="opacity-60" />
              
              {/* Grid 3D de base (representando os pontos comerciais) */}
              <polygon points="12 2 21 7 12 12 3 7 12 2" className="fill-blue-500/10" />
              <path d="M3 7l9 5 9-5" />
              
              {/* Ponto focal (O "Ponto" flutuando acima do eixo) */}
              <circle cx="12" cy="7" r="2" className="fill-white stroke-blue-600 stroke-2" />
              <path d="M12 2L12 5" className="stroke-2" />
            </svg>
          </div>
        </div>

        {/* Conteúdo de Texto sobreposto */}
        <div className="relative z-20 flex flex-col justify-end">
          <div className="bg-white/40 backdrop-blur-md p-8 rounded-2xl border border-white/60 shadow-xl max-w-lg mx-auto w-full">
            <h2 className="text-2xl font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Gestão inteligente de espaços locáveis
            </h2>
            <p className="text-slate-800 leading-relaxed text-sm">
              Tenha o controle total sobre suas propriedades. Da visão 3D dos pontos comerciais até a administração transparente dos contratos com seus inquilinos, tudo em um único eixo central.
            </p>
          </div>
        </div>

      </section>
    </main>
  );
}