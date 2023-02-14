### CHATGPT TODO
"""
edit name button
setting request timeout for /gpt POST
assigning existing conv ID in new name
enter keypress for new name
typewriter effect
login/refresh button
code snippet with indentations
foldable menu
username based chat history
alter-prompting
streaming /gpt responses
"""
### PLAYGROUND TODO
"""
edit name button
enter keypress for new name
login with API key
loading models from db
code snippet with indentations
selecting messages for further conversation
token calculation
file embeddings and prompt structure
"""
### EMBEDDING TODO
"""
starting embedding page
file embeddings and prompt structure
making embedded models to load in pg
"""
from lib.chatgpt_wrapper import ChatGPT
from openai_api import playground
import operator
from functools import reduce
import subprocess
import sqlite3
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
import subprocess
from playwright.sync_api import sync_playwright
import json
import embedding, embed
# from flask_socketio import SocketIO, emit
from embedding import import_knowledge, vectorize_knowledge, response_to_db, check_language, translate_prompt
# doc = import_knowledge('knowledge/civil_code')
# vectorize_knowledge(doc,'knowledge/civil_code.json')
import eventlet.wsgi
import socketio
from eventlet.green import threading

def start_browser(method = 'start'):

    global browser
    if method == 'start':
        subprocess.run("pkill -f playwright", shell=True)
        playwright = sync_playwright().start()
        browser = playwright.firefox.launch_persistent_context(
            user_data_dir="/tmp/playwright",
            headless=False)
        browser.pages[0].goto("https://chat.openai.com/")
        print('************************PLAYWRIGHT READY')
    elif method == 'refresh':
        print('*******************REFRESHING PLAYWRIGHT')
        #closing browser tasks:
        for page in browser.pages:
            page.close()
        subprocess.run("pkill -f playwright", shell=True)
        playwright = sync_playwright().start()
        browser = playwright.firefox.launch_persistent_context(
            user_data_dir="/tmp/playwright",
            headless=True)
        browser.pages[0].goto("https://chat.openai.com/")
    elif method == 'login':
        print('************************LOGIN PLAYWRIGHT')
        for page in browser.pages:
            page.close()
        subprocess.run("pkill -f playwright", shell=True)
        playwright = sync_playwright().start()
        browser = playwright.firefox.launch_persistent_context(
            user_data_dir="/tmp/playwright",
            headless=False)
        browser.pages[0].goto("https://chat.openai.com/")

sio = socketio.Server(cors_allowed_origins="http://localhost:3000")
app = socketio.WSGIApp(sio)

@sio.event  
def connect(sid, environ):
    print('[INFO] Connect to client', sid)
    
@sio.on('disconnect')
def handle_disconnect(sid):
    print('disconnect ', sid)
    


@sio.on('playground')   
def playground_route(sid, data):
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

    sio.emit('response',{'result':response}, room=sid)

@sio.on('playground_messages')
def playground_messages(sid, data):
    name = data.get('name')
    x = data.get('history')
    #open connection to database
    db = sqlite3.connect('database.db')
    cursor = db.cursor()
    # get conversation_messages from database
    if x != None:
        cursor.execute("SELECT prompt, best_choice_text FROM playground WHERE name = ? ORDER BY time DESC LIMIT ?", (name, x))

    res = cursor.fetchall()
    messages = []
    for row in res:
        messages.insert(0, {"prompt": row[0], "best_choice_text": row[1]})  
          # close connection to database
    db.close()
    sio.emit('messages', {'messages': messages}, room=sid)

@sio.on('playground_names')
def playground_names(sid):
    
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
    sio.emit("conversation_names", {"name": conversation_names}, room=sid)

@sio.on('delete_names')
def delete_names(sid, data):   
    name = data['name']
    print('deleting', name)
    db = sqlite3.connect('database.db')
    cursor = db.cursor()
    cursor.execute("DELETE FROM playground WHERE name=?", (name,))
    db.commit()
    db.close()
    sio.emit("delete_names", {"message": f"Successfully deleted all messages with name {name}"}, room=sid)

@sio.on('new_gpt_name')
def new_name(sid, data):
    name = data['name']
    conversation_id = data['conversation_id']
    parent_message_id = data['parent_id']
    print('new name', name, conversation_id, parent_message_id)
    db = sqlite3.connect('database.db')
    cursor = db.cursor()
    insert_sql = 'INSERT INTO chat_messages (conversation_name, conversation_id, parent_message_id, user_prompt, response) VALUES (?, ?, ?, ?, ?)'
    cursor.execute(insert_sql, (name, conversation_id, parent_message_id, '', ''))
    print('**************************name submitted*****************************************************')
    db.commit()
    db.close()
    sio.emit("new_name_created", {"message": f"Successfully Created {name}, {conversation_id}, {parent_message_id}"}, room=sid)

    return

