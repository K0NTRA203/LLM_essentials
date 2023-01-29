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

import json
import embedding, embed
from embedding import import_knowledge, vectorize_knowledge, response_to_db, check_language, translate_prompt
# doc = import_knowledge('knowledge/civil_code')
# vectorize_knowledge(doc,'knowledge/civil_code.json')
# pinecone_init()
# chatgpt_wrapper

app = Flask(__name__)       
CORS(app)



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

@app.route('/gpt', methods=['POST'])
def handle_request():
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

    def asking(conversation_id='', parent_message_id='', user_prompt='', token=''):

    
        # TODO refresh session button --> bot.refresh_session

        # subprocess.run("pkill -f playwright", shell=True)
        # ASYNC PLAYWRIGHT
        #asking for response:
        print('~~~porside shod~~~')
        bot = ChatGPT()
        bot.refresh_session
        
        
        if conversation_id != '' and parent_message_id != '':
            bot.conversation_id = conversation_id
            bot.parent_message_id = parent_message_id
        
        if token =='':
            response = bot.ask(user_prompt)
        else: 
            print(bot.session)
            response = bot.ask(user_prompt,token)
        conversation_id = bot.conversation_id
        #closing browser tasks:
        for page in bot.browser.pages:
            print('~~~dar hale bastan~~~')
            page.close()
        
            
        #returning data back
        print (response,bot.conversation_id, bot.parent_message_id)
        return response,bot.conversation_id, bot.parent_message_id

    # Set up a cursor to iterate over the database

    tok = ''
    # tok ='eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..oZKNw8XJpex9f-BH.DKHKGCr18w6hCkNU_m90pAKK6gHDPvy7Gn_MHZUFwLpaQKg72_sOCP6imhI0YWFARGS6Farq-7NEVOMDEruj7j41QzZZkBPdw54TSfUptxwltvEkijJ4Rxs9-v5ESnMOafriLYUy5rxGtTKu9zZGiRiNHSUQyWJB9FrLzJwNu0zs4sCtzMH1UCenxyO-KWem8eoU8uVSYRfxaV2f-u0rYq13pIEKTqx-oqNmogvHVkW4T4kFyDGlzgvI21fvF7bpenqUuruX-3Q9eRH2sGtuJk-AZRWP7_YGqYwjqw9umf9-Ln-9t2-mWjsFrhT8qmZFCFvLLL_Z80qb6DWmUbSlgnITz277PINo3Hkg_O4rfDz35eW5zMoKppS_afEQoDfyHNcYjCRD9oV4VKJMbOCQxMQ37b6_iuxFHHBC696a3oudJqpjyRd_eACXnURiwSubmLv6eZBrgZ0TvJzEBD3d6k8XLOBdVHt-8qqCswD3gM9azgyTFyXy6yI10vhVC5REKXR9Juhk8xxpp5AEfDuMjMOBbU-vbEF3WsW2ol5FX9_nhOnyVPHo57Sx8cVOGgxHM-edAGBZjC4EwWp2nqDhC8kBEZDuDhyrWQ1l4M3o-pUaoblKax0QtHl75dT0o8jVS8Z6qJoypud8NpflKBhkSdwtZM4eFgZFISi9KW6CLj2kbhXmXTJjvJyYGoWT8X1i0j1GF2kLOev9Bhwq-bhDaXtrD0otWMVWd2vVRThzQV6L54F7piJMBQISB3xZUS_waGTfn1C_tUG9WL8lkbXrjm7ZRo0mcG_-rdZCslyBDZgj-qn_ZiWGAZO_Oxxut7rrm7EO-IPMWkp1lFrubyHPAFXevFZZ618adb22Ah9HPUS12YZimDOHwpgdp1xQ6X1V5ALmbHMa3ZrNWyJ0jKRmDCsBEf57xR6Mmx4-vjzfO-43wOovNV9_0-X783_BsUvcGHQ624QFSnlDmh-Y36UH7VHh_Vj25R-Dukn9jxyHjFyQdCq4go7oElPTw5sQXd3TyPiw5Y5NIacI7aDg1M25InTtLLuwsfRVR_SyYYLz0WLKRKp5-WQcoA5119p-s6EZCfN5U27hLT2OvEkhHHZTFA2FnEOe93-vUQKtapsSasp8oupQfUAT3whxlTuH9757tkM-91Sbu1LK4wuAb5CX_uoMhZmnTOFlnlqyededRx93VRZatt5p-JQgzCc61vyPsjjLlLCyu0v-VuHhS-oOxYSOlwwVxaAPR82EgIotx1BIfgJzsrNMV2RfnFIJqiko2D0FV4Ii_6-w0rqJOTeRN1v9gtlwnHYUZcWd3apaCYmDIv3-vPFg4xIx7J3H1tDNNjirybQMqlYSiXQbd1_h01Tf_pT1x3KPaDwpEQLJ6_LTEIIPlLfDhkO7ZJ5dLXIzdoDLG8YcVayO16PfoNxy59FerPH06dE-B-fHpgLXaQyOw7Avp_Vs6p4qpQ-RKIu9gsmyWTB46iG2ZyXcBcD_xqiwAEEdsvqdootT9z7kCPpc8nT9iQGAGsrYU1QeG9LLDnJCxqJ0_KQmGxoqMFZbwYN4HJWqJWo13Ig3fHnnWuqtoHrOWtacOBPkgScMM2FVPqX7lC35qzV81zkpbchSa1qr4N_hLtWSnou5-g3xzHRFJhCBnFwg4B0FW8C1CsftvNuv2v30ap1Q6l-GqfhL6drgHUOPKAs9VuK-ROB34vybr-3_HVSd7VsibI6ceO7F7LNdSGpnvrrW4pP8iQnlfwc6tgDO2HztkAfv2L_qtEyKOuBXyTxejbzBMcB3-lCO0ZnnPSZGzhsxEcHqK5aTQvxyeXTsGx6QV0ekntoUDMVf854OkfBWNITbwn1WOzOwhfsUh6_FRop7PQapLQKMhEDyz0TXVXk6y-Hi5ozx6p5EBlLxUhgxhqJhrO9z0wrJxCMrwt-UacliIeEZ4aF8Fde9mP1Wx4PvmazfU5h9djhb4REFj41HZ9ORmK36WjZ2931ECL66SXp_x_QESX0KMJuEsiI5KzHSnRFNCHARKWh4oXAJfmVAZITcwNwsgcH6zLq1gzxZpklLogCl061MXX-qFlogbFyQNBdwzNQdYJuEwJ2UM8TIRx1UNDZpCeDeoQcAh3_QcyZoQbZrETAGuMDhYQlql8RBCB-oeMGbbnh-3IcmDjr5dZiPZ8yO_78b3Ytq70Gu3DufVAlP3qnwEvfulYOm43hPbeM7AFUMeaPUI41MYoRl-ELhyeV2qMeZUJhXUMYQ99UFxvID1ZEvZQaav7QorY9iecglsb6Sz3FsorVdTHxUtySyClZPcTWz7ukY5CEqkYMhiUvlhyvTlPzrM0ocBYqIa8SAtD5SCTzRsbzyAS5oQZbKPSscFX6f-wiTalPNyH2a0PymnPw5Jc3I-XSZdUH75UWRNBD7YaAL5tg7HFl5yjV7CgkTfio13qpj-VNsviYRSJwumXBH05XsIbjUsijUToF8PS3eyI9QcVZrCDX1onNrB96dg4Rh0rUWCeV6HKzJaAXB2rS8lxaODrqsUKcw2EGW3QpM6LX9vaJIi-M.PMHOJ3a-3bMs94odFPJu6Q'

    # tok = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik1UaEVOVUpHTkVNMVFURTRNMEZCTWpkQ05UZzVNRFUxUlRVd1FVSkRNRU13UmtGRVFrRXpSZyJ9.eyJodHRwczovL2FwaS5vcGVuYWkuY29tL3Byb2ZpbGUiOnsiZW1haWwiOiJrMG50cmEua2Fta2FtQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJnZW9pcF9jb3VudHJ5IjoiTkwifSwiaHR0cHM6Ly9hcGkub3BlbmFpLmNvbS9hdXRoIjp7InVzZXJfaWQiOiJ1c2VyLU9aZGlxendLSVRuTHRpc1lmdnozTWo2YSJ9LCJpc3MiOiJodHRwczovL2F1dGgwLm9wZW5haS5jb20vIiwic3ViIjoiZ29vZ2xlLW9hdXRoMnwxMDgwMjMxNjU1ODU2NTI2MDY5ODgiLCJhdWQiOlsiaHR0cHM6Ly9hcGkub3BlbmFpLmNvbS92MSIsImh0dHBzOi8vb3BlbmFpLmF1dGgwLmNvbS91c2VyaW5mbyJdLCJpYXQiOjE2NzMzNDU0ODcsImV4cCI6MTY3Mzk1MDI4NywiYXpwIjoiVGRKSWNiZTE2V29USHROOTVueXl3aDVFNHlPbzZJdEciLCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIG1vZGVsLnJlYWQgbW9kZWwucmVxdWVzdCBvcmdhbml6YXRpb24ucmVhZCBvZmZsaW5lX2FjY2VzcyJ9.r8N402-719CfYEIsLaFU6186Akcfh9d0VgH6TuYgQQHH0q_0bpEdC4zUT0PwHSAVTHnOFLgQnmUmARLQfMoCaX8wKS3V2Cw8dmm7s8KC4Rc-2kSjS16jEl3a39wyXAGT-yguip8moK_sbbL56uUihyRdqA4Cww12vXIJedLHRWd0xudRJOuDG-UKG2vL36hfnVTRRaxz-salAFUdhPzugANlNT2mIa0pT-aalFFDCIabfpMkCo-MV4kZPLs0_D3NQQ-bmFoKDxp3H_N7GnBqTQVldsnuvmHjItk8IVFZQk4jWo8gxn9q14BysFXWsb7_tvnOULGuAmxXQH_J5dDMSw'
    response, conversation_id, parent_message_id = asking(conversation_id, parent_message_id, user_prompt,tok)
    # resp =  make_response(jsonify({'response': response, 'conversation_id': conversation_id, 'parent_message_id': parent_message_id}))
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

