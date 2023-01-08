from chatgpt_wrapper import ChatGPT
import chatgpt_wrapper
import os
import jsonlines
import json
import subprocess
import sqlite3
import numpy as np
import time
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def asking(conversation_id, parent_message_id, user_prompt):
    #asking for response:
    print('~~~porside shod~~~')
    bot = ChatGPT()
    bot.conversation_id = conversation_id
    bot.parent_message_id = parent_message_id
    response = bot.ask(user_prompt)

    #closing browser tasks:
    for page in bot.browser.pages:
        print('~~~dar hale bastan~~~')
        page.close()
        
    #returning data back
    return response,bot.parent_message_id


@app.route('/chat', methods=['POST'])
def handle_request():
    # Get the conversation_id, parent_message_id, and user_prompt from the request body
    data = request.get_json()
    print('~~~data oomad~~~',data)
    conversation_id = data['conversation_id']
    parent_message_id = data['parent_message_id']
    user_prompt = data['user_prompt']
    response, parent_message_id = asking(conversation_id, parent_message_id, user_prompt)
    resp =  make_response(jsonify({'response': response, 'parent_message_id': parent_message_id}))
    resp.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'

    # Open a connection to the database
    db = sqlite3.connect('database.db')
    # Set up a cursor to iterate over the database
    cursor = db.cursor()
    # Insert the new chat message into the database
    insert_sql = 'INSERT INTO chat_messages (conversation_id, parent_message_id, user_prompt, response) VALUES (?, ?, ?, ?)'
    cursor.execute(insert_sql, (conversation_id, parent_message_id, user_prompt, response))
    db.commit()
    # Close the connection to the database
    db.close()
    
    # Return the response to the client
    return resp

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3002)

