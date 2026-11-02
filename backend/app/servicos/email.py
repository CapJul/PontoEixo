"""
Serviço de envio de e-mails via SMTP.

As credenciais vêm do .env (variáveis Smtp*). Se `SmtpServidor` estiver vazio,
o e-mail não é enviado: o conteúdo é apenas registrado no log/console. Isso
permite testar o fluxo de recuperação de senha em desenvolvimento sem
configurar um servidor de e-mail.
"""

import logging
import smtplib
import ssl
from email.message import EmailMessage

from app.core.config import settings

logger = logging.getLogger("pontoeixo.email")


def enviar_email(destinatario: str, assunto: str, texto: str, html: str | None = None) -> None:
    """
    Envia um e-mail.

    Args:
        destinatario: endereço de quem vai receber.
        assunto: assunto da mensagem.
        texto: corpo em texto puro (usado por leitores sem suporte a HTML).
        html: corpo em HTML (opcional).

    Erros de envio são registrados no log e não interrompem a aplicação,
    pois esta função normalmente roda em segundo plano (BackgroundTasks).
    """
    if not settings.SmtpServidor:
        # Modo de desenvolvimento: mostra o e-mail no console em vez de enviar
        logger.warning(
            "SMTP não configurado. E-mail NÃO enviado.\nPara: %s\nAssunto: %s\n\n%s",
            destinatario, assunto, texto,
        )
        return

    mensagem = EmailMessage()
    mensagem["From"] = settings.SmtpRemetente
    mensagem["To"] = destinatario
    mensagem["Subject"] = assunto
    mensagem.set_content(texto)
    if html:
        mensagem.add_alternative(html, subtype="html")

    contexto_ssl = ssl.create_default_context()
    try:
        if settings.SmtpUsarStartTls:
            # Porta 587: conecta sem criptografia e depois ativa o TLS
            with smtplib.SMTP(settings.SmtpServidor, settings.SmtpPorta, timeout=15) as servidor:
                servidor.starttls(context=contexto_ssl)
                if settings.SmtpUsuario:
                    servidor.login(settings.SmtpUsuario, settings.SmtpSenha)
                servidor.send_message(mensagem)
        else:
            # Porta 465: conexão já criptografada desde o início
            with smtplib.SMTP_SSL(
                settings.SmtpServidor, settings.SmtpPorta, context=contexto_ssl, timeout=15
            ) as servidor:
                if settings.SmtpUsuario:
                    servidor.login(settings.SmtpUsuario, settings.SmtpSenha)
                servidor.send_message(mensagem)
    except (smtplib.SMTPException, OSError):
        logger.exception("Falha ao enviar e-mail para %s", destinatario)
