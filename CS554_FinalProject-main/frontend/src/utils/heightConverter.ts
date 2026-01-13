export const inchesToFeetInches = (totalInches: number): { feet: number; inches: number } => {
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
};

export const feetInchesToInches = (feet: number, inches: number): number => {
  return feet * 12 + inches;
};

export const formatHeight = (totalInches: number | undefined): string => {
  if (!totalInches) return 'Not set';
  const { feet, inches } = inchesToFeetInches(totalInches);
  return `${feet}'${inches}"`;
};

