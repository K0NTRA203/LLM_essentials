import React, {useRef, useState, useEffect } from 'react';
import {Checkbox, Switch, Modal, Layout, Menu, Input, Slider, Card, Button,Space,ConfigProvider,theme} from 'antd';
import {
  DeleteRowOutlined
} from '@ant-design/icons';
import { blue } from '@ant-design/colors';

import AceEditor from "react-ace";
import "ace-builds/src-noconflict/theme-terminal";
import "ace-builds/src-noconflict/mode-python";



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



  const [engine, setEngine] = useState('gpt-3.5-turbo');
  const [maxTokens, setMaxTokens] = useState(10);
  const [n, setN] = useState(1);
  const [stop, setStop] = useState('');
  const [temp, setTemp] = useState(0.5);
  const [histSlider, setHistSlider] = useState(0);
  const [includeHistory, setIncludeHistory] = useState(false);
  const [system, setSystem] = useState('');


  const [tick, setTick] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [socket, setSocket] = useState(null);


  const [lastResult, setLastResult] = useState('sss');
  const [lastQuery,setLastQuery] = useState('');
  const [cards,setCards] = useState([]);
  const [currentCard,setCurrentCard] = useState([]);
  const seperatedres = [];
  const seperatedprompt = [];
  const [chunk,setChunk] = useState('');

  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [loadingVisible, setLodalVisible] = useState(false);
  const [cardVisiblity, setCardVisiblity] = useState(false);


  
  const [name, setName] = useState('');
  const [butt, setButt] = useState(false);
  const cardRef = useRef();
  // On component mount
 

  let isInCodeBlock = false;
  const devideTextAndCode = (txt) => {
    // console.log('whole text', txt);
    
    const txtArr = txt.split('~~~');
    console.log('line arrays',txtArr);
    const result = [];
    let currentTxt = '';
    // let isInCodeBlock = false;
    let currentIndentation = '';
  
    for (let i = 0; i < txtArr.length; i++) {
      const line = txtArr[i];

      if (line === txtArr[i-1]) {
        currentTxt += line.replace(/\n/g, 'd');
    }
      
      if (line === '') {
        currentTxt += '\n';
        continue;
    }
      if (line.startsWith('\n')) {
        // console.log('startswithnewline', line);
        // console.log('currenttextbefore', currentTxt);

        currentTxt = currentTxt.slice(0, -1);

    }

      if (line.startsWith('')) {
        // console.log('startswithnothing', line);
        currentTxt += '\n';
        
      }
      if (line.startsWith('```') || line === '```' || line.endsWith('```') || line === '``') {
        if (isInCodeBlock) {
          // end of code block
          result.push({ type: 'code', content: currentTxt });
          currentTxt = '';
          isInCodeBlock = false;
        } else {
          // start of code block
          if (currentTxt !== '') {
            result.push({ type: 'text', content: currentTxt });
            currentTxt = '';
          }
          isInCodeBlock = true;
        }
      } else {
        if (isInCodeBlock) {
          const newIndentation = line.match(/^\s*/)[0];
          if (newIndentation.length === 0) {
            currentTxt += line.replace(/\n/g, '\n');
          } else if (newIndentation.length >= currentIndentation.length || newIndentation.length <= currentIndentation.length) {
              // console.log('INDENT',line, newIndentation);
              currentTxt += line.replace(/\n/g, '\n');
            currentIndentation = newIndentation;
          } else {
            // currentTxt += line.substring(currentIndentation.length).replace(/\n/g, '\n');
          }
        } else {
          // currentTxt += line.replace(/\n/g, '\n') 
          currentTxt += line.replace(/\n/g, "\n\r") + '<br\>';

        }
      }
    }
    // console.log('CURRENT TEXXXXXT', currentTxt);

    if (currentTxt !== '') {
      result.push({ type: isInCodeBlock ? 'code' : 'text', content: currentTxt });
    }

    return result;  
  }
  function onChange(newValue) {
    console.log("change", newValue);
  }
  
  

  useEffect(() => {
    cardRef.current.scrollTo(0, cardRef.current.scrollHeight);
  }, [messages, currentText])



  const renderAceEditor = (content) => {
    return (
      <div>          
        <AceEditor
          width="100%"
          maxLines={content.match(/\n/g).length + 1}
          mode="python"
          theme="terminal"
          name="blah2"
          readOnly={true}
          fontSize={14}
          showPrintMargin={true}
          showGutter={true}
          highlightActiveLine={false}
          value={content}
          setOptions={{
            enableBasicAutocompletion: false,
            enableLiveAutocompletion: false,
            enableSnippets: false,
            showLineNumbers: true,
            wrapEnabled: true, // Added option for automatic word wrap
            tabSize: 1,
          }}/><br />
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



  useEffect(() => {
    // CURRENT CARD
    console.log('****RENDER****');
    console.log('chunk', chunk);
    const seperatedCurrentPrompt = devideTextAndCode(lastPrompt);
    const seperatedCurrentResponse = devideTextAndCode(currentText);

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

  useEffect(() => {
    // HISTORIC CARDS
    const cards = messages.map(message => {
      console.log('Writing Cards');
      const seperatedres = devideTextAndCode(message.best_choice_text);
      const seperatedprompt = devideTextAndCode(message.prompt);

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
      // console.log(messages);
    } catch (err) {
      console.error(err);
    };
};


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
  
  useEffect(() => {
    if (submit !== 'submitted' || prompt === '') {
      return;
    }
    const url = new URL('http://localhost:3002/gptstream');
    url.searchParams.append('prompt', prompt);
    url.searchParams.append('name', name);
    url.searchParams.append('hist', histSlider);
    url.searchParams.append('system', system);


  
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
        return;
      }
  
      setIsRendered(false);
      setLodalVisible(false);
      setCurrentText(prevText => prevText + dataWithNewline);
      console.log('******CURRENT TEXT IS CHANGING');

    }
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
      <Card >
        <TextArea value={prompt} showCount maxLength={100000} onChange={e => setPrompt(e.target.value)} onKeyPress={e => {if (e.key === 'Enter') handleSubmit()}}  />
        <Button disabled={butt} type="primary" onClick={handleSubmit}>Send</Button>
      </Card> 
      </div> 
    </Space> 
</Content>
<Sider style={{ marginLeft: '20px', fontFamily:'monospace' }} >
        <form style={{padding:'7px'}} onSubmit={handleSubmit}>
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

          <br />
    </Layout>
    </ConfigProvider>
  );
};
export default FForm;