@sio.on('gpt_names')
def get_conversation_names(sid):
    #open connection to database
    db = sqlite3.connect('database.db')
    #set up a cursor to iterate over the database
    cursor = db.cursor()
    #get conversation_names from databasez
    cursor.execute("SELECT DISTINCT conversation_name FROM chat_messages ORDER BY ROWID DESC")
    res = cursor.fetchall()
    conversation_names = []
    for row in res:
        conversation_names.append(row[0])
    #close connection to database
    db.close()
    #return conversation_names to client
    sio.emit("conversation_names", {"name": conversation_names}, room=sid)
    

@sio.on('delete_gpt_name')
def delete_conversation(sid, data):
    conversation_name = data['name']
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute("DELETE FROM chat_messages WHERE conversation_name=?", (conversation_name,))
    conn.commit()
    conn.close()
    print('successfully deleted')
    sio.emit("delete_names", {"message": f"Successfully deleted all messages with name {conversation_name}"}, room=sid)
    return

@sio.on('gpt')
def handle_message(sid, data):
    # Wrap the handle_message function in a green thread
    t = threading.Thread(target=handle_message_thread, args=(sid, data))
    t.start()
def handle_message_thread(sid, data):
    global browser
    # conversation_id = data ['conversation_id']
    conversation_id = ''
    parent_message_id = ''
    user_prompt = data['prompt']
    conversation_name = data['name']
    print(data)
    print('SQL QONCECTED')
    print('DATA OOMADDDDDD', user_prompt, conversation_name)
    db = sqlite3.connect('database.db')
    cursor = db.cursor()
    cursor.execute("SELECT conversation_id, parent_message_id FROM chat_messages WHERE conversation_name=? ORDER BY ROWID DESC LIMIT 1", (conversation_name,))
    res = cursor.fetchone()
    if res != None and res != ('', ''):
        print('********************CONVERSATION EXISTS***********************'      )
        print(res)
        # if parent_message_id != '' and conversation_id != '':
        conversation_id = res[0]
        parent_message_id = res[1]  

    def asking(browser, conversation_id='', parent_message_id='', user_prompt='', token='' ):
        bot = ChatGPT(pw=browser)
        print('****BOT INITIALIZED****')
        if conversation_id != '' and parent_message_id != '':
            bot.conversation_id = conversation_id
            bot.parent_message_id = parent_message_id
        # elif conversation_id != '':
        #     bot.conversation_id = conversation_id
        # response = bot.ask(user_prompt)
        response = []
        for chunk in bot.ask_stream(user_prompt, token):
            response.append(chunk)
            yield chunk
            
        if len(response) > 0:         
            response = reduce(operator.add, response)
        else: response =  "Unusable response produced, maybe login session expired. Try 'pkill firefox' and 'chatgpt install'"
        print(response)
        if response != "Unusable response produced, maybe login session expired. Try 'pkill firefox' and 'chatgpt install'": 
            conversation_id = bot.conversation_id
            parent_message_id = bot.parent_message_id
            insert_sql = 'INSERT INTO chat_messages (conversation_name, conversation_id, parent_message_id, user_prompt, response) VALUES (?, ?, ?, ?, ?)'
            cursor.execute(insert_sql, (conversation_name, conversation_id, parent_message_id, user_prompt, response))
        else:
            print('KKKKKKKKKKKKKKKKKIIIIIIIIIIIILLLLLLLLLLLLLLLLLLLLLLLL')
        # db.commit()
        # db.close()
        return
        
    print('GOING TO RUN CHUNKS LOOP FOR:', conversation_id, parent_message_id, user_prompt)
    response = []

    for chunk in asking(browser, conversation_id, parent_message_id, user_prompt):
        print('CHUNKCHUNKCHUNK', chunk)
        sio.emit('chunks', {'chunk': chunk})

        response.append(chunk)
    if len(response) > 0:         
        response = reduce(operator.add, response)
    else: response =  "Unusable response produced, maybe login session expired. Try 'pkill firefox' and 'chatgpt install'"
    print('full res: ', response)

    # response = asking(browser, conversation_id, parent_message_id, user_prompt)
    db.commit()
    db.close()
    sio.emit('response', {'result': response}, room=sid)
    return

@sio.on('gpt_messages')
def gpt_history(sid, data):
    name = data['name']
    x = data['history']
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
    sio.emit('msgs',{'result': conversation_messages}, room=sid )


if __name__ == '__main__':
    start_browser()
    print('OK')
    eventlet.wsgi.server(eventlet.listen(('0.0.0.0', 3002)), app, log_output=True)


    #FOR FLASK_SOCKETIO THIS SHOULD BE:
    # socketio.run(app, host='0.0.0.0', port=3002)
    # socketio.run(app)
