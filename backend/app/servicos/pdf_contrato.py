"""
Geração do PDF do contrato de locação.

O texto é montado a partir dos dados cadastrados (locador, locatário,
imóvel e condições do contrato), com cláusulas padrão baseadas na
Lei do Inquilinato (Lei nº 8.245/1991). O documento é um modelo para
revisão antes da assinatura.
"""

from datetime import date
from decimal import Decimal

from fpdf import FPDF

from app.modelos.contrato import Contrato, IndiceReajuste
from app.modelos.inquilino import EstadoCivil, GarantiaLocaticia, TipoLocacao, TipoPessoa
from app.modelos.usuario import Usuario

MESES = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
]

FINALIDADES = {
    TipoLocacao.COMERCIAL: "comercial",
    TipoLocacao.RESIDENCIAL: "residencial",
    TipoLocacao.TEMPORADA: "para temporada",
}

ESTADOS_CIVIS = {
    EstadoCivil.SOLTEIRO: "solteiro(a)",
    EstadoCivil.CASADO: "casado(a)",
    EstadoCivil.DIVORCIADO: "divorciado(a)",
    EstadoCivil.VIUVO: "viúvo(a)",
}

GARANTIAS = {
    GarantiaLocaticia.FIADOR: "fiança prestada por fiador, que assina este contrato como devedor solidário",
    GarantiaLocaticia.CAUCAO: "caução em dinheiro, limitada a três meses de aluguel (art. 38, § 2º, da Lei nº 8.245/1991)",
    GarantiaLocaticia.SEGURO: "seguro de fiança locatícia contratado pelo LOCATÁRIO",
    GarantiaLocaticia.NENHUMA: "nenhuma garantia locatícia",
}

LINHA_EM_BRANCO = "____________________"


def formatar_reais(valor: Decimal) -> str:
    """Decimal('8500.5') -> 'R$ 8.500,50'"""
    texto = f"{valor:,.2f}"
    return "R$ " + texto.replace(",", "X").replace(".", ",").replace("X", ".")


def formatar_data(data: date) -> str:
    return data.strftime("%d/%m/%Y")


def data_por_extenso(data: date) -> str:
    return f"{data.day} de {MESES[data.month - 1]} de {data.year}"


def formatar_documento(documento: str) -> str:
    """Aplica a máscara de CPF (11) ou CNPJ (14) a um documento salvo sem máscara."""
    if len(documento) == 11:
        return f"{documento[:3]}.{documento[3:6]}.{documento[6:9]}-{documento[9:]}"
    if len(documento) == 14:
        return f"{documento[:2]}.{documento[2:5]}.{documento[5:8]}/{documento[8:12]}-{documento[12:]}"
    return documento


def formatar_telefone(telefone: str) -> str:
    """'98987654321' -> '(98) 98765-4321'"""
    if len(telefone) == 11:
        return f"({telefone[:2]}) {telefone[2:7]}-{telefone[7:]}"
    if len(telefone) == 10:
        return f"({telefone[:2]}) {telefone[2:6]}-{telefone[6:]}"
    return telefone


def meses_entre(inicio: date, fim: date) -> int:
    """Quantidade de meses completos entre duas datas."""
    meses = (fim.year - inicio.year) * 12 + (fim.month - inicio.month)
    if fim.day < inicio.day:
        meses -= 1
    return max(meses, 0)


def _latin1(texto: str) -> str:
    """As fontes padrão do PDF usam Latin-1; caracteres fora dele viram '?'."""
    return texto.encode("latin-1", "replace").decode("latin-1")


