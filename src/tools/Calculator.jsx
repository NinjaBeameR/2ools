import React, { useState } from 'react';

function Calculator() {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const handleNumber = (num) => {
    if (waitingForOperand) {
      setDisplay(String(num));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? String(num) : display + num);
    }
  };

  const handleDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const handleOperation = (op) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const result = calculate(previousValue, inputValue, operation);
      setDisplay(String(result));
      setPreviousValue(result);
    }

    setWaitingForOperand(true);
    setOperation(op);
  };

  const calculate = (first, second, op) => {
    switch (op) {
      case '+': return first + second;
      case '-': return first - second;
      case '×': return first * second;
      case '÷': return second !== 0 ? first / second : 0;
      default: return second;
    }
  };

  const handleEquals = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const result = calculate(previousValue, inputValue, operation);
      setDisplay(String(result));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  return (
    <div className="max-w-sm mx-auto">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">Calculator</h2>
      <div className="bg-zinc-100 dark:bg-zinc-700 p-6 rounded-lg mb-4">
        <div className="text-right text-3xl font-mono text-zinc-900 dark:text-zinc-100 break-all">
          {display}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={handleClear}
          className="col-span-2 bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-lg transition-colors"
        >
          AC
        </button>
        <button
          onClick={() => setDisplay(display.slice(0, -1) || '0')}
          className="bg-zinc-400 hover:bg-zinc-500 text-white font-bold py-4 rounded-lg transition-colors"
        >
          ←
        </button>
        <button
          onClick={() => handleOperation('÷')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-lg transition-colors text-xl"
        >
          ÷
        </button>

        {[7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handleNumber(num)}
            className="bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-900 dark:text-zinc-100 font-semibold py-4 rounded-lg transition-colors"
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => handleOperation('×')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-lg transition-colors text-xl"
        >
          ×
        </button>

        {[4, 5, 6].map((num) => (
          <button
            key={num}
            onClick={() => handleNumber(num)}
            className="bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-900 dark:text-zinc-100 font-semibold py-4 rounded-lg transition-colors"
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => handleOperation('-')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-lg transition-colors text-xl"
        >
          −
        </button>

        {[1, 2, 3].map((num) => (
          <button
            key={num}
            onClick={() => handleNumber(num)}
            className="bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-900 dark:text-zinc-100 font-semibold py-4 rounded-lg transition-colors"
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => handleOperation('+')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-lg transition-colors text-xl"
        >
          +
        </button>

        <button
          onClick={() => handleNumber(0)}
          className="col-span-2 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-900 dark:text-zinc-100 font-semibold py-4 rounded-lg transition-colors"
        >
          0
        </button>
        <button
          onClick={handleDecimal}
          className="bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-900 dark:text-zinc-100 font-semibold py-4 rounded-lg transition-colors"
        >
          .
        </button>
        <button
          onClick={handleEquals}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-lg transition-colors text-xl"
        >
          =
        </button>
      </div>
    </div>
  );
}

export default Calculator;