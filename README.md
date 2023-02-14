# LLM_essentials
Python clone for OpenAi chatgpt/playground with embedding
for sending text streams as they generate on chatgpt website, I had to switch to something other than Flask-Rest. I also tried async-playwright and no luck. so I switch back to synced-playwright and decided to use websocket connections. this branch is now using Eventlet Socket.io.
this version is somehow stable and every ws connection works so I'm putting it up; but text stream still just logs on client, and I'm working on it
