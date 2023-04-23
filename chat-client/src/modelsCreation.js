
import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Slider, Layout, Select, Menu } from 'antd';
import AceInput from './helper/AceEditorInput';
import {
    DeleteRowOutlined
  } from '@ant-design/icons';
const { Option } = Select;
const { Content, Sider } = Layout;




const ModelsCreation = () => {
  const [chatbots, setChatbots] = useState([]);
  const [selectedChatbot, setSelectedChatbot] = useState('');


  const [engine, setEngine] = useState('');
  const [maxTokens, setMaxTokens] = useState(100);
  const [n, setN] = useState(1);
  const [stop, setStop] = useState('');
  const [temp, setTemp] = useState(0.5);
  const [system, setSystem] = useState('');
  const [hist, setHist] = useState(2);
  const [libName, setLibName] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [promptArgs, setPromptArgs] = useState('');
  const [name, setName] = useState('');



  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);


  const handleNewChatClick = () => {
    setModalVisible(true);
  };
  const handleDeleteModalCancel = () => {
    setDeleteModalVisible(false);
  };

// const handleDeleteName = async () => {
//   try {
//     console.log('deleting name', name);
//     await fetch(`http://localhost:3002/playground/names?name=${name}`, {
//       method: 'DELETE',
//       headers: {
//         'Access-Control-Allow-Origin': '*',
//         'Content-Type': 'application/json'
//       }
//     });
//     //Refetch the names after deletion
//     fetchChatbots();
//     setDeleteModalVisible(false);
//   } catch (err) {
//     console.error(err);
//   }
// };


  const [form] = Form.useForm();

  const fetchChatbots = async () => {
    try {
      const res = await fetch('http://localhost:3002/chatbotslist');
      const data = await res.json();
      console.log('fetch chatbots');
      setChatbots(data.chatbots_list);
    } catch (err) {
      console.error(err);
    }
  }
  
  useEffect(() => {
    fetchChatbots();
    console.log(chatbots);
  }, []); 

  const onEngineChange = (value) => {

  }

  const onFinish = values => {
    // const { name, engine, maxTokens, n, stop, temp, system, hist, libName, isFocused, promptArgs } = values;
    const data = {
      name: String(name),
      engine: String(engine),
      max_tokens: parseInt(maxTokens),
      n: parseInt(n),
      stop: String(stop),
      temp: parseFloat(temp),
      system: String(system),
      hist: parseInt(hist),
      lib_name: String(libName),
      is_focused: Boolean(isFocused),
      preprompt_args: String(promptArgs)
    };
    fetch('http://localhost:3002/makechatbot', { 
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then(res => {
      if (res.status === 200) {
        alert('Chatbot model created successfully!');
        form.resetFields();
      } else {
        console.log(data);
        alert('Failed to create chatbot model.');
      }
    });
  };

  const onChatbotSliderChange = value => {
    setSelectedChatbot(chatbots[value]);
  };

  function onSystemChange(newValue) {
    // console.log("change", newValue);
    setSystem(newValue);    
  }
  function onArgsChange(newValue) {
    setPromptArgs(newValue);   
    console.log("change", promptArgs);
 
  }

  return (
    <Layout>
    <Sider>
    <Menu style={{backgroundColor:'black', fontFamily:'monospace', fontWeight: 700}}>
      <Menu.Item key="1" onClick={handleNewChatClick}>New Chat</Menu.Item>
      {chatbots.map(name => (
        <Menu.Item key={name} onClick={() => {setName(name)}} style={{display: 'flex', alignItems: 'center'}}>
            <span style={{flex: 1, textAlign: 'left'}}>{name + '    '}</span>
            <DeleteRowOutlined onClick={() => setDeleteModalVisible(true)} style={{cursor: 'pointer',flex: 1, textAlign: 'right'}}/>
        </Menu.Item>
      ))}
    </Menu>
    </Sider>
    <Content>
        {/* <Sider> */}
        <Form
  form={form}
  onFinish={onFinish}
  labelCol={{ span: 6 }}
  wrapperCol={{ span: 12 }}
  initialValues={{
    engine: 'davinci',
    maxTokens: 100,
    n: 1,
    stop: '',
    temp: 0.5,
    system: 'you are a bot',
    hist: true,
    lib_name: '',
    is_focused: false,
    preprompt_args: ''
  }}
>
  <div style={{display: 'flex', justifyContent: 'space-between'}}>
    <div style={{flex: 1, paddingRight: 16}}>
      <Form.Item name="name" label="Model Name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item name="engine" label="Engine">
        <br />
        <label style={{ width: 10 }}>
          <select value={engine} onChange={(e) => setEngine(e.target.value)}>
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
      </Form.Item>

      <Form.Item name="maxTokens" label="Maximum Tokens">
        <Input type="number" />
      </Form.Item>

      <Form.Item name="n" label="Top N">
        <Input type="number" />
      </Form.Item>

      <Form.Item name="stop" label="Stop Words">
        <Input />
      </Form.Item>
      <Form.Item name="system" label="System Role">
        <AceInput prompt={system} onChange={onSystemChange} />
      </Form.Item>

      <Form.Item name="prePrompt" label="Pre-Prompt">
        <AceInput prompt={promptArgs} onChange={onArgsChange} />
      </Form.Item>

    </div>

    <div style={{flex: 1, paddingLeft: 16}}>
      <Form.Item name="temp" label="Temperature">
        <Input type="number" step={0.1} />
      </Form.Item>

      <Form.Item name="system" label="System">
        <Input />
      </Form.Item>

      <Form.Item name="included_history" label="Include History" valuePropName="checked">
        <Input type="checkbox" />
      </Form.Item>

      <Form.Item name="lib_name" label="Library Name">
        <Input />     
      </Form.Item>

      <Form.Item name="is_focused" label="Is Focused" valuePropName="checked">
        <Input type="checkbox" />
      </Form.Item>
      <Form.Item label="Chatbot List">

        <Slider min={0} max={chatbots.length - 1} onChange={onChatbotSliderChange} />
        <div>{selectedChatbot}</div>
      </Form.Item>



    <Form.Item label="">

      <Button type="primary" htmlType="submit">
      Create Model
    </Button>
    </Form.Item>

    </div>
  </div>

</Form>
    {/* </Sider> */}

    </Content>

  <Form.Item wrapperCol={{ offset: 6, span: 12 }}>

  </Form.Item>

    </Layout>
  );
};

export default ModelsCreation;