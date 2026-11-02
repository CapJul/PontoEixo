"""
Modelo da tabela INQUILINO.

Guarda o dossiê do locatário preenchido na tela "Cadastrar Inquilino":
dados pessoais (PF) ou da empresa (PJ), contato e dados da locação.
Cada inquilino pertence ao usuário que o cadastrou e pode estar vinculado
a um imóvel.
"""

import enum
from datetime import date

from sqlalchemy import Date, Enum, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, ColunasDeData
from app.modelos.imovel import Imovel


class TipoPessoa(str, enum.Enum):
    """Pessoa Física ou Pessoa Jurídica."""

    PF = "PF"
    PJ = "PJ"


class Sexo(str, enum.Enum):
    """Sexo/gênero informado no cadastro (apenas PF)."""

    MASCULINO = "M"
    FEMININO = "F"
    OUTRO = "O"


class EstadoCivil(str, enum.Enum):
    """Estado civil (apenas PF)."""

    SOLTEIRO = "solteiro"
    CASADO = "casado"
    DIVORCIADO = "divorciado"
    VIUVO = "viuvo"


class TipoLocacao(str, enum.Enum):
    """Finalidade da locação."""

    COMERCIAL = "comercial"
    RESIDENCIAL = "residencial"
    TEMPORADA = "temporada"


class GarantiaLocaticia(str, enum.Enum):
    """Garantia oferecida pelo inquilino."""

    FIADOR = "fiador"
    CAUCAO = "caucao"
    SEGURO = "seguro"  # seguro fiança
    NENHUMA = "nenhuma"


def _enum_texto(classe_enum: type[enum.Enum], nome: str) -> Enum:
    """Cria a coluna de enum salva como texto, com restrição CHECK no banco."""
    return Enum(
        classe_enum,
        name=nome,
        native_enum=False,
        length=20,
        create_constraint=True,
        values_callable=lambda classe: [item.value for item in classe],
    )


class Inquilino(ColunasDeData, Base):
    """Locatário cadastrado no PontoEixo."""

    __tablename__ = "inquilino"
    __table_args__ = (
        # O mesmo usuário não pode cadastrar duas vezes o mesmo CPF/CNPJ
        UniqueConstraint("usuario_id", "documento", name="uq_inquilino_usuario_id_documento"),
    )

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True, comment="Identificador do inquilino"
    )
    usuario_id: Mapped[int] = mapped_column(
        ForeignKey("usuario.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Usuário que cadastrou o inquilino",
    )
    imovel_id: Mapped[int | None] = mapped_column(
        ForeignKey("imovel.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="Imóvel destinado ao inquilino (opcional)",
    )

    # Identificação
    tipo_pessoa: Mapped[TipoPessoa] = mapped_column(
        _enum_texto(TipoPessoa, "tipo_pessoa"), nullable=False, comment="PF ou PJ"
    )
    nome: Mapped[str] = mapped_column(
        String(200), nullable=False, comment="Nome completo (PF) ou razão social (PJ)"
    )
    documento: Mapped[str] = mapped_column(
        String(14), nullable=False, comment="CPF (11) ou CNPJ (14) sem máscara"
    )
    rg_ou_inscricao_estadual: Mapped[str | None] = mapped_column(
        String(30), nullable=True, comment="RG/órgão emissor (PF) ou inscrição estadual (PJ)"
    )
    data_nascimento: Mapped[date | None] = mapped_column(
        Date, nullable=True, comment="Data de nascimento (apenas PF)"
    )
    sexo: Mapped[Sexo | None] = mapped_column(
        _enum_texto(Sexo, "sexo"), nullable=True, comment="M, F ou O (apenas PF)"
    )
    estado_civil: Mapped[EstadoCivil | None] = mapped_column(
        _enum_texto(EstadoCivil, "estado_civil"), nullable=True, comment="Estado civil (apenas PF)"
    )

    # Contato
    email: Mapped[str | None] = mapped_column(
        String(255), nullable=True, comment="E-mail principal"
    )
    telefone: Mapped[str | None] = mapped_column(
        String(11), nullable=True, comment="Celular/WhatsApp com DDD, só números"
    )

    # Locação
    tipo_locacao: Mapped[TipoLocacao] = mapped_column(
        _enum_texto(TipoLocacao, "tipo_locacao"),
        nullable=False,
        comment="comercial, residencial ou temporada",
    )
    garantia: Mapped[GarantiaLocaticia | None] = mapped_column(
        _enum_texto(GarantiaLocaticia, "garantia_locaticia"),
        nullable=True,
        comment="fiador, caucao, seguro ou nenhuma",
    )

    imovel: Mapped[Imovel | None] = relationship()

    def __repr__(self) -> str:
        return f"<Inquilino id={self.id} nome={self.nome!r}>"
