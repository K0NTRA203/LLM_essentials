import React, {useRef, useState, useEffect } from 'react';
import {Checkbox, Modal, Layout, Menu, Input, Card, Button,Space,ConfigProvider,theme} from 'antd';
import {DeleteRowOutlined, FormatPainterOutlined, InteractionOutlined} from '@ant-design/icons';
// import { io } from "https://cdn.socket.io/4.3.2/socket.io.esm.min.js";
import io from 'socket.io-client';

const { Content, Sider } = Layout;
const { TextArea } = Input;

const Form = () => {
  const [history, setHistory] = useState('1');
  const [result, setResult] = useState('');
  const [prompt, setPrompt] = useState('');
  const [names, setNames] = useState([]);
  const [messages, setMessages] = useState([]);
  const [name, setName] = useState('');
  const [butt, setButt] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [loadingVisible, setLodalVisible] = useState(false);
  const [conversationID, setConversationID] = useState('');
  const [parentID, setParentID] = useState('');
  const [showConversationIDField, setShowConversationIDField] = useState(false);
  const [start, setStart] = useState('');
  const [chunks, setChunks] = useState('');
  const [checked, setChecked] = useState(true);   
  const [isLoading, setIsLoading] = useState(false);  
  const [socket, setSocket] = useState(null);
  const toggleChecked = () => {
    setChecked(!checked);
  };
  
  useEffect(() => {
    const socket = io('http://localhost:3002');
    setSocket(socket);
    setStart('started');
    console.log('GPT Connected to the server!');
    
  
    socket.on("disconnect", () => {
      console.log("GPT Disconnected");
    });
  
    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);
  
  useEffect(() => {
    if (socket) {
      socket.emit("gpt_messages", { name, history });
      console.log('requesting msgs')
    }
  }, [name, history, result]);
  if (socket) {
    socket.on("msgs", data => {
      console.log('msgs came')
      setMessages(data.result);
      setResult('');
      console.log(data)
    });
  }



  useEffect(() => {
    
    if (socket) {

    socket.emit("gpt_names");
    console.log('asking names')}
  }, [name, start]);
  if (socket) {

  socket.on("conversation_names", data => {
    console.log('names came')
    setNames(data.name);
    console.log(data)
  })};

  const cardRef = useRef();
  useEffect(() => {
    cardRef.current.scrollTo(0, cardRef.current.scrollHeight);
  }, [messages])


  const cards = Array.isArray(messages) && messages.length ? messages.map(message => {
    console.log('managing history cards..');
    return (
      <div>
        <div>
          <br></br>
          <Card style={{fontFamily:'monospace', color:'white', backgroundColor: '#000032'}} >        
            <div dangerouslySetInnerHTML={{__html: '🧠: ' + message.user_prompt.replace(/\n/g, '<br />')}} />
          </Card>
          <Card style={{fontFamily:'monospace', color:'white', backgroundColor: '#000032'}} >        
            <p>🤖</p>
            <div dangerouslySetInnerHTML={{__html: message.response.replace(/\n/g, '<br />')}} />
          </Card>
        </div>
      </div>
    );
  }) : null;

  const handleDeleteName = async () => {
    try {
      socket.emit('delete_gpt_name', { 'name': name });
      handleDeleteModalCancel();
    } catch (err) {
      console.error(err);
    } 
  };
  if (socket) {

  socket.on('delete_names', data => {
    console.log('deleted_and_came');
    // INJA INJA INJA INJA
    socket.emit("gpt_names");
    console.log(data)
  })};
  // "new_name_created"
  if (socket) {

  socket.on('new_name_created', data => {
    console.log('name_created_and_came');
    // INJA INJA INJA INJA
    socket.emit("gpt_names");
    console.log(data)
  })};
  const handleNewChatClick = () => {
    setModalVisible(true);
  };
  const handleModalConfirm = () => {
    setModalVisible(false);
    setShowConversationIDField(false);
    socket.emit('new_gpt_name', { 'name': name, 'conversation_id': conversationID, 'parent_id': parentID });
    // socket.emit("gpt_names");
  };
  const handleModalCancel = () => {
    setModalVisible(false);
  };
  const handleDeleteModalCancel = () => {
    setDeleteModalVisible(false);
  };
  const handleNameChange = e => {
    setName(e.target.value);
  };
  
  const handleConversationIDChange = (event) => {
    setConversationID(event.target.value);
  };

  const handleParentIDChange = (event) => {
    setParentID(event.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setButt(true);
    setIsLoading(true);
    socket.emit("gpt", {
      'name':name,
      'prompt':prompt,
      // 'conversation_id': conversationID,
      // 'parent_id':parentID,
    });
    socket.on("chunks", data => {
      console.log('chunks came');
      setIsLoading(false);
      setButt(false);
      setPrompt('');
      setChunks(data.chunk);
      console.log(data);
    });
    socket.on("response", data => {
      console.log('res came');
      setIsLoading(false);
      setButt(false);
      setPrompt('');
      setResult(data.result);
      console.log(data)
    });
  };
return (
  <ConfigProvider
  style={{fontFamily:'monospace'}}
  theme={{
    algorithm: theme.darkAlgorithm,
    token: {colorPrimary: '#CD0203'},
  }}>
  <Layout style={{fontFamily:'monospace'}}>
  <Sider style={{fontWeight: 700, marginRight: '20px', marginBottom: '20px'}}>
    <Menu style={{fontFamily:'monospace'}}>
          <img
            src= "https://web.archive.org/web/20091027234509im_/http://geocities.com/webtoy/0cssxhtml/pix/bullets/ani-blueman.gif"
            style={{ width: '50%', height: '50%',display: 'block', margin: '0 auto', marginTop: '20px', marginBottom: '20px'}}
          /><br/><br/>
        <Menu.Item key="1" onClick={handleNewChatClick}>New Chat</Menu.Item>
        {names.map(name => (
          <Menu.Item key={name} onClick={() => {setName(name)}} style={{display: 'flex', alignItems: 'center'}}>
              <span style={{flex: 1, textAlign: 'left'}}>{name + '    '}</span>
              <DeleteRowOutlined onClick={() => setDeleteModalVisible(true)} style={{cursor: 'pointer',flex: 1, textAlign: 'right'}}/>
          </Menu.Item>
        ))}
    </Menu>
    <label>
      <br/><br/>History:<br/>
      <Input type="number" value={history}
        onChange={e => {setHistory(e.target.value)}} min={1} max={10}/>
    </label><br/><br/><br/>
      <label><h>...</h>
     <FormatPainterOutlined style={{height:'20px', width:'20px', marginBottom:'100px'}}/>
     <InteractionOutlined />
    </label>
  </Sider>

  <Modal
    title={`YOU ARE DELETING ${name}`}  
    open={deleteModalVisible}
    onOk={handleDeleteName}
    onCancel={handleDeleteModalCancel}>
  </Modal>
  <Modal style={{fontFamily:'monospace'}}
        title="New Conversation"
        open={modalVisible}
        onOk={handleModalConfirm}
        onCancel={handleModalCancel}>
    <Input placeholder='Name' value={name} onChange={handleNameChange} />
    <p>
    <Input style={{width:'95%'}} disabled={!checked} placeholder='Existing Conv ID' value={conversationID} onChange={handleConversationIDChange} />
    <Input style={{width:'95%'}} disabled={!checked} placeholder='Existing Parent ID' value={parentID} onChange={handleParentIDChange} />
    <Checkbox style={{marginTop:'5px', float:'right'}} checked={checked} onChange={() => toggleChecked()} title="Custom ID" />
    </p>
  </Modal>

  <Content style={{fontFamily:'monospace', marginRight:20}}>
    <form onSubmit={handleSubmit}>
      <Space direction="vertical" size="small" style={{ display: 'flex' }}>
        <Card ref={cardRef} title={name} value={result} style={{fontFamily:'monospace', height: 'calc(100vh * 0.66)', overflow: 'auto', maxHeight: 'calc(100vh * 0.66)', overflowY: 'scroll'  }}>
          {cards}
          {/* {result} */}
        </Card> 
        <div> 
        <Card style={{ height: 'calc(100vh * 0.3)' }}>
          <TextArea style={{height: 'calc(100vh * 0.15)', backgroundColor:'black'}} value={prompt} showCount maxLength={100000}
            onChange={e => setPrompt(e.target.value)}
            onKeyPress={e => { if (e.key === 'Enter') handleSubmit(e); }} />
          <br/>
          <Button onClick={handleSubmit} style={{height: 'calc(100vh * 0.05)', minHeight: '20px'}} loading={isLoading} disabled={butt} type="primary" htmlType="submit">Send</Button>
        </Card>
        </div> 
      </Space> 
    </form>
  </Content>

          <br />
</Layout>
</ConfigProvider>
  );
};
export default Form;