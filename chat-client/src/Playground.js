import React, {useRef, useState, useEffect, useLayoutEffect } from 'react';
// import { render } from "react-dom";
import { Typography,Switch, Checkbox, Form, Modal, Layout, Menu, Input, Slider, Card, Button, Space, ConfigProvider,theme } from 'antd';
import {
  DeleteRowOutlined
} from '@ant-design/icons';
// import AceEditor from "react-ace";
import "ace-builds/src-noconflict/theme-terminal";
import "ace-builds/src-noconflict/mode-python";
import AceEditorComp from './helper/AceEditor';
import AceInput from './helper/AceEditorInput';
// import TypewriterText from "./helper/Typewriter";
import devideTextAndCode from "./helper/DevideTextAndCode";


const { Content, Sider } = Layout;
const { TextArea } = Input;
// const { Text } = Typography;


const Playground = (props) => {
  // const { handlePageChange } = props;

  const [engine, setEngine] = useState('gpt-3.5-turbo');
  const [maxTokens, setMaxTokens] = useState(10);
  const [n, setN] = useState(1);
  const [stop, setStop] = useState('');
  const [temp, setTemp] = useState(0.5);
  const [histSlider, setHistSlider] = useState(0);
  const [includeHistory, setIncludeHistory] = useState(false);
  const [system, setSystem] = useState('');


  const [history, setHistory] = useState('1');
  const [result, setResult] = useState('');
  const [prompt, setPrompt] = useState('');
  const [names, setNames] = useState([]);
  const [messages, setMessages] = useState([]);
  const [tick, setTick] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
  


  const prettier = require("prettier");
  const tsParser = require("prettier/parser-typescript");
  
  const renderAceEditor = (content) => {
    return (
      <div>          
      <AceEditorComp content={content} />
      </div>  
    );
  };

  // Making cards from recieved messages
  useEffect(() => {
    fetchMsgs();
    fetchNames();
  }, [name, history]);

  function onChange(newValue) {
    console.log("change", newValue);
    setPrompt(newValue);
    console.log(histSlider)
    console.log(includeHistory)
  }

  useEffect(() => {
    const cards = messages.map(message => {
      console.log('Writing Cards');
      const seperatedres = devideTextAndCode(message.best_choice_text, true);
      const seperatedprompt = devideTextAndCode(message.prompt, true);

      const seperatedResCards = seperatedres.map(item => (
        <div key={item.content}>
          {item.type === 'text' && <div dangerouslySetInnerHTML={{ __html: item.content }} />}
          {item.type === 'code' && renderAceEditor(item.content)}
        </div>
      ));
      const seperatedPromptCards = seperatedprompt.map(item => (
        <div key={item.content}>
          {item.type === 'text' && <div dangerouslySetInnerHTML={{ __html: item.content }} />}
          {item.type === 'code' && renderAceEditor(item.content)}
        </div>
      ));
      
      return (
        <div class="scroller"> <p>
          <br></br>
          <Card style={{backgroundColor:'#1a0000', fontFamily: 'monospace'}}>
            🧠: {seperatedPromptCards}
          </Card>
          <Card style={{fontFamily: 'monospace'}}>
          🤖: {seperatedResCards}
          </Card>
          </p>
        </div>
      );
    });

    setCards(cards);
  }, [messages, isRendered,result]);

  const fetchMsgs = async () => {
    try {
      if(!name || !history) return 
      console.log(history)
      const res = await fetch(`http://localhost:3002/playground/messages?name=${name}&x=${history}`);
      const data = await res.json();
      setMessages(data.messages);
      console.log(messages);
    } catch (err) {
      console.error(err);
    };
};

useLayoutEffect(() => {
  cardRef.current.scrollTo(0, cardRef.current.scrollHeight);
  }, [cards, isRendered]);

// Fetching Names
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
          hist: histSlider,
          system: system,
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
          fetchMsgs();
          setPrompt('');
          // COMMENT ABOVE LINE IF USING TYPEWRITER EFFECT
          setResult(data.result);
          cardRef.current.scrollTo(0, cardRef.current.scrollHeight);
        })
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }

