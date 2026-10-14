'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// Mock de dados dos pontos comerciais
const propriedades = [
  {
    id: 'padaria-doce-vida',
    nome: 'Padaria Doce Vida',
    localizacao: 'São José de Ribamar',
    status: 'alugado',
    inquilino: 'Sr. Roberto',
    valor: 'R$ 8.500/mês',
    dimensao: 'col-span-1 row-span-1', // Define o tamanho no grid 3D
    cor: 'bg-slate-800',
  },
  {
    id: 'salão-beleza-estrela',
    nome: 'Salão de Beleza Estrela',
    localizacao: 'São José de Ribamar',
    status: 'disponivel',
    inquilino: '-',
    valor: 'R$ 4.200/mês',
    dimensao: 'col-span-1 row-span-1',
    cor: 'bg-blue-600',
  },
  {
    id: 'rouparia-fashion-alana',
    nome: 'Rouparia Fashion Alana',
    localizacao: 'São Luís',
    status: 'manutencao',
    inquilino: 'Alana Carla',
    valor: 'R$ 2.100/mês',
    dimensao: 'col-span-1 row-span-1',
    cor: 'bg-amber-500',
  },
  {
    id: 'celular-tech-store',
    nome: 'Celular Tech Store',
    localizacao: 'São Luís',
    status: 'alugado',
    inquilino: 'Sr. Carlos',
    valor: 'R$ 2.500/mês',
    dimensao: 'col-span-4 row-span-2',
    cor: 'bg-slate-800',
  }
];

export default function PontoEixoDashboard() {
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans text-slate-800">
      
      {/* BARRA LATERAL (Navegação) */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex z-50 shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-2xl font-light tracking-tight text-slate-900">
            Ponto<span className="font-semibold text-blue-600">Eixo</span>
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-700 font-medium transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            Visão 3D
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Contratos
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            Inquilinos
          </a>
        </nav>
      </aside>

      {/* ÁREA PRINCIPAL: Canvas 3D */}
      <main className="flex-1 relative overflow-hidden bg-[#E8F0FE]">
        
        {/* Textura de papel amassado ultra-suave no fundo do mapa */}
        <div 
          className="absolute inset-0 opacity-20 mix-blend-multiply pointer-events-none"
          style={{
            backgroundImage: "url('https://www.transparenttextures.com/patterns/crumpled-paper.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        ></div>

        {/* Header Superior da Planta */}
        <header className="absolute top-0 left-0 right-0 p-8 z-20 flex justify-between items-start pointer-events-none">
          <div>
            <h2 className="text-3xl font-semibold text-slate-900 drop-shadow-sm">Visão Panorâmica dos seus Aluguéis</h2>
            <p className="text-slate-700 font-medium mt-1 drop-shadow-sm">Selecione um espaço para abrir os detalhes</p>
          </div>
          
          {/* Legenda de Status */}
          <div className="bg-white/80 backdrop-blur-md px-4 py-3 rounded-xl border border-white/50 shadow-sm pointer-events-auto flex gap-4 text-sm font-medium">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-600"></div>Disponível</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-800"></div>Alugado</div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"></div>Manutenção</div>
          </div>
        </header>

        {/* CONTAINER DE PROJEÇÃO 3D (Isométrica) */}
        <div className="absolute inset-0 flex items-center justify-center perspective-[2000px] cursor-grab active:cursor-grabbing">
          
          {/* O "Plano" onde os pontos comerciais são renderizados */}
          <div className="relative w-[800px] h-[600px] transform-style-3d rotate-x-[60deg] rotate-z-[-45deg] transition-transform duration-1000 ease-out hover:rotate-z-[-40deg]">
            
            {/* Base do Terreno (Grid) */}
            <div className="absolute inset-0 bg-white/40 border-2 border-white/60 shadow-2xl rounded-2xl grid grid-cols-4 grid-rows-4 gap-4 p-4">
              
              {/* Renderizando os Pontos Comerciais Dinamicamente */}
              {propriedades.map((ponto) => (
                <Link 
                  href={`/pontos/${ponto.id}`} 
                  key={ponto.id}
                  onMouseEnter={() => setHoveredPoint(ponto.id)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  className={`
                    relative group block transform-style-3d transition-all duration-300 ease-out
                    ${ponto.dimensao} ${ponto.cor} rounded-xl shadow-lg border border-white/20
                    hover:-translate-y-8 hover:shadow-2xl hover:brightness-110
                  `}
                  style={{
                    /* Transformação Z para erguer o bloco do chão simulando um prédio/ponto 3D */
                    transform: hoveredPoint === ponto.id ? 'translateZ(40px)' : 'translateZ(10px)'
                  }}
                >
                  {/* Teto do bloco 3D */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-white font-semibold text-lg rotate-x-[-60deg] rotate-z-[45deg] whitespace-nowrap drop-shadow-md">
                      Abrir {ponto.status === 'alugado' ? 'Contrato' : 'Detalhes'}
                    </span>
                  </div>
                </Link>
              ))}

            </div>
          </div>
        </div>

        {/* Tooltip Dinâmico ao passar o mouse sobre os blocos */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none transition-opacity duration-300">
          {propriedades.map((ponto) => (
            <div 
              key={`tooltip-${ponto.id}`}
              className={`w-[380px] bg-slate-900/95 backdrop-blur-sm text-white px-6 py-4 rounded-xl shadow-2xl border border-white/10 flex flex-col gap-1 transition-all duration-300 absolute bottom-0 left-1/2 -translate-x-1/2 w-80 ${hoveredPoint === ponto.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            >
              <h3 className="font-semibold text-lg">{ponto.nome}</h3>
              <p className="text-slate-300 text-sm flex justify-between">
                <span>Localização: {ponto.localizacao}</span>
                <span className="font-medium text-blue-400">{ponto.valor}</span>
              </p>
              <div className="w-full h-px bg-white/10 my-1"></div>
              <p className="text-sm flex items-center gap-2">
                <span className="text-slate-400">Inquilino:</span> 
                <span className="font-medium">{ponto.inquilino}</span>
              </p>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}