import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';

export function Card({ style, children, ...props }: ViewProps) {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#12121A',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(100, 116, 139, 0.2)', // slate-700/50 approx
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
