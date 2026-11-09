'use client';

import React, { useState } from 'react';

import AvisoErro from '@/componentes/AvisoErro';
import FormularioContrato from '@/componentes/FormularioContrato';
import MenuLateral from '@/componentes/MenuLateral';
import { mensagemDeErro } from '@/lib/api';
import {
  ROTULOS_STATUS_CONTRATO,
  URL_ASSINADOR_GOV,
  atualizarContrato,
  baixarPdfContrato,
  calcularReajuste,
  criarContrato,
  listarContratos,
  removerContrato,
  type Contrato,
  type ContratoEntrada,
  type StatusContrato,
} from '@/lib/contratos';
import { formatarData, formatarReais } from '@/lib/formatacao';
import { listarImoveis, type Imovel } from '@/lib/imoveis';
import { listarInquilinos, type Inquilino } from '@/lib/inquilinos';
import { useDadosApi } from '@/lib/useDadosApi';

type Filtro = 'todos' | StatusContrato;

const FILTROS: { id: Filtro; label: string }[] = [
  { id: 'todos', label: 'Todos os contratos' },
  { id: 'ativo', label: 'Ativos' },
  { id: 'pendente_assinatura', label: 'Aguardando assinatura' },
  { id: 'encerrado', label: 'Encerrados' },
];

const CORES_STATUS: Record<StatusContrato, string> = {
  ativo: 'bg-green-50 text-green-700 ring-green-600/20',
  pendente_assinatura: 'bg-yellow-50 text-yellow-800 ring-yellow-600/20',
  encerrado: 'bg-gray-50 text-gray-600 ring-gray-500/10',
};

// Formulário aberto: novo contrato ou edição de um existente
type EstadoFormulario = { modo: 'novo' } | { modo: 'editar'; contrato: Contrato } | null;

