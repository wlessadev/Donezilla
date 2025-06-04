import React, { useState, useEffect, useContext } from 'react'; // Adicione useContext aqui
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  Modal, 
  TextInput,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { TaskContext } from '../context/TaskContext'; // Importe o TaskContext
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ListsScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const { lists, tasks, setTasks , setLists} = useContext(TaskContext);
  const [editingList, setEditingList] = useState(null);
  const [listToDelete, setListToDelete] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListInput, setNewListInput] = useState('');

  // Carregar dados do AsyncStorage
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

  // Salvar listas no AsyncStorage sempre que houver mudanças
  useEffect(() => {
    const saveLists = async () => {
      try {
        await AsyncStorage.setItem('@lists', JSON.stringify(lists));
      } catch (error) {
        console.error('Error saving lists:', error);
      }
    };
    
    saveLists();
  }, [lists]);

  // Salvar tarefas no AsyncStorage sempre que houver mudanças
  useEffect(() => {
    const saveTasks = async () => {
      try {
        await AsyncStorage.setItem('@tasks', JSON.stringify(tasks));
      } catch (error) {
        console.error('Error saving tasks:', error);
      }
    };
    
    saveTasks();
  }, [tasks]);

  // Função para calcular o progresso de cada lista
  const getListProgress = (listId) => {
    const listTasks = tasks.filter(task => task.listId === listId);
    if (listTasks.length === 0) return 0;
    
    const completedTasks = listTasks.filter(task => task.completed).length;
    return (completedTasks / listTasks.length) * 100;
  };

  // Função para determinar a cor do progresso
  const getProgressColor = (percentage) => {
    if (percentage === 100) return '#4CAF50'; // Verde para 100%
    if (percentage > 50) return '#FFC107'; // Amarelo para 51-99%
    if (percentage > 25) return '#FF9800'; // Laranja para 26-50%
    return '#F44336'; // Vermelho para 0-25%
  };

  const handleDeleteList = (list) => {
    setListToDelete(list);
    setDeleteModalVisible(true);
  };

  const confirmDelete = () => {
    // Remove a lista e suas tarefas associadas
    setLists(lists.filter(item => item.id !== listToDelete.id));
    setTasks(tasks.filter(task => task.listId !== listToDelete.id));
    setDeleteModalVisible(false);
    setListToDelete(null);
  };

  const handleEditList = (list) => {
    setEditingList(list);
    setNewListName(list.name);
    setEditModalVisible(true);
  };

  const saveEditedList = () => {
    setLists(lists.map(list => 
      list.id === editingList.id ? { ...list, name: newListName } : list
    ));
    setEditModalVisible(false);
  };

  const handleAddList = () => {
    if (newListInput.trim() === '') {
      return;
    }
    
    const newList = {
      id: Date.now().toString(),
      name: newListInput.trim(),
      createdAt: new Date().toISOString() // Adiciona a data de criação
    };
    
    setLists([...lists, newList]);
    setNewListInput('');
    setAddModalVisible(false);
  };

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000); // Atualiza a cada minuto
    return () => clearInterval(interval);
  }, []);

