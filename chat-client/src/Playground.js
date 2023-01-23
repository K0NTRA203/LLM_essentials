import React, {useRef, useState, useEffect } from 'react';
import {Checkbox, Modal, Layout, Menu, Input, Slider, Card, Button,Space} from 'antd';


const { Content, Sider } = Layout;
const { TextArea } = Input;
const Playground = () => {
  const [engine, setEngine] = useState('babbage:2020-05-03');
  const [maxTokens, setMaxTokens] = useState(100);
  const [n, setN] = useState(1);
  const [stop, setStop] = useState('');
  const [temp, setTemp] = useState(0.5);
  const [history, setHistory] = useState('1');
  const [result, setResult] = useState('');
  const [prompt, setPrompt] = useState('');
  const [names, setNames] = useState([]);
  const [messages, setMessages] = useState([]);
  const [tick, setTick] = useState(false);

  
  
  
  const [name, setName] = useState('');
  const [butt, setButt] = useState(false);
  const cardRef = useRef();
  // On component mount
  useEffect(() => {
    cardRef.current.scrollTo(0, cardRef.current.scrollHeight);
  }, [messages])

  const [modalVisible, setModalVisible] = useState(false);
  useEffect(() => {
    fetchMsgs();
    
  }, [name, history,result]);
  const cards = messages.map(message => {
    console.log('salam');
    
    return (
      <div>
      <div>
        <Card style={{backgroundColor: '#c9f0ef'}}>
          
          <p>🧠: {message.prompt} </p>
        </Card>
      </div>
      <br></br>
      <div>
        <br></br>
        <Card style={{backgroundColor: '#fbffba'}}>
          <p>🤖: {message.best_choice_text}</p>

        </Card>
      </div>
      </div>
    );
  });
  const fetchMsgs = async () => {

    try {
      
      if(!name || !history) return 
      console.log(history)
      const res = await fetch(`http://localhost:3002/playground/messages?name=${name}&x=${history}`);
      const data = await res.json();
      setMessages(data.messages);
      // setEngine(data.engines);
      console.log(messages)
    } catch (err) {
      console.error(err);
    }
}

// useEffect(() => {
  
    
//     fetchMsgs()
//   });





  const fetchNames = async () => {
    try {
      const res = await fetch('http://localhost:3002/playground/names');
      
      const data = await res.json();
      console.log(data.name)
      setNames(data.name);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    
    fetchNames();
 
  }, []);

  const handleNewChatClick = () => {
    setModalVisible(true);
  };
  const handleModalConfirm = () => {
    setModalVisible(false);
  };
  const handleModalCancel = () => {
    setModalVisible(false);
  };
  
  const handleNameChange = e => {
    setName(e.target.value);
  };
  

  const handleSubmit = async e => {
    e.preventDefault();
    setButt(true);
    
    try {
      
      const res = await fetch('http://localhost:3002/playground', {
        method: 'POST',
        body: JSON.stringify({
          name,
          engine,
          prompt,
          maxTokens,
          n,
          stop,
          temp,
          tick
         
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(() => {
        fetchMsgs();
        setPrompt('');
        setButt(false);
     });
      const data = await res.json();
      setResult(data.result);
    } catch (err) {
      console.error(err);
    }
  };
return (
    <Layout>
      
<Sider theme='light' style={{backgroundColor: '#e8dcec'}}>
  <Menu style={{backgroundColor: '#d4d4d4'}}>
    <Menu.Item key="1" onClick={handleNewChatClick}>New Chat</Menu.Item>
    {names.map(name => (
      <Menu.Item key={name} onClick={() => {setName(name); fetchMsgs()}}>{name}</Menu.Item>
      ))}
  </Menu>
</Sider>
<Modal
  title="Enter a name"
  open={modalVisible}
  onOk={handleModalConfirm}
  onCancel={handleModalCancel}
>
  <Input value={name} onChange={handleNameChange} />
</Modal>

      
<Content style={{backgroundColor: '#d4d4d4'}}>
<form onSubmit={handleSubmit}>
  <Space direction="vertical" size="large" style={{ display: 'flex' }}>
    <Card ref={cardRef} title={name} height='50%' value={result} style={{ height: '400px', overflow: 'auto' }}> {cards} </Card> 
    <div> 
      <Card style={{backgroundColor: '#f0ecec'}}>
         {/* <Input value={prompt} onChange={e => setPrompt(e.target.value)} /> */} 
         <> 
         <TextArea value={prompt} showCount maxLength={100000} onChange={e => setPrompt(e.target.value)} onKeyPress={e => {if (e.key === 'Enter') handleSubmit(e);}} /> 
         <br /> <br /> 
         
         </>
        <Button disabled={butt} type="primary" htmlType="submit">Send</Button>
      </Card> 
        </div> 
        </Space> </form>
</Content>
        <Sider style={{backgroundColor: '#e8dcec'}}>
        <form onSubmit={handleSubmit}>
          <label>
            Engine:
            <select value={engine} onChange={e => setEngine(e.target.value)}>
              <option value="babbage:2020-05-03">Babbage 2020-05-03</option>
              <option value="text-davinci-003">davinci</option>

              <option value="curie:2020-05-03">Curie 2020-05-03</option>
              <option value="davinci:2020-05-03">Davinci 2020-05-03</option>
              <option value="davinci-qanoon-fa">QANOON-FARSI</option>
              <option value="davinci-qanoon-en">QANOON-ENGLISH</option>
              
            </select>
          </label>
          <br />
          <label>
            Max Tokens:
            <Input
              type="number"
              value={maxTokens}
              onChange={e => setMaxTokens(e.target.value)}
            />
          </label>
          <br />
          <label>
            N:
            <Input type="number" value={n} onChange={e => setN(e.target.value)} min={1} max={5} />
          </label>
          <br />
          <label>
            Stop:
            <Input
              type="text"
              value={stop}
              onChange={e => setStop(e.target.value)}
              maxLength={5}
            />
          </label>
          <br />
          <label>
            Temperature:
            <Slider style={{backgroundColor: '#e8dcec'}}
              value={temp}
              onChange={setTemp}
              min={0}
              max={1}
              step={0.1}
            />
          </label>
          <br />
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
          <br />
    
        </form>
     

      </Sider>
    </Layout>
  );
};
export default Playground;