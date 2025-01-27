import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaMicrophoneAlt } from "react-icons/fa";
import { HiMiniSpeakerWave } from "react-icons/hi2";
import { HiMiniSpeakerXMark } from "react-icons/hi2";
import { useSpeechRecognition } from "react-speech-kit";
import { IoSend } from "react-icons/io5";

const ChatGptApp = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [voices, setVoices] = useState([]);
  const [isListening, setIsListening] = useState(false);

  const speechRefs = useRef({});

  const { listen, stop, supported } = useSpeechRecognition({
    onResult: (result) => {
      setInput(result);
      setIsListening(false);
    },
    onError: (error) => {
      console.error("Speech Recognition Error:", error);
      setIsListening(false);
    },
  });

  useEffect(() => {
    if (!supported) {
      console.error("Speech Recognition is not supported in this browser.");
    }
  }, [supported]);

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

  const handleSpeak = (index, text) => {
    const currentRef = speechRefs.current[index];

    if (currentRef?.isPaused) {
      // Resume if paused
      window.speechSynthesis.resume();
      speechRefs.current[index].isPaused = false;
    } else {
      // Stop all ongoing speech
      window.speechSynthesis.cancel();

      // Start a new utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = voices[0] || null;
      utterance.onend = () => {
        speechRefs.current[index].isSpeaking = false;
        speechRefs.current[index].isPaused = false;
      };

      utterance.onerror = () => {
        speechRefs.current[index].isSpeaking = false;
        speechRefs.current[index].isPaused = false;
      };

      // Update state and speak
      speechRefs.current[index] = {
        isSpeaking: true,
        isPaused: false,
      };
      window.speechSynthesis.speak(utterance);
    }
  };

  const handlePause = (index) => {
    const currentRef = speechRefs.current[index];

    if (currentRef?.isSpeaking && !currentRef.isPaused) {
      window.speechSynthesis.pause();
      speechRefs.current[index].isPaused = true;
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const responseMessage = await getGPTResponse(input);
    setMessages((prev) => [...prev, responseMessage]);

    stop();
  };

  const handleListen = () => {
    if (isListening) {
      stop();
      setIsListening(false);
    } else {
      listen();
      setIsListening(true);
    }
  };

  const getGPTResponse = async (message) => {
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
            <div className="flex flex-col" key={index}>
              <div
                className={`my-2 p-3 rounded-lg max-w-[300px] min-w-[250px] ${
                  msg.role === "user"
                    ? "bg-[#f15f17] text-white self-end"
                    : "bg-gray-200 text-gray-800 self-start"
                }`}
                style={{
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                {msg.content}
                {msg.role !== "user" && (
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() =>
                        speechRefs.current[index]?.isSpeaking && !speechRefs.current[index]?.isPaused
                          ? handlePause(index)
                          : handleSpeak(index, msg.content)
                      }
                      className="px-2 py-1 text-black text-xl"
                    >
                      {speechRefs.current[index]?.isSpeaking && !speechRefs.current[index]?.isPaused ? (
                        <HiMiniSpeakerXMark />
                      ) : (
                        <HiMiniSpeakerWave />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
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
            className="text-xl"
          >
            <IoSend />
          </button>
          <button onClick={handleListen} className="px-2 py-2">
            <FaMicrophoneAlt className={isListening ? "text-red-500" : ""} />
          </button>
        </div>
        {/* {isListening && (
          <div className="mt-2 text-blue-500">Go ahead, I'm listening...</div>
        )} */}
      </div>
    </div>
  );
};

export default ChatGptApp;
