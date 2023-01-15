import React, { useState, useEffect } from 'react';
import { Modal, Layout, Menu, Input, Slider, Card, Button,Space} from 'antd';

const { Content, Sider } = Layout;

const Playground = () => {
  const [engine, setEngine] = useState('babbage:2020-05-03');
  const [maxTokens, setMaxTokens] = useState(100);
  const [n, setN] = useState(1);
  const [stop, setStop] = useState('');
  const [temp, setTemp] = useState(0.5);
  const [history, setHistory] = useState(1);
  const [result, setResult] = useState('');
  const [prompt, setPrompt] = useState('');
  const [names, setNames] = useState([]);
  const [name, setName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

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
         
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      setResult(data.result);
    } catch (err) {
      console.error(err);
    }
  };
return (
    <Layout>
<Sider>
  <Menu>
    <Menu.Item key="1" onClick={handleNewChatClick}>New Chat</Menu.Item>
    {names.map(name => (
      <Menu.Item key={name}>{name}</Menu.Item>
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

      
<Content>
<Space direction="vertical" size="large" style={{ display: 'flex' }}>
      <Card title={name} height='50%' value={result}>
       
        </Card>
    
        
      <div>
          <Card>
            <Input value={prompt} onChange={e => setPrompt(e.target.value)} />
            
            <Button type="primary" onClick={() => setPrompt('')}>
              Send
            </Button>
          </Card>
        </div>
  </Space>
</Content>
        <Sider>
        <form onSubmit={handleSubmit}>
          <label>
            Engine:
            <select value={engine} onChange={e => setEngine(e.target.value)}>
              <option value="babbage:2020-05-03">Babbage 2020-05-03</option>
              <option value="curie:2020-05-03">Curie 2020-05-03</option>
              <option value="davinci:2020-05-03">Davinci 2020-05-03</option>
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
              onChange={e => setHistory(e.target.value)}
              min={1}
              max={10}
            />
          </label>
          <br />
          <Button type="primary" htmlType="submit">
            Send
          </Button>
        </form>
     

      </Sider>
    </Layout>
  );
};
export default Playground;