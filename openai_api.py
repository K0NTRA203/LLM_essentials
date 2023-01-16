

# import os
# if os.path.exists('conversation_history.txt'):
#     # Load the file into the conversation_history variable
#     with open('conversation_history.txt', 'r') as f:
#         conversation_history = f.read()
# else:
#     # Set conversation_history to an empty string
#     conversation_history = ''
# openai.api_key = OPENAI_API
# # df = pd.DataFrame([['', 2], [2, 3], [3, 4], [4, 5], [5, 6], ['a', 'b'], ['x', 'y'], ['y', 'z']], columns=['prompt', 'completion'])
# def save_fine_tuning_data(path, df):
#     # Extract the prompts and completions from the DataFrame
#     prompts = df["prompt"].tolist()
#     completions = df["completion"].tolist()
#     prompts = [str(prompt) + " ->" for prompt in prompts]
#     completions = [" " + str(completion) + "\n" for completion in completions]
#     jsons = [{"prompt": prompt, "completion": completion} for prompt, completion in zip(prompts, completions)]
#     # print(openai.File.list())
#     # Open a JSONL file for writing
#     with jsonlines.open(path, "w") as writer:
#       # Write all of the dictionaries to the file
#       writer.write_all(jsons)
# save_fine_tuning_data("test.jsonl", df)
# openai.File.create(file=open('test.jsonl','rb'),purpose='fine-tune')
# openai.FineTune.create(training_file="file-DXA808APjcTd0IodxofPEzrx", model='babbage',suffix= 'arrrr')
# print('lissssst')
# print(openai.Model.list())
import sqlite3
import openai
import json



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