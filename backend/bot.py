import os
import asyncio
import logging
from dotenv import load_dotenv
from typing import Set, List, Dict

import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from aiogram import Bot, Dispatcher, types
from aiogram.filters import CommandStart, Command
from aiogram.enums import ParseMode
from aiogram.client.default import DefaultBotProperties

# --- Конфигурация Логирования ---
logging.basicConfig(level=logging.INFO, format='[%(levelname)s]  %(message)s')

# --- Загрузка переменных окружения ---
print("[INFO]  Loading environment variables...")
load_dotenv()
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
ADMIN_CHAT_ID_STR = os.getenv("ADMIN_CHAT_ID")

if not TELEGRAM_BOT_TOKEN or not ADMIN_CHAT_ID_STR:
    print("[ERROR] Bot Token or Admin ID is not configured in .env file!")
    exit()

try:
    ADMIN_CHAT_ID = int(ADMIN_CHAT_ID_STR)
    print("[SUCCESS] Bot Token and Admin ID are configured.")
except ValueError:
    print(f"[ERROR] Invalid ADMIN_CHAT_ID: '{ADMIN_CHAT_ID_STR}'. It must be a number.")
    exit()


# --- Хранилище в памяти ---
keywords: Set[str] = {"freelance", "job", "проект"}
monitored_chats: Set[int] = set()
active_connections: List[WebSocket] = []


# --- Настройка Aiogram (Telegram Bot) ---
bot = Bot(token=TELEGRAM_BOT_TOKEN, default=DefaultBotProperties(parse_mode=ParseMode.HTML))
dp = Dispatcher()

# --- Настройка FastAPI (Web Server & API) ---
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- WebSocket Уведомления ---
async def broadcast(message: str):
    disconnected_connections = []
    for connection in active_connections:
        try:
            await connection.send_text(message)
        except WebSocketDisconnect:
            disconnected_connections.append(connection)
        except Exception as e:
            logging.error(f"Error sending to websocket: {e}")
            disconnected_connections.append(connection)

    for connection in disconnected_connections:
         if connection in active_connections:
            active_connections.remove(connection)

async def notify_clients_of_update(update_type: str, data: any):
    import json
    await broadcast(json.dumps({"type": update_type, "data": list(data)}))

# --- Обработчики команд Telegram ---
@dp.message(CommandStart())
async def send_welcome(message: types.Message):
    await message.answer(
        "<b>Привет! Я ваш AI-ассистент для мониторинга чатов.</b>\n\n"
        "Вот доступные команды:\n"
        "/add_keyword <code>слово</code> - добавить ключевое слово\n"
        "/del_keyword <code>слово</code> - удалить ключевое слово\n"
        "/keywords - показать все ключевые слова\n"
        "/add_chat <code>ID</code> - добавить чат для мониторинга\n"
        "/del_chat <code>ID</code> - удалить чат для мониторинга\n"
        "/chats - показать все отслеживаемые чаты"
    )

@dp.message(Command('add_keyword'))
async def add_keyword(message: types.Message):
    try:
        keyword = message.text.split(maxsplit=1)[1].strip().lower()
        if keyword:
            keywords.add(keyword)
            await message.answer(f"Ключевое слово '<code>{keyword}</code>' добавлено.")
            await notify_clients_of_update("keywords", keywords)
    except IndexError:
        await message.answer("Пожалуйста, укажите ключевое слово после команды.")


@dp.message(Command('del_keyword'))
async def del_keyword(message: types.Message):
    try:
        keyword = message.text.split(maxsplit=1)[1].strip().lower()
        if keyword in keywords:
            keywords.remove(keyword)
            await message.answer(f"Ключевое слово '<code>{keyword}</code>' удалено.")
            await notify_clients_of_update("keywords", keywords)
        else:
            await message.answer("Такого ключевого слова нет в списке.")
    except IndexError:
        await message.answer("Пожалуйста, укажите ключевое слово после команды.")


@dp.message(Command('keywords'))
async def list_keywords(message: types.Message):
    if keywords:
        await message.answer("Отслеживаемые слова:\n- <code>" + "</code>\n- <code>".join(keywords) + "</code>")
    else:
        await message.answer("Список ключевых слов пуст.")

@dp.message(Command('add_chat'))
async def add_chat(message: types.Message):
    try:
        chat_id_str = message.text.split(maxsplit=1)[1].strip()
        chat_id = int(chat_id_str)
        monitored_chats.add(chat_id)
        await message.answer(f"Чат с ID <code>{chat_id}</code> добавлен для мониторинга.")
        await notify_clients_of_update("chats", monitored_chats)
    except (IndexError, ValueError):
        await message.answer("Пожалуйста, укажите корректный числовой ID чата после команды.")

