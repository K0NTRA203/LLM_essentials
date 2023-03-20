import React from 'react';
import { useRef, useState } from 'react';
import FForm from './Form';
import { useHandleConversationNameChange } from './handleConversationNameChange';
import Playground from './Playground';
import Embedding from './Embedding.js';
import GPT from './GPT.js';
import { Space, Menu, Button, Layout, theme, ConfigProvider, Dropdown } from 'antd';
import { Content, Footer } from 'antd/es/layout/layout';
const { Sider } = Layout;
const { Item: MenuItem } = Menu;




const App = () => {
  // Create refs for the input elements
  const conversationIdRef = useRef(null);
  const parentMessageIdRef = useRef(null);
  const userPromptRef = useRef(null);
  const convNameRef = useRef(null);
  const [page, setPage] = useState('playground');
  const { conversationName, handleConversationNameChange } = useHandleConversationNameChange(
    conversationIdRef,
    parentMessageIdRef
  );

  const handlePageChange = (page) => {
    setPage(page);
  };

  const items = [
    {
      key: '1',
      label: 'Chat Page',
      onClick: () => handlePageChange('conversation'),
    },
    {
      key: '2',
      label: 'Playground Page',
      onClick: () => handlePageChange('playground'),
    },
    {
      key: '3',
      label: 'Embedding Page',
      onClick: () => handlePageChange('embedding'),
    },
    {
      key: '4',
      label: 'GPT',
      onClick: () => handlePageChange('GPT'),
    },
  ];

<Content style={{ height: "100vh" }}   
  theme={{
    algorithm: theme.darkAlgorithm,
    token: {
      colorPrimary: '#0203CD'
    },
  }}>

  <Layout  style={{ height: "100vh" }}>
    <div className="header">

      {page === 'conversation' && <FForm handlePageChange={handlePageChange} />}
      {page === 'playground' && <Playground handlePageChange={handlePageChange} />}
      {page === 'embedding' && <Embedding handlePageChange={handlePageChange} />}
      {page === 'GPT' && <GPT handlePageChange={handlePageChange} />}
    </div>
  </Layout>
</Content>;

  return (
    // <html style={{ height: '100%' colorPrimary: 'black'}}>
      <ConfigProvider
        style={{  fontFamily: 'monospace', height: "100vh" }}
        theme={{
          algorithm: theme.darkAlgorithm,
          token: {
            colorPrimary: '#0203CD',
          },
        }}
      >

        <Content style={{ height: "100vh" }}>
          <Layout style={{ height: "100vh" }}>

                {page === 'conversation' && (
                  <div className="header">
                    <Dropdown menu={{items}} >
                      <a onClick={(e) => e.preventDefault()}>
                        <Space>
                        <img
                          src= "https://gcdnb.pbrd.co/images/UQSd7bsh4Nvx.png"
                          style={{ width: '70%', height: '70%',display: 'block', margin: '0 auto', marginTop: '5px', marginBottom: '5px'}}
                        />                        </Space>
                      </a>
                    </Dropdown>
                <FForm handlePageChange={handlePageChange}/>
                    </div>
              )}
            
              {page === 'playground' && (
                  <div className="header">
                    <Dropdown menu={{items}}>
                      <a onClick={(e) => e.preventDefault()}>
                        <Space>
                        <img
                          src= "https://gcdnb.pbrd.co/images/UQSd7bsh4Nvx.png"
                          style={{ width: '70%', height: '70%',display: 'block', margin: '0 auto', marginTop: '5px', marginBottom: '5px'}}
                        />     
                        </Space>
                      </a>
                    </Dropdown>
                <Playground handlePageChange={handlePageChange}/>
                </div>
                )}

              {page === 'embedding' && (
                  <div className="header">
                    <Dropdown menu={{items}}>
                      <a onClick={(e) => e.preventDefault()}>
                        <Space>
                        <img
                          src= "https://gcdnb.pbrd.co/images/UQSd7bsh4Nvx.png"
                          style={{ width: '70%', height: '70%',display: 'block', margin: '0 auto', marginTop: '20px', marginBottom: '20px'}}
                        />     
                        </Space>
                      </a>
                    </Dropdown>
                <Embedding handlePageChange={handlePageChange}/>
                </div> )}

              {page === 'GPT' && (
                  <div className="header">
                    <Dropdown menu={{items}}>
                      <a onClick={(e) => e.preventDefault()}>
                        <Space>
                        <img
                          src= "https://gcdnb.pbrd.co/images/UQSd7bsh4Nvx.png"
                          style={{ width: '70%', height: '70%',display: 'block', margin: '0 auto', marginTop: '20px', marginBottom: '20px'}}
                        />                             </Space>
                      </a>
                    </Dropdown>
                </div>)}
            </Layout>
          </Content>
      </ConfigProvider>
    // </html>
  );
};

export default App;