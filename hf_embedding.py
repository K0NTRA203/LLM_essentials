import torch
from sentence_transformers import models, SentenceTransformer

def get_embedding_vectors(sentences):
    # Load SBERT pre-trained model
    model = SentenceTransformer('bert-base-nli-mean-tokens')

    # Generate embeddings
    embeddings = model.encode(sentences)

    return embeddings

def upload_to_huggingface(embeddings, name, description):
    # Load SBERT pre-trained model
    model = SentenceTransformer('bert-base-nli-mean-tokens')

    # Wrap embeddings into InputExample object
    examples = [InputExample(texts=[sentence], label=str(idx)) for idx, sentence in enumerate(sentences)]

    # Define Hugging Face dataset
    dataset = datasets.Dataset(examples=examples, model=model)

    # Upload dataset to Hugging Face hub
    dataset.push_to_hub(name=name, description=description)

    return dataset


def query_huggingface(embedding, dataset_name):
    # Load dataset from Hugging Face hub
    embedding_model = models.Transformer(dataset_name)
    pooling_model = models.Pooling(embedding_model.get_word_embedding_dimension())
    model = SentenceTransformer(modules=[embedding_model, pooling_model])
    dataset = datasets.load_dataset(dataset_name)

    # Get the sentence most similar to the input query
    most_similar_idx = model.predict([embedding])[0].argmax()
    most_similar_sentence = dataset[most_similar_idx]['text']

    return most_similar_sentence

