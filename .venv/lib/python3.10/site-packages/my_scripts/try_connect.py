import os
import pinecone
# from dotenv import load_dotenv
# load_dotenv()
from time import sleep

# pinecone.init(os.environ["PINECONE_API_KEY"], environment='us-west1-gcp')
pinecone.init()

INDEX_NAME = 'image-hybrid-search'
index = pinecone.Index(INDEX_NAME)
# index.rest_client.pool_manager.connection_pool_kw['timeout'] = 300
print(index.describe_index_stats())

delay = 60
while delay < 4 * 60 * 60:
    sleep(delay)
    if delay < 60 * 20:
        print(delay)
    try:
        index.describe_index_stats()
    except Exception as e:
        print(f"Failed after {delay // 60} minutes")
        raise

    if delay == 60:
        delay = 15 * 60
    else:
        delay += 60
