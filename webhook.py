import requests
from rich import print
import sys
import argparse
import os
from dotenv import load_dotenv

load_dotenv()

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
OWNER_ID = os.getenv("OWNER_ID")
WEBHOOK_SECRET_TOKEN = os.getenv("WEBHOOK_SECRET_TOKEN")


def send_message(text):
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    data = {"chat_id": OWNER_ID, "text": text}
    response = requests.post(url, data=data)
    print(response.json())
    return response.json()


def set_webhook(webhookurl):

    # 参数	类型	是否必需	描述
    # url	String	是	HTTPS URL，用于接收来自 Telegram 的更新。设置为空字符串 "" 以移除当前的 webhook 配置。
    # certificate	InputFile	否	上传你的公钥证书，以验证根证书的合法性。必须作为文件上传，不支持以字符串形式传递。
    # ip_address	String	否	指定发送 webhook 请求的固定 IP 地址，而不是通过 DNS 解析的地址。
    # max_connections	Integer	否	最大允许的并发 HTTPS 连接数（1-100）。默认值为 40。可以根据负载需求进行调整。
    # allowed_updates	Array of String	否	JSON-序列化的字符串数组，指定要接收的更新类型。例如，["message", "callback_query"]。默认接收所有类型更新。
    # drop_pending_updates	Boolean	否	设置为 true 以丢弃所有待处理的更新。通常用于更改 webhook 设置时。
    # secret_token	String	否	密钥令牌，将在每个 webhook 请求的头部中作为 X-Telegram-Bot-Api-Secret-Token 发送。用于请求验证。
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/setWebhook"
    data = {
        "url": webhookurl,
        "max_connections": 100,
        # "allowed_updates": '["message","callback_query"]',
        "secret_token": WEBHOOK_SECRET_TOKEN,
        "drop_pending_updates": True,
    }
    print(data)
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