@dp.message(Command('del_chat'))
async def del_chat(message: types.Message):
    try:
        chat_id_str = message.text.split(maxsplit=1)[1].strip()
        chat_id = int(chat_id_str)
        if chat_id in monitored_chats:
            monitored_chats.remove(chat_id)
            await message.answer(f"Чат с ID <code>{chat_id}</code> удален из мониторинга.")
            await notify_clients_of_update("chats", monitored_chats)
        else:
            await message.answer("Этот чат не отслеживается.")
    except (IndexError, ValueError):
        await message.answer("Пожалуйста, укажите корректный числовой ID чата после команды.")

@dp.message(Command('chats'))
async def list_chats(message: types.Message):
    if monitored_chats:
        await message.answer("Отслеживаемые чаты:\n- <code>" + "</code>\n- <code>".join(map(str, monitored_chats)) + "</code>")
    else:
        await message.answer("Список отслеживаемых чатов пуст.")

# --- Сканер сообщений ---
@dp.message()
async def scan_message(message: types.Message):
    if message.chat.id not in monitored_chats:
        return

    text = message.text or message.caption
    if not text:
        return

    text_lower = text.lower()
    for keyword in keywords:
        if keyword in text_lower:
            import json
            import uuid
            from datetime import datetime

            logging.info(f"Найдено совпадение по слову '{keyword}' в чате '{message.chat.title}'")

            chat_link = ""
            if message.chat.username:
                chat_link = f"https://t.me/{message.chat.username}/{message.message_id}"
            elif message.chat.type != 'private':
                chat_link = f"https://t.me/c/{abs(message.chat.id)}/{message.message_id}"

            match_data = {
                "id": str(uuid.uuid4()),
                "author": message.from_user.full_name or "Unknown",
                "chatName": message.chat.title or "Unknown Chat",
                "chatLink": chat_link,
                "message": text,
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "keyword": keyword
            }

            notification_text = (
                f"🔥 <b>Найдено совпадение!</b>\n\n"
                f"<b>Ключевое слово:</b> <code>{keyword}</code>\n"
                f"<b>Чат:</b> {message.chat.title}\n"
                f"<b>Автор:</b> {message.from_user.full_name}\n\n"
                f"<b>Сообщение:</b>\n<i>{text[:1000]}</i>"
            )
            if chat_link:
                notification_text += f'\n\n<a href="{chat_link}"><b>Перейти к сообщению</b></a>'

            try:
                await bot.send_message(ADMIN_CHAT_ID, notification_text)
            except Exception as e:
                logging.error(f"Failed to send notification to admin: {e}")

            await broadcast(json.dumps({"type": "new_match", "data": match_data}))
            break

# --- API Endpoints ---
class KeywordItem(BaseModel):
    keyword: str

class ChatItem(BaseModel):
    chat_id: str | int

@app.get("/api/keywords")
async def get_keywords():
    return list(keywords)

@app.post("/api/keywords")
async def api_add_keyword(item: KeywordItem):
    keyword = item.keyword.strip().lower()
    if keyword:
        keywords.add(keyword)
        await notify_clients_of_update("keywords", keywords)
        return {"status": "success", "keyword": keyword}
    raise HTTPException(status_code=400, detail="Keyword cannot be empty")

@app.delete("/api/keywords")
async def api_delete_keyword(item: KeywordItem):
    keyword = item.keyword.strip().lower()
    if keyword in keywords:
        keywords.remove(keyword)
        await notify_clients_of_update("keywords", keywords)
        return {"status": "success", "keyword": keyword}
    raise HTTPException(status_code=404, detail="Keyword not found")

@app.get("/api/chats")
async def get_chats():
    return list(monitored_chats)

@app.post("/api/chats")
async def api_add_chat(item: ChatItem):
    try:
        chat_id = int(item.chat_id)
        monitored_chats.add(chat_id)
        await notify_clients_of_update("chats", monitored_chats)
        return {"status": "success", "chat_id": chat_id}
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid Chat ID format")

@app.delete("/api/chats")
async def api_delete_chat(item: ChatItem):
    try:
        chat_id = int(item.chat_id)
        if chat_id in monitored_chats:
            monitored_chats.remove(chat_id)
            await notify_clients_of_update("chats", monitored_chats)
            return {"status": "success", "chat_id": chat_id}
        raise HTTPException(status_code=404, detail="Chat not found")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid Chat ID format")


# --- WebSocket Endpoint ---
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    logging.info("New client connected via WebSocket.")
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        active_connections.remove(websocket)
        logging.info("Client disconnected from WebSocket.")

# --- Функция запуска ---
async def main():
    logging.info("Starting bot polling...")
    asyncio.create_task(dp.start_polling(bot, allowed_updates=dp.resolve_used_update_types()))

    # --- ИСПРАВЛЕНА СЛЕДУЮЩАЯ СТРОКА ---
    # Мы возвращаем прямой запуск 'app', это надежнее при запуске файла напрямую
    config = uvicorn.Config(app, host="0.0.0.0", port=8000, log_level="info")
    server = uvicorn.Server(config)
    
    logging.info(f"Starting FastAPI server at http://0.0.0.0:8000")
    await server.serve()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n[INFO]  Shutting down...")