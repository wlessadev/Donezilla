import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function HomeScreen({ navigation }) {
  const { theme } = useTheme();
  
  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today's Activities</Text>
      
      {/* Placeholder for today's tasks */}
      <View style={styles.taskContainer}>
        <Text style={styles.taskText}>Task 1</Text>
        <Text style={styles.taskText}>Task 2</Text>
      </View>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('Lists')}
      >
        <Text style={styles.buttonText}>My Lists</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.button}
        onPress={() => navigation.navigate('Profile')}
      >
        <Text style={styles.buttonText}>My Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: theme === 'light' ? '#fff' : 
                     theme === 'dark' ? '#36393f' : '#202225',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: theme === 'light' ? '#000' : '#fff',
  },
  button: {
    backgroundColor: theme === 'light' ? '#5865F2' : '#7289da',
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  taskContainer: {
    marginBottom: 30,
  },
  taskText: {
    fontSize: 16,
    marginVertical: 5,
    color: theme === 'light' ? '#000' : '#fff',
  },
});