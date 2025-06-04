// contexts/TaskContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const [lists, setLists] = useState([]);
  const [tasks, setTasks] = useState([]);

  // Carregar dados do AsyncStorage ao iniciar
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedLists = await AsyncStorage.getItem('@lists');
        const savedTasks = await AsyncStorage.getItem('@tasks');
        
        if (savedLists) setLists(JSON.parse(savedLists));
        if (savedTasks) setTasks(JSON.parse(savedTasks));
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
  }, []);

  // Salvar dados sempre que houver mudanças
  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem('@lists', JSON.stringify(lists));
        await AsyncStorage.setItem('@tasks', JSON.stringify(tasks));
      } catch (error) {
        console.error('Error saving data:', error);
      }
    };
    
    saveData();
  }, [lists, tasks]);

  return (
    <TaskContext.Provider value={{ lists, setLists, tasks, setTasks }}>
      {children}
    </TaskContext.Provider>
  );
};