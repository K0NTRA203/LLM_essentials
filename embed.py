import os
import tiktoken
import pandas as pd
from openai.embeddings_utils import get_embedding, cosine_similarity
import openai
import numpy as np
df = pd.DataFrame()
import json
import time
from openai_api import playground
from io import StringIO
import PyPDF2
import os
from dotenv import load_dotenv
load_dotenv()

# import pinecone
# piencone.init(api_key='')
# from transformers import AutoModel, AutoTokenizer
# from scipy.spatial import distance
# def upload_to_huggingface(df, embedding_column_name, model_name):
#     """
#     Uploads the embeddings in a specified column of a pandas dataframe to Hugging Face
    
#     :param df: pandas dataframe containing the embeddings
#     :param embedding_column_name: name of the column in the dataframe containing the embeddings
#     :param model_name: name of the Hugging Face model
#     """
#     # Load the model and tokenizer
#     model = AutoModel.from_pretrained(model_name)
#     tokenizer = AutoTokenizer.from_pretrained(model_name)
    
#     for i, text in enumerate(df[embedding_column_name]):
#         # Tokenize the text
#         tokens = tokenizer.tokenize(text)
        
#         # Generate the embedding
#         embedding = model.embed(tokens)[0]
        
#         # Save the embedding and the text index to your data structure
#         df.at[i, "huggingface_embedding"] = embedding
#     print(f"Embeddings have been uploaded to dataframe.")

# def search_huggingface(df, query_embedding, k=10):
    # """
    # Search for the most similar embeddings to a given query embedding in a Hugging Face
    
    # :param df: pandas dataframe containing the embeddings
    # :param query_embedding: embedding to search for similar embeddings
    # :param k: number of similar embeddings to return
    # :return: list of the top k most similar embeddings and the corresponding index
    # """
    # # Get the embeddings from the dataframe
    # embeddings = df['huggingface_embedding'].to_numpy()
   
    # # Compute the cosine similarity between the query embedding and all the embeddings
    # similarities = [1 - distance.cosine(query_embedding, e) for e in embeddings]
    
    # # Get the top k most similar embeddings
    # top_k = sorted(range(len(similarities)), key=lambda i: similarities[i], reverse=True)[:k]
   
    # return [(df.iloc[index]['text'],index) for index in top_k]

# def upload_to_pinecone(df, embedding_column_name, project_name):
#     """
#     Uploads the embeddings in a specified column of a pandas dataframe to a Pinecone project
    
#     :param df: pandas dataframe containing the embeddings
#     :param embedding_column_name: name of the column in the dataframe containing the embeddings
#     :param project_name: name of the Pinecone project
#     """
#     # Connect to Pinecone using your API key
#     pinecone.init(api_key="57ff5a50-5430-4296-8ca1-3155e82d2b8c")

#     # Check if the project already exists
#     existing_project = pinecone.Project.list(name=project_name)
#     if existing_project:
#         project = existing_project[0]
#     else:
#         # Create a new Pinecone project
#         project = pinecone.Project.create(name=project_name)

#     # Get the column of your dataframe containing the embedding data
#     embedding_column = df[embedding_column_name]

#     # Iterate through the rows of the dataframe and upload each embedding to Pinecone
#     for i, embedding in enumerate(embedding_column):
#         pinecone.Example.create(project=project.id, embedding=embedding, metadata={"index": i})

#     print(f"Embeddings have been uploaded to Pinecone project {project_name}.")

#     def upload_to_weaviate(df, embedding_column_name, schema_name, weaviate_url):
    
#     # Uploads the embeddings in a specified column of a pandas dataframe to Weaviate
    
#     # :param df: pandas dataframe containing the embeddings
#     # :param embedding_column_name: name of the column in the dataframe containing the embeddings
#     # :param schema_name: name of the Weaviate schema
#     # :param weaviate_url: url of the Weaviate instance
 
#         for i, embedding in enumerate(df[embedding_column_name]):
#             # Prepare the data to be sent to Weaviate
#             data = {
#                 "class": schema_name,
#                 "embedding": embedding.tolist(),
#                 "index": i
#             }
#             # Send the data to Weaviate
#             response = requests.post(weaviate_url + "/things", json=data)
#             if response.status_code != 201:
#                 print(f"Error uploading embedding {i} to Weaviate: {response.text}")
#         print(f"Embeddings have been uploaded to Weaviate schema {schema_name}.")

