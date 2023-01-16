import React from 'react';
import { useRef, useState } from 'react';
import Porm from './Form';
import ServerResponse from './ServerResponse';
import { useHandleConversationNameChange } from './handleConversationNameChange';
import Playground from './Playground';
import { Button,Layout} from 'antd';
import { Content, Footer } from 'antd/es/layout/layout';

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

  const handlePageChange = page => {
    setPage(page);
  };

  return (
    <Layout>
      <Content>
    <div >
      <div>
        {page === 'conversation' && (
          <>
            <ServerResponse />
            <Porm
              conversationIdRef={conversationIdRef}
              parentMessageIdRef={parentMessageIdRef}
              userPromptRef={userPromptRef}
              convNameRef={convNameRef}
              handleConversationNameChange={handleConversationNameChange}
              conversationName={conversationName}
            />
          </>
        )}

      </div>
    </div>
    <Layout>
    <Footer>
    {page === 'playground' && <Playground />}
        <Button onClick={() => handlePageChange('conversation')}>Chat page</Button>
        <Button onClick={() => handlePageChange('playground')}>Playground page</Button>
        
    </Footer>
    </Layout>
    </Content>
    </Layout>
    
  );
};

export default App;