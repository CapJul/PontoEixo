'use client';

import { useCallback, useState } from 'react';

import AvisoErro from '@/componentes/AvisoErro';
import { mensagemDeErro } from '@/lib/api';
import { formatarReais } from '@/lib/formatacao';
import { listarDeducoes, salvarDeducao, type Deducao } from '@/lib/impostoRenda';
import { useDadosApi } from '@/lib/useDadosApi';

const CLASSE_CAMPO =
  'w-full border border-slate-300 rounded-md py-1.5 px-2 text-sm focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500';

type Campo = 'valor_iptu' | 'valor_condominio' | 'valor_taxa_administracao';

function LinhaDeducao({ ano, deducao, aoSalvar }: { ano: number; deducao: Deducao; aoSalvar: () => void }) {
  const [valores, setValores] = useState<Record<Campo, string>>({
    valor_iptu: String(deducao.valor_iptu),
    valor_condominio: String(deducao.valor_condominio),
    valor_taxa_administracao: String(deducao.valor_taxa_administracao),
  });
  const [estado, setEstado] = useState<'parado' | 'salvando' | 'salvo'>('parado');
  const [erro, setErro] = useState<string | null>(null);

  const total = Object.values(valores).reduce((soma, valor) => soma + (Number(valor) || 0), 0);

  const salvar = async () => {
    setEstado('salvando');
    setErro(null);
    try {
      await salvarDeducao(ano, deducao.imovel_id, {
        valor_iptu: Number(valores.valor_iptu) || 0,
        valor_condominio: Number(valores.valor_condominio) || 0,
        valor_taxa_administracao: Number(valores.valor_taxa_administracao) || 0,
      });
      setEstado('salvo');
      aoSalvar();
    } catch (falha) {
      setErro(mensagemDeErro(falha));
      setEstado('parado');
    }
  };

  const campo = (nome: Campo, rotulo: string) => (
    <input
      type="number"
      min="0"
      step="0.01"
      aria-label={`${rotulo} de ${deducao.imovel_nome}`}
      value={valores[nome]}
      onChange={(e) => {
        setValores((atuais) => ({ ...atuais, [nome]: e.target.value }));
        setEstado('parado');
      }}
      className={CLASSE_CAMPO}
    />
  );

  return (
    <tr>
      <td className="px-4 py-3 text-sm font-medium text-slate-900">
        {deducao.imovel_nome}
        {erro && <span className="block text-xs font-normal text-red-600">{erro}</span>}
      </td>
      <td className="px-4 py-3">{campo('valor_iptu', 'IPTU')}</td>
      <td className="px-4 py-3">{campo('valor_condominio', 'Condomínio')}</td>
      <td className="px-4 py-3">{campo('valor_taxa_administracao', 'Taxa de administração')}</td>
      <td className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">{formatarReais(total)}</td>
      <td className="px-4 py-3 text-right">
        <button
          onClick={salvar}
          disabled={estado === 'salvando'}
          aria-label={`Salvar despesas de ${deducao.imovel_nome}`}
          className="px-3 py-1.5 text-xs font-medium text-white bg-slate-800 rounded-md hover:bg-slate-700 disabled:opacity-60"
        >
          {estado === 'salvando' ? 'Salvando...' : estado === 'salvo' ? 'Salvo ✓' : 'Salvar'}
        </button>
      </td>
    </tr>
  );
}

/** Tabela para informar IPTU, condomínio e taxa de administração de cada imóvel no ano. */
export default function DeducoesImovel({ ano, aoAlterar }: { ano: number; aoAlterar: () => void }) {
  const buscar = useCallback(() => listarDeducoes(ano), [ano]);
  const { dados: deducoes, carregando, erro } = useDadosApi(buscar, [] as Deducao[]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        Informe as despesas de {ano} pagas por você (locador) e não reembolsadas pelo inquilino. Elas são
        descontadas do aluguel recebido de cada imóvel, dividindo entre os inquilinos que pagaram por ele no ano.
      </p>
      <AvisoErro mensagem={erro} />
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              <th className="px-4 py-3">Imóvel</th>
              <th className="px-4 py-3">IPTU (R$)</th>
              <th className="px-4 py-3">Condomínio (R$)</th>
              <th className="px-4 py-3">Taxa de adm. (R$)</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3"><span className="sr-only">Ações</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {deducoes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                  {carregando ? 'Carregando...' : 'Nenhum imóvel cadastrado.'}
                </td>
              </tr>
            )}
            {deducoes.map((deducao) => (
              <LinhaDeducao key={`${ano}-${deducao.imovel_id}`} ano={ano} deducao={deducao} aoSalvar={aoAlterar} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
