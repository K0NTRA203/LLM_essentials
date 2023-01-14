import React from 'react';
import { useRef, useState } from 'react';
import Porm from './Form';
import ServerResponse from './ServerResponse';
import { useHandleConversationNameChange } from './handleConversationNameChange';

const App = () => {
  // Create refs for the input elements
  const conversationIdRef = useRef(null);
  const parentMessageIdRef = useRef(null);
  const userPromptRef = useRef(null);
  const convNameRef = useRef(null)
  const {conversationName, handleConversationNameChange} = useHandleConversationNameChange(conversationIdRef, parentMessageIdRef);

  return (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
    <div>
        <ServerResponse />
        <Porm conversationIdRef={conversationIdRef} parentMessageIdRef={parentMessageIdRef} userPromptRef={userPromptRef} convNameRef={convNameRef} handleConversationNameChange={handleConversationNameChange} conversationName={conversationName}/>
    </div>
  </div>
  );
};

export default App;