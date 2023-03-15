import sqlite3
import openai
import os
import time
from dotenv import load_dotenv
load_dotenv()
openai_key = os.environ['OPENAI_KEY']




def _make_gptapi_history(system_str, name, x):
    # call the function
    conversation_history = pg_history_from_db(name, x)
    # create two empty lists
    prompts = []
    responses = []
    # iterate through the conversation_history and append values to each list
    for conversation in conversation_history:
        prompts.append(conversation['prompt'])
        responses.append(conversation['best_choice_text'])

    messages = []
    if system_str != '':
        messages.append({"role": "system", "content": system_str})
    for i in range(len(prompts)):
        messages.append({"role": "user", "content": prompts[i]})
        messages.append({"role": "assistant", "content": responses[i]})
        # print(messages)
    return messages


def gpt_api(name, x, system_str , msg_content):


    history = _make_gptapi_history(system_str, name, x)
    current_message= [{"role": "user", "content": msg_content}]
    history.extend(current_message)
    print('x= ', x, '******MSG_CONTENT******', history)
    completion = openai.ChatCompletion.create(
        model='gpt-3.5-turbo',
        # messages=all_messages
        messages=history
        
    )
    print(completion)
    res = completion['choices'][0]['message']['content']
    print(res)
    return res

def pg_history_from_db(name,x):
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
    db.close()
    print('PG MESSAGES', conversation_messages)
    return conversation_messages


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

def gpt_stream(name, msg_content, included_hist, system):
    full_msg = ''
    history = _make_gptapi_history(system, name, included_hist)
    current_message= [{"role": "user", "content": msg_content}]
    history.extend(current_message)
    print(f"history{history}")

    for completion in openai.ChatCompletion.create(
        model='gpt-3.5-turbo',
        messages=history,
        stream=True
    ):
        reason = completion['choices'][0]['finish_reason']
        if reason != None: 
            # WHEN FINISHED

            yield f"data: [DONE]\n\n"
            # DB COMMIT SHOULD BE CHANGED LATER

                

        if 'delta' in completion['choices'][0]:
            if 'content' in completion['choices'][0]['delta']:
                msg = completion['choices'][0]['delta']['content']
                full_msg = full_msg + msg

                msg = msg.replace('\n','~~~')
                yield f"data: {msg}\n\n"
    unix_time = int(time.time())
    print(unix_time)
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    print('tryin to save db', full_msg)
    c.execute("CREATE TABLE IF NOT EXISTS playground(id TEXT, name TEXT, model TEXT, prompt TEXT, all_choices TEXT, best_choice_text TEXT, time INTEGER, tokens INTEGER, tick BOOL)")
    c.execute("INSERT INTO playground (id, name, model, prompt, all_choices, best_choice_text, time, tokens, tick) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", ('',name, 'gpt-turbo', msg_content, '', full_msg, unix_time, 0, False))
    conn.commit()
    conn.close()
    

