import sqlite3
import time
import uuid

def chatbots_list():
    connection = sqlite3.connect('database.db')
    cursor = connection.cursor()

    cursor.execute("SELECT DISTINCT name FROM chatbot GROUP BY name")
    res = cursor.fetchall()
    chatbot_names = []
    for row in res:
        chatbot_names.append(row[0])
    connection.commit()
    connection.close()
    return chatbot_names


def make_chatbot(data):
    print(data)
    id = str(uuid.uuid4())    
    name = data['name']
    engine = data['engine']
    max_tokens = data['maxTokens']
    n = data['n']
    stop = data['stop']
    temperature = data['temp']
    system = data['system']
    included_history = data['hist']
    lib_name = data['lib_name']
    is_focused = data['is_focused']
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute("CREATE TABLE IF NOT EXISTS chatbot(id TEXT, name TEXT, engine TEXT, max_tokens INTEGER, n INTEGER, stop TEXT, temperature FLOAT, system TEXT, included_history INTEGER, lib_name TEXT, is_focused BOOL)")
    # check if name already exists
    c.execute("SELECT name FROM chatbot WHERE name=?", (name,))
    result = c.fetchone()
    if result is not None:
        # name already exists, throw an error
        conn.close()
        yield '[EXISTS]'
        raise ValueError("Name already exists in chatbot")
    # name does not exist, insert new record
    c.execute("INSERT INTO chatbot (id, name, engine, max_tokens, n, stop, temperature, system, included_history, lib_name, is_focused) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", 
              (id, name, engine, max_tokens, n, stop, temperature, system, included_history, lib_name, is_focused))
    conn.commit()
    conn.close()
    return '[DONE]'

def load_chatbot(name):
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute("SELECT * FROM chatbot WHERE name=?", (name,))
    bot = c.fetchone()
    conn.close()
    if bot:
        params = {
            'id': bot[0],
            'name': bot[1],
            'engine': bot[2],
            'maxTokens': bot[3],
            'n': bot[4],
            'stop': bot[5],
            'temp': bot[6],
            'system': bot[7],
            'hist': bot[8],
            'lib_name': bot[9],
            'is_focused': bot[10]
        }
        return params
    else:
        return 'Chatbot not found'

def response_to_db(name, response, engine, prompt, tokens=''):
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    print(response)
    now_time = int(time.time())
    c.execute("CREATE TABLE IF NOT EXISTS playground(id TEXT, name TEXT, model TEXT, prompt TEXT, all_choices TEXT, best_choice_text TEXT, time INTEGER, tokens INTEGER, tick BOOL)")
    c.execute("INSERT INTO playground (id, name, model, prompt, all_choices, best_choice_text, time, tokens, tick) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", ('',name, engine, prompt, '', response, now_time, tokens, False))
    conn.commit()
    conn.close()