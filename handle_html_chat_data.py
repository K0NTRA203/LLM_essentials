import json
import openai
openai.api_key = "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"

# def commit_json_data(location, model='ada', suffix=''):   
#     with open(location) as f:
#         file_id = openai.File.create(file=f, purpose='fine-tune')
#         openai.FineTune.create(object='fine_tune_data/sina_chatgpt2.jsonl', training_file=file_id, model=model, suffix= suffix)
#     status = openai.FineTune.retrieve(id=file_id)
#     return file_id, status
# commit_json_data(location='fine_tune_data/sina_chatgpt2.jsonl',model='davinci',suffix='sina_project')
# status = openai.FineTune.retrieve(id='ft-h0b8eM40gpt7Pe5755MaJclv')
# print(status)
def get_jsonl_tokens(path_to_jsonl):
    #open file and read lines
    with open(path_to_jsonl, 'r') as f:
        jsonl_lines = f.readlines()
    #count the lines
    token_count = len(jsonl_lines)
    #return the number of tokens
    return token_count
print(get_jsonl_tokens('fine_tune_data/sina_chatgpt2_prepared.jsonl'))
def get_finetune_status(id):
    status = openai.FineTune.retrieve(id=id)
    return status

def get_html_parts(html):
    result = {}

    # Parse the HTML into a Python dictionary
    data = json.loads(html)

    # Get the "mapping" part of the HTML
    mapping_data = data["mapping"]

    # Initialize the prompt and completion lists
    prompt_list = []
    completion_list = []

    # Iterate over the mapping data
    for _, v in mapping_data.items():
        # Get the message part of the mapping
        message_data = v["message"]

        # Check if the message is None
        if message_data is not None:
            # Get the content part of the message
            content_data = message_data["content"]

            # Get the parts from the content
            parts = content_data["parts"]

            # Check if the message is from user or assistant
            if message_data["role"] == "user":
                prompt_list.append(parts[0]) # Get the first element of the list
                
            elif message_data["role"] == "assistant":
                completion_list.append(parts[0]) # Get the first element of the list

    for i in range(len(prompt_list)):
        result = {"prompt": prompt_list[i], "completion": completion_list[i]}
        with open("fine_tune_data/sina_chatgpt2.jsonl", "a") as f:
            json.dump(result, f)
            f.write("\n")

    return result

# # Load the HTML content
# with open("fine_tune_data/sina_chatgpt1.html") as f:
#     html = f.read()

# # Get the parts
# parts = get_html_parts(html)

# print(parts)