# def search_pinecone(project_name, query_embedding, k=10):
#     """
#     Search for the most similar embeddings to a given query embedding in a Pinecone project
    
#     :param project_name: name of the Pinecone project
#     :param query_embedding: embedding to search for similar embeddings
#     :param k: number of similar embeddings to return
#     :return: list of the top k most similar embeddings 
#     """
#     results = pinecone.search(project=project_name, embedding=query_embedding, k=k)
#     return results

# def search_weaviate(schema_name, query_embedding, weaviate_url, k=3):
#     """
#     Search for the most similar embeddings to a given query embedding in Weaviate
    
#     :param schema_name: name of the Weaviate schema
#     :param query_embedding: embedding to search for similar embeddings
#     :param k: number of similar embeddings to return
#     :param weaviate_url: url of the Weaviate instance
#     :return: list of the top k most similar embeddings
#     """
#     # Prepare the search query
#     query = {
#         "query": {
#             "vector": {
#                 "embedding": {
#                     "vector": query_embedding.tolist()
#                 },
#                 "maxResults": k
#             }
#         },
#         "class": schema_name
#     }
#     # Send the search query to Weaviate
#     response = requests.post(weaviate_url + "/things/searches", json=query)
#     if response.status_code != 200:
#         print(f"Error searching in Weaviate: {response.text}")
#         return []
#     # Return the embeddings from the search results
#     return [result["embedding"] for result in response.json()["results"]]

# """DATAFRAME NEEDED FOR THIS PROJECT IS LIKE THIS:
# FILEPATH/PARAGRAPH/KEYWORDS/N_TOKENS/EMBEDDING
# WITH EVERY PARAGRAPH SEPERATED"""
# BUT ITS ALREADY JUST [paragraph, embedding]


