"""
Modelo da tabela USUARIO.

Guarda as contas que acessam o sistema (proprietários/gestores dos imóveis).
A senha nunca é armazenada em texto puro: apenas o seu hash.
"""

from sqlalchemy import Boolean, Integer, String, true
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, ColunasDeData


class Usuario(ColunasDeData, Base):
    """Conta de acesso ao PontoEixo."""

    __tablename__ = "usuario"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True, comment="Identificador do usuário"
    )
    nome: Mapped[str] = mapped_column(
        String(150), nullable=False, comment="Nome completo do usuário"
    )
    email: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        unique=True,
        index=True,
        comment="E-mail usado no login (sempre em minúsculas)",
    )
    senha_hash: Mapped[str] = mapped_column(
        String(255), nullable=False, comment="Hash da senha do usuário"
    )
    ativo: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default=true(),
        comment="Indica se o usuário pode acessar o sistema",
    )

    def __repr__(self) -> str:
        return f"<Usuario id={self.id} email={self.email!r}>"
