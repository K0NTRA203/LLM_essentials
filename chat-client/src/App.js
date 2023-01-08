import './App.css';
import { useRef, useState } from 'react';


const App = () => {
  // Create refs for the input elements
  const conversationIdRef = useRef(null);
  const parentMessageIdRef = useRef(null);
  const userPromptRef = useRef(null);

  const handleFormSubmit = (event) => {
    event.preventDefault();

    // Get the values of the input elements
    const conversationId = conversationIdRef.current.value;
    const parentMessageId = parentMessageIdRef.current.value;
    const userPrompt = userPromptRef.current.value;

    // Send a POST request to the server with the input values as the request body
    fetch('http://localhost:3002/chat', {
      method: 'POST',
      body: JSON.stringify({ conversation_id: conversationId, parent_message_id: parentMessageId, user_prompt: userPrompt }),
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => response.json())
      .then((data) => {
        // Update the parentMessageId field and the serverResponse element with the response from the server
        parentMessageIdRef.current.value = data.parent_message_id;
        document.getElementById('serverResponse').innerHTML = data.response;
      });
  };
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ width: '40%' }}>
          <form onSubmit={handleFormSubmit}>
            <label htmlFor="conversationId">Conversation ID:</label>
            <br />
            <input type="text" id="conversationId" ref={conversationIdRef} />
            <br />
            <label htmlFor="parentMessageId">Parent Message ID:</label>
            <br />
            <input type="text" id="parentMessageId" ref={parentMessageIdRef} />
            <br />
            <label htmlFor="userPrompt">User Prompt:</label>
            <br />
            <textarea id="userPrompt" style={{ width: '80%', height: '200px' }} ref={userPromptRef} />
            <br />
            <button type="submit">Send</button>
          </form>
        </div>
        <div style={{ width: '60%', borderLeft: '1px solid black' }}>
          <p>Server Response:</p>
          <div id="serverResponse" style={{ width: '100%', height: '200px', border: '1px solid black', overflow: 'auto' }}></div>
        </div>
      </div>
    </div>
  );
};

export default App;