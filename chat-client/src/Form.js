import React, {useRef, useState, useEffect } from 'react';
import {Checkbox, Modal, Layout, Menu, Input, Slider, Card, Button,Space,ConfigProvider,theme} from 'antd';
import {
  DeleteRowOutlined
} from '@ant-design/icons';
import { blue } from '@ant-design/colors';


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
  const cardRef = useRef();
  // On component mount
  useEffect(() => {
    cardRef.current.scrollTo(0, cardRef.current.scrollHeight);
  }, [messages])

  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [loadingVisible, setLodalVisible] = useState(false);

  useEffect(() => {
    fetchMsgs();
    fetchNames();
  }, [name, history,result]);
  const cards = messages.map(message => {
    console.log('salam');
    
    return (
      <div>
        <div>
          <br></br>
          <Card style={{fontFamily:'monospace', color:'white', backgroundColor: '#000032'}} >        
            <div dangerouslySetInnerHTML={{__html: '🧠: ' + message.user_prompt.replace(/\n/g, '<br />')}} />
          </Card>

          <Card style={{fontFamily:'monospace', color:'white', backgroundColor: '#000032'}} >        
            <p>🤖</p>
            <p>  <div dangerouslySetInnerHTML={{__html: message.response.replace(/\n/g, '<br />')}} /></p>
          </Card>
        </div>
      </div>
    );
  });


  const fetchMsgs = async () => {

    try {
      
      if(!name || !history) return 
      console.log(history)
      const res = await fetch(`http://localhost:3002/gpt/messages?name=${name}&x=${history}`);
      const data = await res.json();
      setMessages(data.messages);
      // setEngine(data.engines);
      console.log(messages)
    } catch (err) {
      console.error(err);
    }
}


  const fetchNames = async () => {
    try {
      const res = await fetch('http://localhost:3002/gpt/names');
      
      const data = await res.json();
      console.log(data.name)
      setNames(data.name);
    } catch (err) {
      console.error(err);
    }
  }

  const handleDeleteName = async () => {
    try {
      fetch('http://localhost:3002/gpt/names', {
        method: 'DELETE',
        body: JSON.stringify({ conv_name: name }),
        headers: { 'Content-Type': 'application/json' },
      })
      //Refetch the names after deletion
      fetchNames();
      handleDeleteModalCancel();
    } catch (err) {
      console.error(err);
    }
  }
  

  const handleNewChatClick = () => {
    setModalVisible(true);
  };
  const handleModalConfirm = () => {
    setModalVisible(false);
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
  

  const handleSubmit = async e => {
    e.preventDefault();
    setButt(true);
    setPrompt('');
    setLodalVisible(true)

    try {
      
      const res = await fetch('http://localhost:3002/gpt', {
        method: 'POST',
        body: JSON.stringify({
          name: name,
          prompt: prompt,

        }),
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(() => {
        setLodalVisible(false);
        fetchMsgs();
        setPrompt('');
        setButt(false);
        fetchNames();
        
     });
      const data = await res.json();
      setResult(data.result);
    } catch (err) {
      console.error(err);
    }
  };
return (
  <ConfigProvider
  style={{fontFamily:'monospace'}}
  theme={{
    algorithm: theme.darkAlgorithm,
    token: {
      colorPrimary: '#0203CD'
      
      
    },
  }}
  >
    <Layout style={{fontFamily:'monospace'}}>
      
<Sider style={{fontWeight: 700, marginRight: '20px', marginBottom: '20px'}}>
<Menu style={{fontFamily:'monospace'}}>
    <Menu.Item key="1" onClick={handleNewChatClick}>New Chat</Menu.Item>
    {names.map(name => (
      <Menu.Item key={name} onClick={() => {setName(name); fetchMsgs()}} style={{display: 'flex', alignItems: 'center'}}>
          <span style={{flex: 1, textAlign: 'left'}}>{name + '    '}</span>
          <DeleteRowOutlined onClick={() => setDeleteModalVisible(true)} style={{cursor: 'pointer',flex: 1, textAlign: 'right'}}/>
      </Menu.Item>
    ))}
</Menu>

  <label>
            History:
            <Input
              type="number"
              value={history}
              onChange={e => {setHistory(e.target.value); fetchMsgs()}}
              min={1}
              max={10}
          />
          </label>

</Sider>
<Modal
  title={`YOU ARE DELETING ${name}`}  
  open={deleteModalVisible}
  onOk={handleDeleteName}
  onCancel={handleDeleteModalCancel}>
    <Input value={name} onChange={handleNameChange} />
</Modal>
<Modal
  title="Enter a name"
  open={modalVisible}
  onOk={handleModalConfirm}
  onCancel={handleModalCancel}>
    <Input value={name} onChange={handleNameChange} />
</Modal>


<Content style={{fontFamily:'monospace', marginRight:20}}>
  <form onSubmit={handleSubmit}>
    <Space direction="vertical" size="small" style={{ display: 'flex' }}>
      <Card ref={cardRef} title={name} value={result} style={{display: 'list-item' ,backgroundColor: '#000032', height: '400px', overflow: 'auto', marginBottom:'50px' ,fontFamily:'monospace' }}>
        {cards}
        {loadingVisible && (
        <img
          src= "loading.gif"
          style={{ width: '70%', height: '70%',display: 'block', margin: '0 auto', marginTop: '20'}}
          alt="loading"
        />)}
      </Card> 
        <div> 
          <Card >
 
            <TextArea value={prompt} showCount maxLength={100000} 
            onChange={e => setPrompt(e.target.value)}  
            onKeyPress={e => {if (e.key === 'Enter') handleSubmit(e);}} /> 
          <Button disabled={butt} type="primary" htmlType="submit">Send</Button>
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