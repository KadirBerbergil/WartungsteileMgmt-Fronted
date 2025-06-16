// src/components/ColorField.tsx - Benutzerfreundliche Farbauswahl
import React, { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface ColorFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

// Häufige Farben mit RAL-Code Mapping
const COLOR_OPTIONS = [
  { label: 'Grau', value: 'RAL 7035', color: '#D7D7D7' },
  { label: 'Weiß', value: 'RAL 9016', color: '#F1F0EA' },
  { label: 'Schwarz', value: 'RAL 9005', color: '#0A0A0A' },
  { label: 'Blau', value: 'RAL 5015', color: '#2271B3' },
  { label: 'Rot', value: 'RAL 3020', color: '#CC0605' },
  { label: 'Gelb', value: 'RAL 1023', color: '#FAD201' },
  { label: 'Grün', value: 'RAL 6018', color: '#57A639' },
  { label: 'Orange', value: 'RAL 2004', color: '#F44611' },
  { label: 'Silber', value: 'RAL 9006', color: '#A5A5A5' },
  { label: 'Dunkelgrau', value: 'RAL 7016', color: '#383E42' },
  { label: 'Hellgrau', value: 'RAL 7047', color: '#D0D0D0' },
  { label: 'Beige', value: 'RAL 1013', color: '#EAE6CA' }
];

const ColorField: React.FC<ColorFieldProps> = ({
  id,
  label,
  value,
  onChange,
  disabled = false,
  placeholder
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCustom, setIsCustom] = useState(false);

  // Prüfen ob aktueller Wert in den Optionen ist
  const currentOption = COLOR_OPTIONS.find(option => 
    option.value === value || 
    option.label.toLowerCase() === value.toLowerCase() ||
    value.toLowerCase().includes(option.label.toLowerCase())
  );

  const handleOptionSelect = (option: typeof COLOR_OPTIONS[0]) => {
    onChange(option.value);
    setIsOpen(false);
    setIsCustom(false);
  };

  const handleCustomInput = (inputValue: string) => {
    onChange(inputValue);
  };

  // Bestimme Anzeige-Text
  let displayValue: string;
  if (!value || value.trim() === '') {
    displayValue = placeholder || 'Farbe auswählen...';
  } else if (currentOption) {
    displayValue = `${currentOption.label} (${currentOption.value})`;
  } else {
    displayValue = value;
  }

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-gray-900">
        {label}
      </label>
      
      {isCustom ? (
        // Custom Input Mode
        <div className="space-y-2">
          <input
            id={id}
            type="text"
            value={value}
            onChange={(e) => handleCustomInput(e.target.value)}
            placeholder={placeholder || "z.B. grau, RAL 7035, oder Munsell Gray Color"}
            className="w-full px-3 py-2 border border-gray-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-300"
            disabled={disabled}
          />
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setIsCustom(false)}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              disabled={disabled}
            >
              Aus Liste wählen
            </button>
          </div>
        </div>
      ) : (
        // Dropdown Mode
        <div className="relative">
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={`
              w-full flex items-center justify-between px-3 py-2 border border-gray-200 
              rounded bg-white text-left transition-colors
              ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'cursor-pointer hover:border-gray-300'}
              ${isOpen ? 'ring-2 ring-blue-500 ring-opacity-20 border-blue-500' : ''}
            `}
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {currentOption && (
                <div 
                  className="w-4 h-4 rounded border border-gray-300 flex-shrink-0"
                  style={{ backgroundColor: currentOption.color }}
                />
              )}
              <span className={`truncate ${
                (!value || value.trim() === '') ? 'text-gray-500' : 'text-gray-900'
              }`}>
                {displayValue}
              </span>
            </div>
            {!disabled && (
              <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${
                isOpen ? 'rotate-180' : ''
              }`} />
            )}
          </button>

          {isOpen && !disabled && (
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-10"
                onClick={() => setIsOpen(false)}
              />
              
              {/* Dropdown */}
              <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                {/* Standard Colors */}
                <div className="py-1">
                  {COLOR_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleOptionSelect(option)}
                      className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 transition-colors text-left"
                    >
                      <div 
                        className="w-4 h-4 rounded border border-gray-300 flex-shrink-0"
                        style={{ backgroundColor: option.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900">{option.label}</div>
                        <div className="text-xs text-gray-500">{option.value}</div>
                      </div>
                      {(option.value === value || 
                        option.label.toLowerCase() === value.toLowerCase() ||
                        value.toLowerCase().includes(option.label.toLowerCase())) && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
                
                {/* Custom Option */}
                <div className="border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustom(true);
                      setIsOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    ✏️ Eigene Farbe eingeben...
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Hilfetext */}
      <div className="text-xs text-gray-500">
        {isCustom ? (
          <>Einfache Farbnamen (grau, blau), RAL-Codes oder Munsell-Farben</>
        ) : (
          <>Wählen Sie eine Standardfarbe oder geben Sie eine eigene ein</>
        )}
      </div>
    </div>
  );
};

export default ColorField;