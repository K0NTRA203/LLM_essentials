import pinecone
import multiprocessing as mp
import numpy as np
from multiprocessing.pool import Pool, ThreadPool
from time import sleep

mp.set_start_method('fork')
print(mp.get_start_method())

pinecone.init()

INDEX_NAME = 'image-hybrid-search'
index = pinecone.Index(INDEX_NAME)
print(index.describe_index_stats())

index.query(np.random.random(768).tolist(), top_k=5)

rand_input = np.random.random((20, 768)).tolist()
# print(len(rand_input))

def do_query(vectors):
    # pinecone.init()
    # print(index.configuration.server_variables['index_name'])
    # print(pinecone.Config.API_KEY)
    # sleep(1)
    # res = index.query(vectors, top_k=5).to_dict()
    # print(res)
    # return res
    # return index.describe_index_stats()
    # print(id(index))
    my_index = pinecone.Index(INDEX_NAME)
    return my_index.query(vectors, top_k=5).to_dict()

def get_len(vectors):
    return len(vectors)

# with Pool(4) as mypool:
#     all_res = mypool.map(do_query, rand_input, chunksize=1)
#     # all_res = mypool.map(get_len, rand_input, chunksize=20)
#
# # print(index.describe_index_stats())
#
# print(type(all_res), len(all_res))
# # print(type(all_res[-1]))
# print(all_res)

# mypool = ThreadPool(4)
# mp_index = pinecone.Index(INDEX_NAME, pool_threads=mypool)
mp_index = pinecone.GRPCIndex(INDEX_NAME)
print(len(rand_input))
rand_input = [('id', _, {}) for _ in rand_input]
mp_index.upsert(rand_input)
res = mp_index.query(np.random.random(768).tolist(), top_k = 5)
print(res)
