import { CognitiveStyle } from '../types';

export const cognitiveStyles: CognitiveStyle[] = [
  {
    id: 1,
    name: 'Observer',
    description: 'Detail-oriented and analytical, you notice patterns others miss.',
    traits: ['Meticulous', 'Patient', 'Methodical', 'Precise'],
    color: '#EF4444'
  },
  {
    id: 2,
    name: 'Analyzer',
    description: 'Logical and systematic, you break down complex problems efficiently.',
    traits: ['Logical', 'Systematic', 'Critical thinking', 'Problem solver'],
    color: '#F97316'
  },
  {
    id: 3,
    name: 'Visionary',
    description: 'Creative and innovative, you see possibilities where others see obstacles.',
    traits: ['Creative', 'Innovative', 'Future-focused', 'Inspiring'],
    color: '#EAB308'
  },
  {
    id: 4,
    name: 'Empath',
    description: 'Emotionally intelligent and intuitive, you understand people deeply.',
    traits: ['Empathetic', 'Intuitive', 'Supportive', 'People-focused'],
    color: '#22C55E'
  },
  {
    id: 5,
    name: 'Navigator',
    description: 'Adaptable and resourceful, you find your way through any challenge.',
    traits: ['Adaptable', 'Resourceful', 'Flexible', 'Solution-oriented'],
    color: '#3B82F6'
  }
];

export const calculateNumerology = (birthDate: string): number => {
  // Remove non-digits and sum all digits
  const digits = birthDate.replace(/\D/g, '');
  let sum = digits.split('').reduce((acc, digit) => acc + parseInt(digit), 0);
  
  // Reduce to single digit
  while (sum > 9) {
    sum = sum.toString().split('').reduce((acc, digit) => acc + parseInt(digit), 0);
  }
  
  // Handle 0 as 5 (Navigator)
  return sum === 0 ? 5 : sum;
};

export const getCognitiveStyle = (numerologyResult: number): CognitiveStyle => {
  const styleMap: { [key: number]: number } = {
    1: 1, 2: 2, 3: 3, 4: 4, 5: 5,
    6: 1, 7: 2, 8: 3, 9: 4, 0: 5
  };
  
  const styleId = styleMap[numerologyResult] || 5;
  return cognitiveStyles.find(style => style.id === styleId) || cognitiveStyles[4];
};