import sqlite3
import time

def make_chatbot(data):
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
    conn = sqlite3.connect('chatbots.db')
    c = conn.cursor()
    print(response)
    now_time = int(time.time())
    c.execute("CREATE TABLE IF NOT EXISTS chatbot(id TEXT, name TEXT, model TEXT, prompt TEXT, all_choices TEXT, best_choice_text TEXT, time INTEGER, tokens INTEGER, tick BOOL)")
    c.execute("INSERT INTO playground (id, name, model, prompt, all_choices, best_choice_text, time, tokens, tick) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", ('',name, engine, prompt, '', response, now_time, tokens, False))
    conn.commit()
    conn.close()

    return

def response_to_db(name, response, engine, prompt, tokens=''):
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    print(response)
    now_time = int(time.time())
    c.execute("CREATE TABLE IF NOT EXISTS playground(id TEXT, name TEXT, model TEXT, prompt TEXT, all_choices TEXT, best_choice_text TEXT, time INTEGER, tokens INTEGER, tick BOOL)")
    c.execute("INSERT INTO playground (id, name, model, prompt, all_choices, best_choice_text, time, tokens, tick) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", ('',name, engine, prompt, '', response, now_time, tokens, False))
    conn.commit()
    conn.close()