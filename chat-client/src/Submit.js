function handleSubmit(event) {
    event.preventDefault();
    const conversationId = document.getElementById('conversationId').value;
    const parentMessageId = document.getElementById('parentMessageId').value;
    const userPrompt = document.getElementById('userPrompt').value;
    console.log('LOGging')
    // Send a POST request to the server with the input values as the request body
    fetch('http://localhost:3001/chat', {
      method: 'POST',
      body: JSON.stringify({ conversation_id: conversationId, parent_message_id: parentMessageId, user_prompt: userPrompt }),
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => response.json())
      .then((data) => {
        // Update the serverResponse element with the response from the server
        document.getElementById('serverResponse').innerHTML = data.response;
      });
  }