import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaMicrophoneAlt } from "react-icons/fa";
import { useSpeechRecognition } from "react-speech-kit";
import { HiMiniSpeakerWave } from "react-icons/hi2";
import { HiMiniSpeakerXMark } from "react-icons/hi2";
const ChatGptApp = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState([]);

  const speechRef = useRef(null);

  useEffect(() => {
    const availableVoices = window.speechSynthesis.getVoices();
    if (availableVoices.length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        setVoices(window.speechSynthesis.getVoices());
      };
    } else {
      setVoices(availableVoices);
    }
  }, []);

  const handleSpeak = (text) => {
    console.log(window.speechSynthesis.paused,text, window.speechSynthesis.resume)
    if (window.speechSynthesis.paused) {
      // Resume speaking
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      // Stop any ongoing speech
      window.speechSynthesis.cancel();

      // Start a new utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = voices[0] || null; // Use the first available voice
      utterance.onend = () => {
        setIsSpeaking(false);
        speechRef.current = null;
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        speechRef.current = null;
      };

      speechRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
      setIsPaused(false);
    }
  };

  const handlePause = () => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const { listen, listening, stop } = useSpeechRecognition({
    onResult: (result) => {
      setInput(result);
    },
    onError: (err) => console.error("Speech recognition error:", err),
  });

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const responseMessage = await getGPTResponse(input);
    setMessages((prev) => [...prev, responseMessage]);

    stop();
  };

  const getGPTResponse = async (message) => {
    // Mock response for demonstration purposes
    return {
      role: "assistant",
      content: `Echo: ${message}`,
    };
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-2xl p-4">
        <motion.div
          className="h-96 overflow-y-auto bg-gray-50 p-4 rounded-lg border border-gray-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {messages.map((msg, index) => (
            <div className="flex flex-col"> <div
            key={index}
            className={`my-2 p-3 rounded-lg max-w-xs ${
              msg.role === "user"
                ? "bg-blue-500 text-white self-end"
                : "bg-gray-200 text-gray-800 self-start"
            }`}
            style={{
              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            {msg.content}
            <div className="flex items-center gap-2 mt-2">
              {(msg.role !== "user") && <button
                onClick={() =>
                  isSpeaking && !isPaused
                    ? handlePause()
                    : handleSpeak(msg.content)
                }
                className="px-2 py-1 text-black text-xl"
              >
                {isSpeaking && !isPaused ? <HiMiniSpeakerXMark /> : <HiMiniSpeakerWave />}
              </button>}
            </div>
          </div></div>
           
          ))}
        </motion.div>
        <div className="mt-4 flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
          />
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Send
          </button>
          <button onMouseDown={listen} onMouseUp={stop}>
            <FaMicrophoneAlt />
          </button>
        </div>
        {listening && (
          <div className="mt-2 text-blue-500">Go ahead, I'm listening...</div>
        )}
      </div>
    </div>
  );
};

export default ChatGptApp;
