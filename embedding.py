import openai
import os 
import sqlite3
import googletrans
from googletrans import Translator
import time
from langchain import OpenAI

os.environ['OPENAI_API_KEY'] = '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'
from gpt_index import GPTSimpleVectorIndex, SimpleDirectoryReader, GPTKeywordTableIndex, LLMPredictor, PromptHelper

def import_knowledge(folder):
    documents = SimpleDirectoryReader(folder).load_data()
    print(type(documents), 'KNOWLEDGE IMPORTED')
    return documents

###################################
# q.txt used 21000 embedding tokens
#civil_code took 81000 tokens
###################################

def vectorize_knowledge(documents,output_location):
    index = GPTSimpleVectorIndex(documents)
    index.save_to_disk(output_location)
    print('KNOWLEDGE VECTORIZED IN ',output_location)
    return

def import_vectors(location):
    # llm_predictor = LLMPredictor(llm=OpenAI(model_name="text-babbage-001"))
    # # define prompt helper
    # # set maximum input size
    # max_input_size = 1000
    # # set number of output tokens
    num_output = 300
    # # set maximum chunk overlap
    # max_chunk_overlap = 20
    chunk_size_limit = 1000
    prompt_helper = PromptHelper(num_output=num_output, chunk_size_limit=chunk_size_limit)
    # index = GPTSimpleVectorIndex.load_from_disk(location,llm_predictor=llm_predictor, prompt_helper=prompt_helper)    
    index = GPTSimpleVectorIndex.load_from_disk(location,prompt_helper=prompt_helper)    
    
    print(location,' LOADED')
    return index

def query(prompt):
    index = import_vectors('knowledge/civil_code.json')



    response = index.query(prompt,response_mode = 'compact',similarity_top_k=5)
    print(response)
    print('SOURCE NODES',response.source_nodes)
    # formatted sources
    print('FORMATTED SOURCES',response.get_formatted_sources())
    return response

def response_to_db(name, response, engine, prompt):
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    print(response)
    now_time = int(time.time())
    c.execute("CREATE TABLE IF NOT EXISTS playground(id TEXT, name TEXT, model TEXT, prompt TEXT, all_choices TEXT, best_choice_text TEXT, time INTEGER, tokens INTEGER, tick BOOL)")
    c.execute("INSERT INTO playground (id, name, model, prompt, all_choices, best_choice_text, time, tokens, tick) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", ('',name, engine, prompt, '', response, now_time, '', False))
    conn.commit()
    conn.close()

def check_language(prompt):
    translator = Translator()
    detect = translator.detect(prompt)
    print('LANGUAGE DETECTED: ',detect)
    if detect == 'fa':
        return 'Farsi'
    else:
        return 'NotFarsi'
    
def translate_prompt(prompt,dest):
    translator = googletrans.Translator()
    translation = translator.translate(prompt,dest)
    print('FULL TRANSLATION OUT', translation)
    print(translation.__dict__()["text"])
    return translation.__dict__()["text"]