return (
  <ConfigProvider
  style={{ height: '100vh', fontFamily:'monospace'}}
  theme={{
    algorithm: theme.darkAlgorithm,
    token: {
      colorPrimary: '#CD0203'
    },
  }}
  >
  <Layout>   
  <Sider style={{ marginRight: '20px', marginBottom: '20px' }}>
  <Menu style={{ backgroundColor:'black', fontFamily:'monospace', fontWeight: 700}}>

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
      <Card class='scroller' ref={cardRef} title={name} value={result} style={{fontFamily: 'monospace', height: 'calc(100vh * 0.66)', overflow: 'auto', maxHeight: 'calc(100vh * 0.66)', overflowY: 'scroll' }}> 
      {cards} 
       {/* {!isRendered && result && (
          <div>
            <br />
            <Card style={{backgroundColor:'#1a0000',fontFamily: 'monospace'}}>
              🧠: {lastQuery}
            </Card>
            <Card style={{fontFamily: 'monospace'}}>
            🤖:<TypewriterText text={result} setIsRendered={setIsRendered} cardRef={cardRef} setPrompt={setPrompt} fetchMsgs={fetchMsgs} />

            </Card>
          </div>
       )} */}
      {/* UNCOMMENT ABOVE CODE FOR TYPEWRITER EFFECT */}
      </Card> 
      
      <div> 
        <Card style={{height: 'auto'}} 
                    onKeyDown={e => {if (e.key === 'Enter' && e.ctrlKey) handleSubmit(e);}}>
          <div style={{ position: 'relative' }}>
            <AceInput prompt={prompt} onChange={onChange} />
            <Button
              disabled={butt}
              type="primary"
              htmlType="submit"
              onClick={handleSubmit}
              style={{ position: 'absolute', top: 10, right: 10 }}>
              Send
            </Button>
          </div>
        </Card> 
      </div> 
    </Space> 
  </Form>
</Content>

<Sider style={{ 
  marginLeft: '20px', 
  fontFamily:'monospace',
  color: 'ED333B' // add color property
}} >
        <form style={{padding:'7px', color: 'ED333B' }} onSubmit={handleSubmit}>
          <label>
            Engine:
            <select value={engine} onChange={e => setEngine(e.target.value)}>
              <option value="gpt-3.5-turbo">ChatGPT API</option>
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
          <br/> <br/>
          <label>
            Temperature:
            <Slider 
              // style={{backgroundColor: '#e8dcec'}}
              value={temp}
              onChange={setTemp}
              min={0}
              max={1}
              step={0.1}
            />
          </label>
          <br/> <br/>
          <label>
            Displaying History:
            <Input
              type="number"
              value={history}
              onChange={e => {setHistory(e.target.value); fetchMsgs()}}
              min={1}
              max={10}
          />
          <br/> <br/>
          <Switch 
              size="small" 
              checked={includeHistory} 
              onChange={() => {
                        setIncludeHistory(!includeHistory);
                        setHistSlider(0);
                        if (!includeHistory) {
                          
                          console.log(histSlider)
                        }
              }}>
            </Switch> 
     
            Remember History
          {includeHistory && (
            <Slider 
              value={histSlider}
              onChange={setHistSlider}
              min={0}
              max={20}
              step={1}
            />
          )}
                    <br/><br/>
            Role:
            <TextArea value={system} 
                    placeholder="You are a helpful agent"
                    autoSize={{ minRows: 3, maxRows: 5 }}
                    onChange={e => setSystem(e.target.value)} />

          </label>
          <br />
        </form>
      </Sider>
      
      
      
    </Layout>
    </ConfigProvider>
  );
};
export default Playground;

