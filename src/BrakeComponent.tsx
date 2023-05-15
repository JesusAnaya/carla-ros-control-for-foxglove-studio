import React from 'react';
import { PrimaryButton } from "@fluentui/react"; // Adjust with your button import

interface BrakeComponentProps {
  brake: number;
  setBrake: React.Dispatch<React.SetStateAction<number>>;
}

const BrakeComponent: React.FC<BrakeComponentProps> = ({ brake, setBrake }) => {
  let brakeInterval: NodeJS.Timeout | null = null;

  const handleBrakeButtonClick = () => {
    if (brake === 0) {
      brakeInterval = setInterval(() => {
        setBrake((prevBrake) => {
          if (prevBrake < 1) {
            return prevBrake + 0.2; // increment by 0.2 every second to reach 1 in 5 seconds
          } else {
            if (brakeInterval) clearInterval(brakeInterval);
            return 1;
          }
        });
      }, 1000); // run every second
    } else {
      if (brakeInterval) clearInterval(brakeInterval);
      setBrake(0);
    }
  };

  return (
    <div>
      <PrimaryButton onClick={handleBrakeButtonClick}>
        {brake === 1 ? "Deactivate Brake" : "Activate Brake"}
      </PrimaryButton>
    </div>
  );
};

export default BrakeComponent;
