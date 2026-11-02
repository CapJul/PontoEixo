"""
Modelo da tabela CODIGO_RECUPERACAO.

Cada linha é um código de 6 dígitos enviado por e-mail para o usuário que
esqueceu a senha. O código fica salvo apenas como hash, expira após alguns
minutos e é invalidado após muitas tentativas erradas ou depois de usado.
"""

from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, false, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.modelos.usuario import Usuario


class CodigoRecuperacao(Base):
    """Código de verificação usado no fluxo de recuperação de senha."""

    __tablename__ = "codigo_recuperacao"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True, comment="Identificador do código"
    )
    usuario_id: Mapped[int] = mapped_column(
        ForeignKey("usuario.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Usuário que solicitou a recuperação",
    )
    codigo_hash: Mapped[str] = mapped_column(
        String(64), nullable=False, comment="Hash HMAC-SHA256 do código enviado"
    )
    expira_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, comment="Momento em que o código deixa de valer"
    )
    tentativas: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        server_default="0",
        comment="Quantidade de tentativas erradas de validação",
    )
    utilizado: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        server_default=false(),
        comment="True quando o código já foi usado ou foi invalidado",
    )
    criado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        comment="Data e hora de envio do código",
    )

    usuario: Mapped[Usuario] = relationship()

    def __repr__(self) -> str:
        return f"<CodigoRecuperacao id={self.id} usuario_id={self.usuario_id}>"
