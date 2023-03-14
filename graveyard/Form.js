import React, {useRef, useState, useEffect } from 'react';
import {Checkbox, Modal, Layout, Menu, Input, Slider, Card, Button,Space,ConfigProvider,theme} from 'antd';
import {
  DeleteRowOutlined
} from '@ant-design/icons';
import { blue } from '@ant-design/colors';


const { Content, Sider } = Layout;
const { TextArea } = Input;
const FForm = (props) => {
  const { handlePageChange } = props;
  const [history, setHistory] = useState('1');
  const [result, setResult] = useState('');
  const [prompt, setPrompt] = useState('');
  const [names, setNames] = useState([]);
  const [messages, setMessages] = useState([]);
  const [submit, setSubmit] = useState('');
  const [currentText, setCurrentText] = useState("");
  const [isRendered, setIsRendered] = useState(false);
  const [lastPrompt, setLastPrompt] = useState('');

  
  const [name, setName] = useState('');
  const [butt, setButt] = useState(false);
  const cardRef = useRef();
  // On component mount
  useEffect(() => {
    cardRef.current.scrollTo(0, cardRef.current.scrollHeight);
  }, [messages, currentText])

  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [loadingVisible, setLodalVisible] = useState(false);

  useEffect(() => {
    fetchMsgs();
    fetchNames();
  }, [name, history]);
  const cards = messages.map(message => {
    // console.log('salam');

    return (
      <div>
        <div>
          <br></br>
          <Card style={{backgroundColor:'#1a0000', fontFamily: 'monospace'}}>
            <div dangerouslySetInnerHTML={{__html: '🧠: ' + message.user_prompt.replace(/\n/g, '<br />')}} />
          </Card>

          <Card style={{backgroundColor:'black', fontFamily: 'monospace'}}>
            <div dangerouslySetInnerHTML={{__html: '🤖: ' + '<br />' + message.response.replace(/\n/g, '<br />')}} />
          </Card>
        </div>
      </div>
    );
  });


  const fetchMsgs = async () => {

    try {
      
      if(!name || !history) return 
      // console.log(history)
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

  function handleSubmit(){
    setSubmit('submitted');
    setCurrentText('');
    setButt(true);
    setLastPrompt(prompt);

  };
  
  useEffect(() => {
    if (submit !== 'submitted' || prompt === '') {
      return;
    }
    const url = new URL('http://localhost:3002/gpt');
    url.searchParams.append('prompt', prompt);
    url.searchParams.append('name', name);
  
    const eventSource = new EventSource(url);
    eventSource.addEventListener('data', handleStream);
    console.log('polling');


    function handleStream(data){
      if (data === 'DONEDONE') {
        setSubmit('unsubmitted')
        eventSource.close();
        setIsRendered(true)
        setButt(false);
        setPrompt('');
        // setCurrentText('');
        setLodalVisible(false);
        
        return;
      }
      setIsRendered(false)

      setLodalVisible(false);}
      eventSource.onmessage = e => {
        const dataWithNewline = e.data.replace(/~~~~/g, '\n');


        console.log(dataWithNewline);
        handleStream(dataWithNewline);
        setCurrentText(prevText => {
          if (dataWithNewline !== 'DONEDONE') {
            return dataWithNewline;
          } else {
            return prevText;
          }
        });
      };
    }, [submit]);

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
    <Layout>
      
    <Sider style={{ backgroundColor:'black', marginRight: '20px', marginBottom: '20px' }}>
    <Menu style={{backgroundColor:'black', fontFamily:'monospace', fontWeight: 700}}>
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
<Modal style={{fontFamily:'monospace'}}
  title={`YOU ARE DELETING ${name}`}  
  open={deleteModalVisible}
  onOk={handleDeleteName}
  onCancel={handleDeleteModalCancel}>
    <Input value={name} onChange={handleNameChange} />
</Modal>
<Modal style={{fontFamily:'monospace'}}
  title="Enter a name"
  open={modalVisible}
  onOk={handleModalConfirm}
  onCancel={handleModalCancel}>
    <Input value={name} onChange={handleNameChange} />
</Modal>
<Space direction="vertical"></Space>


<Content style={{fontFamily:'monospace'}}>
<Space direction="vertical" size="large" style={{ display: 'flex' }}>
      <Card ref={cardRef} title={name} value={result} style={{fontFamily: 'monospace', height: 'calc(100vh * 0.66)', overflow: 'auto', maxHeight: 'calc(100vh * 0.66)', overflowY: 'scroll' }}>
        {cards}

        {/* {currentText && !isRendered && ( */}
          <div>
            <br />
            <Card style={{backgroundColor:'#1a0000',fontFamily: 'monospace'}}>
            <div dangerouslySetInnerHTML={{__html: '🧠: ' + lastPrompt}} />

              {/* 🧠: {prompt} */}
            </Card>
            <Card style={{backgroundColor:'black', fontFamily: 'monospace'}}>
            <div dangerouslySetInnerHTML={{__html: '🤖: ' + '<br />' + currentText}} />

              {/* 🤖: {currentText} */}
            </Card>
          </div>
        {/* )} */}
      </Card>
   
        {loadingVisible && (
        <img
          src= "loading.gif"
          style={{ width: '70%', height: '70%',display: 'block', margin: '0 auto', marginTop: '20px'}}
          alt="loading"
        />)}

      <div> 
      <Card >
        <TextArea value={prompt} showCount maxLength={100000} onChange={e => setPrompt(e.target.value)} onKeyPress={e => {if (e.key === 'Enter') handleSubmit()}}  />
        <Button disabled={butt} type="primary" onClick={handleSubmit}>Send</Button>
      </Card> 
      </div> 
    </Space> 
</Content>

          <br />
    </Layout>
    </ConfigProvider>
  );
};
export default FForm;