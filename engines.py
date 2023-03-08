
from openai_api import playground, gpt_api
from embedding import response_to_db,translate_prompt
import openai
import embedding
import embed
import sqlite3

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