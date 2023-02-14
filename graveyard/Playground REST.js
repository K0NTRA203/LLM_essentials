import React, { useRef, useState, useEffect,useLayoutEffect} from 'react';
import { Checkbox, Form, Modal, Layout, Menu, Input, Slider, Card, Button, Space, ConfigProvider,theme } from 'antd';
import {
  DeleteRowOutlined
} from '@ant-design/icons';

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
  const [removeLast, setRemoveLast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [butt, setButt] = useState(false);
  const cardRef = useRef();


  // On component mount

  useLayoutEffect(() => {
    cardRef.current.scrollTo(0, cardRef.current.scrollHeight);
  }, [messages])

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(false);

  function TypewriterText({ text, setIsRendered, cardRef }) {
    const [currentText, setCurrentText] = useState("");
    let i = 0;
    const randomTime = Math.floor(Math.random() * (80 - 10 + 1) + 10);
    useEffect(() => {
      let modifiedText = text.replace(/\n/g, "\n\r");
      modifiedText = modifiedText.replace(/\r/g, "<br />");
  
      const interval = setInterval(() => {
        setCurrentText(modifiedText.slice(0, i));
        i++;
        cardRef.current.scrollTo(0, cardRef.current.scrollHeight);
        if (i > modifiedText.length) {
          clearInterval(interval);
          setIsRendered(true);
          fetchMsgs();
          setPrompt('');

        }
      }, randomTime);
      return () => clearInterval(interval);
    }, [text]);
    return <p dangerouslySetInnerHTML={{ __html: currentText}} />;
  }

  useEffect(() => {
    fetchMsgs();
    fetchNames();
  }, [name, history]);
  const cards = messages.map(message => {

    return (
  
        <div>
          <br></br>
          <Card style={{backgroundColor:'#1a0000', fontFamily: 'monospace'}}>

            <div dangerouslySetInnerHTML={{ __html: '🧠: ' + message.prompt.replace(/\n/g, '<br />') }} />
          </Card>

          <Card style={{backgroundColor:'black', fontFamily: 'monospace'}}>
            <div dangerouslySetInnerHTML={{ __html: '🤖: ' + '<br />' + message.best_choice_text.replace(/\n/g, '<br />') }} />




          </Card>
        </div>
    
    );
  });
  const fetchMsgs = async (removeLast = false) => {
    try {
      if (!name || !history) return;
      console.log(history);
      const res = await fetch(`http://localhost:3002/playground/messages?name=${name}&x=${history}`);
      const data = await res.json();
      if (removeLast) {
        setMessages(data.messages.slice(0, -1));
      } else {
        setMessages(data.messages);
        setResult('')
      }
      console.log(messages);
    } catch (err) {
      console.error(err);
    }
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

  const handleDeleteName = async () => {
    try {
      fetch('http://localhost:3002/playground/names', {
        method: 'DELETE',
        body: JSON.stringify({ name: name }),
        headers: { 'Content-Type': 'application/json' },
      }).then(() => {
       
      //Refetch the names after deletion
        fetchNames();
        handleDeleteModalCancel()});
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
  const handleDeleteModalCancel = () => {
    setDeleteModalVisible(false);
  };


  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true)
    setButt(true);
    setIsRendered(false);
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
      });
      const data = await res.json();
      setIsLoading(false)
      setResult(data.result);
      console.log(data.result);
      fetchMsgs(true);
      setButt(false);
      fetchNames();
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
        colorPrimary: '#CD0203'
        
        
      },
    }}
    >
    <Layout>

      <Sider style={{ backgroundColor:'black', marginRight: '20px', marginBottom: '20px' }}>
        <Menu style={{backgroundColor:'black', fontFamily:'monospace', fontWeight: 700}}>

        <img
            src= "https://web.archive.org/web/20090903074751im_/http://geocities.com/Area51/Corridor/4492/scale.gif"
            style={{ width: '30%', height: '30%',display: 'block', margin: '0 auto', marginTop: '20px', marginBottom: '20px'}}
            
          /><br/><br/>
          <Menu.Item key="1" onClick={handleNewChatClick}>New Chat</Menu.Item>
          {names.map(name => (
            <Menu.Item key={name} onClick={() => {setName(name); fetchMsgs()}} style={{display: 'flex', alignItems: 'center'}}>
              <span style={{flex: 1, textAlign: 'left'}}>{name + '    '}</span>
              <DeleteRowOutlined onClick={() => setDeleteModalVisible(true)} style={{cursor: 'pointer',flex: 1, textAlign: 'right'}}/>
            </Menu.Item>
          ))}
        </Menu>
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
<Content style={{ fontFamily: 'monospace'}}>
  <Form onSubmit={handleSubmit}>
    <Space direction="vertical" size="large" style={{ display: 'flex' }}>
      <Card ref={cardRef} title={name} style={{fontFamily: 'monospace', height: 'calc(100vh * 0.66)', overflow: 'auto', maxHeight: 'calc(100vh * 0.66)', overflowY: 'scroll' }}>
        {cards}

        {result && !isRendered && (
          <div>
            <br />
            <Card style={{backgroundColor:'#1a0000',fontFamily: 'monospace'}}>
              🧠: {prompt}
            </Card>
            <Card style={{backgroundColor:'black', fontFamily: 'monospace'}}>
              🤖:<TypewriterText text={result} setIsRendered={setIsRendered} cardRef={cardRef} />
            </Card>
          </div>
        )}
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
  </Form>
</Content>

      <Sider style={{backgroundColor:'black',  marginLeft: '20px' }}>
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
            <Slider
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
              onChange={e => { setHistory(e.target.value); fetchMsgs() }}
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