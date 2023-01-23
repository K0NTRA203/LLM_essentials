import sqlite3
import openai
import json
from chatgpt_wrapper import ChatGPT
import chatgpt_wrapper


# print('lissssst')
# print(openai.Model.list())

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

def playground(name, engine, prompt, max_tokens, n, stop, temperature,tick=False):
    print('name', name)
    print('prompt', prompt)
    print('engine', engine)
    openai.api_key = "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"
    response = openai.Completion.create(
        engine=engine,
        prompt=prompt,
        max_tokens=int(max_tokens),
        n=int(n),
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