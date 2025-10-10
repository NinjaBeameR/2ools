import React, { useState } from 'react';
import { ArrowRightLeft } from 'lucide-react';

const conversionTypes = {
  Length: {
    units: ['Meter', 'Kilometer', 'Centimeter', 'Millimeter', 'Mile', 'Yard', 'Foot', 'Inch'],
    toBase: {
      Meter: 1,
      Kilometer: 1000,
      Centimeter: 0.01,
      Millimeter: 0.001,
      Mile: 1609.34,
      Yard: 0.9144,
      Foot: 0.3048,
      Inch: 0.0254,
    },
  },
  Weight: {
    units: ['Kilogram', 'Gram', 'Milligram', 'Pound', 'Ounce', 'Ton'],
    toBase: {
      Kilogram: 1,
      Gram: 0.001,
      Milligram: 0.000001,
      Pound: 0.453592,
      Ounce: 0.0283495,
      Ton: 1000,
    },
  },
  Temperature: {
    units: ['Celsius', 'Fahrenheit', 'Kelvin'],
    convert: (value, from, to) => {
      let celsius;
      if (from === 'Celsius') celsius = value;
      else if (from === 'Fahrenheit') celsius = (value - 32) * 5/9;
      else celsius = value - 273.15;

      if (to === 'Celsius') return celsius;
      else if (to === 'Fahrenheit') return celsius * 9/5 + 32;
      else return celsius + 273.15;
    },
  },
  Volume: {
    units: ['Liter', 'Milliliter', 'Gallon', 'Quart', 'Pint', 'Cup'],
    toBase: {
      Liter: 1,
      Milliliter: 0.001,
      Gallon: 3.78541,
      Quart: 0.946353,
      Pint: 0.473176,
      Cup: 0.236588,
    },
  },
};

function UnitConverter() {
  const [category, setCategory] = useState('Length');
  const [fromUnit, setFromUnit] = useState('Meter');
  const [toUnit, setToUnit] = useState('Kilometer');
  const [fromValue, setFromValue] = useState('');
  const [toValue, setToValue] = useState('');

  const handleConvert = (value, from, to) => {
    if (!value || isNaN(value)) {
      setToValue('');
      return;
    }

    const numValue = parseFloat(value);
    const categoryData = conversionTypes[category];

    if (category === 'Temperature') {
      const result = categoryData.convert(numValue, from, to);
      setToValue(result.toFixed(4));
    } else {
      const baseValue = numValue * categoryData.toBase[from];
      const result = baseValue / categoryData.toBase[to];
      setToValue(result.toFixed(4));
    }
  };

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    const units = conversionTypes[newCategory].units;
    setFromUnit(units[0]);
    setToUnit(units[1]);
    setFromValue('');
    setToValue('');
  };

  const handleSwap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    setFromValue(toValue);
    setToValue(fromValue);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">Unit Converter</h2>

      {/* Category Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
          Category
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {Object.keys(conversionTypes).map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                category === cat
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Conversion Interface */}
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6 border border-zinc-200 dark:border-zinc-700">
        <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
          {/* From */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              From
            </label>
            <select
              value={fromUnit}
              onChange={(e) => {
                setFromUnit(e.target.value);
                handleConvert(fromValue, e.target.value, toUnit);
              }}
              className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 mb-2"
            >
              {conversionTypes[category].units.map((unit) => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
            <input
              type="number"
              value={fromValue}
              onChange={(e) => {
                setFromValue(e.target.value);
                handleConvert(e.target.value, fromUnit, toUnit);
              }}
              placeholder="Enter value"
              className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-lg"
            />
          </div>

          {/* Swap Button */}
          <button
            onClick={handleSwap}
            className="mb-2 p-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
          >
            <ArrowRightLeft className="w-5 h-5" />
          </button>

          {/* To */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              To
            </label>
            <select
              value={toUnit}
              onChange={(e) => {
                setToUnit(e.target.value);
                handleConvert(fromValue, fromUnit, e.target.value);
              }}
              className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 mb-2"
            >
              {conversionTypes[category].units.map((unit) => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
            <input
              type="number"
              value={toValue}
              readOnly
              placeholder="Result"
              className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-zinc-100 dark:bg-zinc-600 text-zinc-900 dark:text-zinc-100 text-lg font-semibold"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default UnitConverter;
