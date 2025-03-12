import React, { useState, useEffect } from "react";

interface selectButtonProps {
  text: string;
  value: boolean;
  onChange?: (value: boolean) => void;
}

const SelectButton = ({ text="", value = false, onChange }: selectButtonProps) => {
  const [selected, setSelected] = useState(value);
  
  useEffect(() => {
    setSelected(value);
  }, [value]);

  function handleClick() {
    const newValue = !selected;
    setSelected(newValue);
    if (onChange) {
      onChange(newValue);
    }
    console.log(text + " selected: " + newValue);
  }
  
  return (
    <button 
      onClick={handleClick} 
      className={`h-12 px-6 m-2 text-white rounded-xl
      ${selected ? "bg-violet-900" : "bg-violet-600 hover:bg-violet-800"}`}
    >
      {text}
    </button>
  );
};

export default SelectButton;