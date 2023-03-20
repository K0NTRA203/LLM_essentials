import React from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-terminal';

const AceEditorComp = ({ content }) => {
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
          firstLineNumber: 0,
          wrapEnabled: true,
          tabSize: 1,
        }}
      />
      <br />
    </div>
  );
};

export default AceEditorComp;