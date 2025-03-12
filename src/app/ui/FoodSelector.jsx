import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import foodMap from '../../public/foodMap.json';

const FoodSelector = ({ selectedValue, onSelectValue, onClearValue }) => {
  const [inputValue, setInputValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Function to generate suggestions based on input
  const getSuggestions = (input) => {
    if (!input) return [];
    input = input.toLowerCase();
    
    const results = [];
    
    // Check for category matches
    for (const category in foodMap) {
      const displayCategory = category.replace('_', ' ');
      if (displayCategory.toLowerCase().includes(input)) {
        results.push({
          type: 'category',
          value: displayCategory,
          originalKey: category
        });
      }
      
      // Check for subcategory matches
      for (const food of foodMap[category]) {
        if (food.toLowerCase().includes(input)) {
          results.push({
            type: 'subcategory',
            value: food,
            category: displayCategory,
            originalKey: category
          });
        }
      }
    }
    
    return results.slice(0, 10); // Limit results to 10 items
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setSuggestions(getSuggestions(value));
    setShowDropdown(true);
  };

  const handleSelectOption = (option) => {
    if (option.type === 'category') {
      onSelectValue({
        type: 'category',
        value: option.value,
        originalKey: option.originalKey
      });
    } else {
      onSelectValue({
        type: 'subcategory',
        value: option.value,
        category: option.category,
        originalKey: option.originalKey
      });
    }
    
    setShowDropdown(false);
    setInputValue('');
  };

  const handleReset = () => {
    onClearValue();
    setInputValue('');
    setShowDropdown(false);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  };

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full max-w-md">
      {selectedValue ? (
        // Selected value display
        <div className="relative p-3 bg-white border rounded-md shadow-sm flex items-center">
          <div className="flex-1">
            {selectedValue.type === 'category' ? (
              <span className="font-medium capitalize">{selectedValue.value}</span>
            ) : (
              <div>
                <span className="font-medium">{selectedValue.value}</span>
                <span className="text-gray-500 text-sm ml-2">({selectedValue.category})</span>
              </div>
            )}
          </div>
          <button 
            onClick={handleReset}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Clear selection"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        // Input field
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onClick={() => inputValue && setShowDropdown(true)}
            placeholder="Search for food or cuisine..."
            className="w-full p-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          {/* Dropdown */}
          {showDropdown && suggestions.length > 0 && (
            <div 
              ref={dropdownRef}
              className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-64 overflow-auto"
            >
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-3 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSelectOption(suggestion)}
                >
                  {suggestion.type === 'category' ? (
                    <div className="font-medium capitalize">{suggestion.value}</div>
                  ) : (
                    <div>
                      <span>{suggestion.value}</span>
                      <span className="text-gray-500 text-sm ml-2">({suggestion.category})</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FoodSelector;