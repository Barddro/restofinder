import React from "react";
import SelectButton from "./SelectButton";

interface RestrictionsProps {
  restrictions: boolean[];
  setRestrictions: React.Dispatch<React.SetStateAction<boolean[]>>;
}

const Restrictions: React.FC<RestrictionsProps> = ({ restrictions, setRestrictions }) => {
  const handleRestrictionChange = (index: number, value: boolean) => {
    const newRestrictions = [...restrictions];
    newRestrictions[index] = value;
    setRestrictions(newRestrictions);
  };

  return(
    <div>
      <SelectButton text="Vegetarian" value={restrictions[0]} onChange={(value) => handleRestrictionChange(0, value)} />
      <SelectButton text="Vegan" value={restrictions[1]} onChange={(value) => handleRestrictionChange(1, value)} />
      <SelectButton text="Kosher" value={restrictions[2]} onChange={(value) => handleRestrictionChange(2, value)} />
      <SelectButton text="Hallal" value={restrictions[3]} onChange={(value) => handleRestrictionChange(3, value)} />
    </div>
  );
};

export default Restrictions;