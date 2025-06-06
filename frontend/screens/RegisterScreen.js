import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, Modal } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const styles = getStyles(theme);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [step, setStep] = useState(1); // 1 = credenciais, 2 = avatar

  const validateEmail = (email) => {
    const re = /^[^\s@]{3,}@[^\s@]{3,}\.[^\s@]{2,}$/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const validateUsername = (username) => {
    return username.length >= 3;
  };

  const handleContinue = () => {
    if (!validateEmail(email)) {
      Alert.alert('Email inválido', 'Por favor, insira um email válido (exemplo: abc@abc.br)');
      return;
    }
    
    if (!validatePassword(password)) {
      Alert.alert('Senha inválida', 'A senha deve ter pelo menos 8 caracteres');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Senhas não coincidem', 'As senhas digitadas não são iguais');
      return;
    }
    
    setStep(2);
  };

  const handleRegister = () => {
    if (!validateUsername(username)) {
      Alert.alert('Nome de usuário inválido', 'O nome de usuário deve ter pelo menos 3 caracteres');
      return;
    }
    
    console.log('Register with:', { email, password, username, avatar });
    navigation.navigate('Home');
  };

  const toggleShowPassword = () => setShowPassword(!showPassword);
  const toggleShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  const handleAddImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos acessar suas fotos para definir uma foto de perfil');
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
      'Remover Foto',
      'Tem certeza que deseja remover sua foto de perfil?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Remover',
          onPress: () => {
            setAvatar(null);
            setModalVisible(false);
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {step === 1 ? (
        <>
          <Text style={styles.title}>Criar Conta</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu email"
              placeholderTextColor={theme === 'light' ? '#999' : '#aaa'}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Senha</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Digite sua senha (mínimo 8 caracteres)"
                placeholderTextColor={theme === 'light' ? '#999' : '#aaa'}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={toggleShowPassword} style={styles.eyeButton}>
                <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirmar Senha</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirme sua senha"
                placeholderTextColor={theme === 'light' ? '#999' : '#aaa'}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity onPress={toggleShowConfirmPassword} style={styles.eyeButton}>
                <Text style={styles.eyeIcon}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={[
              styles.button, 
              !validateEmail(email) || !validatePassword(password) || password !== confirmPassword 
                ? styles.buttonDisabled 
                : null
            ]} 
            onPress={handleContinue}
            disabled={!validateEmail(email) || !validatePassword(password) || password !== confirmPassword}
          >
            <Text style={styles.buttonText}>Continuar</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>Já tem uma conta? Faça login</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.title}>Complete seu perfil</Text>
          
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={() => setModalVisible(true)}>
              <View style={styles.avatarContainer}>
                {avatar ? (
                  <Image source={{ uri: avatar }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, { backgroundColor: theme === 'light' ? '#ddd' : '#5865F2' }]} />
                )}
                <View style={styles.cameraIcon}>
                  <Ionicons name="camera" size={20} color="#fff" />
                </View>
              </View>
            </TouchableOpacity>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nome de usuário</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite seu nome de usuário (mínimo 3 letras)"
                placeholderTextColor={theme === 'light' ? '#999' : '#aaa'}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.button, !validateUsername(username) ? styles.buttonDisabled : null]} 
            onPress={handleRegister}
            disabled={!validateUsername(username)}
          >
            <Text style={styles.buttonText}>Registrar</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setStep(1)}>
            <Text style={styles.linkText}>Voltar</Text>
          </TouchableOpacity>

          {/* Modal para seleção de foto */}
          <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: theme === 'light' ? '#fff' : '#36393f' }]}>
                <Text style={[styles.modalTitle, { color: theme === 'light' ? '#000' : '#fff' }]}>
                  {avatar ? 'Foto de Perfil' : 'Adicionar Foto'}
                </Text>
                
                {avatar ? (
                  <>
                    <TouchableOpacity 
                      style={styles.modalButton} 
                      onPress={handleAddImage}
                    >
                      <Text style={styles.modalButtonText}>Alterar Foto</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.modalButton, styles.removeButton]}
                      onPress={handleRemoveImage}
                    >
                      <Text style={[styles.modalButtonText, { color: '#ff4444' }]}>Remover Foto</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity 
                    style={styles.modalButton} 
                    onPress={handleAddImage}
                  >
                    <Text style={styles.modalButtonText}>Escolher da Galeria</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity 
                  style={styles.modalButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: theme === 'light' ? '#fff' : 
                     theme === 'dark' ? '#36393f' : '#202225',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: theme === 'light' ? '#000' : '#fff',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 5,
    color: theme === 'light' ? '#000' : '#fff',
  },
  input: {
    backgroundColor: theme === 'light' ? '#f7f7f7' : '#2f3136',
    color: theme === 'light' ? '#000' : '#fff',
    padding: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: theme === 'light' ? '#ddd' : '#444',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme === 'light' ? '#f7f7f7' : '#2f3136',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: theme === 'light' ? '#ddd' : '#444',
  },
  passwordInput: {
    flex: 1,
    color: theme === 'light' ? '#000' : '#fff',
    padding: 15,
  },
  eyeButton: {
    padding: 15,
  },
  eyeIcon: {
    fontSize: 16,
  },
  button: {
    backgroundColor: '#5865F2',
    padding: 15,
    borderRadius: 5,
    marginVertical: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#999',
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  linkText: {
    color: theme === 'light' ? '#5865F2' : '#7289da',
    textAlign: 'center',
    marginTop: 15,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
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
});