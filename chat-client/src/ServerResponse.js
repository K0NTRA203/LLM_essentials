
import React from 'react';

const ServerResponse = () => (
    <div style={{ width: '90%',height: '90%', borderLeft: '1px solid red' }}>
      <p>Server Response:</p>
      <div id="serverResponse" style={{ width: '100%', height: '100px', border: '1px solid black', overflow: 'auto' }}></div>
    </div>
  );

export default ServerResponse;