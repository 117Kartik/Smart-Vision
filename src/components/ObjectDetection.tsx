import React, { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocossd from '@tensorflow-models/coco-ssd';
import { supabase } from '../lib/supabase';
import { LogOut } from 'lucide-react';

// Updated object sets for better categorization
const DANGEROUS_OBJECTS = new Set([
  'person',
  'car',
  'truck',
  'motorcycle',
  'bus',
  'train',
  'dog',
  'cat',
  'horse',
  'bear',
  'elephant'
]);

const OBSTACLE_OBJECTS = new Set([
  'chair',
  'couch',
  'bed',
  'dining table',
  'toilet',
  'tv',
  'refrigerator',
  'oven',
  'sink',
  'door',
  'stairs',
  'bench'
]);

const DISTANCE_THRESHOLD = 0.25; // Represents roughly 2 meters in screen space ratio
const WARNING_COOLDOWN = 3000; // 3 seconds cooldown between same warnings

export default function ObjectDetection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [model, setModel] = useState<cocossd.ObjectDetection | null>(null);
  const [warnings, setWarnings] = useState<Map<string, number>>(new Map());
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const warningTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const [isMuted, setIsMuted] = useState(false);
  const lastSpokenWarning = useRef<string>('');
  const lastWarningTime = useRef<number>(0);

  useEffect(() => {
    const loadModel = async () => {
      try {
        await tf.setBackend('webgl');
        await tf.ready();
        // Use mobilenet_v2 for better detection of common objects
        const loadedModel = await cocossd.load({
          base: 'mobilenet_v2',
          modelUrl: undefined
        });
        setModel(loadedModel);
        setIsLoading(false);
        speak('Object detection is ready. Press Space to toggle voice warnings.');
      } catch (error) {
        console.error('Error loading model:', error);
        speak('Error loading detection model. Please refresh the page.');
      }
    };
    loadModel();

    return () => {
      warningTimeouts.current.forEach(timeout => clearTimeout(timeout));
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsMuted(prev => !prev);
        if ('speechSynthesis' in window) {
          speechSynthesis.cancel();
          const message = !isMuted ? 'Voice warnings disabled' : 'Voice warnings enabled';
          const utterance = new SpeechSynthesisUtterance(message);
          utterance.rate = 1.2;
          speechSynthesis.speak(utterance);
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isMuted]);

  const speak = (text: string) => {
    if (!isMuted && 'speechSynthesis' in window) {
      const currentTime = Date.now();
      if (text !== lastSpokenWarning.current || currentTime - lastWarningTime.current > WARNING_COOLDOWN) {
        speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.2;
        utterance.pitch = 1;
        speechSynthesis.speak(utterance);
        lastSpokenWarning.current = text;
        lastWarningTime.current = currentTime;
      }
    }
  };

  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadeddata = () => {
              setIsVideoReady(true);
              if (canvasRef.current) {
                canvasRef.current.width = videoRef.current.videoWidth;
                canvasRef.current.height = videoRef.current.videoHeight;
              }
            };
          }
        })
        .catch(err => {
          console.error('Error accessing camera:', err);
          speak('Error accessing camera. Please check camera permissions.');
        });
    }
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const detectObjects = async () => {
    if (!model || !videoRef.current || !canvasRef.current || !isVideoReady) return;

    try {
      const predictions = await model.detect(videoRef.current);
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.drawImage(videoRef.current, 0, 0, ctx.canvas.width, ctx.canvas.height);

      ctx.font = '24px Arial';
      ctx.lineWidth = 3;

      const currentTime = Date.now();
      const newWarnings = new Map<string, number>();
      let mostDangerousObject: { class: string; ratio: number; type: 'danger' | 'obstacle' } | null = null;

      predictions
        .filter(prediction => prediction.score > 0.55) // Lowered threshold for better object detection
        .forEach(prediction => {
          const [x, y, width, height] = prediction.bbox;
          const objectSize = width * height;
          const screenSize = ctx.canvas.width * ctx.canvas.height;
          const sizeRatio = objectSize / screenSize;

          const isDangerous = DANGEROUS_OBJECTS.has(prediction.class);
          const isObstacle = OBSTACLE_OBJECTS.has(prediction.class);

          if ((isDangerous || isObstacle) && sizeRatio > DISTANCE_THRESHOLD) {
            // Track the most significant object
            if (!mostDangerousObject || 
                (isDangerous && mostDangerousObject.type === 'obstacle') ||
                (sizeRatio > mostDangerousObject.ratio && 
                 ((isDangerous && mostDangerousObject.type === 'danger') ||
                  (isObstacle && mostDangerousObject.type === 'obstacle')))) {
              mostDangerousObject = { 
                class: prediction.class, 
                ratio: sizeRatio,
                type: isDangerous ? 'danger' : 'obstacle'
              };
            }

            const warningKey = `${prediction.class}-${Math.floor(x)}-${Math.floor(y)}`;
            const lastWarning = warnings.get(warningKey) || 0;

            if (currentTime - lastWarning > WARNING_COOLDOWN) {
              newWarnings.set(warningKey, currentTime);

              if (warningTimeouts.current.has(warningKey)) {
                clearTimeout(warningTimeouts.current.get(warningKey));
              }

              const timeout = setTimeout(() => {
                setWarnings(prev => {
                  const updated = new Map(prev);
                  updated.delete(warningKey);
                  return updated;
                });
              }, WARNING_COOLDOWN);

              warningTimeouts.current.set(warningKey, timeout);
            } else {
              newWarnings.set(warningKey, lastWarning);
            }

            ctx.strokeStyle = isDangerous ? '#FF0000' : '#FFA500';
            ctx.fillStyle = isDangerous ? '#FF0000' : '#FFA500';
          } else {
            ctx.strokeStyle = '#00FF00';
            ctx.fillStyle = '#00FF00';
          }

          ctx.strokeRect(x, y, width, height);
          ctx.fillText(
            `${prediction.class}`,
            x,
            y > 30 ? y - 10 : 30
          );
        });

      if (mostDangerousObject) {
        const warning = mostDangerousObject.type === 'danger' 
          ? `${mostDangerousObject.class} ahead` 
          : `${mostDangerousObject.class} in your path`;
        speak(warning);
      }

      setWarnings(newWarnings);

      if (newWarnings.size > 0) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('detection_logs').insert({
            user_id: user.id,
            objects_detected: predictions.map(p => p.class),
            distance_warnings: Array.from(newWarnings.keys()),
          });
        }
      }
    } catch (error) {
      console.error('Error during object detection:', error);
    }

    requestAnimationFrame(detectObjects);
  };

  useEffect(() => {
    if (model && isVideoReady) {
      detectObjects();
    }
  }, [model, isVideoReady]);

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Vision Assistant</h1>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => {
                setIsMuted(!isMuted);
                if ('speechSynthesis' in window) {
                  speechSynthesis.cancel();
                  const message = isMuted ? 'Voice warnings enabled' : 'Voice warnings disabled';
                  const utterance = new SpeechSynthesisUtterance(message);
                  utterance.rate = 1.2;
                  speechSynthesis.speak(utterance);
                }
              }}
              className={`px-4 py-2 rounded-lg font-semibold ${
                isMuted ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
              }`}
              aria-label={isMuted ? 'Enable voice warnings' : 'Disable voice warnings'}
            >
              {isMuted ? 'Voice Off' : 'Voice On'}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-[60vh] bg-gray-800 rounded-lg">
            <div className="text-white text-2xl">Loading detection model...</div>
          </div>
        ) : (
          <>
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute top-0 left-0 w-full h-full object-contain"
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full object-contain"
              />
            </div>

            <div className="mt-8">
              <h2 className="text-2xl font-bold text-white mb-4">Active Warnings</h2>
              <div className="space-y-2">
                {Array.from(warnings.keys()).map((warning) => (
                  <div
                    key={warning}
                    className={`text-white p-4 rounded-lg text-xl animate-pulse ${
                      DANGEROUS_OBJECTS.has(warning.split('-')[0])
                        ? 'bg-red-600/90'
                        : 'bg-orange-500/90'
                    }`}
                  >
                    {warning.split('-')[0]}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}