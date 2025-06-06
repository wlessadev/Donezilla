import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Keyboard } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { FrontView } from '../components/Godzilla/FrontView';

export default function LoginScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const styles = getStyles(theme);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0.5, y: 0.5 });
  const [focusedInput, setFocusedInput] = useState(null);
  
  const passwordInputRef = useRef(null);
  const emailInputRef = useRef(null);

  const handleLogin = () => {
    Keyboard.dismiss();
    console.log('Login with:', { email, password });
    navigation.navigate('Home');
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
    // Quando mostrar/ocultar senha, manter o foco no campo
    if (passwordInputRef.current) {
      passwordInputRef.current.focus();
    }
  };

  const handleInputFocus = (inputName) => {
    setFocusedInput(inputName);
    // Posição inicial do cursor quando o input ganha foco
    setCursorPos({
      x: inputName === 'password' ? 0.3 : 0.7,
      y: 0.8
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      {/* Godzilla acima dos campos */}
      <View style={styles.godzillaContainer}>
        <FrontView
          eyePosition={cursorPos}
          isPasswordField={focusedInput === 'password'}
          showPassword={showPassword}
          onTogglePassword={toggleShowPassword}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          ref={emailInputRef}
          style={styles.input}
          placeholder="Digite seu email"
          placeholderTextColor={theme === 'light' ? '#999' : '#aaa'}
          value={email}
          onChangeText={setEmail}
          onChange={(e) => {
            // Atualiza a posição X do cursor baseado no comprimento do texto
            const textLength = e.nativeEvent.text.length;
            const normX = Math.min(0.5 + (textLength * 0.05), 0.95);
            setCursorPos({ x: normX, y: 0.8 });
          }}
          onFocus={() => handleInputFocus('email')}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Senha</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            ref={passwordInputRef}
            style={styles.passwordInput}
            placeholder="Digite sua senha"
            placeholderTextColor={theme === 'light' ? '#999' : '#aaa'}
            value={password}
            onChangeText={setPassword}
            onChange={(e) => {
              const textLength = e.nativeEvent.text.length;
              const normX = Math.min(0.3 + (textLength * 0.05), 0.95);
              setCursorPos({ x: normX, y: 0.8 });
            }}
            onFocus={() => handleInputFocus('password')}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity 
            onPress={toggleShowPassword} 
            style={styles.eyeButton}
          >
            <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.linkText}>Não tem uma conta? Registre-se</Text>
      </TouchableOpacity>
    </View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40, // Reduzi um pouco para dar espaço ao Godzilla
    backgroundColor: theme === 'light' ? '#fff' : 
                     theme === 'dark' ? '#36393f' : '#202225',
  },
  godzillaContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 250, // Altura fixa para o container do Godzilla
    marginBottom: 10,
    backgroundColor: 'blue', // Transparente para ver o Godzilla
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
  linkText: {
    color: theme === 'light' ? '#5865F2' : '#7289da',
    textAlign: 'center',
    marginTop: 15,
  },
});