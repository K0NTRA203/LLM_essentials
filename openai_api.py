

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



def playground(name, engine, prompt, max_tokens, n, stop, temperature):
    print('name', name)
    print('prompt', prompt)
    print('engine', engine)
    openai.api_key = "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"
    response = openai.Completion.create(
        engine=engine,
        prompt=prompt,
        max_tokens=int(max_tokens),
        n=n,
        stop=stop,
        temperature=temperature
    )
    print(response.choices[0]['text'])
    def response_to_db(name, prompt, response):
        if prompt != None:
            conn = sqlite3.connect('database.db')
            c = conn.cursor()   
            c.execute('''CREATE TABLE IF NOT EXISTS playground_messages
                    (id TEXT, name TEXT, model TEXT, prompt TEXT, choices TEXT, best_choice_text TEXT, timing INTEGER, warnings TEXT)''')
            
            return response.choices[0]['text']

    response_to_db(name, prompt, response)
    return response.choices[0]['text']