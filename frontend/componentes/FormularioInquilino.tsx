'use client';

import React, { useState, type FormEvent } from 'react';
import Link from 'next/link';

import AvisoErro from '@/componentes/AvisoErro';
import { mensagemDeErro } from '@/lib/api';
import { formatarDocumento, formatarTelefone } from '@/lib/formatacao';
import { listarImoveis, type Imovel } from '@/lib/imoveis';
import type {
  EstadoCivil,
  GarantiaLocaticia,
  Inquilino,
  InquilinoEntrada,
  Sexo,
  TipoLocacao,
  TipoPessoa,
} from '@/lib/inquilinos';
import { mascararCnpj, mascararCpf, mascararTelefone } from '@/lib/mascaras';
import { useDadosApi } from '@/lib/useDadosApi';

const CLASSE_CAMPO =
  'w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-1 focus:ring-slate-500 focus:border-slate-500 sm:text-sm';
const CLASSE_SELECT = `${CLASSE_CAMPO} text-slate-700 bg-white`;
const CLASSE_ROTULO = 'block text-sm font-medium text-slate-700 mb-1';

interface Props {
  /** Inquilino em edição; ausente no cadastro. */
  inquilino?: Inquilino;
  aoSalvar: (dados: InquilinoEntrada) => Promise<void>;
}

