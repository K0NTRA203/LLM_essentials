import { useState } from 'react';

export const useHandleConversationNameChange = (conversationIdRef, parentMessageIdRef) => {
  const [conversationName, setConversationName] = useState('');

  const handleConversationNameChange = (event) => {
    setConversationName(event.target.value);
    parentMessageIdRef.current.value = '';
    conversationIdRef.current.value = '';
  };

  return {
    conversationName,
    handleConversationNameChange,
  };
};
