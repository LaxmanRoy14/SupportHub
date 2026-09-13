import os

import resend

from dotenv import load_dotenv


load_dotenv()


def get_required_env(name: str) -> str:
    value = os.getenv(name)

    if value is None:
        raise ValueError(
            f"{name} is not set in the environment"
        )

    return value


RESEND_API_KEY = get_required_env("RESEND_API_KEY")
EMAIL_FROM = get_required_env("EMAIL_FROM")

resend.api_key = RESEND_API_KEY

def send_otp_email(
    recipient_email: str,
    otp: str
) -> None:

    resend.Emails.send(
        {
            "from": EMAIL_FROM,
            "to": [recipient_email],
            "subject": "SupportHub Email Verification",
            "text": f"""
Hello,

Your SupportHub verification OTP is:

{otp}

This OTP will expire in 10 minutes.

If you did not create a SupportHub account, you can ignore this email.

Regards,
SupportHub Team
""",
        }
    )