export default function PontoEixoContratos() {
  const { dados: contratos, setDados: setContratos, carregando, erro } = useDadosApi(listarContratos, [] as Contrato[]);
  const { dados: inquilinos } = useDadosApi(listarInquilinos, [] as Inquilino[]);
  const { dados: imoveis } = useDadosApi(listarImoveis, [] as Imovel[]);
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [formulario, setFormulario] = useState<EstadoFormulario>(null);
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const [baixandoId, setBaixandoId] = useState<number | null>(null);

  const contratosFiltrados = contratos.filter(c => filtro === 'todos' || c.status === filtro);

  // Funcionalidade do WhatsApp
  const abrirWhatsApp = (telefone: string, inquilino: string, propriedade: string) => {
    const mensagem = encodeURIComponent(`Olá, ${inquilino}. Aqui é da administração do PontoEixo. Entramos em contato referente ao contrato do espaço: ${propriedade}.`);
    window.open(`https://wa.me/55${telefone}?text=${mensagem}`, '_blank');
  };

  const baixarPdf = async (contrato: Contrato) => {
    setBaixandoId(contrato.id);
    try {
      await baixarPdfContrato(contrato);
      setErroAcao(null);
    } catch (falha) {
      setErroAcao(mensagemDeErro(falha));
    } finally {
      setBaixandoId(null);
    }
  };

  const salvar = async (dados: ContratoEntrada) => {
    if (formulario?.modo === 'editar') {
      const atualizado = await atualizarContrato(formulario.contrato.id, dados);
      setContratos(atuais => atuais.map(c => (c.id === atualizado.id ? atualizado : c)));
    } else {
      const novo = await criarContrato(dados);
      setContratos(atuais => [novo, ...atuais]);
    }
    setFormulario(null);
  };

  const excluir = async (contrato: Contrato) => {
    await removerContrato(contrato.id);
    setContratos(atuais => atuais.filter(c => c.id !== contrato.id));
    setFormulario(null);
  };

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans text-gray-900">
      
      <MenuLateral />

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          
          {/* Cabeçalho da Seção */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Gestão de Contratos</h2>
              <p className="text-sm text-gray-500 mt-1">Gerencie documentos, acompanhe reajustes e colete assinaturas.</p>
            </div>
            
            <button 
              onClick={() => setFormulario({ modo: 'novo' })}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              Novo Contrato
            </button>
          </header>

          <div className="mb-6">
            <AvisoErro mensagem={erroAcao ?? erro} />
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-4">
            {FILTROS.map((f) => (
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
                <span className="ml-1.5 text-xs text-gray-400">
                  {f.id === 'todos' ? contratos.length : contratos.filter(c => c.status === f.id).length}
                </span>
              </button>
            ))}
          </div>

          {contratosFiltrados.length === 0 && (
            <div className="bg-white rounded-lg border border-gray-200 px-6 py-10 text-center text-sm text-gray-500">
              {carregando
                ? 'Carregando contratos...'
                : contratos.length === 0
                  ? 'Nenhum contrato cadastrado ainda. Use "Novo Contrato" para criar o primeiro.'
                  : 'Nenhum contrato com este status.'}
            </div>
          )}

          {/* Lista de Contratos */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {contratosFiltrados.map((contrato) => {
              const reajuste = calcularReajuste(contrato);
              return (
              <div key={contrato.id} className="bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col">
                
                <div className="p-5 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">{contrato.inquilino.nome}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {contrato.imovel.nome}
                      </p>
                    </div>
                    
                    {/* Badges de Status (Padrão SaaS com Ring) */}
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${CORES_STATUS[contrato.status]}`}>
                      {ROTULOS_STATUS_CONTRATO[contrato.status]}
                    </span>
                  </div>

                  {/* Grid de Informações Financeiras */}
                  <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-t border-gray-100">
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Aluguel</dt>
                      <dd className="mt-1 text-sm font-semibold text-gray-900">{formatarReais(contrato.valor_aluguel)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Vencimento</dt>
                      <dd className="mt-1 text-sm text-gray-900">Dia {String(contrato.dia_vencimento).padStart(2, '0')}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Vigência</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formatarData(contrato.data_inicio)} a {formatarData(contrato.data_fim)}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-gray-500">Reajuste</dt>
                      <dd className={`mt-1 text-sm font-medium ${reajuste.proximo ? 'text-red-600' : 'text-gray-900'}`}>
                        {reajuste.texto}
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Footer do Card com Ações */}
                <div className="bg-gray-50 px-5 py-3 border-t border-gray-200 flex flex-wrap items-center gap-3 rounded-b-lg">
                  <button 
                    onClick={() => baixarPdf(contrato)}
                    disabled={baixandoId === contrato.id}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-60"
                  >
                    {baixandoId === contrato.id ? 'Gerando PDF...' : 'Baixar PDF'}
                  </button>

                  {contrato.status === 'pendente_assinatura' && (
                    <a 
                      href={URL_ASSINADOR_GOV}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Baixe o PDF e assine com sua conta gov.br"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                      Assinar Gov.br
                    </a>
                  )}

                  <div className="flex-1"></div>

                  {/* Ações Secundárias */}
                  {contrato.inquilino.telefone && (
                    <button 
                      onClick={() => abrirWhatsApp(contrato.inquilino.telefone!, contrato.inquilino.nome, contrato.imovel.nome)}
                      className="text-gray-400 hover:text-green-600 transition-colors" 
                      title="Falar via WhatsApp"
                      aria-label={`Falar com ${contrato.inquilino.nome} no WhatsApp`}
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                    </button>
                  )}
                  <button 
                    onClick={() => setFormulario({ modo: 'editar', contrato })}
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors" 
                  >
                    Editar
                  </button>
                </div>

              </div>
              );
            })}
          </div>
        </div>
      </main>

      {formulario && (
        <FormularioContrato
          key={formulario.modo === 'editar' ? formulario.contrato.id : 'novo'}
          contrato={formulario.modo === 'editar' ? formulario.contrato : undefined}
          inquilinos={inquilinos}
          imoveis={imoveis}
          aoSalvar={salvar}
          aoExcluir={formulario.modo === 'editar' ? () => excluir(formulario.contrato) : undefined}
          aoFechar={() => setFormulario(null)}
        />
      )}

    </div>
  );
}