class _DocumentoPdf(FPDF):
    """PDF com rodapé de página padrão do PontoEixo."""

    def __init__(self, numero_contrato: int):
        super().__init__(format="A4")
        self.numero_contrato = numero_contrato
        self.set_margins(22, 20, 22)
        self.set_auto_page_break(auto=True, margin=22)

    def footer(self) -> None:
        self.set_y(-15)
        self.set_font("Helvetica", size=8)
        self.set_text_color(120, 120, 120)
        texto = (
            f"Contrato nº {self.numero_contrato} - gerado pelo PontoEixo em {formatar_data(date.today())}"
            f" - página {self.page_no()}/{{nb}}"
        )
        self.cell(0, 10, _latin1(texto), align="C")

    # Atalhos de escrita -------------------------------------------------
    def titulo(self, texto: str) -> None:
        self.set_font("Helvetica", "B", 13)
        self.multi_cell(0, 7, _latin1(texto), align="C", new_x="LMARGIN", new_y="NEXT")

    def secao(self, texto: str) -> None:
        self.ln(3)
        self.set_font("Helvetica", "B", 10.5)
        self.multi_cell(0, 6, _latin1(texto), new_x="LMARGIN", new_y="NEXT")

    def paragrafo(self, texto: str) -> None:
        self.set_font("Helvetica", size=10)
        self.multi_cell(0, 5.5, _latin1(texto), align="J", new_x="LMARGIN", new_y="NEXT")
        self.ln(1.5)

    def assinatura(self, rotulo: str, nome: str = "") -> None:
        self.ln(12)
        self.set_font("Helvetica", size=10)
        self.cell(0, 5, "_" * 60, align="C", new_x="LMARGIN", new_y="NEXT")
        self.set_font("Helvetica", "B", 9.5)
        self.cell(0, 5, _latin1(rotulo), align="C", new_x="LMARGIN", new_y="NEXT")
        if nome:
            self.set_font("Helvetica", size=9.5)
            self.cell(0, 5, _latin1(nome), align="C", new_x="LMARGIN", new_y="NEXT")


def _qualificar_locatario(contrato: Contrato) -> str:
    """Monta o parágrafo de qualificação do inquilino (PF ou PJ)."""
    inquilino = contrato.inquilino
    documento = formatar_documento(inquilino.documento)
    partes: list[str]

    if inquilino.tipo_pessoa == TipoPessoa.PF:
        partes = [inquilino.nome]
        if inquilino.estado_civil:
            partes.append(ESTADOS_CIVIS[inquilino.estado_civil])
        partes.append(f"inscrito(a) no CPF sob o nº {documento}")
        if inquilino.rg_ou_inscricao_estadual:
            partes.append(f"portador(a) do RG {inquilino.rg_ou_inscricao_estadual}")
    else:
        partes = [inquilino.nome, f"pessoa jurídica inscrita no CNPJ sob o nº {documento}"]
        if inquilino.rg_ou_inscricao_estadual:
            partes.append(f"inscrição estadual {inquilino.rg_ou_inscricao_estadual}")
        partes.append(f"neste ato representada por {LINHA_EM_BRANCO}")

    contatos = []
    if inquilino.email:
        contatos.append(f"e-mail {inquilino.email}")
    if inquilino.telefone:
        contatos.append(f"telefone {formatar_telefone(inquilino.telefone)}")
    if contatos:
        partes.append(" e ".join(contatos))

    return ", ".join(partes) + ", doravante denominado(a) LOCATÁRIO(A)."


