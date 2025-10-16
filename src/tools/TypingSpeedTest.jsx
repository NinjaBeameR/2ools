import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Trophy } from 'lucide-react';

const sampleTexts = [
  "The quick brown fox jumps over the lazy dog. Programming is both an art and a science.",
  "In the world of technology, innovation never stops. Every day brings new challenges and opportunities.",
  "Practice makes perfect. The more you type, the faster and more accurate you become.",
  "Typing is an essential skill in the modern digital age. Mastering it opens many doors.",
  "Speed and accuracy are equally important. Focus on both to become a typing master.",
];

function TypingSpeedTest() {
  const [text, setText] = useState('');
  const [input, setInput] = useState('');
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    resetTest();
  }, []);

  useEffect(() => {
    if (started && !finished) {
      timerRef.current = setInterval(() => {
        setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [started, finished, startTime]);

  useEffect(() => {
    if (input.length > 0 && text) {
      calculateMetrics();
    }

    if (input === text && input.length > 0) {
      finishTest();
    }
  }, [input]);

  const resetTest = () => {
    const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    setText(randomText);
    setInput('');
    setStarted(false);
    setFinished(false);
    setStartTime(null);
    setWpm(0);
    setAccuracy(100);
    setTimeElapsed(0);
  };

  const startTest = () => {
    setStarted(true);
    setStartTime(Date.now());
    inputRef.current?.focus();
  };

  const calculateMetrics = () => {
    const timeInMinutes = (Date.now() - startTime) / 60000;
    const wordsTyped = input.trim().split(/\s+/).length;
    const calculatedWpm = Math.round(wordsTyped / timeInMinutes);
    setWpm(calculatedWpm);

    // Calculate accuracy
    let correct = 0;
    for (let i = 0; i < input.length; i++) {
      if (input[i] === text[i]) {
        correct++;
      }
    }
    const calculatedAccuracy = Math.round((correct / input.length) * 100);
    setAccuracy(calculatedAccuracy);
  };

  const finishTest = () => {
    setFinished(true);
    setStarted(false);
  };

  const getCharClass = (index) => {
    if (index >= input.length) return 'text-gray-400';
    if (input[index] === text[index]) return 'text-green-600 bg-green-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="h-full flex flex-col p-6 bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Typing Speed Test</h1>

      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <div className="flex justify-around mb-8">
          <Stat label="WPM" value={wpm} color="blue" />
          <Stat label="Accuracy" value={`${accuracy}%`} color="green" />
          <Stat label="Time" value={`${timeElapsed}s`} color="purple" />
        </div>

        <div className="mb-6 p-6 bg-gray-50 rounded-lg">
          <p className="text-xl leading-relaxed font-mono">
            {text.split('').map((char, index) => (
              <span
                key={index}
                className={`${getCharClass(index)} ${index === input.length ? 'border-l-2 border-blue-600' : ''}`}
              >
                {char}
              </span>
            ))}
          </p>
        </div>

        {!started && !finished && (
          <button
            onClick={startTest}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg font-semibold"
          >
            <Play size={24} />
            Start Test
          </button>
        )}

        {started && (
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full px-6 py-4 text-xl border-2 border-blue-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
            placeholder="Start typing..."
            autoFocus
          />
        )}

        {finished && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Trophy size={48} className="text-yellow-500" />
              <h2 className="text-3xl font-bold text-gray-800">Test Complete!</h2>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <ResultCard label="Words Per Minute" value={wpm} />
              <ResultCard label="Accuracy" value={`${accuracy}%`} />
              <ResultCard label="Time Taken" value={`${timeElapsed}s`} />
            </div>
            <button
              onClick={resetTest}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 mx-auto"
            >
              <RotateCcw size={20} />
              Try Again
            </button>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <p className="text-sm text-gray-700">
          <strong>Tips:</strong> Focus on accuracy first, speed will come naturally. Keep your fingers on the home row.
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value, color }) {
  const colors = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    purple: 'bg-purple-100 text-purple-800',
  };

  return (
    <div className="text-center">
      <div className={`text-4xl font-bold mb-2 ${colors[color]}`}>{value}</div>
      <div className="text-gray-600">{label}</div>
    </div>
  );
}

function ResultCard({ label, value }) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="text-3xl font-bold text-blue-600 mb-2">{value}</div>
      <div className="text-gray-600">{label}</div>
    </div>
  );
}

export default TypingSpeedTest;
