"""
${message}

Revisão: ${up_revision}
Revisão anterior: ${down_revision | comma,n}
Criada em: ${create_date}
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa
${imports if imports else ""}

# Identificadores usados pelo Alembic para ordenar as migrações
revision: str = ${repr(up_revision)}
down_revision: str | Sequence[str] | None = ${repr(down_revision)}
branch_labels: str | Sequence[str] | None = ${repr(branch_labels)}
depends_on: str | Sequence[str] | None = ${repr(depends_on)}


def upgrade() -> None:
    """Aplica a migração."""
    ${upgrades if upgrades else "pass"}


def downgrade() -> None:
    """Desfaz a migração."""
    ${downgrades if downgrades else "pass"}
