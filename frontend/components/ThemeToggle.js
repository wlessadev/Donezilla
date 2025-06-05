import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  const handleThemeChange = async (selectedTheme) => {
    try {
      await AsyncStorage.setItem('theme', selectedTheme);
      toggleTheme(selectedTheme);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };
  
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.option, theme === 'light' && styles.selected]}
        onPress={() => handleThemeChange('light')}
      >
        <Text style={styles.optionText}>Light</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.option, theme === 'dark' && styles.selected]}
        onPress={() => handleThemeChange('dark')}
      >
        <Text style={styles.optionText}>Dark</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.option, theme === 'darker' && styles.selected]}
        onPress={() => handleThemeChange('darker')}
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