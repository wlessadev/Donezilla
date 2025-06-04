import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { TaskContext } from '../context/TaskContext';

export default function HomeScreen({ navigation }) {
  const { theme } = useTheme();
  const { tasks, lists } = useContext(TaskContext);

  const styles = getStyles(theme);
  const [allTasks, setAllTasks] = useState([]);

  useEffect(() => {
    const loadTasks = async () => {
      setAllTasks(tasks);
    };
    loadTasks();
  }, [tasks]);

  const formatDateTime = (date) => {
    const options = {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    };
    return new Intl.DateTimeFormat('pt-BR', options).format(new Date(date));
  };

  const sortTasks = (tasks) => {
  // Filtra apenas tarefas não concluídas
  const uncompletedTasks = tasks.filter(task => !task.completed);
  
  return uncompletedTasks.sort((a, b) => {
    const now = new Date();
    const aDueDate = a.dueDate ? new Date(a.dueDate) : null;
    const bDueDate = b.dueDate ? new Date(b.dueDate) : null;
    
    // Verifica se a tarefa está pendente (prazo vencido)
    const aIsOverdue = aDueDate && aDueDate < now;
    const bIsOverdue = bDueDate && bDueDate < now;
    
    // Primeiro ordena por status de pendente (pendentes primeiro)
    if (aIsOverdue && !bIsOverdue) return -1;
    if (!aIsOverdue && bIsOverdue) return 1;
    
    // Dentro do mesmo grupo (ambas pendentes ou ambas não pendentes), ordena por prioridade
    if (a.priority === 'high' && b.priority !== 'high') return -1;
    if (a.priority !== 'high' && b.priority === 'high') return 1;
    if (a.priority === 'medium' && b.priority === 'low') return -1;
    if (a.priority === 'low' && b.priority === 'medium') return 1;
    
    // Se tiverem mesma prioridade, ordena por data (mais próximas primeiro)
    if (aDueDate && bDueDate) {
      return aDueDate - bDueDate;
    } else if (aDueDate) {
      return -1;
    } else if (bDueDate) {
      return 1;
    }
    
    return 0; // Se tudo for igual, mantém a ordem
  });
};

  const renderItem = ({ item }) => {
    const listName = lists.find(list => list.id === item.listId).name;
    const dueDate = item.dueDate ? `⋅ ${formatDateTime(item.dueDate)}` : '';
    const priority = getPriorityText(item.priority);

    return (
      <TouchableOpacity
        style={[styles.taskContainer, item.dueDate && new Date(item.dueDate) < new Date() ? styles.overdueTask : null]}
        onPress={() => navigation.navigate('ListTasks', { listId: item.listId, listName: listName })}
      >
        <Text style={styles.taskText}>
          <Text style={styles.taskTitle}>{item.title}</Text> - {listName} {dueDate} ({priority})
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tarefas</Text>

      <FlatList
        data={sortTasks(allTasks).slice(0, 7)} // Mostrar apenas 7 tarefas
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
      />

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

const getPriorityText = (priority) => {
  switch (priority) {
    case 'high':
      return 'Alta';
    case 'medium':
      return 'Média';
    case 'low':
      return 'Baixa';
    default:
      return '';
  }
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
  overdueTask: {
    backgroundColor: theme === 'light' ? '#ffebee' : '#b71c1c',
    borderLeftColor: '#F44336',
  },
  taskContainer: {
    marginBottom: 30,
    padding: 15,
    borderRadius: 5,
    backgroundColor: theme === 'light' ? '#f7f7f7' 
                     : theme === 'dark' ? '#2f3136' : '#36393f',
  },
  taskText: {
    fontSize: 16,
    color: theme === 'light' ? '#000' : '#fff',
  },
});