import React, {useRef, useState, useEffect, memo } from 'react';
import {Switch, Modal, Layout, Menu, Input, Slider, Card, Button,Space,ConfigProvider,theme} from 'antd';
import {
  DeleteRowOutlined
} from '@ant-design/icons';

import AceEditorComp from './helper/AceEditor';
import "ace-builds/src-noconflict/theme-terminal";
import "ace-builds/src-noconflict/mode-python";
// import TypewriterText from "./helper/Typewriter";
import devideTextAndCode from "./helper/DevideTextAndCode";
import AceInput from './helper/AceEditorInput';
import AudioRecorder from './helper/Recording.js';



const { Content, Sider } = Layout;
const { TextArea } = Input;
const FForm = (props) => {
  // const { handlePageChange } = props;
  const [history, setHistory] = useState('1');
  const [result,setResult] = useState('');
  const [prompt, setPrompt] = useState('');
  const [names, setNames] = useState([]);
  const [messages, setMessages] = useState([]);
  const [submit, setSubmit] = useState('');
  const [currentText, setCurrentText] = useState("");
  const [isRendered, setIsRendered] = useState(false);
  const [role, setRole] = useState(false);

  const [lastPrompt, setLastPrompt] = useState('');


  const [engine, setEngine] = useState('gpt-3.5-turbo');
  const [maxTokens, setMaxTokens] = useState(10);
  const [n, setN] = useState(1);
  const [stop, setStop] = useState('');
  const [temp, setTemp] = useState(0.5);
  const [histSlider, setHistSlider] = useState(0);
  const [includeHistory, setIncludeHistory] = useState(false);
  const [system, setSystem] = useState('');


  // const [tick, setTick] = useState(false);
  // const [isLoading, setIsLoading] = useState(false);

  // const [socket, setSocket] = useState(null);


  // const [lastResult, setLastResult] = useState('sss');
  // const [lastQuery,setLastQuery] = useState('');
  const [cards,setCards] = useState([]);
  const [currentCard,setCurrentCard] = useState([]);
  // const seperatedres = [];
  // const seperatedprompt = [];
  const [chunk,setChunk] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [loadingVisible, setLodalVisible] = useState(false);
  const [cardVisiblity, setCardVisiblity] = useState(false);
  // const [historic, setHistoric] = useState(true);

  
  const [name, setName] = useState('');
  const [butt, setButt] = useState(false);
  const cardRef = useRef();
  // On component mount

  // useEffect(() => {
  //   function handleKeyPress(event) {
  //     if (event.shiftKey && event.key === 'R') {
  //       console.log('RR')
  //       setRole(prevRole => !prevRole);
  //     }
  //   }

  //   window.addEventListener('keydown', handleKeyPress);

  //   return () => {
  //     window.removeEventListener('keydown', handleKeyPress);
  //   }
  // }, []);

  

  useEffect(() => {
    cardRef.current.scrollTo(0, cardRef.current.scrollHeight);
  }, [messages, currentText])



  const renderAceEditor = (content) => {
    return (
      <div>          
      <AceEditorComp content={content} />
      </div>  
    );
  };

  useEffect(() => {
    fetchMsgs();
    fetchNames();
    setCardVisiblity(false);
  }, [name, history]);

  function onChange(newValue) {
    console.log("change", newValue);
    setPrompt(newValue);
    console.log(histSlider)
    console.log(includeHistory)
    
  }


  // CURRENT CARD
  useEffect(() => {
    console.log('****RENDER****');
    console.log('chunk', chunk);
    const seperatedCurrentPrompt = devideTextAndCode(lastPrompt, false);
    const seperatedCurrentResponse = devideTextAndCode(currentText, false);

    const seperatedCurrentResCards = seperatedCurrentResponse.map(item => (
      <div key={item.content}>
        {item.type === 'text' && <div dangerouslySetInnerHTML={{ __html: item.content }} />}
        {item.type === 'code' && renderAceEditor(item.content)}
      </div>
    ));
    const seperatedCurrentPromptCards = seperatedCurrentPrompt.map(item => (
      <div key={item.content}>
        {item.type === 'text' && <div dangerouslySetInnerHTML={{ __html: item.content }} />}
        {item.type === 'code' && renderAceEditor(item.content)}
      </div>
    ));
    console.log('*****RES',seperatedCurrentResCards);

    const currentCard =  (
      <div> <p>
        <br></br>
        <Card style={{backgroundColor:'#1a0000', fontFamily: 'monospace'}}>
          🧠: {seperatedCurrentPromptCards}
        </Card>
        <Card style={{fontFamily: 'monospace'}}>
        🤖: {seperatedCurrentResCards}
        </Card>
        </p>
      </div>
      );
      
    console.log('THATS IT',seperatedCurrentPrompt,seperatedCurrentResponse);
    console.log('currentcard', currentCard);
    setCurrentCard(currentCard);
  }, [chunk]);

  useEffect(() => {
      console.log('CURRENT', currentCard);
  }, [currentCard]);

  // HISTORIC CARDS
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
      <div> <p>
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
      // console.log(history)
      
      const res = await fetch(`http://localhost:3002/playground/messages?name=${name}&x=${history}`);
      const data = await res.json();

      setMessages(data.messages);
      console.log('fetch hist');
    } catch (err) {
      console.error(err);
    };
};


