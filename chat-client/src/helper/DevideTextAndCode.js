import React from 'react';

const devideTextAndCode = (txt, historic) => {
    // console.log('whole text', txt);
    const txtArr = historic ? txt.split('\n') : txt.split('~~~');
    console.log('line arrays',txtArr);
    const result = [];
    let currentTxt = '';
    let isInCodeBlock = false;
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
        console.log('startswithnewline', line);
        console.log('currenttextbefore', currentTxt);

        currentTxt = currentTxt.slice(0, -1);
        console.log('currenttextafta', currentTxt);

    }

      if (line.startsWith('')) {
        console.log('startswithnothing', line);
        currentTxt += '\n';
        
      }
      if (line.startsWith('```') || line === '```') {
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
              console.log('INDENT',line, newIndentation);
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
    if (currentTxt !== '') {
      result.push({ type: isInCodeBlock ? 'code' : 'text', content: currentTxt });
    }

    return result;  
  };
export default devideTextAndCode;