def _tiktoken_encoding(df, max_tokens = 50, model = 'cl100k_base'):
    x = 0
    encoding = tiktoken.get_encoding(model)
    df_new = df.copy()
    rows_to_divide = [index for index, row in df_new.iterrows() if len(encoding.encode(row['paragraph'])) > max_tokens]
    while rows_to_divide:
        
        index = rows_to_divide.pop(0)
        print('index', index)
        # try:
        row = df_new.loc[index]
        text = row['paragraph']
    


        
        paragraphs = text.split("\n")
        print ('paragraphs', paragraphs)
        
        for i, paragraph in enumerate(paragraphs):
            print('SPLITTTTT',i,' / ',  x)
            x += 1
            if len(encoding.encode(paragraph)) > max_tokens:
                if not paragraph.strip().startswith("```") and not paragraph.strip().startswith("'''"):
                    half_idx = (len(paragraph) // 2)
                    first_half = paragraph[:half_idx]
                    second_half = paragraph[half_idx:]
                    df_new.at[index, 'paragraph'] = "\n".join(paragraphs[:i] + [first_half] + paragraphs[i+1:])
                    df_new = df_new.append({
                        # 'filepath': row['filepath'],
                        'paragraph': second_half,
                        # 'keywords': row['keywords'],
                        'n_tokens': len(encoding.encode(second_half)),
                        'embedding': row['embedding']
                    }, ignore_index=True)
                    rows_to_divide.append(df_new.index[-1])
                    break
                else:
                    df_new.at[index, 'paragraph'] = "\n".join(paragraphs)
        # except: print('ERRRRRRRRRRRRR')
    return df_new

def _similarity(query,csv_loc, model='text-embedding-ada-002', n=3):
    print('query:',query)

    # loading shit:
    df = pd.read_csv(csv_loc)
  
    df_new= df.copy()
    

    df_new['embedding'] = df.embedding.apply(eval).apply(np.array)

    df_new['similarities'] = df_new.embedding.apply(lambda x: cosine_similarity(x, query))
    res = df_new.sort_values('similarities', ascending=False).head(n)
    return res

def _query_csv(query, csv_address, n = 3):
    openai.api_key = os.environ['OPENAI_KEY']
    query_embedding = get_embedding(query, engine='text-embedding-ada-002')
    x = _similarity(query_embedding,csv_address,n)
   
    x_list = x['paragraph'].tolist()
    x_list = [str(i) for i in x_list]
    x_string = '\n'.join([f'{i+1}. {paragraph}' for i, paragraph in enumerate(x_list)])
    full_prompt = "you are a bot named Reza who helps user with law questions.you should answer users questions according to CONTEXT below.if user asks something that is irrelevent to CONTEXT, answer {I think..} and then answer it from your own knowledge about law.\n CONTEXT:{" + x_string + "} \n question: "+query + '\n answer: '

    # full_prompt = "you are a bot named Ali who helps user to complete their coding projects. Ali answers questions, having in mind the Chat-History provided below.if user asks something that is irrelevent to context below, it means user is not reffering to anything in Chat-History. answer {we haven't talked about that yet but..} and then answer it from your own knowledge about coding to help user finish the project.\n Chat-History:{" + x_string + "} \n question: "+query + '\n answer: '
    print(full_prompt)
    return full_prompt

def jsonl_to_df(jsonl_file, df):
    """
    Add every pair of prompt and completion from a JSONL file to a new 'paragraph' column in a pandas dataframe.
    
    :param jsonl_file: path to JSONL file containing prompt and completion pairs
    :param df: pandas dataframe to add the paragraphs to
    """
    with open(jsonl_file) as f:
        for line in f:
            data = json.loads(line)
            
            prompt = 'question: '+ data['prompt']

            completion = 'answer: ' + data['completion']
            paragraph = prompt + completion
            df = df.append({'paragraph': paragraph}, ignore_index=True)
    return df


def pdf_to_df(pdf_location):
    # Open the pdf file
    with open(pdf_location, 'rb') as pdf_file:
        # create pdf reader object
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        # Create a new dataframe
        df = pd.DataFrame(columns=['paragraph','embedding'])
        # Iterate over all pages of the pdf
        for page_num in range(len(pdf_reader.pages)):
            page = pdf_reader.pages[page_num]
            pdf_text = page.extract_text()
            # Add the extracted text to the 'paragraph' column
            df = df.append({'paragraph':pdf_text}, ignore_index=True)
    return df


def df_add_embedding(df, out_loc = 'knowledge/embedded.csv', model='text-embedding-ada-002'):
    openai.api_key = os.environ['OPENAI_KEY']
    df_new = _tiktoken_encoding(df)
    # Add a delay of 1 second between requests
    for index, row in df_new.iterrows():
        text = row["paragraph"]
        df_new.at[index, 'embedding'] = get_embedding(text, engine=model)
        time.sleep(1)
        print(index, '/', len(df_new))
    df_new.to_csv(out_loc, index=False)
    return df_new

def query_intel(prompt, intel_loc, model, max_tokens):
    
    x = _query_csv(prompt, intel_loc,n=3)
    openai.api_key = os.environ['OPENAI_KEY']
    try:
        res = openai.Completion.create(prompt= x, model=model, max_tokens = max_tokens)
        print(res)
        return res.choices[0]['text'], str(res.usage['total_tokens'])
    except: print('^^^^^OPENAI OVERLOAD^^^^^')

# df_load = pdf_to_df('knowledge/labour_law.pdf')
# df_load = df_add_embedding(df_load,'knowledge/labour_law.csv')
# print(query_intel('whats employers responsibility in case of earthquake in workplace?', 'knowledge/labour_law.csv', 'text-davinci-003', 1000))



########################################################################
# add_prompt_completion_to_df('fine_tune_data/sina_chatgpt2.jsonl', history_df)
# df = pd.DataFrame(columns=['paragraph', 'embedding'])
# df = add_prompt_completion_to_df('fine_tune_data/sina_chatgpt2.jsonl', df)
# df_embedded = df_embedding(df, 'code_knowledge/sina_embedding2.csv')
# print(query_intel('what are user classes in this project?', 'code_knowledge/sina_embedding2.csv', 'text-davinci-003', 1000))
