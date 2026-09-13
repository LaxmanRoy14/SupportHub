import os
import smtplib
from email.message import EmailMessage

from dotenv import load_dotenv


load_dotenv()


def get_required_env(name: str) -> str:
    value = os.getenv(name)

    if value is None:
        raise ValueError(
            f"{name} is not set in the environment"
        )

    return value


EMAIL_HOST = get_required_env("EMAIL_HOST")
EMAIL_USERNAME = get_required_env("EMAIL_USERNAME")
EMAIL_PASSWORD = get_required_env("EMAIL_PASSWORD")
EMAIL_FROM = get_required_env("EMAIL_FROM")

EMAIL_PORT = int(
    os.getenv("EMAIL_PORT", "587")
)

def send_otp_email(
    recipient_email: str,
    otp: str
) -> None:

    message = EmailMessage()

    message["Subject"] = "SupportHub Email Verification"
    message["From"] = EMAIL_FROM
    message["To"] = recipient_email

    message.set_content(
        f"""
Hello,

Your SupportHub verification OTP is:

{otp}

This OTP will expire in 10 minutes.

If you did not create a SupportHub account, you can ignore this email.

Regards,
SupportHub Team
"""
    )

    with smtplib.SMTP(
        EMAIL_HOST,
        EMAIL_PORT
    ) as server:

        server.starttls()

        server.login(
            EMAIL_USERNAME,
            EMAIL_PASSWORD
        )

        server.send_message(message)