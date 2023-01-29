from chatgpt_wrapper import ChatGPT
from openai_api import playground
import os
import jsonlines
import json
import subprocess
import sqlite3
import numpy as np
import time
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import subprocess
import asyncio
import json
import embedding, embed
from embedding import import_knowledge, vectorize_knowledge, response_to_db, check_language, translate_prompt
# doc = import_knowledge('knowledge/civil_code')
# vectorize_knowledge(doc,'knowledge/civil_code.json')
# pinecone_init()
# chatgpt_wrapper
from playwright.async_api import async_playwright

async def start_browser():
    play = await async_playwright.start()
    playbrowser = await play.firefox
    browser = await playbrowser.launch_persistent_context(
        user_data_dir="/tmp/playwright",
        headless=False)
    return browser

app = Flask(__name__)       
CORS(app)


bot = ChatGPT()

@app.route('/playground' , methods=['POST'])
def playground_route():
    data = request.get_json()
    name = data["name"]
    engine = data["engine"]
    prompt = data["prompt"]
    response = ''
    max_tokens = data["maxTokens"]
    n = data["n"]
    stop = data["stop"]
    temperature = data["temp"]
    if engine != 'davinci-qanoon-fa' and engine != 'davinci-qanoon-en' and engine != 'davinci-sina' and engine != 'labour-law' and engine != 'labour-law-fa':
        response = playground(name,engine,prompt,max_tokens,n,stop,temperature)
    elif engine == 'davinci-qanoon-fa':
        translated_prompt = translate_prompt(prompt,'en')
        print('TRANSLATED TO: ',translated_prompt)
        response = embedding.query(translated_prompt)
        translated_response = translate_prompt(str(response), 'fa')
        print('TRANSLATED RESPONSE: ', translated_response)
        response_to_db(name,translated_response, engine, prompt)
    elif engine == 'davinci-qanoon-en':
        response = embedding.query(prompt)
        response_to_db(name,str(response), engine, prompt)
    elif engine == 'davinci-sina':
        response,tokens = embed.query_intel(prompt,'code_knowledge/sina_embedding2.csv','text-davinci-003', 1000)
        response_to_db(name,str(response), engine, prompt,tokens=tokens)
    elif engine == 'labour-law':
        response,tokens = embed.query_intel(prompt,'knowledge/labour_law.csv','text-davinci-003', 1000)
        response_to_db(name,str(response), engine, prompt,tokens=tokens)
    elif engine == 'labour-law-fa':
        translated_prompt = translate_prompt(prompt,'en')
        print('TRANSLATED TO: ',translated_prompt)
        response,tokens = embed.query_intel(translated_prompt,'knowledge/labour_law.csv','text-davinci-003', 1000)
        translated_response = translate_prompt(str(response), 'fa')
        print('TRANSLATED RESPONSE: ', translated_response)
        response_to_db(name,translated_response, engine, prompt, tokens=tokens)

        
    resp =  make_response(jsonify({"result": response}))
    resp.headers['Access-Control-Allow-Origin'] = '*'
    resp.headers['Access-Control-Allow-Methods'] = 'POST'
    return resp

@app.route('/playground/messages' , methods=['GET'])
def playground_messages():
    name = request.args.get('name')
    x = request.args.get('x')
    print('NAME O X: ',name,x)
    #open connection to database
    db = sqlite3.connect('database.db')
    cursor = db.cursor()
    # get conversation_messages from database
    if x != None:
        cursor.execute("SELECT prompt, best_choice_text FROM playground WHERE name = ? ORDER BY time DESC LIMIT ?", (name, x))

    res = cursor.fetchall()
    conversation_messages = []
    for row in res:
        conversation_messages.insert(0, {"prompt": row[0], "best_choice_text": row[1]})  
          # close connection to database
    db.close()
    #return conversation_messages to client
    print(conversation_messages)
    resp =  make_response(jsonify({"messages": conversation_messages}))
    resp.headers['Access-Control-Allow-Origin'] = '*'
    resp.headers['Access-Control-Allow-Methods'] = 'GET'
    return resp


@app.route('/playground/names' , methods=['GET'])
def playground_names():
    
    #open connection to database
    db = sqlite3.connect('database.db')
    cursor = db.cursor()
    # cursor.execute("CREATE TABLE IF NOT EXISTS playground(id TEXT, name TEXT, model TEXT, prompt TEXT, all_choices TEXT, best_choice_text TEXT, time INTEGER, tokens INTEGER, tick BOOL)")
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

@app.route('/playground/names', methods=['DELETE'])
def delete_names():   
    data = request.get_json()
    name = data['name']
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
    conversation_name = data['conv_name']
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
    print('NAME O X: ',name,x)
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

print('****************INITIALIZING BOTT******************')

@app.route('/gpt', methods=['POST'])
async def handle_request():
    loop = asyncio.get_event_loop
    if loop is None:
        loop = asyncio.new_event_loop()
    print(loop)
    # asyncio.set_event_loop(loop)
    conversation_id= ''
    parent_message_id=''
    # Get the conversation_id, parent_message_id, and user_prompt from the request body
    data = request.get_json()
    print('~~~data oomad~~~',data)
    user_prompt = data['prompt']
    conversation_name = data['name']
    # print('convName',conversation_name)
    # Open a connection to the database
    db = sqlite3.connect('database.db')
    cursor = db.cursor()
    cursor.execute("SELECT conversation_id, parent_message_id FROM chat_messages WHERE conversation_name=? ORDER BY conversation_id DESC LIMIT 1", (conversation_name,))
    res = cursor.fetchone()
    if res != None:
        print('CONVERSATION EXISTS')
        # If conversation_name exists, set conversation_id and parent_message_id
        conversation_id = res[0]
        parent_message_id = res[1]
        print('EXISTING CONVERSATION:', conversation_id,parent_message_id)
    


    async def asking(loop,conversation_id='', parent_message_id='', user_prompt='', token=''):

    
        # TODO refresh session button --> bot.refresh_session
        await bot.initialize()
        # subprocess.run("pkill -f playwright", shell=True)
        # ASYNC PLAYWRIGHT
        #asking for response:
        print('~~~porside shod~~~')

        # await bot.refresh_session
        
        
        if conversation_id != '' and parent_message_id != '':
            bot.conversation_id = conversation_id
            bot.parent_message_id = parent_message_id
        
        if token =='':
            future = asyncio.run_coroutine_threadsafe(bot.ask(user_prompt), loop)
            response = future.result()
        else: 
            print(bot.session)
            future = asyncio.run_coroutine_threadsafe(bot.ask(user_prompt,token), loop)
            response = future.result()
        conversation_id = bot.conversation_id
        #closing browser tasks:
        # for page in bot.browser.pages:
        #     print('~~~dar hale bastan~~~')
        #     page.close()
            # Synchronous function

        #returning data back
        
        print (response,bot.conversation_id, bot.parent_message_id)
        return response,bot.conversation_id, bot.parent_message_id

    # Set up a cursor to iterate over the database

    tok = ''
   
    response, conversation_id, parent_message_id = await asking(loop, conversation_id, parent_message_id, user_prompt,tok)
    # resp =  make_response(jsonify({'response': response, 'conversation_id': conversation_id, 'parent_message_id': parent_message_id}))
    print ('respoooooooooooooooooooooooooooooooonse', response)
    resp =  make_response(jsonify({'response': response}))

    resp.headers['Access-Control-Allow-Origin'] = '*'

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
    asyncio.run(start_browser())

