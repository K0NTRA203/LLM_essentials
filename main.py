
import sqlite3
import time
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from flask import Response
from revChatGPT.V1 import Chatbot
from engines import query_engines, query_gpt, query_gpt_api_stream
from db_connection import make_chatbot
import os
from dotenv import load_dotenv
from openai_api import pg_history_from_db
import mysql.connector

# mydb = mysql.connector.connect(
#   host="localhost",
#   user="yourusername",
#   password="yourpassword"
# )

# print(mydb)

load_dotenv()
    
app = Flask(__name__)

# CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})
CORS(app, resources={r"/*": {"origins": "*"}})
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    return response


@app.route('/makechatbot', methods=['POST'])
def handle_make_chatbot():
    if request.method == 'OPTIONS':
        print('OPTIONSSSSSS')
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type',
        }
        return ('', 204, headers)
    else:
        print('POST METHOD')
        headers = {'Access-Control-Allow-Origin': '*'}
        data = request.get_json()
        response = make_chatbot(data)
        resp =  make_response(jsonify({"result": response}))
        resp.headers.add('Access-Control-Allow-Origin', '*')
        return resp



@app.route('/gptstream', methods=['GET'])
def handle_gpt_stream():
    user_prompt = request.args.get('prompt', default='default prompt')
    conversation_name = request.args.get('name', default='default name')
    included_hist = request.args.get('hist', default=0)
    system = request.args.get('system', default='you are a bot')


    result = Response(query_gpt_api_stream(conversation_name, user_prompt, included_hist, system), mimetype='text/event-stream')
    result.headers.add('Access-Control-Allow-Origin', '*')
    return result

@app.route('/playground' , methods=['POST', 'OPTIONS'])
def playground_route():
    if request.method == 'OPTIONS':
        print('OPTIONSSSSSS')
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST',
            'Access-Control-Allow-Headers': 'Content-Type',
        }
        return ('', 204, headers)
    else:
        print('POST METHOD')
        headers = {'Access-Control-Allow-Origin': '*'}
        data = request.get_json()
        response = query_engines(data)
        resp =  make_response(jsonify({"result": response}))
        resp.headers.add('Access-Control-Allow-Origin', '*')
        return resp

@app.route('/playground/messages' , methods=['GET'])
def playground_messages():
    name = request.args.get('name')
    x = request.args.get('x')
    print('NAME and X: ',name,x)
    conversation_messages = pg_history_from_db(name,x)
    resp =  make_response(jsonify({"messages": conversation_messages}))
    resp.headers['Access-Control-Allow-Origin'] = '*'
    resp.headers['Access-Control-Allow-Methods'] = 'GET'
    return resp

@app.route('/playground/names' , methods=['GET'])
def playground_names():
    #open connection to database
    db = sqlite3.connect('database.db')
    cursor = db.cursor()
    # get conversation_names from database
    cursor.execute("SELECT DISTINCT name FROM playground GROUP BY name")
    res = cursor.fetchall()
    conversation_names = []
    for row in res:
        conversation_names.append(row[0])
    # close connection to database
    db.close()
    #return conversation_names to client
    resp =  make_response(jsonify({"name": conversation_names}))
    print('resp',resp)
    resp.headers['Access-Control-Allow-Origin'] = '*'
    resp.headers['Access-Control-Allow-Methods'] = 'GET'
    return resp

@app.route('/playground/names/', methods=['DELETE','OPTIONS'])
def delete_names():   
    # if request.method == 'OPTIONS':
    #     print('****RECIEVED OPTIONS REQUEST FOR DELETE****')
    #     headers = {
    #         'Access-Control-Allow-Origin': '*',
    #         'Access-Control-Allow-Methods': 'DELETE',
    #         'Access-Control-Allow-Headers': '*',
    #     }
    #     return ('', 204, headers)
    # elif request.method == 'DELETE':
    data = request.get_json()
    name = data['name']
    print(f"TRYING TO DELETE {name}")
    db = sqlite3.connect('database.db')
    cursor = db.cursor()
    cursor.execute("DELETE FROM playground WHERE name=?", (name,))
    db.commit()
    db.close()
    return jsonify({"message": f"Successfully deleted all messages with name {name}"})

