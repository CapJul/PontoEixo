"""Esquemas usados nos endpoints de inquilinos."""

import re
from datetime import date, datetime
from typing import Annotated, Any

from pydantic import (
    BaseModel,
    BeforeValidator,
    ConfigDict,
    Field,
    StringConstraints,
    field_validator,
    model_validator,
)

from app.core.validadores import somente_caracteres_documento, validar_cnpj, validar_cpf
from app.esquemas.comum import EmailNormalizado
from app.modelos.inquilino import (
    EstadoCivil,
    GarantiaLocaticia,
    Sexo,
    TipoLocacao,
    TipoPessoa,
)


def _vazio_para_nulo(valor: Any) -> Any:
    """Converte textos vazios ("" ou só espaços) em None.

    Os <select> e <input> do formulário enviam "" quando não preenchidos.
    """
    if isinstance(valor, str) and not valor.strip():
        return None
    return valor


# Campo opcional que aceita "" vindo do formulário como "não informado"
Opcional = BeforeValidator(_vazio_para_nulo)


class InquilinoEntrada(BaseModel):
    """
    Dados da tela "Cadastrar Inquilino".

    - Para PF, `documento` é o CPF; para PJ, o CNPJ (numérico ou alfanumérico).
      Pode ser enviado com ou sem máscara.
    - `data_nascimento`, `sexo` e `estado_civil` só se aplicam a PF e são
      ignorados quando `tipo_pessoa` é PJ.
    """

    # Identificação
    tipo_pessoa: TipoPessoa
    nome: Annotated[str, StringConstraints(strip_whitespace=True, min_length=2, max_length=200)] = Field(
        description="Nome completo (PF) ou razão social (PJ)", examples=["João da Silva"]
    )
    documento: str = Field(description="CPF ou CNPJ, com ou sem máscara", examples=["529.982.247-25"])
    rg_ou_inscricao_estadual: Annotated[
        Annotated[str, StringConstraints(strip_whitespace=True, max_length=30)] | None, Opcional
    ] = Field(default=None, examples=["1234567 SSP/MA"])
    data_nascimento: Annotated[date | None, Opcional] = Field(default=None, examples=["1990-05-20"])
    sexo: Annotated[Sexo | None, Opcional] = None
    estado_civil: Annotated[EstadoCivil | None, Opcional] = None

    # Contato
    email: Annotated[EmailNormalizado | None, Opcional] = Field(default=None, examples=["joao@exemplo.com"])
    telefone: Annotated[str | None, Opcional] = Field(
        default=None, description="Celular com DDD, com ou sem máscara", examples=["(98) 98765-4321"]
    )

    # Locação
    imovel_id: Annotated[int | None, Opcional] = Field(
        default=None, description="Id do imóvel destinado (opcional)"
    )
    tipo_locacao: TipoLocacao = TipoLocacao.COMERCIAL
    garantia: Annotated[GarantiaLocaticia | None, Opcional] = None

    @field_validator("telefone")
    @classmethod
    def validar_telefone(cls, telefone: str | None) -> str | None:
        """Mantém só os números e exige DDD + 8 ou 9 dígitos."""
        if telefone is None:
            return None
        numeros = re.sub(r"\D", "", telefone)
        if len(numeros) not in (10, 11):
            raise ValueError("Telefone deve ter DDD + número (10 ou 11 dígitos).")
        return numeros

    @field_validator("data_nascimento")
    @classmethod
    def validar_data_nascimento(cls, data: date | None) -> date | None:
        """Não permite data de nascimento no futuro."""
        if data is not None and data > date.today():
            raise ValueError("A data de nascimento não pode estar no futuro.")
        return data

    @model_validator(mode="after")
    def validar_documento_e_campos_pf(self) -> "InquilinoEntrada":
        """Valida o CPF/CNPJ de acordo com o tipo de pessoa e limpa os campos exclusivos de PF."""
        self.documento = somente_caracteres_documento(self.documento)

        if self.tipo_pessoa == TipoPessoa.PF:
            if not validar_cpf(self.documento):
                raise ValueError("CPF inválido.")
        else:
            if not validar_cnpj(self.documento):
                raise ValueError("CNPJ inválido.")
            # Campos que não existem para pessoa jurídica
            self.data_nascimento = None
            self.sexo = None
            self.estado_civil = None

        return self


class InquilinoSaida(BaseModel):
    """Inquilino devolvido pela API."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    tipo_pessoa: TipoPessoa
    nome: str
    documento: str = Field(description="CPF ou CNPJ sem máscara")
    rg_ou_inscricao_estadual: str | None
    data_nascimento: date | None
    sexo: Sexo | None
    estado_civil: EstadoCivil | None
    email: str | None
    telefone: str | None
    imovel_id: int | None
    tipo_locacao: TipoLocacao
    garantia: GarantiaLocaticia | None
    criado_em: datetime
    atualizado_em: datetime
