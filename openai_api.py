

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

def playground(name, engine, prompt, max_tokens, n, stop, temperature):
        c.execute("INSERT INTO playground_me
    response = openai.Completion.create(
        engine=engine,
        prompt=prompt,
        max_tokens=max_tokens,
        n=n,
        stop=stop,
        temperature=temperature
    )

    def response_to_db(name, response):
        conn = sqlite3.connect('database.db')
        c = conn.cursor()
        c.execute('''CREATE TABLE IF NOT EXISTS playground_messages
                (id INTEGER PRIMARY KEY, name TEXT, model TEXT, prompt TEXT, choices BLOB, best_choice_text TEXT, timing INTEGER, warnings TEXT)''')

        c.execute("INSERT INTO playground_messages (id, name, model, prompt, choices, best_choice_text, timing, warnings) VALUES (?,?,?,?,?,?,?,?)",
                (response.id, name, response.model, response.prompt, response.choices, response.choices[0]['text'], response.timing, response.warnings))
        conn.commit()
        conn.close()

    response_to_db(name, response)
    return response[0]['text']