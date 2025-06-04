import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.option, theme === 'light' && styles.selected]}
        onPress={() => toggleTheme('light')}
      >
        <Text style={styles.optionText}>Light</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.option, theme === 'dark' && styles.selected]}
        onPress={() => toggleTheme('dark')}
      >
        <Text style={styles.optionText}>Dark</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.option, theme === 'darker' && styles.selected]}
        onPress={() => toggleTheme('darker')}
      >
        <Text style={styles.optionText}>Darker</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#2f3136',
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  selected: {
    backgroundColor: '#5865F2',
    borderRadius: 20,
  },
  optionText: {
    color: '#fff',
    fontSize: 14,
  },
});