import React, { useState, useEffect } from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity, TextInput, Alert, Image, Modal } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [avatar, setAvatar] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('john@example.com');
  const [currentEmail, setCurrentEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [confirmNewEmail, setConfirmNewEmail] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  

  const handleImagePress = () => {
    setModalVisible(true);
  };

  const handleAddImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'We need access to your photos to set a profile picture');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
    setModalVisible(false);
  };

  const handleRemoveImage = () => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove your profile photo?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          onPress: () => {
            setAvatar(null);
            setModalVisible(false);
          },
          style: 'destructive',
        },
      ]
    );
  };

  useEffect(() => {
    const loadName = async () => {
      try {
        const storedName = await AsyncStorage.getItem('username');
        if (storedName !== null) {
          setName(storedName);
        }
      } catch (error) {
        console.error('Failed to load name:', error);
      }
    };
    
    loadName();
  }, []);

// Função para salvar o nome quando ele muda
  const handleUpdateName = async () => {
    try {
      if (name.trim() === '') {
        Alert.alert('Error', 'Name cannot be empty');
        return;
      }
      
      await AsyncStorage.setItem('username', name);
      Alert.alert('Success', 'Name updated successfully');
    } catch (error) {
      console.error('Failed to save name:', error);
      Alert.alert('Error', 'Failed to update name');
    }
  };
  
  useEffect(() => {
    const saveName = async () => {
      if (name.trim() !== '') {
        try {
          await AsyncStorage.setItem('username', name);
        } catch (error) {
          console.error('Failed to save name:', error);
        }
      }
    };
    
    const timer = setTimeout(() => {
      saveName();
    }, 1000); // Debounce de 1 segundo
    
    return () => clearTimeout(timer);
  }, [name]);

  const handleUpdateEmail = () => {
    if (currentEmail !== email) {
      Alert.alert('Error', 'Current email is incorrect');
      return;
    }

    if (newEmail.trim() === '') {
      Alert.alert('Error', 'New email cannot be empty');
      return;
    }

    if (newEmail !== confirmNewEmail) {
      Alert.alert('Error', 'New emails do not match');
      return;
    }

    setEmail(newEmail);
    setCurrentEmail('');
    setNewEmail('');
    setConfirmNewEmail('');
    setIsEditing(false);
    Alert.alert('Success', 'Email updated successfully');
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={handleImagePress}>
          <View style={styles.avatarContainer}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatar} />
            )}
            <View style={styles.cameraIcon}>
              <Ionicons name="camera" size={20} color="#fff" />
            </View>
          </View>
        </TouchableOpacity>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.email}>{email}</Text>
      </View>

      {/* Modal para gerenciamento da foto */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme === 'light' ? '#fff' : '#36393f' }]}>
            <Text style={[styles.modalTitle, { color: theme === 'light' ? '#000' : '#fff' }]}>
              {avatar ? 'Profile Photo' : 'Add Profile Photo'}
            </Text>
            
            {avatar ? (
              <>
                <TouchableOpacity 
                  style={styles.modalButton} 
                  onPress={handleAddImage}
                >
                  <Text style={styles.modalButtonText}>Change Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.removeButton]}
                  onPress={handleRemoveImage}
                >
                  <Text style={[styles.modalButtonText, { color: '#ff4444' }]}>Remove Photo</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity 
                style={styles.modalButton} 
                onPress={handleAddImage}
              >
                <Text style={styles.modalButtonText}>Choose from Gallery</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Name</Text>
          <View style={styles.nameContainer}>
            <TextInput
              style={[styles.input, styles.nameInput]}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor={theme === 'light' ? '#999' : '#666'}
            />
            <TouchableOpacity 
              style={[styles.saveButton, styles.nameSaveButton]} 
              onPress={handleUpdateName}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>

        {isEditing ? (
          <>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Current Email</Text>
              <TextInput
                style={styles.input}
                value={currentEmail}
                onChangeText={setCurrentEmail}
                placeholder="Enter current email"
                placeholderTextColor={theme === 'light' ? '#999' : '#666'}
                keyboardType="email-address"
              />
            </View>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>New Email</Text>
              <TextInput
                style={styles.input}
                value={newEmail}
                onChangeText={setNewEmail}
                placeholder="Enter new email"
                placeholderTextColor={theme === 'light' ? '#999' : '#666'}
                keyboardType="email-address"
              />
            </View>
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>Confirm New Email</Text>
              <TextInput
                style={styles.input}
                value={confirmNewEmail}
                onChangeText={setConfirmNewEmail}
                placeholder="Confirm new email"
                placeholderTextColor={theme === 'light' ? '#999' : '#666'}
                keyboardType="email-address"
              />
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setIsEditing(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={handleUpdateEmail}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <TouchableOpacity 
            style={styles.editButton} 
            onPress={() => setIsEditing(true)}
          >
            <Text style={styles.editButtonText}>Change Email</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <View style={styles.preferenceItem}>
          <Text style={styles.preferenceText}>Theme</Text>
          <ThemeToggle />
        </View>

        <View style={styles.preferenceItem}>
          <Text style={styles.preferenceText}>Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            thumbColor={theme === 'light' ? '#5865F2' : '#7289da'}
            trackColor={{ false: '#767577', true: theme === 'light' ? '#5865F2' : '#7289da' }}
          />
        </View>
      </View>
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
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme === 'light' ? '#ddd' : '#5865F2',
  },
  cameraIcon: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: theme === 'light' ? '#5865F2' : '#202225',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme === 'light' ? '#fff' : '#36393f',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme === 'light' ? '#000' : '#fff',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: theme === 'light' ? '#666' : '#aaa',
  },
  section: {
    marginTop: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: theme === 'light' ? '#000' : '#fff',
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme === 'light' ? '#eee' : '#2f3136',
  },
  preferenceText: {
    fontSize: 16,
    color: theme === 'light' ? '#000' : '#fff',
  },
  settingItem: {
    marginBottom: 15,
  },
  settingLabel: {
    fontSize: 14,
    color: theme === 'light' ? '#666' : '#aaa',
    marginBottom: 5,
  },
  input: {
    backgroundColor: theme === 'light' ? '#f5f5f5' : '#2f3136',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: theme === 'light' ? '#000' : '#fff',
  },
  editButton: {
    backgroundColor: theme === 'light' ? '#f0f0f0' : '#2f3136',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: theme === 'light' ? '#5865F2' : '#7289da',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: theme === 'light' ? '#f0f0f0' : '#2f3136',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#5865F2',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 5,
    backgroundColor: '#5865F2',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  removeButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameInput: {
    flex: 3,
    marginRight: 10,
  },
  nameSaveButton: {
    width: 40,
    paddingVertical: 12,
  },
});