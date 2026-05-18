import React from 'react';
import { Text, TextProps } from 'react-native';

interface TypographyProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption';
  color?: string;
  className?: string;
}

export function Typography({ variant = 'body', className = '', style, children, ...props }: TypographyProps) {
  let baseClass = 'text-textPrimary';
  
  switch (variant) {
    case 'h1':
      baseClass += ' text-4xl font-bold mb-4';
      break;
    case 'h2':
      baseClass += ' text-2xl font-bold mb-3';
      break;
    case 'h3':
      baseClass += ' text-xl font-semibold mb-2';
      break;
    case 'body':
      baseClass += ' text-base';
      break;
    case 'caption':
      baseClass += ' text-sm text-textSecondary';
      break;
  }

  return (
    <Text className={`${baseClass} ${className}`} style={style} {...props}>
      {children}
    </Text>
  );
}