def gerar_pdf_contrato(contrato: Contrato, locador: Usuario) -> bytes:
    """Gera o PDF do contrato de locação e devolve os bytes do arquivo."""
    inquilino = contrato.inquilino
    imovel = contrato.imovel
    finalidade = FINALIDADES[inquilino.tipo_locacao]
    prazo_meses = meses_entre(contrato.data_inicio, contrato.data_fim)

    pdf = _DocumentoPdf(contrato.id)
    pdf.set_title(_latin1(f"Contrato de locação nº {contrato.id}"))
    pdf.set_author(_latin1(locador.nome))
    pdf.add_page()

    pdf.titulo(f"CONTRATO DE LOCAÇÃO DE IMÓVEL {finalidade.upper()}")
    pdf.set_font("Helvetica", size=9.5)
    pdf.cell(0, 6, _latin1(f"Contrato nº {contrato.id}"), align="C", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(4)

    pdf.secao("DAS PARTES")
    pdf.paragrafo(
        f"LOCADOR: {locador.nome}, inscrito(a) no CPF/CNPJ sob o nº {LINHA_EM_BRANCO}, "
        f"e-mail {locador.email}, doravante denominado(a) LOCADOR."
    )
    pdf.paragrafo(f"LOCATÁRIO(A): {_qualificar_locatario(contrato)}")
    pdf.paragrafo(
        "As partes acima identificadas têm entre si justo e acertado o presente contrato de "
        "locação, que se regerá pelas cláusulas seguintes e pela Lei nº 8.245/1991 (Lei do Inquilinato)."
    )

    pdf.secao("CLÁUSULA 1ª - DO OBJETO")
    endereco = imovel.endereco or LINHA_EM_BRANCO
    pdf.paragrafo(
        f"O presente contrato tem como objeto a locação {finalidade} do imóvel denominado "
        f"\"{imovel.nome}\", situado em {endereco}, que o(a) LOCATÁRIO(A) declara receber em "
        "perfeitas condições de uso, comprometendo-se a devolvê-lo no mesmo estado ao final da locação."
    )

    pdf.secao("CLÁUSULA 2ª - DO PRAZO")
    pdf.paragrafo(
        f"A locação terá prazo de {prazo_meses} meses, com início em {formatar_data(contrato.data_inicio)} "
        f"e término em {formatar_data(contrato.data_fim)}, data em que o(a) LOCATÁRIO(A) se obriga a "
        "restituir o imóvel livre e desocupado, salvo prorrogação ajustada por escrito entre as partes."
    )

    pdf.secao("CLÁUSULA 3ª - DO ALUGUEL E DO PAGAMENTO")
    vencimento = f"todo dia {contrato.dia_vencimento} de cada mês"
    if contrato.dia_vencimento > 28:
        vencimento += " (ou no último dia do mês, nos meses que não tiverem esse dia)"
    pdf.paragrafo(
        f"O aluguel mensal é de {formatar_reais(contrato.valor_aluguel)}, com vencimento {vencimento}. "
        "O atraso no pagamento sujeitará o(a) LOCATÁRIO(A) à multa de 10% (dez por cento) sobre o valor "
        "devido, acrescida de juros de 1% (um por cento) ao mês e correção monetária."
    )

    pdf.secao("CLÁUSULA 4ª - DO REAJUSTE")
    if contrato.indice_reajuste == IndiceReajuste.NENHUM:
        pdf.paragrafo("O valor do aluguel permanecerá fixo durante todo o prazo deste contrato.")
    else:
        indice = "IPCA (IBGE)" if contrato.indice_reajuste == IndiceReajuste.IPCA else "IGP-M (FGV)"
        pdf.paragrafo(
            f"O aluguel será reajustado a cada 12 (doze) meses, contados do início da locação, pela "
            f"variação acumulada do {indice} no período. Na falta deste índice, será adotado outro "
            "oficial que o substitua."
        )

    pdf.secao("CLÁUSULA 5ª - DA GARANTIA")
    garantia = GARANTIAS[inquilino.garantia] if inquilino.garantia else "nenhuma garantia locatícia"
    pdf.paragrafo(f"Para garantia das obrigações assumidas neste contrato, fica estabelecida {garantia}.")

    pdf.secao("CLÁUSULA 6ª - DAS OBRIGAÇÕES")
    pdf.paragrafo(
        "Cabe ao(à) LOCATÁRIO(A) pagar pontualmente o aluguel e os encargos da locação (consumo de água, "
        "energia elétrica e demais despesas ordinárias), usar o imóvel apenas para a finalidade contratada, "
        "não sublocá-lo nem ceder o contrato sem autorização por escrito do LOCADOR e realizar os reparos "
        "de danos que causar. Cabe ao LOCADOR entregar o imóvel em condições de uso e responder pelos "
        "vícios anteriores à locação, nos termos dos arts. 22 e 23 da Lei nº 8.245/1991."
    )

    pdf.secao("CLÁUSULA 7ª - DA RESCISÃO")
    pdf.paragrafo(
        "A infração de qualquer cláusula deste contrato autoriza a sua rescisão. Caso o(a) LOCATÁRIO(A) "
        "devolva o imóvel antes do término do prazo, pagará multa proporcional ao período restante, "
        "conforme o art. 4º da Lei nº 8.245/1991."
    )

    numero_clausula = 8
    if contrato.observacoes:
        pdf.secao(f"CLÁUSULA {numero_clausula}ª - DISPOSIÇÕES ADICIONAIS")
        pdf.paragrafo(contrato.observacoes)
        numero_clausula += 1

    pdf.secao(f"CLÁUSULA {numero_clausula}ª - DO FORO")
    pdf.paragrafo(
        "Fica eleito o foro da comarca onde se localiza o imóvel para dirimir quaisquer questões "
        "oriundas deste contrato. E, por estarem assim justas e contratadas, as partes assinam o "
        "presente instrumento em 2 (duas) vias de igual teor, na presença de duas testemunhas."
    )

    pdf.ln(4)
    pdf.set_font("Helvetica", size=10)
    pdf.cell(
        0, 6, _latin1(f"{LINHA_EM_BRANCO}, {data_por_extenso(date.today())}."),
        align="R", new_x="LMARGIN", new_y="NEXT",
    )

    pdf.assinatura("LOCADOR", locador.nome)
    pdf.assinatura("LOCATÁRIO(A)", inquilino.nome)
    pdf.assinatura("TESTEMUNHA 1 - Nome e CPF")
    pdf.assinatura("TESTEMUNHA 2 - Nome e CPF")

    return bytes(pdf.output())
