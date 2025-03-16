import React, { useState } from 'react';
import { Mic, Camera, Navigation, AlertTriangle, Settings, Volume2, Repeat, Battery, Wifi, Menu } from 'lucide-react';

const BlindAssistantApp = () => {
  const [isListening, setIsListening] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('home');
  const [batteryLevel, setBatteryLevel] = useState(80);
  const [lastAlert, setLastAlert] = useState("Welcome to Blind Assistant. I'm ready to help you navigate.");

  const handleVoiceCommand = (command) => {
    // Simulated voice command handling
    setLastAlert(`Voice command received: ${command}`);
  };

  const HomeScreen = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6 flex flex-col gap-4">
        <button 
          className="bg-blue-600 text-white p-6 rounded-xl text-xl font-bold flex items-center justify-center gap-3 w-full"
          onClick={() => {
            setCurrentScreen('detection');
            setLastAlert("Starting object detection. Please wait.");
          }}
        >
          <Camera size={32} />
          <span>Start Detection</span>
        </button>
        
        <button 
          className="bg-green-600 text-white p-6 rounded-xl text-xl font-bold flex items-center justify-center gap-3 w-full"
          onClick={() => {
            setCurrentScreen('navigation');
            setLastAlert("Starting navigation. Please specify your destination.");
          }}
        >
          <Navigation size={32} />
          <span>Start Navigation</span>
        </button>
        
        <button 
          className="bg-purple-600 text-white p-6 rounded-xl text-xl font-bold flex items-center justify-center gap-3 w-full"
          onClick={() => setLastAlert("Capturing scene. Please hold still.")}
        >
          <Camera size={32} />
          <span>Describe Scene</span>
        </button>
        
        <button 
          className="bg-red-600 text-white p-6 rounded-xl text-xl font-bold flex items-center justify-center gap-3 w-full"
          onClick={() => {
            setCurrentScreen('emergency');
            setLastAlert("Emergency assistance activated. Contacting your emergency contacts.");
          }}
        >
          <AlertTriangle size={32} />
          <span>Emergency Assist</span>
        </button>
      </div>
      
      <StatusBar batteryLevel={batteryLevel} />
    </div>
  );

  const StatusBar = ({ batteryLevel }) => (
    <div className="bg-gray-800 p-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Mic size={24} color={isListening ? "green" : "gray"} />
        <span className="text-white">Listening</span>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <Battery size={20} color="white" />
          <span className="text-white text-sm">{batteryLevel}%</span>
        </div>
        <Wifi size={20} color="white" />
      </div>
    </div>
  );

  const VoiceFeedbackPanel = () => (
    <div className="bg-gray-900 p-4 rounded-xl mb-4">
      <div className="flex items-center gap-2 mb-2">
        <Volume2 size={24} color="white" />
        <span className="text-white font-bold">Last Alert:</span>
      </div>
      <p className="text-white text-lg">{lastAlert}</p>
      <button 
        className="mt-3 bg-gray-700 p-2 rounded-lg flex items-center gap-2 text-white"
        onClick={() => handleVoiceCommand("Repeat last alert")}
      >
        <Repeat size={18} />
        <span>Replay Last Alert</span>
      </button>
    </div>
  );

  const DetectionScreen = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6">
        <div className="bg-black h-full rounded-xl flex items-center justify-center relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center">
              <p className="text-2xl font-bold mb-4">Camera Active</p>
              <p className="text-lg">Detecting objects in your surroundings</p>
            </div>
          </div>
          <div className="absolute bottom-6 left-6">
            <button 
              className="bg-red-600 p-4 rounded-full"
              onClick={() => {
                setCurrentScreen('home');
                setLastAlert("Detection stopped.");
              }}
            >
              <span className="text-white">Stop</span>
            </button>
          </div>
        </div>
      </div>
      
      <VoiceFeedbackPanel />
      <StatusBar batteryLevel={batteryLevel} />
    </div>
  );

  const NavigationScreen = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6">
        <div className="bg-black h-full rounded-xl flex items-center justify-center relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-center">
              <p className="text-2xl font-bold mb-4">Navigation Active</p>
              <p className="text-lg">Turn-by-turn guidance</p>
              <p className="mt-4 text-xl">Continue straight for 50 meters</p>
            </div>
          </div>
          <div className="absolute bottom-6 left-6">
            <button 
              className="bg-red-600 p-4 rounded-full"
              onClick={() => {
                setCurrentScreen('home');
                setLastAlert("Navigation stopped.");
              }}
            >
              <span className="text-white">Stop</span>
            </button>
          </div>
        </div>
      </div>
      
      <VoiceFeedbackPanel />
      <StatusBar batteryLevel={batteryLevel} />
    </div>
  );

  const EmergencyScreen = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6">
        <div className="bg-red-100 h-full rounded-xl flex items-center justify-center relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-bold mb-4 text-red-600">Emergency Mode Active</p>
              <p className="text-lg text-red-600">Sharing your location with emergency contacts</p>
              <p className="mt-4 text-xl text-red-600">Stay calm. Help is on the way.</p>
            </div>
          </div>
          <div className="absolute bottom-6 left-6">
            <button 
              className="bg-gray-800 p-4 rounded-full"
              onClick={() => {
                setCurrentScreen('home');
                setLastAlert("Emergency mode deactivated.");
              }}
            >
              <span className="text-white">Cancel</span>
            </button>
          </div>
        </div>
      </div>
      
      <VoiceFeedbackPanel />
      <StatusBar batteryLevel={batteryLevel} />
    </div>
  );

  const SettingsScreen = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Detection Sensitivity</h2>
          <div className="flex flex-col gap-2">
            <button className="bg-blue-600 text-white p-4 rounded-lg text-left">Short-range (1-2 meters)</button>
            <button className="bg-gray-200 p-4 rounded-lg text-left">Medium-range (3-5 meters)</button>
            <button className="bg-gray-200 p-4 rounded-lg text-left">Long-range (6+ meters)</button>
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Voice Assistant</h2>
          <div className="flex flex-col gap-2">
            <button className="bg-blue-600 text-white p-4 rounded-lg text-left">Google TTS</button>
            <button className="bg-gray-200 p-4 rounded-lg text-left">Amazon Polly</button>
            <button className="bg-gray-200 p-4 rounded-lg text-left">Offline Voice</button>
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Custom Alerts</h2>
          <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
            <span>Vibration Feedback</span>
            <div className="w-12 h-6 bg-blue-600 rounded-full relative">
              <div className="absolute right-1 top-1 bg-white w-4 h-4 rounded-full"></div>
            </div>
          </div>
        </div>
        
        <button 
          className="bg-gray-800 text-white p-4 rounded-lg w-full"
          onClick={() => {
            setCurrentScreen('home');
            setLastAlert("Settings saved.");
          }}
        >
          Save and Return
        </button>
      </div>
      
      <StatusBar batteryLevel={batteryLevel} />
    </div>
  );

  const renderScreen = () => {
    switch (currentScreen) {
      case 'detection':
        return <DetectionScreen />;
      case 'navigation':
        return <NavigationScreen />;
      case 'emergency':
        return <EmergencyScreen />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="bg-gray-100 h-screen flex flex-col">
      <div className="bg-gray-800 p-4 flex justify-between items-center">
        <h1 className="text-white text-xl font-bold">Blind Assistant</h1>
        <button 
          onClick={() => {
            setCurrentScreen('settings');
            setLastAlert("Settings menu opened.");
          }}
        >
          <Settings size={24} color="white" />
        </button>
      </div>
      
      <div className="flex-1 flex flex-col">
        {renderScreen()}
      </div>
    </div>
  );
};

export default BlindAssistantApp;
Last edited just now


Publish
