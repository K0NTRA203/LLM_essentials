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
import openai_api
import json

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

@app.route('/playground' , methods=['POST'])
def playground_route():
    data = request.get_json()
    name = data["name"]
    engine = data["engine"]
    prompt = data["prompt"]
    max_tokens = data["maxTokens"]
    n = data["n"]
    stop = data["stop"]
    temperature = data["temp"]
    response = openai_api.playground(name,engine,prompt,max_tokens,n,stop,temperature)

    resp =  make_response(jsonify({"result": response}))
    resp.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
    return resp

@app.route('/playground/names' , methods=['GET'])
def playground_names():
    #open connection to database
    db = sqlite3.connect('database.db')
    #set up a cursor to iterate over the database
    cursor = db.cursor()
    #CREATE TABLE IF DOES NOT EXIST
    cursor.execute('''CREATE TABLE IF NOT EXISTS playground_messages
            (id TEXT, name TEXT, model TEXT, prompt TEXT, choices BLOB, best_choice_text TEXT, timing INTEGER, warnings TEXT)''')
    cursor.execute("PRAGMA table_info(playground_messages)")
    columns = cursor.fetchall()
    column_names = [col[1] for col in columns]
    if set(column_names) != set(["id", "name", "model", "prompt", "choices", "best_choice_text", "timing", "warnings"]):
        for col in ["id", "name", "model", "prompt", "choices", "best_choice_text", "timing", "warnings"]:
            if col not in column_names:
                cursor.execute(f"ALTER TABLE playground_messages ADD COLUMN {col}")
        db.commit()
    #get conversation_names from database
    cursor.execute("SELECT DISTINCT name FROM playground_messages GROUP BY name")
    res = cursor.fetchall()
    conversation_names = []
    for row in res:
        conversation_names.append(row[0])
    #close connection to database
    db.close()
    #return conversation_names to client
    resp =  make_response(jsonify({"name": conversation_names}))
    print('resp',resp)
    resp.headers['Access-Control-Allow-Origin'] = '*'
    resp.headers['Access-Control-Allow-Methods'] = 'GET'
    return resp
    
@app.route('/names', methods=['GET'])
def get_conversation_names():

    #open connection to database
    db = sqlite3.connect('database.db')
    #set up a cursor to iterate over the database
    cursor = db.cursor()
    #get conversation_names from database
    cursor.execute("SELECT DISTINCT conversation_name FROM chat_messages GROUP BY conversation_name")
    res = cursor.fetchall()
    conversation_names = []
    for row in res:
        conversation_names.append(row[0])
    #close connection to database
    db.close()
    #return conversation_names to client
    resp =  make_response(jsonify({'conversation_names': conversation_names}))
    resp.headers['Access-Control-Allow-Origin'] = '*'
    resp.headers['Access-Control-Allow-Methods'] = 'GET'
    return resp

@app.route('/chat', methods=['DELETE'])
def delete_conversation():
    data = request.get_json()
    conversation_name = data['conversation_name']
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute("DELETE FROM chat_messages WHERE conversation_name=?", (conversation_name,))
    conn.commit()
    c.execute("SELECT DISTINCT conversation_name FROM chat_messages GROUP BY conversation_name")
    conversation_names = c.fetchall()
    conn.close()
    return jsonify({'conversation_names': conversation_names})
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
        print('EXISTING CONVERSATION:', conversation_id,parent_message_id)
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

