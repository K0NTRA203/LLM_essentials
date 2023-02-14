from lib.chatgpt_wrapper import ChatGPT
import sqlite3
from flask import Flask, request, jsonify, make_response
from playwright.sync_api import sync_playwright
import json
from flask_socketio import SocketIO, emit
import subprocess
from flask_cors import CORS
from flask_socketio import ConnectionRefusedError
import socketio
import eventlet



sio = socketio.Server(cors_allowed_origins="http://localhost:3000")
app = socketio.WSGIApp(sio)

@sio.event  
def connect(sid, environ):
    print('[INFO] Connect to client', sid)

@sio.event
def disconnect(sid):
    print('disconnect ', sid)

if __name__ == '__main__':
    eventlet.wsgi.server(eventlet.listen(('0.0.0.0', 5100)), app)