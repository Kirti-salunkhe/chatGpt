import React, { useState, useRef } from 'react';
import { useSpeechSynthesis } from 'react-speech-kit';

function Example() {
  const [value, setValue] = useState('');
  const [isPaused, setIsPaused] = useState(false);
  const speechRef = useRef(null); // Reference to track the utterance

  const { speak } = useSpeechSynthesis({
    onEnd: () => {
      speechRef.current = null; // Reset the utterance reference when finished
    },
  });

  const handleSpeak = () => {
    if (!speechRef.current) {
      // Create a new utterance and start speaking
      const utterance = new SpeechSynthesisUtterance(value);
      utterance.onboundary = (event) => {
        // Track the position where the speech stopped
        speechRef.current = utterance;
        speechRef.current.lastCharIndex = event.charIndex;
      };
      window.speechSynthesis.speak(utterance);
      speechRef.current = utterance;
    } else if (isPaused) {
      // Resume speaking
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  };

  const handlePause = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const handleStop = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      speechRef.current = null;
      setIsPaused(false);
    }
  };

  return (
    <div>
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <div>
        <button onClick={handleSpeak}>
          {isPaused ? 'Resume' : 'Speak'}
        </button>
        <button onClick={handlePause}>Pause</button>
        <button onClick={handleStop}>Stop</button>
      </div>
    </div>
  );
}

export default Example;
