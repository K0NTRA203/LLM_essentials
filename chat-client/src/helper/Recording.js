
import React, { useState, useEffect } from "react";

// import { useReactMediaRecorder } from "react-media-recorder";

// const AudioRecorder = () => {
//   const { status, startRecording, stopRecording, mediaBlobUrl } =
//     useReactMediaRecorder({ video: true });

//   return (
//     <div>
//       <p>{status}</p>
//       <button onClick={startRecording}>Start Recording</button>
//       <button onClick={stopRecording}>Stop Recording</button>
//       <video src={mediaBlobUrl} controls autoPlay loop />
//     </div>
//   );
// };

import { useWhisper } from '@chengsokdara/use-whisper';

const AudioRecorder = () => {
  const { transcript } = useWhisper({
    apiKey: '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', // YOUR_OPEN_AI_TOKEN
    streaming: true,
    timeSlice: 1_000, // 1 second
    whisperConfig: {
      language: 'en',
    },
  });

  return (
    <div>
      <p>{transcript.text}</p>
    </div>
  );
};

export default AudioRecorder;