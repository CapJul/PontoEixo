"use client";
export default function PontoEixoCadastro() {
  return (
    <main className="min-h-screen grid grid-cols-1 md:grid-cols-2 font-sans text-slate-800">
      
      {/* COLUNA 1: Formulário de Cadastro (Esquerda) */}
      <section className="flex flex-col justify-center items-center px-8 sm:px-16 lg:px-24 bg-white py-12 md:py-0">
        <div className="w-full max-w-md space-y-8">
          
          {/* Cabeçalho */}
          <div>
            <h1 className="text-4xl font-light tracking-tight text-slate-900 mb-2">
              Criar <span className="font-semibold text-blue-600">Conta</span>
            </h1>
            <p className="text-slate-500 text-sm">
              Junte-se ao PontoEixo e centralize a gestão dos seus espaços comerciais, contratos e inquilinos.
            </p>
          </div>

          {/* Formulário */}
          <form className="space-y-5 mt-8" onSubmit={(e) => e.preventDefault()}>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                Nome completo
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors duration-200"
                placeholder="João da Silva"
              />
            </div>

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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                  Senha
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors duration-200"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700 mb-1">
                  Confirmar senha
                </label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-colors duration-200"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-start mt-2">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="w-4 h-4 border border-slate-300 rounded bg-slate-50 focus:ring-3 focus:ring-blue-200"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="text-slate-500">
                  Eu concordo com os{' '}
                  <a href="#" className="font-medium text-blue-600 hover:underline">
                    Termos de Serviço
                  </a>{' '}
                  e a{' '}
                  <a href="#" className="font-medium text-blue-600 hover:underline">
                    Política de Privacidade
                  </a>.
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 mt-4 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-all shadow-md"
            >
              Começar a usar o PontoEixo
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Já possui uma conta?{' '}
            <a href="/login" className="font-semibold text-slate-900 hover:text-blue-600 transition-colors">
              Faça login
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

        {/* Elemento Gráfico Central (Símbolo Ponto + Eixo) */}
        <div className="relative z-20 flex-1 flex flex-col items-center justify-center mb-8">
          <div className="relative w-48 h-48 flex items-center justify-center">
            {/* Círculo de fundo suave para destacar o ícone */}
            <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl"></div>
            
            {/* SVG Customizado */}
            <svg 
              className="w-32 h-32 text-blue-600 drop-shadow-lg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              {/* Eixos 3D Isométricos */}
              <path d="M12 22v-9" className="opacity-60" />
              <path d="M12 13l-9-5" className="opacity-60" />
              <path d="M12 13l9-5" className="opacity-60" />
              
              {/* Grid 3D de base */}
              <polygon points="12 2 21 7 12 12 3 7 12 2" className="fill-blue-500/10" />
              <path d="M3 7l9 5 9-5" />
              
              {/* Ponto focal */}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Evolua a administração do seu portfólio
            </h2>
            <p className="text-slate-800 leading-relaxed text-sm">
              Dê o primeiro passo para modernizar suas locações. Cadastre-se agora para mapear seus pontos comerciais, organizar a papelada e oferecer a melhor experiência aos seus inquilinos.
            </p>
          </div>
        </div>

      </section>
    </main>
  );
}