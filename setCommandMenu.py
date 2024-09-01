import asyncio
import logging
import sys
import os
from PIL import Image, ImageChops
from typing import BinaryIO
import io
import cv2  # opencv-python-headless / opencv-contrib-python
import tempfile
import imageio
import urllib.request
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv
import requests
from rich import print


load_dotenv()
TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
API_TOKEN = TOKEN
OWNER_ID = os.getenv("OWNER_ID")
ACCOUNT_ID = os.getenv("ACCOUNT_ID")
proxy = os.getenv("PROXY")
API_BASE_URL = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/ai/run/"
headers = {"Authorization": f"Bearer {API_TOKEN}"}


def set_command_menu():

    commands = [
        {
            "command": "showUpdatedMessagesOn".lower(),
            "description": "Show updated messages on",
        },
        {
            "command": "showUpdatedMessagesOff".lower(),
            "description": "Show updated messages off",
        },
        {
            "command": "stickerEchoOn".lower(),  # stickerechoon
            "description": "Sticker echo on",
        },
        {
            "command": "stickerEchoOff".lower(),  # stickerechooff
            "description": "Sticker echo off",
        },
        {
            "command": "stickerSetEchoOn".lower(),  #
            "description": "Echo All Stickers on",
        },
        {
            "command": "stickerSetEchoOff".lower(),  #
            "description": "Echo All Stickers off",
        },
        {
            "command": "greet".lower(),
            "description": "Greet user",
        },
        {
            "command": "texttoimage".lower(),
            "description": "Convert text to image",
        },
        # //imagetotext
        {
            "command": "imagetotext".lower(),
            "description": "Convert image to text",
        },
        # //image2image
        {
            "command": "image2image".lower(),
            "description": "Convert image to image",
        },
    ]

    input = {"commands": commands}
    response = requests.post(
        f"https://api.telegram.org/bot{TOKEN}/setMyCommands",
        json=input,
        # stream=True,
        proxies={"https": proxy, "http": proxy},
    )

    print(response.json())
    return response.json()


def delete_command_menu():
    response = requests.post(
        f"https://api.telegram.org/bot{TOKEN}/deleteMyCommands",
        json={},
        # stream=True,
        proxies={"https": proxy, "http": proxy},
    )

    print(response.json())
    return response.json()


def get_command_menu():

    response = requests.post(
        f"https://api.telegram.org/bot{TOKEN}/getMyCommands",
        json={},
        # stream=True,
        proxies={"https": proxy, "http": proxy},
    )

    print(response.json())
    return response.json()


delete_command_menu()
set_command_menu()
get_command_menu()
