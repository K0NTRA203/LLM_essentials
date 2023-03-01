import requests
import json

def get_access_token(url):
    response = requests.get(url)
    if response.status_code == 200:
        data = json.loads(response.text)
        access_token = data['accessToken']
        return access_token
    else:
        print(f"Error getting access token: {response.status_code}")
        return None
url = "https://chat.openai.com/api/auth/session"
access_token = get_access_token(url)
print(f"Access token: {access_token}")