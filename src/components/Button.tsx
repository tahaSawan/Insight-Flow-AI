import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps, ActivityIndicator } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  isLoading?: boolean;
  className?: string;
}

export function Button({ 
  title, 
  variant = 'primary', 
  isLoading = false, 
  className = '', 
  ...props 
}: ButtonProps) {
  let bgClass = 'bg-primary';
  let textClass = 'text-white font-semibold text-center';

  if (variant === 'secondary') {
    bgClass = 'bg-secondary';
  } else if (variant === 'outline') {
    bgClass = 'bg-transparent border border-primary';
    textClass = 'text-primary font-semibold text-center';
  }

  return (
    <TouchableOpacity 
      className={`${bgClass} py-3 px-6 rounded-xl flex-row justify-center items-center ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'outline' ? '#3B82F6' : '#fff'} />
      ) : (
        <Text className={textClass}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
