
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-terminal';
import React from 'react';

export default function AceInput({ prompt, onChange }) {
  return (
    <AceEditor
      onChange={onChange}
      minLines={4}
      width="100%"
      height="100%"
      maxLines={4}
      mode="python"
      theme="terminal"
      name="blah2"
      readOnly={false}
      fontSize={14}
      showPrintMargin={true}
      showGutter={true}
      highlightActiveLine={true}
      wrapEnabled={true}
      value={prompt}
      setOptions={{
        wrapEnabled: true,
        
        enableBasicAutocompletion: false,
        firstLineNumber: 0,
        enableLiveAutocompletion: false,
        enableSnippets: false,
        showLineNumbers: true,
        tabSize: 1,
      }}
    />
  );
}