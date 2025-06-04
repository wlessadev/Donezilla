import React, { useState, useEffect, useContext, useCallback } from 'react';
import { TaskContext } from '../context/TaskContext';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  TextInput, 
  Alert,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';

import { useTheme } from '../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Slider from '@react-native-community/slider';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function ListTasksScreen({ route }) {
  const { listId, listName } = route.params;
  const { tasks, setTasks } = useContext(TaskContext);
  const { theme } = useTheme();
  const styles = getStyles(theme);
  
  const [localTasks, setLocalTasks] = useState(
    tasks.filter(task => task.listId === listId)
  );

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskText, setNewTaskText] = useState('');
  const [addTaskModalVisible, setAddTaskModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskText, setEditTaskText] = useState('');
  const [deleteTaskModalVisible, setDeleteTaskModalVisible] = useState(false);
  const [deleteTask, setDeleteTask] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDueDate, setSelectedDueDate] = useState(null);
  const [repeatOption, setRepeatOption] = useState('never');
  const [selectedSound, setSelectedSound] = useState('default');
  const [priority, setPriority] = useState('medium');

  const setTasksCallback = useCallback((newTasks) => {
    setTasks(newTasks);
  }, [setTasks]);

  useEffect(() => {
    const tasksFromOtherLists = tasks.filter(task => task.listId !== listId);
    const hasChanges = JSON.stringify([...tasksFromOtherLists, ...localTasks]) !== JSON.stringify(tasks);
    
    if (hasChanges) {
      setTasks([...tasksFromOtherLists, ...localTasks]);
    }
  }, [localTasks, listId]); // Adicione outras dependências se necessário

  // Atualiza as tarefas locais apenas quando as tarefas do contexto mudarem
  // e não forem causadas por uma atualização local
  useEffect(() => {
    const newTasks = tasks.filter(task => task.listId === listId);
    const hasChanges = JSON.stringify(newTasks) !== JSON.stringify(localTasks);
    
    if (hasChanges) {
      setLocalTasks(newTasks);
    }
  }, [tasks, listId]);

  const handleAddTask = () => {
    if (newTaskTitle.trim() === '' || newTaskText.trim() === '') {
      Alert.alert('Erro', 'Título e descrição são obrigatórios');
      return;
    }
    
    const newTask = {
      id: Date.now().toString(),
      listId,
      title: newTaskTitle.trim(),
      text: newTaskText.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
      dueDate: selectedDueDate || null,
      repeat: repeatOption || 'never',
      sound: selectedSound || 'default',
      priority: priority || 'medium',
      completedAt: null
    };
    
    setLocalTasks([...localTasks, newTask]);
    setNewTaskTitle('');
    setNewTaskText('');
    setAddTaskModalVisible(false);
    setSelectedDueDate(null);
    setRepeatOption('never');
    setSelectedSound('default');
    setPriority('medium');
  };

  const handleDeleteTask = (taskId) => {
    const task = localTasks.find((task) => task.id === taskId);
    setDeleteTask(task);
    setDeleteTaskModalVisible(true); // Isso deve ser true para mostrar o modal
  };

  const confirmDeleteTask = () => {
    setLocalTasks(localTasks.filter((task) => task.id !== deleteTask.id));
    setDeleteTaskModalVisible(false);
    setDeleteTask(null);
  };


  const toggleTaskCompletion = (taskId) => {
    setLocalTasks(localTasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setEditTaskTitle(task.title);
    setEditTaskText(task.text);
    setSelectedDueDate(task.dueDate);
    setPriority(task.priority);
  };

  const saveEditedTask = () => {
    setLocalTasks(localTasks.map(task => 
      task.id === editingTask.id ? { 
        ...task, 
        title: editTaskTitle, 
        text: editTaskText, 
        dueDate: selectedDueDate, 
        priority: priority 
      } : task
    ));
    setEditingTask(null);
    setEditTaskTitle('');
    setEditTaskText('');
    setSelectedDueDate(null);
    setPriority('medium');
  };

  const sortedTasks = [...localTasks].sort((a, b) => {
    // Tarefas concluídas vão para o final da lista
    if (a.completed && b.completed) {
      // Ordene as tarefas concluídas pela data de conclusão
      return new Date(b.completedAt) - new Date(a.completedAt);
    }

    // Tarefas pendentes vão para o topo da lista
    if (!a.completed && !b.completed) {
      // Ordene as tarefas pendentes por prioridade
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (a.priority !== 'high' && b.priority === 'high') return 1;
      if (a.priority === 'medium' && b.priority === 'low') return -1;
      if (a.priority === 'low' && b.priority === 'medium') return 1;

      // Se as prioridades forem iguais, ordene pela proximidade ao dia atual
      const aDueDate = a.dueDate ? new Date(a.dueDate) : Infinity;
      const bDueDate = b.dueDate ? new Date(b.dueDate) : Infinity;
      if (aDueDate < bDueDate) return -1;
      if (aDueDate > bDueDate) return 1;

      // Se as datas de prazo forem iguais, ordene pela data de criação
      return new Date(b.createdAt) - new Date(a.createdAt);
    }

    // Se uma tarefa for concluída e a outra não, a concluída vai para o final
    if (a.completed) return 1;
    if (b.completed) return -1;
  });

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  // Função para lidar com mudança de data
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      // Se já tiver uma hora selecionada, mantém a hora
      if (selectedDueDate) {
        const newDate = new Date(selectedDueDate);
        newDate.setFullYear(selectedDate.getFullYear());
        newDate.setMonth(selectedDate.getMonth());
        newDate.setDate(selectedDate.getDate());
        setSelectedDueDate(newDate.toISOString());
      } else {
        setSelectedDueDate(selectedDate.toISOString());
      }
    }
  };

  // Função para lidar com mudança de hora
  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      // Se já tiver uma data selecionada, mantém a data
      if (selectedDueDate) {
        const newDate = new Date(selectedDueDate);
        newDate.setHours(selectedTime.getHours());
        newDate.setMinutes(selectedTime.getMinutes());
        setSelectedDueDate(newDate.toISOString());
      } else {
        // Se não tiver data, usa a data atual
        const today = new Date();
        today.setHours(selectedTime.getHours());
        today.setMinutes(selectedTime.getMinutes());
        setSelectedDueDate(today.toISOString());
      }
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return '#F44336';
      case 'medium': return '#FFC107';
      case 'low': return '#4CAF50';
      default: return '#9E9E9E';
    }
  };

  const renderItem = ({ item }) => {
    const isOverdue = item.dueDate && new Date(item.dueDate) < new Date() && !item.completed;
    
    return (
      <View style={[
        styles.taskItem,
        item.completed && styles.completedTask,
        isOverdue && styles.overdueTask
      ]}>
        <TouchableOpacity onPress={() => toggleTaskCompletion(item.id)} style={styles.taskCheckbox}>
          <Icon 
            name={item.completed ? 'check-box' : 'check-box-outline-blank'} 
            size={24} 
            color={item.completed ? '#4CAF50' : (isOverdue ? '#F44336' : (theme === 'light' ? '#555' : '#ddd'))} 
          />
        </TouchableOpacity>
        
        <View style={styles.taskContent}>
          <Text style={[
            styles.taskTitle,
            item.completed && styles.completedText
          ]}>
            {item.title}
          </Text>
          
          {item.text && (
            <Text style={[
              styles.taskText,
              item.completed && styles.completedText
            ]}>
              {item.text}
            </Text>
          )}
          
          <View style={styles.taskMeta}>
            {item.dueDate && (
              <Text style={[
                styles.taskDueDate,
                isOverdue && styles.overdueText,
                item.completed && styles.completedText
              ]}>
                <Icon name="access-time" size={12} /> {formatDateTime(item.dueDate)}
              </Text>
            )}
            
            <Text style={styles.taskPriority} backgroundColor={getPriorityColor(item.priority)}>
              {item.priority === 'high' ? 'Alta' : item.priority === 'medium' ? 'Média' : 'Baixa'}
            </Text>
          </View>
        </View>
        
        <View style={styles.taskActions}>
          <TouchableOpacity onPress={() => handleEditTask(item)}>
            <Icon name="edit" size={20} color={theme === 'light' ? '#555' : '#ddd'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDeleteTask(item.id)}>
            <Icon name="delete" size={20} color={theme === 'light' ? '#555' : '#ddd'} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.listTitle}>{listName}</Text>
      
      <FlatList
        data={sortedTasks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={localTasks.length === 0 ? styles.emptyContainer : null}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhuma tarefa ainda. Toque no + para adicionar uma!</Text>
        }
      />

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setAddTaskModalVisible(true)}
      >
        <Icon name="add" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Modal para adicionar tarefa */}
      <Modal
        visible={addTaskModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAddTaskModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nova Tarefa</Text>
            
            {/* Campo do Título */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Título*</Text>
              <TextInput
                style={styles.input}
                value={newTaskTitle}
                onChangeText={setNewTaskTitle}
                placeholder="Digite o título da tarefa"
                placeholderTextColor={theme === 'light' ? '#999' : '#777'}
                autoFocus={true}
              />
            </View>
            
            {/* Campo da Descrição */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Descrição</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                value={newTaskText}
                onChangeText={setNewTaskText}
                placeholder="Adicione detalhes (opcional)"
                placeholderTextColor={theme === 'light' ? '#999' : '#777'}
                multiline
              />
            </View>
            
            {/* Seletor de Prioridade (Slider) */}
            <View style={styles.modalSection}>
              <Text style={styles.sectionTitle}>Prioridade</Text>
              <View style={styles.prioritySliderContainer}>
                <View style={styles.priorityLabels}>
                  <Text style={[styles.priorityLabel, priority === 'low' && styles.priorityLabelActive]}>Baixa</Text>
                  <Text style={[styles.priorityLabel, priority === 'medium' && styles.priorityLabelActive]}>Média</Text>
                  <Text style={[styles.priorityLabel, priority === 'high' && styles.priorityLabelActive]}>Alta</Text>
                </View>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={2}
                  step={1}
                  value={priority === 'low' ? 0 : priority === 'medium' ? 1 : 2}
                  onValueChange={(value) => setPriority(value === 0 ? 'low' : value === 1 ? 'medium' : 'high')}
                  minimumTrackTintColor="#5865F2"
                  maximumTrackTintColor={theme === 'light' ? '#e0e0e0' : '#424242'}
                  thumbTintColor="#5865F2"
                />
              </View>
            </View>
            
            {/* Botões para abrir os pickers */}
            <View style={styles.modalSection}>
              <Text style={styles.sectionTitle}>Prazo</Text>
              <View style={styles.datetimeContainer}>
                <TouchableOpacity 
                  style={styles.datetimeButton}
                  onPress={() => {
                    setShowDatePicker(true);
                  }}
                >
                  <Icon name="calendar-today" size={18} color="#5865F2" />
                  <Text style={styles.datetimeButtonText}>
                    {selectedDueDate ? formatDate(selectedDueDate) : 'Selecionar data'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.datetimeButton}
                  onPress={() => {
                    setShowTimePicker(true);
                  }}
                  disabled={!selectedDueDate}
                >
                  <Icon name="access-time" size={18} color="#5865F2" />
                  <Text style={[
                    styles.datetimeButtonText,
                    !selectedDueDate && styles.datetimeButtonTextDisabled
                  ]}>
                    {selectedDueDate ? formatTime(selectedDueDate) : 'Selecionar hora'}
                  </Text>
                </TouchableOpacity>
              </View>
              {selectedDueDate && (
                <TouchableOpacity 
                  style={styles.clearDateButton}
                  onPress={() => setSelectedDueDate(null)}
                >
                  <Text style={styles.clearDateButtonText}>Limpar data</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Botões do Modal */}
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setAddTaskModalVisible(false)}
              >
                <Text style={[styles.buttonText, { color: '#5865F2' }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddTask}
                disabled={!newTaskTitle.trim()}
              >
                <Text style={styles.buttonText}>Adicionar</Text>
              </TouchableOpacity>
            </View>
            {/* Date Picker */}
            {showDatePicker && (
              <DateTimePicker
                value={selectedDueDate ? new Date(selectedDueDate) : new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}

            {/* Time Picker */}
            {showTimePicker && (
              <DateTimePicker
                value={selectedDueDate ? new Date(selectedDueDate) : new Date()}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleTimeChange}
              />
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal para editar tarefa */}
      <Modal
        visible={!!editingTask}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditingTask(null)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Tarefa</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Título*</Text>
              <TextInput
                style={styles.input}
                value={editTaskTitle}
                onChangeText={setEditTaskTitle}
                placeholder="Digite o título da tarefa"
                placeholderTextColor={theme === 'light' ? '#999' : '#777'}
                autoFocus={true}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Descrição</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                value={editTaskText}
                onChangeText={setEditTaskText}
                placeholder="Adicione detalhes (opcional)"
                placeholderTextColor={theme === 'light' ? '#999' : '#777'}
                multiline
              />
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.sectionTitle}>Prioridade</Text>
              <View style={styles.prioritySliderContainer}>
                <View style={styles.priorityLabels}>
                  <Text style={[styles.priorityLabel, priority === 'low' && styles.priorityLabelActive]}>Baixa</Text>
                  <Text style={[styles.priorityLabel, priority === 'medium' && styles.priorityLabelActive]}>Média</Text>
                  <Text style={[styles.priorityLabel, priority === 'high' && styles.priorityLabelActive]}>Alta</Text>
                </View>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={2}
                  step={1}
                  value={priority === 'low' ? 0 : priority === 'medium' ? 1 : 2}
                  onValueChange={(value) => setPriority(value === 0 ? 'low' : value === 1 ? 'medium' : 'high')}
                  minimumTrackTintColor="#5865F2"
                  maximumTrackTintColor={theme === 'light' ? '#e0e0e0' : '#424242'}
                  thumbTintColor="#5865F2"
                />
              </View>
            </View>

            {/* Botões para abrir os pickers */}
            <View style={styles.modalSection}>
              <Text style={styles.sectionTitle}>Prazo</Text>
              <View style={styles.datetimeContainer}>
                <TouchableOpacity 
                  style={styles.datetimeButton}
                  onPress={() => {
                    setShowDatePicker(true);
                  }}
                >
                  <Icon name="calendar-today" size={18} color="#5865F2" />
                  <Text style={styles.datetimeButtonText}>
                    {selectedDueDate ? formatDate(selectedDueDate) : 'Selecionar data'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.datetimeButton}
                  onPress={() => {
                    setShowTimePicker(true);
                  }}
                  disabled={!selectedDueDate}
                >
                  <Icon name="access-time" size={18} color="#5865F2" />
                  <Text style={[
                    styles.datetimeButtonText,
                    !selectedDueDate && styles.datetimeButtonTextDisabled
                  ]}>
                    {selectedDueDate ? formatTime(selectedDueDate) : 'Selecionar hora'}
                  </Text>
                </TouchableOpacity>
              </View>
              {selectedDueDate && (
                <TouchableOpacity 
                  style={styles.clearDateButton}
                  onPress={() => setSelectedDueDate(null)}
                >
                  <Text style={styles.clearDateButtonText}>Limpar data</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Botões do Modal */}
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditingTask(null)}
              >
                <Text style={[styles.buttonText, { color: '#5865F2' }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveEditedTask}
                disabled={!editTaskTitle.trim()}
              >
                <Text style={styles.buttonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
            {/* Date Picker */}
            {showDatePicker && (
              <DateTimePicker
                value={selectedDueDate ? new Date(selectedDueDate) : new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}

            {/* Time Picker */}
            {showTimePicker && (
              <DateTimePicker
                value={selectedDueDate ? new Date(selectedDueDate) : new Date()}
                mode="time"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleTimeChange}
              />
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal para deletar tarefa */}
      <Modal
        visible={!!deleteTaskModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDeleteTaskModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Excluir Tarefa</Text>
            <Text style={styles.deleteText}>
              Tem certeza que deseja excluir a tarefa "{deleteTask?.title}"?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setDeleteTaskModalVisible(false)}
              >
                <Text style={[styles.buttonText, { color: '#5865F2' }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={confirmDeleteTask} // Chame a função de confirmação de exclusão
              >
                <Text style={styles.buttonText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  listTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: theme === 'light' ? '#000' : '#fff',
    textAlign: 'center',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: theme === 'light' ? '#f2f2f2' : '#2f3136',
    borderRadius: 5,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  
  completedTask: {
    backgroundColor: theme === 'light' ? '#e8f5e9' : '#1b5e20',
    borderLeftColor: '#4CAF50',
  },
  
  overdueTask: {
    backgroundColor: theme === 'light' ? '#ffebee' : '#b71c1c',
    borderLeftColor: '#F44336',
  },
  
  taskContent: {
    flex: 1,
    marginLeft: 10,
  },
  
  taskTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme === 'light' ? '#000' : '#fff',
    marginBottom: 4,
  },
  
  taskText: {
    fontSize: 14,
    color: theme === 'light' ? '#555' : '#ddd',
    marginBottom: 4,
  },
  
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  
  taskDueDate: {
    fontSize: 12,
    color: theme === 'light' ? '#666' : '#aaa',
    marginRight: 10,
  },
  
  overdueText: {
    color: '#F44336',
  },
  
  completedText: {
    textDecorationLine: 'line-through',
    color: theme === 'light' ? '#888' : '#aaa',
  },
  
  taskPriority: {
    fontSize: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    color: '#fff',
    overflow: 'hidden',
  },
  taskCheckbox: {
    marginRight: 10,
  },
  taskText: {
    fontSize: 16,
    color: theme === 'light' ? '#000' : '#fff',
    flex: 1,
  },
  completedTaskText: {
    textDecorationLine: 'line-through',
    color: theme === 'light' ? '#888' : '#aaa',
  },
  taskActions: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  taskActionButton: {
    padding: 8,
    marginLeft: 5,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#5865F2',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: theme === 'light' ? '#fff' : '#36393f',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme === 'light' ? '#000' : '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: theme === 'light' ? '#555' : '#aaa',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: theme === 'light' ? '#ddd' : '#555',
    borderRadius: 8,
    padding: 12,
    color: theme === 'light' ? '#000' : '#fff',
    backgroundColor: theme === 'light' ? '#fff' : '#2f3136',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme === 'light' ? '#555' : '#ddd',
    marginBottom: 8,
  },
  prioritySliderContainer: {
    marginTop: 8,
  },
  priorityLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  priorityLabel: {
    fontSize: 12,
    color: theme === 'light' ? '#888' : '#777',
  },
  priorityLabelActive: {
    color: '#5865F2',
    fontWeight: 'bold',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  datetimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  datetimeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: theme === 'light' ? '#f5f5f5' : '#2f3136',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  datetimeButtonText: {
    marginLeft: 8,
    color: '#5865F2',
  },
  datetimeButtonTextDisabled: {
    color: theme === 'light' ? '#aaa' : '#666',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: 'transparent',
  },
  saveButton: {
    backgroundColor: '#5865F2',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  clearDateButton: {
    marginTop: 10,
    alignSelf: 'center',
    padding: 8,
  },
  clearDateButtonText: {
    color: '#F44336',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: theme === 'light' ? '#888' : '#aaa',
    textAlign: 'center',
  },
       deleteButton: {
       backgroundColor: '#ED4245', // Cor de fundo para o botão de exclusão
     },
     
});
