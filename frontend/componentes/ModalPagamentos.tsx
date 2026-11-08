'use client';

import { useCallback, useState, type FormEvent } from 'react';

import AvisoErro from '@/componentes/AvisoErro';
import { mensagemDeErro } from '@/lib/api';
import { dataParaIso, type Contrato } from '@/lib/contratos';
import { formatarData, formatarReais } from '@/lib/formatacao';
import {
  formatarCompetencia,
  listarPagamentos,
  registrarPagamento,
  removerPagamento,
  textoSituacao,
  type Pagamento,
} from '@/lib/pagamentos';
import { useDadosApi } from '@/lib/useDadosApi';

const CLASSE_CAMPO =
  'w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white';
const CLASSE_ROTULO = 'block text-sm font-medium text-gray-700 mb-1';

interface Props {
  contrato: Contrato;
  /** Chamado depois de registrar ou excluir, para atualizar a situação do contrato. */
  aoAlterar: () => Promise<void>;
  aoFechar: () => void;
}

export default function ModalPagamentos({ contrato, aoAlterar, aoFechar }: Props) {
  const buscar = useCallback(() => listarPagamentos(contrato.id), [contrato.id]);
  const { dados: pagamentos, setDados: setPagamentos, carregando, erro: erroCarregamento } =
    useDadosApi(buscar, [] as Pagamento[]);

  // Sugere o mês em aberto mais antigo (ou o mês atual) e o valor do contrato
  const emAberto = contrato.situacao_financeira.competencias_em_aberto;
  const [campos, setCampos] = useState({
    competencia: (emAberto[0] ?? dataParaIso(new Date())).slice(0, 7),
    valor_pago: String(contrato.valor_aluguel),
    data_pagamento: dataParaIso(new Date()),
    irrf_retido: '0',
    observacao: '',
  });
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const ehPJ = contrato.inquilino.tipo_pessoa === 'PJ';

  const alterar = (campo: keyof typeof campos, valor: string) =>
    setCampos((atual) => ({ ...atual, [campo]: valor }));

  const registrar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      const novo = await registrarPagamento(contrato.id, {
        competencia: `${campos.competencia}-01`,
        valor_pago: Number(campos.valor_pago),
        data_pagamento: campos.data_pagamento,
        irrf_retido: ehPJ ? Number(campos.irrf_retido || 0) : 0,
        observacao: campos.observacao.trim() || null,
      });
      setPagamentos((atuais) => [novo, ...atuais].sort((a, b) => b.competencia.localeCompare(a.competencia)));
      await aoAlterar();
      // Prepara o próximo registro com o mês seguinte
      const [ano, mes] = campos.competencia.split('-').map(Number);
      const seguinte = new Date(ano, mes, 1);
      alterar('competencia', dataParaIso(seguinte).slice(0, 7));
    } catch (falha) {
      setErro(mensagemDeErro(falha));
    } finally {
      setEnviando(false);
    }
  };

  const excluir = async (pagamento: Pagamento) => {
    if (!window.confirm(`Excluir o pagamento de ${formatarCompetencia(pagamento.competencia)}?`)) return;
    setErro(null);
    try {
      await removerPagamento(pagamento.id);
      setPagamentos((atuais) => atuais.filter((p) => p.id !== pagamento.id));
      await aoAlterar();
    } catch (falha) {
      setErro(mensagemDeErro(falha));
    }
  };

  const situacao = contrato.situacao_financeira;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden max-h-full flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Pagamentos</h3>
            <p className="text-sm text-gray-500">{contrato.inquilino.nome} · {contrato.imovel.nome}</p>
          </div>
          <button onClick={aoFechar} aria-label="Fechar" className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          <AvisoErro mensagem={erro ?? erroCarregamento} />

          {situacao.situacao === 'inadimplente' && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <p className="font-medium">{textoSituacao(situacao)}</p>
              <p className="mt-1">Meses em aberto: {situacao.competencias_em_aberto.map(formatarCompetencia).join(', ')}</p>
            </div>
          )}
          {situacao.situacao === 'sem_cobranca' && (
            <p className="text-sm text-gray-500">
              Este contrato não está ativo, então não gera cobranças. Você ainda pode registrar pagamentos recebidos.
            </p>
          )}

          {/* Registrar pagamento */}
          <form onSubmit={registrar} className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end bg-gray-50 border border-gray-200 rounded-md p-4">
            <div>
              <label htmlFor="pg-competencia" className={CLASSE_ROTULO}>Mês</label>
              <input id="pg-competencia" required type="month" value={campos.competencia} onChange={(e) => alterar('competencia', e.target.value)} className={CLASSE_CAMPO} />
            </div>
            <div>
              <label htmlFor="pg-valor" className={CLASSE_ROTULO}>Valor (R$)</label>
              <input id="pg-valor" required type="number" min="0.01" step="0.01" value={campos.valor_pago} onChange={(e) => alterar('valor_pago', e.target.value)} className={CLASSE_CAMPO} />
            </div>
            <div>
              <label htmlFor="pg-data" className={CLASSE_ROTULO}>Pago em</label>
              <input id="pg-data" required type="date" value={campos.data_pagamento} onChange={(e) => alterar('data_pagamento', e.target.value)} className={CLASSE_CAMPO} />
            </div>
            {ehPJ ? (
              <div>
                <label htmlFor="pg-irrf" className={CLASSE_ROTULO} title="Imposto de renda retido na fonte pelo inquilino PJ">IRRF (R$)</label>
                <input id="pg-irrf" type="number" min="0" step="0.01" value={campos.irrf_retido} onChange={(e) => alterar('irrf_retido', e.target.value)} className={CLASSE_CAMPO} />
              </div>
            ) : <div className="hidden sm:block" />}
            <div className="col-span-2 sm:col-span-3">
              <label htmlFor="pg-obs" className={CLASSE_ROTULO}>Observação (opcional)</label>
              <input id="pg-obs" maxLength={255} value={campos.observacao} onChange={(e) => alterar('observacao', e.target.value)} className={CLASSE_CAMPO} placeholder="Ex.: pago com multa" />
            </div>
            <button type="submit" disabled={enviando} className="col-span-2 sm:col-span-1 bg-blue-600 text-white py-2 px-4 rounded-md shadow-sm text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
              {enviando ? 'Salvando...' : 'Registrar'}
            </button>
          </form>

          {/* Histórico */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Histórico</h4>
            {pagamentos.length === 0 ? (
              <p className="text-sm text-gray-500">{carregando ? 'Carregando...' : 'Nenhum pagamento registrado.'}</p>
            ) : (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b border-gray-200">
                    <th className="py-2 font-medium">Mês</th>
                    <th className="py-2 font-medium">Valor</th>
                    <th className="py-2 font-medium">Pago em</th>
                    {ehPJ && <th className="py-2 font-medium">IRRF</th>}
                    <th className="py-2"><span className="sr-only">Ações</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pagamentos.map((pagamento) => (
                    <tr key={pagamento.id}>
                      <td className="py-2 font-medium text-gray-900">
                        {formatarCompetencia(pagamento.competencia)}
                        {pagamento.observacao && <span className="block text-xs font-normal text-gray-500">{pagamento.observacao}</span>}
                      </td>
                      <td className="py-2">{formatarReais(pagamento.valor_pago)}</td>
                      <td className="py-2">{formatarData(pagamento.data_pagamento)}</td>
                      {ehPJ && <td className="py-2">{formatarReais(pagamento.irrf_retido)}</td>}
                      <td className="py-2 text-right">
                        <button onClick={() => excluir(pagamento)} className="text-xs font-medium text-red-600 hover:text-red-800" aria-label={`Excluir pagamento de ${formatarCompetencia(pagamento.competencia)}`}>
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
