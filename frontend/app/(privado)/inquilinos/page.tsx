'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';

import AvisoErro from '@/componentes/AvisoErro';
import MenuLateral from '@/componentes/MenuLateral';
import { mensagemDeErro } from '@/lib/api';
import { formatarData, formatarDocumento, formatarReais, formatarTelefone } from '@/lib/formatacao';
import {
  ROTULOS_ESTADO_CIVIL,
  ROTULOS_GARANTIA,
  ROTULOS_LOCACAO,
  listarInquilinos,
  removerInquilino,
  type Inquilino,
} from '@/lib/inquilinos';
import { useDadosApi } from '@/lib/useDadosApi';

const ICONE_WHATSAPP = (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347Z"/></svg>
);

/** Remove acentos e deixa em minúsculas, para a busca ignorar maiúsculas e acentos. */
function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export default function PontoEixoInquilinos() {
  const { dados: inquilinos, setDados: setInquilinos, carregando, erro } = useDadosApi(listarInquilinos, [] as Inquilino[]);
  const [busca, setBusca] = useState('');
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  
  // Barra lateral (Slide-over): guarda só o id, para sempre mostrar os dados atuais da lista
  const [idSelecionado, setIdSelecionado] = useState<number | null>(null);
  const inquilinoSelecionado = inquilinos.find(i => i.id === idSelecionado) ?? null;
  const fecharPerfil = () => setIdSelecionado(null);

  // Busca por nome, documento (com ou sem máscara) ou imóvel
  const inquilinosFiltrados = useMemo(() => {
    const termo = normalizar(busca.trim());
    const termoDocumento = busca.replace(/[.\-/\s]/g, '').toUpperCase();
    if (!termo) return inquilinos;
    return inquilinos.filter(inq =>
      normalizar(inq.nome).includes(termo) ||
      normalizar(inq.imovel?.nome ?? '').includes(termo) ||
      (termoDocumento !== '' && inq.documento.includes(termoDocumento))
    );
  }, [inquilinos, busca]);

  const falarWhatsApp = (telefone: string, nome: string) => {
    const msg = `Olá, ${nome}. Aqui é da administração do PontoEixo. Tudo bem?`;
    window.open(`https://wa.me/55${telefone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const excluir = async (inquilino: Inquilino) => {
    if (!window.confirm(`Excluir o cadastro de "${inquilino.nome}"? Esta ação não pode ser desfeita.`)) return;
    setExcluindo(true);
    try {
      await removerInquilino(inquilino.id);
      setInquilinos(atuais => atuais.filter(i => i.id !== inquilino.id));
      fecharPerfil();
      setErroAcao(null);
    } catch (falha) {
      setErroAcao(mensagemDeErro(falha));
    } finally {
      setExcluindo(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans text-slate-900 overflow-hidden relative">
      
      {/* BARRA LATERAL ESQUERDA (Menu de Navegação) */}
      <MenuLateral />

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 p-8 overflow-y-auto z-10">
        <div className="max-w-7xl mx-auto space-y-6">
          
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Diretório de Inquilinos</h2>
              <p className="text-sm text-slate-500 mt-1">Gerencie a carteira de clientes, histórico de pagamentos e dados de contato.</p>
            </div>
            <Link href="/inquilinos/novo" className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-800 border border-transparent rounded-lg hover:bg-slate-700 focus:ring-2 focus:ring-offset-2 focus:ring-slate-800 shadow-sm transition-all">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              Cadastrar Inquilino
            </Link>
          </header>

          <AvisoErro mensagem={erroAcao ?? erro} />

          {/* Barra de busca */}
          <div className="relative max-w-md">
            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" /></svg>
            <input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome, CPF/CNPJ ou imóvel..."
              aria-label="Buscar inquilinos"
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400"
            />
          </div>
          
          {/* Tabela de Dados */}
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Inquilino / Contato</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Imóvel Vinculado</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Locação</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Fiador/Garantia</th>
                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {inquilinosFiltrados.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-500">
                        {carregando
                          ? 'Carregando inquilinos...'
                          : busca
                            ? 'Nenhum inquilino encontrado para esta busca.'
                            : 'Nenhum inquilino cadastrado ainda.'}
                      </td>
                    </tr>
                  )}
                  {inquilinosFiltrados.map((inq) => (
                    <tr key={inq.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-slate-500 font-semibold text-sm">
                            {inq.tipo_pessoa}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-slate-900">{inq.nome}</div>
                            <div className="text-sm text-slate-500">{formatarDocumento(inq.documento)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900 font-medium">{inq.imovel?.nome ?? 'Sem imóvel'}</div>
                        <div className="text-sm text-slate-500">{inq.imovel?.endereco ?? ''}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                        {ROTULOS_LOCACAO[inq.tipo_locacao]}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-900">{inq.garantia ? ROTULOS_GARANTIA[inq.garantia] : '—'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-3">
                          {inq.telefone && (
                            <button 
                              onClick={() => falarWhatsApp(inq.telefone!, inq.nome)}
                              className="p-1.5 rounded-md transition-colors text-slate-400 hover:text-green-600 hover:bg-green-50"
                              title="Falar no WhatsApp"
                              aria-label={`Falar com ${inq.nome} no WhatsApp`}
                            >
                              {ICONE_WHATSAPP}
                            </button>
                          )}
                          
                          {/* BOTÃO VER PERFIL - ABRE A BARRA LATERAL */}
                          <button 
                            onClick={() => setIdSelecionado(inq.id)}
                            className="text-slate-700 hover:text-slate-900 bg-white border border-slate-300 px-3 py-1.5 rounded-md hover:bg-slate-50 focus:ring-2 focus:ring-offset-1 focus:ring-slate-500 transition-colors shadow-sm"
                          >
                            Ver Perfil
                          </button>

                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* OVERLAY ESCURECIDO (Fundo do modal) */}
      <div 
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          inquilinoSelecionado ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={fecharPerfil}
      />

      {/* SLIDE-OVER (Barra Lateral Direita) */}
      <div 
        className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl border-l border-slate-200 transform transition-transform duration-300 ease-in-out flex flex-col ${
          inquilinoSelecionado ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {inquilinoSelecionado && (
          <>
            {/* Header do Slide-over */}
            <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-semibold text-slate-900">Perfil do Locatário</h3>
              <button 
                onClick={fecharPerfil} 
                aria-label="Fechar perfil"
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-200"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Corpo do Slide-over (Rola internamente se for longo) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              {/* Header do Perfil (Avatar + Nome) */}
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xl font-bold border border-slate-300 shadow-sm">
                  {inquilinoSelecionado.nome.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{inquilinoSelecionado.nome}</h2>
                  <p className="text-sm text-slate-500">{inquilinoSelecionado.tipo_pessoa === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}</p>
                </div>
              </div>

              {/* Informações de Contato */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Contato e Documentação</h4>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 text-sm">
                  <div className="sm:col-span-1">
                    <dt className="text-slate-500">Documento ({inquilinoSelecionado.tipo_pessoa === 'PF' ? 'CPF' : 'CNPJ'})</dt>
                    <dd className="font-medium text-slate-900 mt-1">{formatarDocumento(inquilinoSelecionado.documento)}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-slate-500">{inquilinoSelecionado.tipo_pessoa === 'PF' ? 'RG / Órgão Emissor' : 'Inscrição Estadual'}</dt>
                    <dd className="font-medium text-slate-900 mt-1">{inquilinoSelecionado.rg_ou_inscricao_estadual ?? '—'}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-slate-500">Telefone / WhatsApp</dt>
                    <dd className="font-medium text-slate-900 mt-1">{formatarTelefone(inquilinoSelecionado.telefone)}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-slate-500">E-mail</dt>
                    <dd className="font-medium text-slate-900 mt-1 break-all">{inquilinoSelecionado.email ?? '—'}</dd>
                  </div>
                  {inquilinoSelecionado.tipo_pessoa === 'PF' && (
                    <>
                      <div className="sm:col-span-1">
                        <dt className="text-slate-500">Nascimento</dt>
                        <dd className="font-medium text-slate-900 mt-1">{formatarData(inquilinoSelecionado.data_nascimento)}</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-slate-500">Estado Civil</dt>
                        <dd className="font-medium text-slate-900 mt-1">
                          {inquilinoSelecionado.estado_civil ? ROTULOS_ESTADO_CIVIL[inquilinoSelecionado.estado_civil] : '—'}
                        </dd>
                      </div>
                    </>
                  )}
                </dl>
              </div>

              <hr className="border-slate-100" />

              {/* Dados da Locação */}
              <div>
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Locação</h4>
                <div className="bg-slate-50 rounded-md border border-slate-200 p-4 space-y-4">
                  <div>
                    <span className="block text-xs text-slate-500">Imóvel Vinculado</span>
                    <span className="block font-semibold text-slate-900 text-base">{inquilinoSelecionado.imovel?.nome ?? 'Sem imóvel'}</span>
                    {inquilinoSelecionado.imovel?.endereco && (
                      <span className="block text-xs text-slate-500 mt-0.5">{inquilinoSelecionado.imovel.endereco}</span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200">
                    <div>
                      <span className="block text-xs text-slate-500">Aluguel do Imóvel</span>
                      <span className="block font-semibold text-slate-900">
                        {inquilinoSelecionado.imovel ? formatarReais(inquilinoSelecionado.imovel.valor_aluguel) : '—'}
                      </span>
                    </div>
                    <div>
                      <span className="block text-xs text-slate-500">Tipo de Locação</span>
                      <span className="block font-medium text-slate-800 text-sm">{ROTULOS_LOCACAO[inquilinoSelecionado.tipo_locacao]}</span>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-slate-200">
                    <span className="block text-xs text-slate-500">Garantia / Fiador</span>
                    <span className="block font-medium text-slate-800 text-sm">
                      {inquilinoSelecionado.garantia ? ROTULOS_GARANTIA[inquilinoSelecionado.garantia] : '—'}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Footer do Slide-over (Ações) */}
            <div className="px-6 py-4 border-t border-slate-200 bg-white grid grid-cols-2 gap-3">
              <button
                onClick={() => excluir(inquilinoSelecionado)}
                disabled={excluindo}
                className="w-full justify-center px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-md hover:bg-red-50 transition-colors shadow-sm disabled:opacity-60"
              >
                {excluindo ? 'Excluindo...' : 'Excluir'}
              </button>
              <Link
                href={`/inquilinos/${inquilinoSelecionado.id}/editar`}
                onClick={fecharPerfil}
                className="w-full text-center px-4 py-2 text-sm font-medium text-white bg-slate-800 border border-transparent rounded-md shadow-sm hover:bg-slate-700 transition-colors"
              >
                Editar Cadastro
              </Link>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
