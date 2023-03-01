import sqlite3
import openai
import json
# from chatgpt_wrapper import ChatGPT
# import chatgpt_wrapper
import os
from dotenv import load_dotenv
load_dotenv()
openai_key = os.environ['OPENAI_KEY']

def playground(name, engine, prompt, max_tokens, n, stop, temperature,tick=False):
    print('name', name)
    print('prompt', prompt)
    print('engine', engine)
    openai.api_key = openai_key
    response = openai.Completion.create(
        engine=engine,
        prompt=prompt,
        
        max_tokens=int(max_tokens) if max_tokens is not None else 100,
        n=int(n) if n is not None else 1,
        stop=stop,
        temperature=temperature
    )
    def response_to_db(name, response, engine, prompt):
        conn = sqlite3.connect('database.db')
        c = conn.cursor()
        print(response)
        c.execute("CREATE TABLE IF NOT EXISTS playground(id TEXT, name TEXT, model TEXT, prompt TEXT, all_choices TEXT, best_choice_text TEXT, time INTEGER, tokens INTEGER, tick BOOL)")
        c.execute("INSERT INTO playground (id, name, model, prompt, all_choices, best_choice_text, time, tokens, tick) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", (response.id,name, engine, prompt, '', response.choices[0].text, int(response.created), int(response.usage.total_tokens), tick))
        conn.commit()
        conn.close()
    print(response.choices[0]['text'])


    def delete_db(name):
        try:
            conn = sqlite3.connect('database.db')
            cur = conn.cursor()
            sql = 'DROP TABLE IF EXISTS ' + name
            cur.execute(sql)
            conn.commit()
            conn.close()
        except:
            print('errror')
    
    # delete_db('playground')
    response_to_db(name, response, engine, prompt)

    return response.choices[0]['text']