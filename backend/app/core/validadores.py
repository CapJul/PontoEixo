"""
Validação de documentos brasileiros (CPF e CNPJ).

As funções recebem o documento com ou sem máscara e retornam True se os
dígitos verificadores estiverem corretos.

O CNPJ segue a regra da Receita Federal que, desde julho de 2026, aceita
também CNPJs alfanuméricos (12 primeiros caracteres com letras e números e
2 dígitos verificadores numéricos). Os CNPJs só com números continuam válidos.
"""

import re


def somente_caracteres_documento(documento: str) -> str:
    """Remove pontos, barras, traços e espaços e converte letras para maiúsculas."""
    return re.sub(r"[.\-/\s]", "", documento).upper()


def validar_cpf(cpf: str) -> bool:
    """Valida um CPF (ex.: '529.982.247-25' ou '52998224725')."""
    numeros = somente_caracteres_documento(cpf)

    if not re.fullmatch(r"\d{11}", numeros):
        return False
    # Sequências repetidas (000.000.000-00, 111...) passam no cálculo mas são inválidas
    if numeros == numeros[0] * 11:
        return False

    for posicao in (9, 10):
        soma = sum(int(numeros[i]) * (posicao + 1 - i) for i in range(posicao))
        digito = (soma * 10) % 11 % 10
        if digito != int(numeros[posicao]):
            return False
    return True


def validar_cnpj(cnpj: str) -> bool:
    """Valida um CNPJ numérico ou alfanumérico (ex.: '11.222.333/0001-81')."""
    caracteres = somente_caracteres_documento(cnpj)

    if not re.fullmatch(r"[A-Z0-9]{12}\d{2}", caracteres):
        return False
    if caracteres == caracteres[0] * 14:
        return False

    # Regra da Receita: o valor de cada caractere é o seu código ASCII menos 48
    # ('0'..'9' valem 0..9 e 'A'..'Z' valem 17..42).
    valores = [ord(caractere) - 48 for caractere in caracteres]

    pesos_primeiro = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    pesos_segundo = [6] + pesos_primeiro

    for pesos, posicao in ((pesos_primeiro, 12), (pesos_segundo, 13)):
        soma = sum(valor * peso for valor, peso in zip(valores[:posicao], pesos))
        resto = soma % 11
        digito = 0 if resto < 2 else 11 - resto
        if digito != valores[posicao]:
            return False
    return True
