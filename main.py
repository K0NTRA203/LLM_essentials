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

def asking(conversation_id, parent_message_id, user_prompt, token=''):
    #asking for response:
    print('~~~porside shod~~~')
    bot = ChatGPT()
    if conversation_id != '':
        bot.conversation_id = conversation_id
        bot.parent_message_id = parent_message_id
    
    if token =='':
        response = bot.ask(user_prompt)
    else: 
        response = bot.ask(user_prompt,token)
    conversation_id = bot.conversation_id

    #closing browser tasks:
    for page in bot.browser.pages:
        print('~~~dar hale bastan~~~')
        page.close()
       
        
    #returning data back
    return response,bot.conversation_id, bot.parent_message_id


@app.route('/chat', methods=['POST'])
def handle_request():
    # Get the conversation_id, parent_message_id, and user_prompt from the request body
    data = request.get_json()
    print('~~~data oomad~~~',data)
    conversation_id = data['conversation_id']
    parent_message_id = data['parent_message_id']
    user_prompt = data['user_prompt']
    conversation_name = data['conversation_name']
    # print('convName',conversation_name)
    # Open a connection to the database
    db = sqlite3.connect('database.db')
    
    # Set up a cursor to iterate over the database
    cursor = db.cursor()
    cursor.execute("SELECT conversation_id, parent_message_id FROM chat_messages WHERE conversation_name=? ORDER BY conversation_id DESC LIMIT 1", (conversation_name,))
    res = cursor.fetchone()
    if res != None:
        print('CONVERSATION EXISTS')
        # If conversation_name exists, set conversation_id and parent_message_id
        conversation_id = res[0]
        parent_message_id = res[1]
        print('AZTOO DB DAROOMAND BEBIN CHIE', conversation_id,parent_message_id)


    # Adding new cols to db:
    
    # cursor.executescript("""
    # ALTER TABLE chat_messages ADD COLUMN tok TEXT;
    # ALTER TABLE chat_messages ADD COLUMN conversation_name TEXT;
    # """)

    # Checking if parent_message_id is empty
    # if parent_message_id == "" and conversation_id != '':
    #     # Retrieve last parent_message_id with the same conversation_id
    #     cursor.execute("SELECT parent_message_id FROM chat_messages WHERE conversation_id=? ORDER BY parent_message_id DESC LIMIT 1", (conversation_id,))
    #     parent_message_id = cursor.fetchone()[0]
    #     print('hichi---->>>',parent_message_id)

    # tok = ''
    tok = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik1UaEVOVUpHTkVNMVFURTRNMEZCTWpkQ05UZzVNRFUxUlRVd1FVSkRNRU13UmtGRVFrRXpSZyJ9.eyJodHRwczovL2FwaS5vcGVuYWkuY29tL3Byb2ZpbGUiOnsiZW1haWwiOiJrMG50cmEua2Fta2FtQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJnZW9pcF9jb3VudHJ5IjoiTkwifSwiaHR0cHM6Ly9hcGkub3BlbmFpLmNvbS9hdXRoIjp7InVzZXJfaWQiOiJ1c2VyLU9aZGlxendLSVRuTHRpc1lmdnozTWo2YSJ9LCJpc3MiOiJodHRwczovL2F1dGgwLm9wZW5haS5jb20vIiwic3ViIjoiZ29vZ2xlLW9hdXRoMnwxMDgwMjMxNjU1ODU2NTI2MDY5ODgiLCJhdWQiOlsiaHR0cHM6Ly9hcGkub3BlbmFpLmNvbS92MSIsImh0dHBzOi8vb3BlbmFpLmF1dGgwLmNvbS91c2VyaW5mbyJdLCJpYXQiOjE2NzMzNDU0ODcsImV4cCI6MTY3Mzk1MDI4NywiYXpwIjoiVGRKSWNiZTE2V29USHROOTVueXl3aDVFNHlPbzZJdEciLCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIG1vZGVsLnJlYWQgbW9kZWwucmVxdWVzdCBvcmdhbml6YXRpb24ucmVhZCBvZmZsaW5lX2FjY2VzcyJ9.r8N402-719CfYEIsLaFU6186Akcfh9d0VgH6TuYgQQHH0q_0bpEdC4zUT0PwHSAVTHnOFLgQnmUmARLQfMoCaX8wKS3V2Cw8dmm7s8KC4Rc-2kSjS16jEl3a39wyXAGT-yguip8moK_sbbL56uUihyRdqA4Cww12vXIJedLHRWd0xudRJOuDG-UKG2vL36hfnVTRRaxz-salAFUdhPzugANlNT2mIa0pT-aalFFDCIabfpMkCo-MV4kZPLs0_D3NQQ-bmFoKDxp3H_N7GnBqTQVldsnuvmHjItk8IVFZQk4jWo8gxn9q14BysFXWsb7_tvnOULGuAmxXQH_J5dDMSw'
    response, conversation_id, parent_message_id = asking(conversation_id, parent_message_id, user_prompt,tok)
    resp =  make_response(jsonify({'response': response, 'conversation_id': conversation_id, 'parent_message_id': parent_message_id}))
    resp.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'

    print(resp)
    # Insert the new chat message into the database
    
    insert_sql = 'INSERT INTO chat_messages (tok, conversation_name, conversation_id, parent_message_id, user_prompt, response) VALUES (?, ?, ?, ?, ?, ?)'
    cursor.execute(insert_sql, (tok,conversation_name, conversation_id, parent_message_id, user_prompt, response))
    db.commit()
    # Close the connection to the database
    db.close()
    
    # Return the response to the client
    return resp

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3002)

