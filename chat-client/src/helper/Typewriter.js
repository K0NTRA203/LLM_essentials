import React, { useState, useEffect } from "react";

function TypewriterText({ text, setIsRendered, cardRef, setPrompt, fetchMsgs }) { // pass setPrompt and fetchMsgs as props
    const [currentText, setCurrentText] = useState("");
  let i = 0;
  const randomTime = 0.001;
  useEffect(() => {
    let modifiedText = text.replace(/\n/g, "\n\r");
    modifiedText = modifiedText.replace(/\r/g, "<br />");

    const interval = setInterval(() => {
      setCurrentText(modifiedText.slice(0, i));
      i++;
      cardRef.current.scrollTo(0, cardRef.current.scrollHeight);
      if (i > modifiedText.length) {
        clearInterval(interval);
        setPrompt("");
        fetchMsgs();
        setIsRendered(true);
        cardRef.current.scrollTo(0, cardRef.current.scrollHeight);
      }
    }, randomTime);
    return () => clearInterval(interval);
  }, [text]);
  return <p dangerouslySetInnerHTML={{ __html: currentText }} />;
}

export default TypewriterText;