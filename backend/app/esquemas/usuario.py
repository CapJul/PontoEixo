"""Esquemas relacionados ao usuário."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class UsuarioSaida(BaseModel):
    """Dados públicos do usuário devolvidos pela API (nunca inclui a senha)."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    nome: str
    email: str
    criado_em: datetime
