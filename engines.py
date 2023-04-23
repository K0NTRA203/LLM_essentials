
from openai_api import playground, gpt_api, gpt_stream
from embedding import translate_prompt
# import openai
import embedding
import embed
import sqlite3
import time
from db_connection import response_to_db, load_chatbot
from dotenv import load_dotenv
import os
import requests
load_dotenv()


def query_hf_ngrok(prompt, lib_name):
    base_url = os.environ['HF_NGROK_ADDRESS']
    url = f"{base_url}/library/query_wiki"
    print(url)
    data = {'query': prompt,
        'dataset_name': lib_name,
        'k': 2}
    headers = {'ngrok-skip-browser-warning': 'true'}
    response = requests.get(url, params=data, headers=headers)
    if response.status_code == 200:
        res = response.json()
        print(res['result'])
    else:
        print('Error:', response)
    return res['result']

def query_custom_chatbot(data, name):
    chatbot = load_chatbot(name)
    prompt = data['prompt']
    hist = chatbot['hist']
    system = chatbot['system']
    lib_name = chatbot['lib_name']
    is_focused = chatbot['is_focused']

    if lib_name:
        if is_focused: 
            context = query_hf_ngrok(prompt, lib_name)
            role_appendix = f'Answer according to this Context and dont answer anything out of this Context.\nContext:{context}'
            system += role_appendix
        else: 
            context = query_hf_ngrok(prompt, lib_name)
            role_appendix = f'Answer according to this Context and use your own knowledge-base if the question is out of this Context.\nContext:{context}'
            system += role_appendix

    for chunk in query_gpt_api_stream(name, prompt, hist, system):
        yield chunk
    return

def query_engines(data):
        print(data)
        name = data['name']
        engine = data['engine']
        prompt = data['prompt']
        response = ''
        max_tokens = data['maxTokens']
        n = data['n']
        stop = data['stop']
        temperature = data['temp']
        tick = data['tick']
        hist = data['hist']
        system = data['system']
        

        print('*******RECIEVED PROMPT********', prompt)
        if engine != 'davinci-qanoon-fa' and engine != 'davinci-qanoon-en' and engine != 'davinci-sina' and engine != 'labour-law' and engine != 'labour-law-fa'and engine != 'gpt-3.5-turbo':
            response = playground(name,engine,prompt,max_tokens,n,stop,temperature)
            return response
        
        elif engine == 'gpt-3.5-turbo':
            
            response = gpt_api(name,hist,system,prompt)
            response_to_db(name,str(response), 'gpt-3.5-turbo', prompt)
            return response
        
        elif engine == 'davinci-qanoon-fa': 
            translated_prompt = translate_prompt(prompt,'en')
            print('TRANSLATED TO: ',translated_prompt)
            response = embedding.query(translated_prompt)
            translated_response = translate_prompt(str(response), 'fa')
            print('TRANSLATED RESPONSE: ', translated_response)
            response_to_db(name,translated_response, engine, prompt)
            # yield f"resp: {translated_response}\n\n"
            return translated_response
            
        elif engine == 'davinci-qanoon-en':
            response = embedding.query(prompt)
            response_to_db(name,str(response), engine, prompt)
            # yield f"resp: {response}\n\n"
            return response

        
        elif engine == 'davinci-sina':
            response,tokens = embed.query_intel(prompt,'knowledge/code_knowledge/sina_embedding2.csv','text-davinci-003', 1000)
            response_to_db(name,str(response), engine, prompt,tokens=tokens)
            # yield f"resp: {response}\n\n"
            return response


        elif engine == 'labour-law':
            response,tokens = embed.query_intel(prompt,'knowledge/labour_law.csv','text-davinci-003', 1000)
            response_to_db(name,str(response), engine, prompt,tokens=tokens)
            # yield f"resp: {translated_response}\n\n"
            return translated_response

            
        elif engine == 'labour-law-fa':
            translated_prompt = translate_prompt(prompt,'en')
            print('TRANSLATED TO: ',translated_prompt)
            response,tokens = embed.query_intel(translated_prompt,'knowledge/labour_law.csv','text-davinci-003', 1000)
            translated_response = translate_prompt(str(response), 'fa')
            print('TRANSLATED RESPONSE: ', translated_response)
            response_to_db(name,translated_response, engine, prompt, tokens=tokens)
            # yield f"resp: {translated_response}\n\n"
            return translated_response

def query_gpt(bot,conversation_name, conversation_id='', parent_message_id='', user_prompt='', token='' ):
        
        db = sqlite3.connect('database.db')
        cursor = db.cursor()
        if conversation_id != '' and parent_message_id != '':
            bot.config.update({"conversation_id": conversation_id})
            bot.config.update({"parent_id": parent_message_id})

            # bot.conversation_id = conversation_id
            # bot.parent_id = parent_message_id
        response = ''
        prev_text = ''
        for data in bot.ask(user_prompt):
            message = data["message"][len(prev_text) :]
            message = message.replace('\n\n', '<br/><br/>')
            message = message.replace('\n', '<br/>')
            message = message.replace('\t', '    ')
            yielding_chunk = f"data: {message}\n\n"
            # Yielding CODES inside these characters:
            yielding_chunk = yielding_chunk.replace('```', '|||')

            yield yielding_chunk
            print("YIELDED CHUNK IS: ", yielding_chunk)
            conversation_id = bot.conversation_id
            parent_message_id = bot.parent_id
  
        insert_sql = 'INSERT INTO chat_messages (tok, conversation_name, conversation_id, parent_message_id, user_prompt, response) VALUES (?, ?, ?, ?, ?, ?)'
        cursor.execute(insert_sql, (token, conversation_name, conversation_id, parent_message_id, user_prompt, message))
        db.commit()
        db.close()
        yield 'data: DONEDONE\n\n'

def query_gpt_api_stream(name, prompt, included_hist, system):
    start_time = time.time()
    for data in gpt_stream(name, prompt, included_hist, system):
        if time.time() - start_time > 60:
            yield f"data: TIMEOUT! TRY AGAIN\n\n"
            yield f"data: [DONE]\n\n"
            break
        print(data)
        yield data

# query_hf_ngrok('who is tony montana?', 'tonymontana')

          


        
  


