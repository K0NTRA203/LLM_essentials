import React, { useState } from 'react';
import { Layout, Menu, Input, Slider, Card, Button } from 'antd';

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

  const fetchNames = async () => {
    try {
      const res = await fetch('/playground/names');
      const data = await res.json();
      setNames(data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchNames();
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await fetch('/playground', {
        method: 'POST',
        body: JSON.stringify({
          engine,
          maxTokens,
          n,
          stop,
          temp,
          history
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
          <Menu.Item key="1">New Chat</Menu.Item>
          {names.map(name => (
            <Menu.Item key={name}>{name}</Menu.Item>
          ))}
        </Menu>
      </Sider>
      <Content>
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
        <div>
          <h2>Result:</h2>
          <p>{result}</p>
        </div>
        <div>
          <Card title="Prompt">
            <Input value={prompt} onChange={e => setPrompt(e.target.value)} />
            <Button type="primary" onClick={() => setPrompt('')}>
              Clear
            </Button>
          </Card>
        </div>
      </Content>
    </Layout>
  );
};