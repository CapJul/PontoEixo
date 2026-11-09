'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';

import AvisoErro from '@/componentes/AvisoErro';
import { mensagemDeErro } from '@/lib/api';
import {
  ROTULOS_INDICE,
  dataParaIso,
  somarMeses,
  type Contrato,
  type ContratoEntrada,
  type IndiceReajuste,
  type StatusContrato,
} from '@/lib/contratos';
import type { Imovel } from '@/lib/imoveis';
import type { Inquilino } from '@/lib/inquilinos';

const CLASSE_CAMPO =
  'w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white';
const CLASSE_ROTULO = 'block text-sm font-medium text-gray-700 mb-1';

interface Props {
  contrato?: Contrato;
  inquilinos: Inquilino[];
  imoveis: Imovel[];
  aoSalvar: (dados: ContratoEntrada) => Promise<void>;
  aoExcluir?: () => Promise<void>;
  aoFechar: () => void;
}

export default function FormularioContrato({ contrato, inquilinos, imoveis, aoSalvar, aoExcluir, aoFechar }: Props) {
  const hoje = new Date();
  const [campos, setCampos] = useState({
    inquilino_id: contrato ? String(contrato.inquilino_id) : '',
    imovel_id: contrato ? String(contrato.imovel_id) : '',
    valor_aluguel: contrato ? String(contrato.valor_aluguel) : '',
    dia_vencimento: contrato ? String(contrato.dia_vencimento) : '5',
    data_inicio: contrato?.data_inicio ?? dataParaIso(hoje),
    data_fim: contrato?.data_fim ?? dataParaIso(somarMeses(hoje, 12)),
    indice_reajuste: contrato?.indice_reajuste ?? ('ipca' as IndiceReajuste),
    status: contrato?.status ?? ('pendente_assinatura' as StatusContrato),
    observacoes: contrato?.observacoes ?? '',
  });
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const alterar = (campo: keyof typeof campos, valor: string) =>
    setCampos((atual) => ({ ...atual, [campo]: valor }));

  // Ao escolher o imóvel, sugere o aluguel cadastrado nele
  const escolherImovel = (imovelId: string) => {
    const imovel = imoveis.find((i) => String(i.id) === imovelId);
    setCampos((atual) => ({
      ...atual,
      imovel_id: imovelId,
      valor_aluguel: imovel ? String(imovel.valor_aluguel) : atual.valor_aluguel,
    }));
  };

  // Ao escolher o inquilino, já seleciona o imóvel vinculado a ele (se houver)
  const escolherInquilino = (inquilinoId: string) => {
    const inquilino = inquilinos.find((i) => String(i.id) === inquilinoId);
    alterar('inquilino_id', inquilinoId);
    if (inquilino?.imovel_id && !contrato) escolherImovel(String(inquilino.imovel_id));
  };

  const executar = async (acao: () => Promise<void>) => {
    setErro(null);
    setEnviando(true);
    try {
      await acao();
    } catch (falha) {
      setErro(mensagemDeErro(falha));
      setEnviando(false);
    }
  };

  const salvar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (campos.data_fim <= campos.data_inicio) {
      setErro('A data de término deve ser posterior à data de início.');
      return;
    }
    return executar(() =>
      aoSalvar({
        inquilino_id: Number(campos.inquilino_id),
        imovel_id: Number(campos.imovel_id),
        valor_aluguel: Number(campos.valor_aluguel),
        dia_vencimento: Number(campos.dia_vencimento),
        data_inicio: campos.data_inicio,
        data_fim: campos.data_fim,
        indice_reajuste: campos.indice_reajuste,
        status: campos.status,
        observacoes: campos.observacoes.trim() || null,
      }),
    );
  };

  const excluir = () => {
    if (!aoExcluir) return;
    if (!window.confirm('Excluir este contrato? Esta ação não pode ser desfeita.')) return;
    return executar(aoExcluir);
  };

  const semCadastros = inquilinos.length === 0 || imoveis.length === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden max-h-full flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">{contrato ? 'Editar Contrato' : 'Novo Contrato'}</h3>
          <button onClick={aoFechar} aria-label="Fechar" className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form className="p-6 space-y-4 overflow-y-auto" onSubmit={salvar}>
          <AvisoErro mensagem={erro} />

          {semCadastros && !contrato && (
            <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
              Para criar um contrato, cadastre antes pelo menos um{' '}
              <Link href="/inquilinos/novo" className="font-medium underline">inquilino</Link> e um{' '}
              <Link href="/home" className="font-medium underline">imóvel</Link>.
            </p>
          )}

          <div>
            <label htmlFor="ct-inquilino" className={CLASSE_ROTULO}>Inquilino</label>
            <select id="ct-inquilino" required value={campos.inquilino_id} onChange={(e) => escolherInquilino(e.target.value)} className={CLASSE_CAMPO}>
              <option value="">Selecione um inquilino...</option>
              {inquilinos.map((inq) => (
                <option key={inq.id} value={inq.id}>{inq.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="ct-imovel" className={CLASSE_ROTULO}>Propriedade</label>
            <select id="ct-imovel" required value={campos.imovel_id} onChange={(e) => escolherImovel(e.target.value)} className={CLASSE_CAMPO}>
              <option value="">Selecione um espaço...</option>
              {imoveis.map((imovel) => (
                <option key={imovel.id} value={imovel.id}>{imovel.nome}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="ct-valor" className={CLASSE_ROTULO}>Aluguel mensal (R$)</label>
              <input id="ct-valor" required type="number" min="0" step="0.01" value={campos.valor_aluguel} onChange={(e) => alterar('valor_aluguel', e.target.value)} className={CLASSE_CAMPO} />
            </div>
            <div>
              <label htmlFor="ct-dia" className={CLASSE_ROTULO}>Dia do vencimento</label>
              <input id="ct-dia" required type="number" min="1" max="31" value={campos.dia_vencimento} onChange={(e) => alterar('dia_vencimento', e.target.value)} className={CLASSE_CAMPO} />
            </div>
            <div>
              <label htmlFor="ct-inicio" className={CLASSE_ROTULO}>Início</label>
              <input id="ct-inicio" required type="date" value={campos.data_inicio} onChange={(e) => alterar('data_inicio', e.target.value)} className={CLASSE_CAMPO} />
            </div>
            <div>
              <label htmlFor="ct-fim" className={CLASSE_ROTULO}>Término</label>
              <input id="ct-fim" required type="date" value={campos.data_fim} onChange={(e) => alterar('data_fim', e.target.value)} className={CLASSE_CAMPO} />
            </div>
            <div>
              <label htmlFor="ct-indice" className={CLASSE_ROTULO}>Reajuste anual</label>
              <select id="ct-indice" value={campos.indice_reajuste} onChange={(e) => alterar('indice_reajuste', e.target.value)} className={CLASSE_CAMPO}>
                {Object.entries(ROTULOS_INDICE).map(([valor, rotulo]) => (
                  <option key={valor} value={valor}>{rotulo}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="ct-status" className={CLASSE_ROTULO}>Status</label>
              <select id="ct-status" value={campos.status} onChange={(e) => alterar('status', e.target.value)} className={CLASSE_CAMPO}>
                <option value="pendente_assinatura">Aguardando assinatura</option>
                <option value="ativo">Ativo</option>
                <option value="encerrado">Encerrado</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="ct-obs" className={CLASSE_ROTULO}>Cláusulas adicionais (opcional)</label>
            <textarea id="ct-obs" rows={3} maxLength={2000} value={campos.observacoes} onChange={(e) => alterar('observacoes', e.target.value)} className={CLASSE_CAMPO} placeholder="Ex.: Permitida a instalação de letreiro na fachada." />
            <p className="text-xs text-gray-500 mt-1">Entram no PDF como uma cláusula do contrato.</p>
          </div>

          <div className="flex gap-3 pt-2">
            {contrato && aoExcluir && (
              <button type="button" onClick={excluir} disabled={enviando} className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50 disabled:opacity-60">
                Excluir
              </button>
            )}
            <button type="submit" disabled={enviando} className="flex-1 bg-blue-600 text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60">
              {enviando ? 'Salvando...' : contrato ? 'Salvar alterações' : 'Gerar Contrato'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