const fetchNames = async () => {
  try {
    const res = await fetch('http://localhost:3002/playground/names');
    const data = await res.json();
    console.log('fetch names');
    setNames(data.name);
  } catch (err) {
    console.error(err);
  }
}


const handleDeleteName = async () => {
  try {
    console.log('deleting name', name);
    await fetch(`http://localhost:3002/playground/names?name=${name}`, {
      method: 'DELETE',
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    });
    //Refetch the names after deletion
    fetchNames();
    setDeleteModalVisible(false);
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
    setCardVisiblity(true);
    fetchMsgs();
  };
  
// SUBMITING CHAT PROMPT
  useEffect(() => {
    if (submit !== 'submitted' || prompt === '') {
      return;
    }
    console.log('submitted');
    const url = new URL('http://localhost:3002/gptstream');
    url.searchParams.append('prompt', prompt);
    url.searchParams.append('name', name);
    url.searchParams.append('hist', histSlider);
    url.searchParams.append('system', system);

// GETTING THE RESPONSE
    const eventSource = new EventSource(url);
    eventSource.onmessage = handleStream;
    console.log('polling');
  
    function handleStream(e) {
      const dataWithNewline = e.data;
      console.log('data', dataWithNewline);
      setChunk(dataWithNewline);
      // console.log('chunk',chunk);
  
      if (dataWithNewline === '[DONE]') {
        setSubmit('unsubmitted');
        eventSource.close();
        setIsRendered(true);
        setButt(false);
        setChunk('');
        setPrompt('');
        // setCurrentText('');
        setLodalVisible(false);
        if (includeHistory){setHistSlider(histSlider+1)}
        return;
      }
  
      setIsRendered(false);
      setLodalVisible(false);
      setCurrentText(prevText => prevText + dataWithNewline);
      // console.log('******CURRENT TEXT IS CHANGING');
    }
  }, [submit]);

return (
<ConfigProvider
  // onKeyDown={e => {if (e.key === 'r' && e.shiftKey) setRole(!role);}}
  style={{fontFamily:'monospace'}}
  theme={{
    algorithm: theme.darkAlgorithm,
    token: {
      colorPrimary: '#0203CD'
    },
  }}>
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
      <Card ref={cardRef} title={name} value={result} style={{fontFamily: 'monospace', height: '80vh', overflow: 'auto', maxHeight: 'calc(100vh * 1)', overflowY: 'scroll' }}>
          {cards}
        {cardVisiblity && (
          <div>
          {currentCard}
          </div>
        )}
      </Card>
        {loadingVisible && (
          <img
            src= "loading.gif"
            style={{ width: '70%', height: '70%',display: 'block', margin: '0 auto', marginTop: '20px'}}
            alt="loading"
          />)}
      <div> 
        <div style={{ position: 'relative', height: '20vh', marginBottom:'130px' }}
                      onKeyDown={e => {if (e.key === 'Enter' && e.ctrlKey) handleSubmit(e);}}>
                                    <AudioRecorder/>

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
      </div> 
    </Space> 
</Content>
<Sider className="coloredText" style={{ marginLeft: '20px', fontFamily:'monospace' }} >
        <form style={{padding:'7px', color: '#ED333B' }} onSubmit={handleSubmit}>
          <label className="coloredText">
            Engine:
            <select className="coloredText" value={engine} onChange={e => setEngine(e.target.value) }>
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
            
            <Input className="coloredText"
              type="number"
              value={maxTokens}
              onChange={e => setMaxTokens(e.target.value)}
            />
          </label>
          <br />
          <label>
            N:
            <Input className="coloredText" type="number" value={n} onChange={e => setN(e.target.value)} min={1} max={5} />
          </label>
          <br />
          <label>
            Stop:
            <Input
              className="coloredText"
              type="text"
              value={stop}
              onChange={e => setStop(e.target.value)}
              maxLength={5}
            />
          </label>
          <br/> <br/>
          <label className="coloredText">
            Temperature:
            <Slider
              className="coloredText"
              // style={{backgroundColor: '#e8dcec'}}
              value={temp}
              onChange={setTemp}
              min={0}
              max={1}
              step={0.1}
            />
          </label>
          <br/> <br/>
          <label className="coloredText">
            Displaying History:
            <Input
              className="coloredText"
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
              }}>
            </Switch> 
     
            Remember History
            <Slider
              className="coloredText"
              value={histSlider}
              onChange={setHistSlider}
              min={0}
              max={20}
              step={1}
            />
                    <br/><br/>
                    <Switch 
              size="small" 
              checked={role} 
              onChange={() => {
                        setRole(!role);
              }}>
            </Switch> 
                    Role:
          { role && (
            
            <TextArea value={system} 
                    placeholder="You are a helpful agent"
                    autoSize={{ minRows: 3, maxRows: 5 }}
                    onChange={e => setSystem(e.target.value)} />)}

          </label>
          <br />
        </form>
      </Sider>

          <br />
    </Layout>
  </ConfigProvider>
  );
};
export default FForm;