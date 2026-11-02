"""
Regras de negócio do envio do código de recuperação de senha.

Fluxo completo (telas do frontend em /recuperar-senha):
  1. Usuário informa o e-mail     -> `gerar_e_enviar_codigo` cria o código e envia por e-mail.
  2. Usuário digita o código      -> rota /validar-codigo confere e devolve um token de redefinição.
  3. Usuário define a nova senha  -> rota /redefinir usa o token para trocar a senha.
"""

from datetime import datetime, timedelta, timezone
from html import escape

from fastapi import BackgroundTasks
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.seguranca import gerar_codigo_numerico, gerar_hash_codigo
from app.modelos.codigo_recuperacao import CodigoRecuperacao
from app.modelos.usuario import Usuario
from app.servicos.email import enviar_email


def agora_utc() -> datetime:
    """Data e hora atual em UTC (padrão usado em todo o banco)."""
    return datetime.now(timezone.utc)


def _envio_recente(sessao: Session, usuario_id: int) -> bool:
    """Retorna True se já foi enviado um código há menos de `SegundosEntreEnviosCodigo`."""
    limite = agora_utc() - timedelta(seconds=settings.SegundosEntreEnviosCodigo)
    codigo_recente = sessao.scalar(
        select(CodigoRecuperacao.id).where(
            CodigoRecuperacao.usuario_id == usuario_id,
            CodigoRecuperacao.criado_em > limite,
        )
    )
    return codigo_recente is not None


def montar_email_codigo(nome: str, codigo: str) -> tuple[str, str]:
    """Monta o corpo do e-mail (texto e HTML) com o código de recuperação."""
    minutos = settings.MinutosExpiracaoCodigoRecuperacao
    texto = (
        f"Olá, {nome}!\n\n"
        f"Seu código para redefinir a senha do PontoEixo é: {codigo}\n\n"
        f"O código vale por {minutos} minutos. Se você não pediu a recuperação, "
        "ignore este e-mail: sua senha continua a mesma.\n"
    )
    nome_html = escape(nome)  # evita que o nome quebre/injete HTML no e-mail
    html = f"""
    <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 480px;">
      <p>Olá, {nome_html}!</p>
      <p>Seu código para redefinir a senha do <strong>PontoEixo</strong> é:</p>
      <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #2563eb;">{codigo}</p>
      <p>O código vale por {minutos} minutos.</p>
      <p style="color: #64748b; font-size: 13px;">
        Se você não pediu a recuperação, ignore este e-mail: sua senha continua a mesma.
      </p>
    </div>
    """
    return texto, html


def gerar_e_enviar_codigo(
    sessao: Session, usuario: Usuario, tarefas: BackgroundTasks
) -> bool:
    """
    Cria um novo código de recuperação para o usuário e agenda o envio por e-mail.

    - Invalida os códigos anteriores ainda não usados (só o último vale).
    - Não envia outro código se o último foi enviado há menos de
      `SegundosEntreEnviosCodigo` segundos (evita spam de e-mails).
    - O e-mail é enviado em segundo plano, depois que a resposta é devolvida.

    Returns:
        True se um novo código foi gerado; False se o envio foi barrado pelo intervalo mínimo.
    """
    if _envio_recente(sessao, usuario.id):
        return False

    # Invalida códigos antigos ainda pendentes
    sessao.execute(
        update(CodigoRecuperacao)
        .where(
            CodigoRecuperacao.usuario_id == usuario.id,
            CodigoRecuperacao.utilizado.is_(False),
        )
        .values(utilizado=True)
    )

    codigo = gerar_codigo_numerico()
    sessao.add(
        CodigoRecuperacao(
            usuario_id=usuario.id,
            codigo_hash=gerar_hash_codigo(codigo),
            expira_em=agora_utc() + timedelta(minutes=settings.MinutosExpiracaoCodigoRecuperacao),
            criado_em=agora_utc(),
        )
    )
    sessao.commit()

    texto, html = montar_email_codigo(usuario.nome, codigo)
    tarefas.add_task(
        enviar_email,
        destinatario=usuario.email,
        assunto="PontoEixo - Código de recuperação de senha",
        texto=texto,
        html=html,
    )
    return True


def buscar_codigo_valido(sessao: Session, usuario_id: int) -> CodigoRecuperacao | None:
    """Retorna o código pendente (não usado e não expirado) mais recente do usuário."""
    return sessao.scalar(
        select(CodigoRecuperacao)
        .where(
            CodigoRecuperacao.usuario_id == usuario_id,
            CodigoRecuperacao.utilizado.is_(False),
            CodigoRecuperacao.expira_em > agora_utc(),
        )
        .order_by(CodigoRecuperacao.id.desc())
    )
