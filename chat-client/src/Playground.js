import React, {useRef, useState, useEffect } from 'react';
import { Checkbox, Form, Modal, Layout, Menu, Input, Slider, Card, Button, Space, ConfigProvider,theme } from 'antd';
import {
  DeleteRowOutlined
} from '@ant-design/icons';

const { Content, Sider } = Layout;
const { TextArea } = Input;
const Playground = () => {
  const [engine, setEngine] = useState('babbage:2020-05-03');
  const [maxTokens, setMaxTokens] = useState(10);
  const [n, setN] = useState(1);
  const [stop, setStop] = useState('');
  const [temp, setTemp] = useState(0.5);
  const [history, setHistory] = useState('1');
  const [result, setResult] = useState('');
  const [prompt, setPrompt] = useState('');
  const [names, setNames] = useState([]);
  const [messages, setMessages] = useState([]);
  const [tick, setTick] = useState(false);
  const [removeLast, setRemoveLast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [start, setStart] = useState('');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [socket, setSocket] = useState(null);
  const [name, setName] = useState('');
  const [butt, setButt] = useState(false);
  const [submit, setSubmit] = useState('');
  const cardRef = useRef();
  const [cards,setCards] = useState([]);
  const [lastResult, setLastResult] = useState('sss');
  const [lastQuery,setLastQuery] = useState('');


  // Scrolling inside the card for every msg update
  function TypewriterText({ text, setIsRendered, cardRef }) {
    const [currentText, setCurrentText] = useState("");
    let i = 0;
    const randomTime = Math.floor(Math.random() * (15 - 10 + 1) + 10);
    useEffect(() => {
      let modifiedText = text.replace(/\n/g, "\n\r");
      modifiedText = modifiedText.replace(/\r/g, "<br />");
  
      const interval = setInterval(() => {
        setCurrentText(modifiedText.slice(0, i));
        i++;
        cardRef.current.scrollTo(0, cardRef.current.scrollHeight);
        if (i > modifiedText.length) {
          clearInterval(interval);
          setPrompt('');
          fetchMsgs();
          setIsRendered(true);
          cardRef.current.scrollTo(0, cardRef.current.scrollHeight);


        }
      }, randomTime);
      return () => clearInterval(interval);
    }, [text]);
    return <p dangerouslySetInnerHTML={{ __html: currentText}} />;
  }

  // Making cards from recieved messages
  useEffect(() => {
    fetchMsgs();
    fetchNames();

  }, [name, history]);

  useEffect(() => {

    const cards = messages.map(message => {
      console.log('Writing Cards');
      return (
        <div>
          <p>
        <br></br>
        <Card style={{backgroundColor:'#1a0000', fontFamily: 'monospace'}}>
          <div dangerouslySetInnerHTML={{ __html: '🧠: ' + message.prompt.replace(/\n/g, '<br />') }} />
        </Card>

        <Card style={{fontFamily: 'monospace'}}>
          <div dangerouslySetInnerHTML={{ __html: '🤖: ' + '<br />' + message.best_choice_text.replace(/\n/g, '<br />') }} />
        </Card>
        </p>
      </div>
      
      );
    });
    setCards(cards);
    cardRef.current.scrollTo(0, cardRef.current.scrollHeight);

}, [messages, isRendered]);

  const fetchMsgs = async () => {
    try {
      if(!name || !history) return 
      console.log(history)
      const res = await fetch(`http://localhost:3002/playground/messages?name=${name}&x=${history}`);
      const data = await res.json();
      setMessages(data.messages);
      // setEngine(data.engines);
      console.log(messages)
      // cardRef.current.scrollTo(0, cardRef.current.scrollHeight);

    } catch (err) {
      console.error(err);
    }
}

// Fetching
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

  const handleDeleteName = async (name) => {
    try {
      await fetch(`http://localhost:3002/playground/names?name=${name}`, {
        method: 'DELETE'
      });
      //Refetch the names after deletion
      fetchNames();
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
  
  const handleNameChange = e => {
    setName(e.target.value);
  };
  function handleSubmit(){
    console.log(prompt,name,engine)
    setButt(true);
    setIsRendered(true);
    
    
    const timeout = ms => new Promise(res => setTimeout(res, ms));
    Promise.race([
      fetch('http://localhost:3002/playground', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt,
          name: name,
          engine: engine,
          maxTokens: maxTokens,
          n: n,
          stop: stop,
          temp: temp,
          tick: tick,
        })
      }),
      timeout(1500000)
    ])
    .then(response => {
      if (response === timeout) {
        setButt(false);
        setResult('Request Timeout');
        cardRef.current.scrollTo(0, cardRef.current.scrollHeight);
      } else {
        response.json().then(data => {
          setLastQuery(prompt);
          setButt(false);

          setIsRendered(false);
          setResult(data.result);
          cardRef.current.scrollTo(0, cardRef.current.scrollHeight);
          console.log(data);
          
        })
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }

return (
  <ConfigProvider
  style={{fontFamily:'monospace'}}
  theme={{
    algorithm: theme.darkAlgorithm,
    token: {
      colorPrimary: '#CD0203'
    },
  }}
  >
  <Layout>    
  <Sider style={{ marginRight: '20px', marginBottom: '20px' }}>
  <Menu style={{ fontFamily:'monospace', fontWeight: 700}}>

        <img
            src= "https://web.archive.org/web/20090903074751im_/http://geocities.com/Area51/Corridor/4492/scale.gif"
            style={{ width: '30%', height: '30%',display: 'block', margin: '0 auto', marginTop: '20px', marginBottom: '20px'}}
          /><br/><br/>
    <Menu.Item key="1" onClick={handleNewChatClick}>New Chat</Menu.Item>
    {names.map(name => (
      <Menu.Item key={name} onClick={() => {setName(name); fetchMsgs()}} style={{display: 'flex', justifyContent: 'space-between'}}>
          {name}
          <DeleteRowOutlined onClick={() => handleDeleteName(name) } style={{float:'right'}}/>
      </Menu.Item>
      ))}
  </Menu>
</Sider>

<Modal
  title="Enter a name"
  open={modalVisible}
  onOk={handleModalConfirm}
  onCancel={handleModalCancel}>
    <Input value={name} onChange={handleNameChange} />
</Modal>

<Space direction="vertical"></Space>    
<Content style={{ fontFamily: 'monospace'}}>
  <Form onSubmit={handleSubmit}>

  <Space direction="vertical" size="large" style={{ display: 'flex' }}>
      <Card ref={cardRef} title={name} value={result} style={{fontFamily: 'monospace', height: 'calc(100vh * 0.66)', overflow: 'auto', maxHeight: 'calc(100vh * 0.66)', overflowY: 'scroll' }}> 
      {cards} 
      {/* {result && */}
       {!isRendered && result && (
          <div>
            <br />
            <Card style={{backgroundColor:'#1a0000',fontFamily: 'monospace'}}>
              🧠: {lastQuery}
            </Card>
            <Card style={{fontFamily: 'monospace'}}>
            🤖:<TypewriterText text={result} setIsRendered={setIsRendered} cardRef={cardRef} />

            </Card>
          </div>
       )}
    
      </Card> 
      
        <div> 
          <Card style={{height: 'calc(100vh * 0.3)'}}>
          <TextArea value={prompt} showCount maxLength={100000} 
            onChange={e => setPrompt(e.target.value)}  
            onKeyPress={e => {if (e.key === 'Enter') handleSubmit(e);}} /> 
            <br /> 
          <Button disabled={butt} type="primary" htmlType="submit">Send</Button>
      </Card> 
        </div> 
    </Space> 
  </Form>
</Content>
<Sider style={{ marginLeft: '20px' }}>
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
              <option value="davinci-sina">davinci-sina</option>
              <option value="labour-law">LABOUR LAW</option>
              <option value="labour-law-fa">LABOUR LAW FARSI</option>
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
    </Layout></ConfigProvider>
  );
};
export default Playground;