export default function FormularioInquilino({ inquilino, aoSalvar }: Props) {
  const { dados: imoveis } = useDadosApi(listarImoveis, [] as Imovel[]);

  const [tipoPessoa, setTipoPessoa] = useState<TipoPessoa>(inquilino?.tipo_pessoa ?? 'PF');
  const [campos, setCampos] = useState({
    nome: inquilino?.nome ?? '',
    documento: inquilino ? formatarDocumento(inquilino.documento) : '',
    rg_ou_inscricao_estadual: inquilino?.rg_ou_inscricao_estadual ?? '',
    data_nascimento: inquilino?.data_nascimento ?? '',
    sexo: inquilino?.sexo ?? '',
    estado_civil: inquilino?.estado_civil ?? '',
    email: inquilino?.email ?? '',
    telefone: inquilino?.telefone ? formatarTelefone(inquilino.telefone) : '',
    imovel_id: inquilino?.imovel_id ? String(inquilino.imovel_id) : '',
    tipo_locacao: inquilino?.tipo_locacao ?? 'comercial',
    garantia: inquilino?.garantia ?? '',
  });
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const alterar = (campo: keyof typeof campos) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setCampos((atual) => ({ ...atual, [campo]: e.target.value }));

  const trocarTipoPessoa = (novoTipo: TipoPessoa) => {
    setTipoPessoa(novoTipo);
    setCampos((atual) => ({ ...atual, documento: '' })); // CPF e CNPJ têm formatos diferentes
  };

  const enviar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    const ehPF = tipoPessoa === 'PF';
    try {
      await aoSalvar({
        tipo_pessoa: tipoPessoa,
        nome: campos.nome,
        documento: campos.documento,
        rg_ou_inscricao_estadual: campos.rg_ou_inscricao_estadual || null,
        data_nascimento: ehPF ? campos.data_nascimento || null : null,
        sexo: ehPF ? (campos.sexo as Sexo) || null : null,
        estado_civil: ehPF ? (campos.estado_civil as EstadoCivil) || null : null,
        email: campos.email || null,
        telefone: campos.telefone || null,
        imovel_id: campos.imovel_id ? Number(campos.imovel_id) : null,
        tipo_locacao: campos.tipo_locacao as TipoLocacao,
        garantia: (campos.garantia as GarantiaLocaticia) || null,
      });
    } catch (falha) {
      setErro(mensagemDeErro(falha));
      setEnviando(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <form className="bg-white border border-slate-200 rounded-lg shadow-sm" onSubmit={enviar}>

      {/* TIPO DE PESSOA (PF / PJ) */}
      <div className="px-8 py-6 border-b border-slate-200 bg-slate-50/50 rounded-t-lg space-y-4">
        <AvisoErro mensagem={erro} />
        <div className="flex items-center gap-6">
          <span className="text-sm font-medium text-slate-700">Tipo de Cadastro:</span>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="tipoPessoa"
              value="PF"
              checked={tipoPessoa === 'PF'}
              onChange={() => trocarTipoPessoa('PF')}
              className="w-4 h-4 text-slate-800 border-slate-300 focus:ring-slate-800"
            />
            <span className="text-sm text-slate-800">Pessoa Física (PF)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="tipoPessoa"
              value="PJ"
              checked={tipoPessoa === 'PJ'}
              onChange={() => trocarTipoPessoa('PJ')}
              className="w-4 h-4 text-slate-800 border-slate-300 focus:ring-slate-800"
            />
            <span className="text-sm text-slate-800">Pessoa Jurídica (PJ)</span>
          </label>
        </div>
      </div>

      <div className="px-8 py-8 space-y-10">

        {/* SEÇÃO 1: DADOS PRINCIPAIS */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-5">
            1. Dados Principais
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label htmlFor="inq-nome" className={CLASSE_ROTULO}>
                {tipoPessoa === 'PF' ? 'Nome Completo' : 'Razão Social'}
              </label>
              <input
                id="inq-nome"
                type="text"
                required
                minLength={2}
                maxLength={200}
                value={campos.nome}
                onChange={alterar('nome')}
                className={CLASSE_CAMPO}
                placeholder={tipoPessoa === 'PF' ? 'Ex: João da Silva' : 'Ex: Empresa XYZ Ltda'}
              />
            </div>

            <div>
              <label htmlFor="inq-documento" className={CLASSE_ROTULO}>
                {tipoPessoa === 'PF' ? 'CPF' : 'CNPJ'}
              </label>
              <input
                id="inq-documento"
                type="text"
                required
                value={campos.documento}
                onChange={(e) =>
                  setCampos((atual) => ({
                    ...atual,
                    documento: tipoPessoa === 'PF' ? mascararCpf(e.target.value) : mascararCnpj(e.target.value),
                  }))
                }
                className={CLASSE_CAMPO}
                placeholder={tipoPessoa === 'PF' ? '000.000.000-00' : '00.000.000/0001-00'}
              />
            </div>

            <div>
              <label htmlFor="inq-rg" className={CLASSE_ROTULO}>
                {tipoPessoa === 'PF' ? 'RG / Órgão Emissor' : 'Inscrição Estadual'}
              </label>
              <input
                id="inq-rg"
                type="text"
                maxLength={30}
                value={campos.rg_ou_inscricao_estadual}
                onChange={alterar('rg_ou_inscricao_estadual')}
                className={CLASSE_CAMPO}
              />
            </div>

            {/* Exibe Idade, Sexo e Estado Civil apenas se for PF */}
            {tipoPessoa === 'PF' && (
              <>
                <div>
                  <label htmlFor="inq-nascimento" className={CLASSE_ROTULO}>Data de Nascimento</label>
                  <input
                    id="inq-nascimento"
                    type="date"
                    value={campos.data_nascimento}
                    onChange={alterar('data_nascimento')}
                    className={`${CLASSE_CAMPO} text-slate-700`}
                  />
                </div>
                <div>
                  <label htmlFor="inq-sexo" className={CLASSE_ROTULO}>Sexo / Gênero</label>
                  <select id="inq-sexo" value={campos.sexo} onChange={alterar('sexo')} className={CLASSE_SELECT}>
                    <option value="">Selecione...</option>
                    <option value="M">Masculino</option>
                    <option value="F">Feminino</option>
                    <option value="O">Outro</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="inq-estado-civil" className={CLASSE_ROTULO}>Estado Civil</label>
                  <select
                    id="inq-estado-civil"
                    value={campos.estado_civil}
                    onChange={alterar('estado_civil')}
                    className={`${CLASSE_SELECT} md:w-1/2`}
                  >
                    <option value="">Selecione...</option>
                    <option value="solteiro">Solteiro(a)</option>
                    <option value="casado">Casado(a)</option>
                    <option value="divorciado">Divorciado(a)</option>
                    <option value="viuvo">Viúvo(a)</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>

        <hr className="border-slate-200" />

        {/* SEÇÃO 2: CONTATO */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-5">2. Informações de Contato</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-2">
              <label htmlFor="inq-email" className={CLASSE_ROTULO}>E-mail Principal</label>
              <input
                id="inq-email"
                type="email"
                value={campos.email}
                onChange={alterar('email')}
                className={CLASSE_CAMPO}
                placeholder="email@exemplo.com"
              />
            </div>
            <div>
              <label htmlFor="inq-telefone" className={CLASSE_ROTULO}>Celular / WhatsApp</label>
              <input
                id="inq-telefone"
                type="tel"
                value={campos.telefone}
                onChange={(e) => setCampos((atual) => ({ ...atual, telefone: mascararTelefone(e.target.value) }))}
                className={CLASSE_CAMPO}
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>
        </div>

        <hr className="border-slate-200" />

        {/* SEÇÃO 3: VÍNCULO COM IMÓVEL */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-5">3. Vínculo de Locação</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-slate-50 border border-slate-200 p-5 rounded-md">

            <div className="md:col-span-2">
              <label htmlFor="inq-imovel" className={CLASSE_ROTULO}>Imóvel Destinado</label>
              <select id="inq-imovel" value={campos.imovel_id} onChange={alterar('imovel_id')} className={CLASSE_SELECT}>
                <option value="">Nenhum imóvel por enquanto</option>
                {imoveis.map((imovel) => (
                  <option key={imovel.id} value={imovel.id}>
                    {imovel.nome}
                    {imovel.status === 'disponivel' ? ' (disponível)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="inq-locacao" className={CLASSE_ROTULO}>Tipo de Locação</label>
              <select id="inq-locacao" value={campos.tipo_locacao} onChange={alterar('tipo_locacao')} className={CLASSE_SELECT}>
                <option value="comercial">Comercial</option>
                <option value="residencial">Residencial</option>
                <option value="temporada">Temporada / Evento</option>
              </select>
            </div>

            <div>
              <label htmlFor="inq-garantia" className={CLASSE_ROTULO}>Garantia Locatícia</label>
              <select id="inq-garantia" value={campos.garantia} onChange={alterar('garantia')} className={CLASSE_SELECT}>
                <option value="">Selecione o tipo de garantia...</option>
                <option value="fiador">Fiador (Com imóvel)</option>
                <option value="caucao">Caução (Depósito)</option>
                <option value="seguro">Seguro Fiança</option>
                <option value="nenhuma">Nenhuma</option>
              </select>
            </div>

          </div>
        </div>

      </div>

      {/* RODAPÉ: BOTÕES DE AÇÃO */}
      <div className="px-8 py-5 border-t border-slate-200 bg-slate-50/50 rounded-b-lg flex items-center justify-end gap-3">
        <Link
          href="/inquilinos"
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={enviando}
          className="px-6 py-2 text-sm font-medium text-white bg-slate-800 border border-transparent rounded-md shadow-sm hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-800 transition-colors disabled:opacity-60"
        >
          {enviando ? 'Salvando...' : 'Salvar Inquilino'}
        </button>
      </div>

    </form>
  );
}