// Adicione esta função para formatar o tempo relativo:
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds <= 5) return '⋅ agora';
    
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 60) return `⋅ há ${seconds} segundos`;
    if (minutes < 60) return `⋅ há ${minutes} minuto${minutes !== 1 ? 's' : ''}`;
    if (hours < 24) return `⋅ há ${hours} hora${hours !== 1 ? 's' : ''}`;
    return `⋅ há ${days} dia${days !== 1 ? 's' : ''}`;
  };

  
  const renderItem = ({ item }) => {
    const progress = getListProgress(item.id);
    const progressColor = getProgressColor(progress);
    
    return (
      <TouchableOpacity 
        onPress={() => navigation.navigate('ListTasks', { 
          listId: item.id,
          listName: item.name
        })}
        activeOpacity={0.7}
      >
        <View style={styles.listItem}>
          <View style={styles.titleContainer}>
            <Text style={styles.listText}>{item.name}</Text>
            <Text style={styles.timeAgoText}>
              {formatTimeAgo(item.createdAt)}
            </Text>
          </View>
          {/* Barra de progresso */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: progressColor }]} />
            <View style={styles.progressBackground} />
          </View>
          
          <Text style={styles.progressText}>
            {Math.round(progress)}% completo ({tasks.filter(t => t.listId === item.id && t.completed).length}/{tasks.filter(t => t.listId === item.id).length})
          </Text>
          
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              onPress={(e) => {
                e.stopPropagation();
                handleEditList(item);
              }} 
              style={styles.actionButton}
            >
              <Icon name="edit" size={20} color={theme === 'light' ? '#555' : '#ddd'} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={(e) => {
                e.stopPropagation();
                handleDeleteList(item);
              }} 
              style={styles.actionButton}
            >
              <Icon name="delete" size={20} color={theme === 'light' ? '#555' : '#ddd'} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minhas Listas</Text>
      
      <FlatList
        data={lists}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={lists.length === 0 ? styles.emptyContainer : null}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhuma lista encontrada. Toque no + para adicionar uma!</Text>
        }
      />

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setAddModalVisible(true)}
      >
        <Icon name="add" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Modal de Edição */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Lista</Text>
            
            <TextInput
              style={styles.input}
              value={newListName}
              onChangeText={setNewListName}
              placeholder="Nome da lista"
              placeholderTextColor={theme === 'light' ? '#999' : '#777'}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={[styles.buttonText, { color: theme === 'light' ? '#000' : '#fff' }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={saveEditedList}
              >
                <Text style={styles.buttonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Exclusão */}
      <Modal
        visible={deleteModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Excluir Lista</Text>
            
            <Text style={styles.deleteText}>
              Tem certeza que deseja excluir a lista "{listToDelete?.name}"? Esta ação não pode ser desfeita.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={[styles.buttonText, { color: theme === 'light' ? '#000' : '#fff' }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.deleteButton]}
                onPress={confirmDelete}
              >
                <Text style={styles.buttonText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Adição */}
      <Modal
        visible={addModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAddModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nova Lista</Text>
            
            <TextInput
              style={styles.input}
              value={newListInput}
              onChangeText={setNewListInput}
              placeholder="Nome da lista"
              placeholderTextColor={theme === 'light' ? '#999' : '#777'}
              autoFocus={true}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setAddModalVisible(false)}
              >
                <Text style={[styles.buttonText, { color: theme === 'light' ? '#000' : '#fff' }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddList}
              >
                <Text style={styles.buttonText}>Criar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: theme === 'light' ? '#000' : '#fff',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  listItem: {
    padding: 15,
    backgroundColor: theme === 'light' ? '#f2f2f2' : '#2f3136',
    borderRadius: 5,
    marginBottom: 10,
  },
   listText: {
    fontSize: 16,
    color: theme === 'light' ? '#000' : '#fff',
    flexShrink: 1,
  },
  
  timeAgoText: {
    fontSize: 12,
    color: theme === 'light' ? '#888' : '#aaa',
    marginLeft: 8,
  },
  progressContainer: {
    height: 6,
    width: '100%',
    backgroundColor: theme === 'light' ? '#e0e0e0' : '#424242',
    borderRadius: 3,
    marginBottom: 4,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  progressBackground: {
    flex: 1,
    height: '100%',
    backgroundColor: theme === 'light' ? '#e0e0e0' : '#424242',
  },
  progressText: {
    fontSize: 12,
    color: theme === 'light' ? '#666' : '#aaa',
    marginBottom: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
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
    width: '80%',
    backgroundColor: theme === 'light' ? '#fff' : '#36393f',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: theme === 'light' ? '#000' : '#fff',
  },
  deleteText: {
    color: theme === 'light' ? '#666' : '#ddd',
    marginBottom: 20,
    lineHeight: 22,
  },
  input: {
    borderWidth: 1,
    borderColor: theme === 'light' ? '#ccc' : '#555',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    color: theme === 'light' ? '#000' : '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: theme === 'light' ? '#f2f2f2' : '#2f3136',
  },
  saveButton: {
    backgroundColor: '#5865F2',
  },
  deleteButton: {
    backgroundColor: '#ED4245',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
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
});