@app.route('/gpt/names/', methods=['GET'])
def get_conversation_names():

    #open connection to database
    db = sqlite3.connect('database.db')
    #set up a cursor to iterate over the database
    cursor = db.cursor()
    #get conversation_names from database
    cursor.execute("SELECT DISTINCT conversation_name FROM chat_messages ORDER BY ROWID DESC")
    res = cursor.fetchall()
    conversation_names = []
    for row in res:
        conversation_names.append(row[0])
    #close connection to database
    db.close()
    #return conversation_names to client
    resp =  make_response(jsonify({'name': conversation_names}))
    resp.headers['Access-Control-Allow-Origin'] = '*'
    resp.headers['Access-Control-Allow-Methods'] = 'GET'
    return resp

@app.route('/gpt/names', methods=['DELETE'])
def delete_conversation():
    data = request.get_json()
    conversation_name = data['name']
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute("DELETE FROM chat_messages WHERE conversation_name=?", (conversation_name,))
    conn.commit()
    # c.execute("SELECT DISTINCT conversation_name FROM chat_messages GROUP BY conversation_name")
    # conversation_names = c.fetchall()
    conn.close()
    resp = jsonify({"message": f"Successfully deleted all messages with name {conversation_name}"})

    resp.headers['Access-Control-Allow-Origin'] = '*'
    resp.headers['Access-Control-Allow-Methods'] = 'GET'

    return resp

@app.route('/gpt/messages', methods=['GET'])
def gpt_history():
    name = request.args.get('name')
    x = request.args.get('x')
    print('NAME and X: ',name,x)
    #open connection to database
    db = sqlite3.connect('database.db')
    cursor = db.cursor()
    # get conversation_messages from database
    if x != None:
        cursor.execute("SELECT user_prompt, response FROM chat_messages WHERE conversation_name = ? ORDER BY ROWID DESC LIMIT ?", (name, x))

    res = cursor.fetchall()
    conversation_messages = []
    for row in res:
        conversation_messages.insert(0, {"user_prompt": row[0], "response": row[1]})  
          # close connection to database
    db.close()
    #return conversation_messages to client
    print(conversation_messages)
    resp =  make_response(jsonify({"messages": conversation_messages}))
    resp.headers['Access-Control-Allow-Origin'] = '*'
    resp.headers['Access-Control-Allow-Methods'] = 'GET'
    return resp


@app.route('/gpt', methods=['GET'])
def handle_request():
    global bot
    conversation_id = ''
    parent_message_id = ''
   
    user_prompt = request.args.get('prompt', default='default prompt')
    conversation_name = request.args.get('name', default='default name')
    db = sqlite3.connect('database.db')
    cursor = db.cursor()
    cursor.execute("SELECT conversation_id, parent_message_id FROM chat_messages WHERE conversation_name=? ORDER BY ROWID DESC LIMIT 1", (conversation_name,))
    res = cursor.fetchone()
    if res != None:
        print('CONVERSATION EXISTS', conversation_id, parent_message_id)
        conversation_id = res[0]
        parent_message_id = res[1]
    db.close()
    
    result = Response(query_gpt(bot,conversation_name, conversation_id, parent_message_id, user_prompt), mimetype='text/event-stream')

    result.headers.add('Access-Control-Allow-Origin', '*')
    return result

if __name__ == '__main__':
    global bot
    bot = Chatbot(config={
    "access_token": os.environ['OPENAI_ACCESS_TOKEN'],
    # "email": os.environ['OPENAI_EMAIL'],
    # "password": os.environ['OPENAI_PASSWORD']
    })
    app.run(host='0.0.0.0', port=3002, threaded = False)