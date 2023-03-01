import openai
import os 
import sqlite3
import googletrans
from googletrans import Translator
import time
from langchain import OpenAI
# import pinecone
# def pinecone_init(name='sina'):
#     pinecone.init(api_key="57ff5a50-5430-4296-8ca1-3155e82d2b8c", environment="us-west1-gcp")
#     # pinecone.create_index(name, dimension=1536, metric='euclidean', pod_type='p1')

# # check if index already exists (it shouldn't if this is first time)
#     if name not in pinecone.list_indexes():
#         # if does not exist, create index
#         pinecone.create_index(
#             name,
#             dimension=1536,
#             metric='cosine',
#             # metadata_config={'indexed': ['channel_id', 'published']}
#         )
#     print('^^^^^^^^^^^PINECONE INDEXES: ',pinecone.list_indexes)
#     return

openai.api_key = os.environ['OPENAI_KEY']
from gpt_index import GPTSimpleVectorIndex, SimpleDirectoryReader, GPTKeywordTableIndex, LLMPredictor, PromptHelper

def import_knowledge(folder):
    documents = SimpleDirectoryReader(folder).load_data()
    print(type(documents), 'KNOWLEDGE IMPORTED')
    return documents

###################################
# q.txt used 21000 embedding tokens
#civil_code took 81000 tokens
#sina codes took 100700 tokens
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
    max_input_size = 2000
    embedding_limit = 2
    # # set number of output tokens
    num_output = 300
    # # set maximum chunk overlap
    max_chunk_overlap = 1
    chunk_size_limit = 20
    prompt_helper = PromptHelper(embedding_limit=embedding_limit, num_output=num_output, chunk_size_limit=chunk_size_limit, max_input_size=max_input_size, max_chunk_overlap=max_chunk_overlap)
    # index = GPTSimpleVectorIndex.load_from_disk(location,llm_predictor=llm_predictor, prompt_helper=prompt_helper)    
    # index = GPTSimpleVectorIndex.load_from_disk(location,prompt_helper=prompt_helper)    
    index = GPTSimpleVectorIndex.load_from_disk(location,prompt_helper=prompt_helper) 
    
    print(location,' LOADED')
    return index

def query(prompt):
    # index = import_vectors('knowledge/civil_code.json')
    index = import_vectors('knowledge/code_knowledge/sina_codes.json')




    response = index.query(prompt,response_mode = 'compact',similarity_top_k=5)
    print(response)
    print('SOURCE NODES',response.source_nodes)
    # formatted sources
    print('FORMATTED SOURCES',response.get_formatted_sources())
    return response

def response_to_db(name, response, engine, prompt, tokens=''):
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    print(response)
    now_time = int(time.time())
    c.execute("CREATE TABLE IF NOT EXISTS playground(id TEXT, name TEXT, model TEXT, prompt TEXT, all_choices TEXT, best_choice_text TEXT, time INTEGER, tokens INTEGER, tick BOOL)")
    c.execute("INSERT INTO playground (id, name, model, prompt, all_choices, best_choice_text, time, tokens, tick) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", ('',name, engine, prompt, '', response, now_time, tokens, False))
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
# documents = import_knowledge('code_knowledge')
# vectorize_knowledge(documents,'code_knowledge/sina_codes.json')