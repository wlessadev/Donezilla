import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet , Text} from 'react-native';
import { Svg } from 'react-native-svg';
import { Eyes } from './parts/Eyes';
import { Tail } from './parts/Tail';
import { Head } from './parts/Head';
import Animated, { useSharedValue, useDerivedValue } from 'react-native-reanimated';

interface FrontViewProps {
  // Props para controle externo (opcional)
  eyePosition?: { x: number; y: number };
  isPasswordField?: boolean;
  showPassword?: boolean;
}

export const FrontView: React.FC<FrontViewProps> = ({
  eyePosition,
  isPasswordField = false,
  showPassword = false,
}) => {
  // Estado para a posição do cursor (se não for controlado externamente)
  const [cursorPosition, setCursorPosition] = useState({ x: 0.5, y: 0.5 });
  
  // Posição normalizada do cursor (0 a 1)
  const normX = useDerivedValue(() => {
    return eyePosition?.x ?? cursorPosition.x;
  });
  
  const normY = useDerivedValue(() => {
    return eyePosition?.y ?? cursorPosition.y;
  });

  // Controle da cauda
  const coverEyes = isPasswordField && !showPassword;
  const coverOneEye = isPasswordField && showPassword;

  return (
    <View style={styles.container}>
        <Svg 
            width="340" 
            height="250" 
            viewBox="0 0 340 250"
            style={{ backgroundColor: "green" }}  // Alterado para verde
        >
        <Head />
        <Eyes 
          followX={normX.value} 
          followY={normY.value} 
          isCovered={coverEyes || coverOneEye} 
        />
        <Tail coverEyes={coverEyes} coverOneEye={coverOneEye} />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButton: {
    marginTop: 10,
    padding: 5,
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
});