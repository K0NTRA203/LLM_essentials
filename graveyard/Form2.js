
import React, {useRef, useState, useEffect} from 'react';
import { Button, Modal,Input} from 'antd';

const Form = (props) => {
  const {conversationIdRef, parentMessageIdRef, userPromptRef, convNameRef, handleConversationNameChange, conversationName} = props;
  const [conversationNames, setConversationNames] = useState([]);
  const setConvName = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const newConvRef = useRef();
  
  const showModal = () => {
    setIsModalOpen(true);
   return (
    <>
      <Button type="primary" onClick={showModal}>
        Open Modal
      </Button>
      <Modal title="Basic Modal" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
      
      </Modal>
    </>)};
  const handleOk = () => {
    handleDelete()
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
    setIsAddOpen(false)
  };



  useEffect(() => {
    fetch('http://localhost:3002/names')
      .then(response => response.json())
      .then(data => {
        setConversationNames(data.conversation_names);
      });
  }, []);

  const handleFormSubmit = (event) => {
    event.preventDefault();

    // Get the values of the input elements
    const conversationId = conversationIdRef.current.value;
    const parentMessageId = parentMessageIdRef.current.value;
    const userPrompt = userPromptRef.current.value;
    const convName = convNameRef.current.value;
    

    // Send a POST request to the server with the input values as the request body
    fetch('http://localhost:3002/chat', {
      method: 'POST',
      body: JSON.stringify({ conversation_id: conversationId, parent_message_id: parentMessageId, user_prompt: userPrompt,conversation_name:convName }),
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => response.json())
      .then((data) => {
        // Update the parentMessageId field and the serverResponse element with the response from the server
        parentMessageIdRef.current.value = data.parent_message_id;
        conversationIdRef.current.value = data.conversation_id;
        document.getElementById('serverResponse').innerHTML = data.response;
      });
  };
  
  const handleConfirm = () => {
    setIsModalOpen(false);
    
  };
  
  const handleAdd = () => {
    setIsAddOpen(true);
  };
  const addConfirm = () => {
  
    setIsAddOpen(false);
  };
  
  const handleDelete = (event) => {
    event.preventDefault();

    // Get the value of the selected conversation name
    const convName = convNameRef.current.value;

    // Send a DELETE request to the server with the selected conversation name as the request body
    fetch('http://localhost:3002/chat', {
      method: 'DELETE',
      body: JSON.stringify({ conversation_name: convName }),
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => response.json())
      .then((data) => {
        // Update the conversationNames list with the response from the server
        setConversationNames(data.conversation_names);
      });
  };

return (
<div>
      <form onSubmit={handleFormSubmit}>
        <label htmlFor="convName">Conversation Name:</label>
        <br />
        <select id="convName" ref={convNameRef} value={conversationName} onChange={handleConversationNameChange}>
          {conversationNames.map(name => (
            <option>{name}</option>
          ))}
        </select>
        {isModalOpen ? (
          <>
            
          </>
        ) : (
          <>
   
            <button type="button" onClick={showModal}>-</button>
            <button type="button" onClick={handleAdd}>+</button>
          </>
        )}
        <br />
        <label htmlFor="userPrompt">User Prompt:</label>
        <br />
        <textarea id="userPrompt" style={{ width: '80%', height: '100px' ,left: '50%'}} ref={userPromptRef} />
        
        <Button size='small' shape='circle' onClick={handleFormSubmit}>👀</Button>
        <br />
        <input type="text" id="conversationId" ref={conversationIdRef} disabled/>
        <br />
        <input type="text" id="parentMessageId" ref={parentMessageIdRef} disabled/>
        <br />
        <Modal title={`Confirm Deleting Conversation ${conversationName}`} open={isModalOpen} onOk={handleDelete} onCancel={handleCancel}>
          <p></p>
        </Modal>
        <Modal title='New Chat' open={isAddOpen} onOk={addConfirm} onCancel={handleCancel}>
          <input type="text" id="convName" ref={convNameRef} value={conversationName} onChange={handleConversationNameChange} />
        </Modal>
      </form>
    </div>
  );};
  export default Form;