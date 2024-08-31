# https://api.telegram.org/bot<your-bot-token>/setWebhook?url=https://<your-username>.pythonanywhere.com/webhook/
# https://api.telegram.org/bot123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11/getMe
# 6668050853:AAHEn9duU63AKfcsnskroQR6esxAmKMeCys


# https://api.telegram.org/bot6668050853:AAHEn9duU63AKfcsnskroQR6esxAmKMeCys/setWebhook


# setWebhook
# curl -X POST https://api.telegram.org/bot<YOUR-BOT-TOKEN>/setWebhook \
#     -d url="https://yourdomain.com/webhook" \
#     -d max_connections=10 \
#     -d allowed_updates='["message"]' \
#     -d secret_token="your-secret-token"


# deleteWebhook
# curl -X POST https://api.telegram.org/bot<YOUR-BOT-TOKEN>/deleteWebhook \
#     -d drop_pending_updates=true


# curl -X GET https://api.telegram.org/bot<YOUR-BOT-TOKEN>/getWebhookInfo


import requests
from rich import print
import sys
import argparse
import os
from dotenv import load_dotenv

load_dotenv()

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
OWNER_ID = os.getenv("OWNER_ID")


def send_message(text):
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    data = {"chat_id": OWNER_ID, "text": text}
    response = requests.post(url, data=data)
    print(response.json())
    return response.json()


def set_webhook(webhookurl):
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/setWebhook"
    data = {"url": webhookurl, "max_connections": 100, "allowed_updates": '["message"]'}
    response = requests.post(url, data=data)
    print(response.json())
    return response.json()


def webhook_info():
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getWebhookInfo"

    response = requests.post(url)
    print(response.json())
    return response.json()


def delete_webhook():
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/deleteWebhook"
    data = {"drop_pending_updates": True}
    response = requests.post(url, data=data)
    print(response.json())
    return response.json()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Set or delete a webhook for your Telegram bot."
    )
    parser.add_argument("url", help="The webhook URL to set.", nargs="?", default=None)
    parser.add_argument(
        "--delete", action="store_true", help="Delete the current webhook."
    )

    args = parser.parse_args()

    if args.delete:
        delete_webhook()
    if args.url:
        set_webhook(args.url)
    webhook_info()

# set_webhook("https://tgbot.whysiki.fun")

# Examples:
# Set a Webhook:
# bash

# python script.py https://tgbot-whysiki.oooplhhhg.workers.dev
# Delete the Webhook:
# bash

# python script.py --delete
# Set a Webhook and then Show Info:
# bash

# python script.py https://tgbot-whysiki.oooplhhhg.workers.dev
# Just Show Webhook Info:
# bash

# python script.py
# This allows you to manage the webhook setup more flexibly via command line arguments.
