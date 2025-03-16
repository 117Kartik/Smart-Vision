import React, { useState } from "react";

const BlindAssistantApp = () => {
  const [message, setMessage] = useState("");

  const handleAction = (action) => {
    setMessage(`${action} activated`); // ✅ Fixed syntax error
    // Simulate voice feedback
    const speech = new SpeechSynthesisUtterance(`${action} activated`); // ✅ Fixed syntax error
    window.speechSynthesis.speak(speech);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-4">AI Blind Assistant</h1>
      <div className="grid grid-cols-1 gap-4 w-full max-w-md">
        <button 
          className="p-4 bg-blue-600 rounded-xl text-lg focus:outline-none hover:bg-blue-500"
          onClick={() => handleAction("Start Detection")}
        >
          Start Detection
        </button>
        <button 
          className="p-4 bg-green-600 rounded-xl text-lg focus:outline-none hover:bg-green-500"
          onClick={() => handleAction("Start Navigation")}
        >
          Start Navigation
        </button>
        <button 
          className="p-4 bg-yellow-600 rounded-xl text-lg focus:outline-none hover:bg-yellow-500"
          onClick={() => handleAction("Describe Scene")}
        >
          Describe Scene
        </button>
        <button 
          className="p-4 bg-red-600 rounded-xl text-lg focus:outline-none hover:bg-red-500"
          onClick={() => handleAction("Emergency Assist")}
        >
          Emergency Assist
        </button>
      </div>
      {message && <p className="mt-4 text-lg">{message}</p>}
    </div>
  );
};

export default BlindAssistantApp;
