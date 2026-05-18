import React from 'react';
import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  className?: string;
}

export function Card({ className = '', children, ...props }: CardProps) {
  return (
    <View 
      className={`bg-surface p-4 rounded-2xl shadow-sm border border-slate-700/50 ${className}`} 
      {...props}
    >
      {children}
    </View>
  );
}
