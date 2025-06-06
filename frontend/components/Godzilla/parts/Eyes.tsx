import React from 'react';
import { G, Circle } from 'react-native-svg';
import Animated, { useAnimatedProps } from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface EyesProps {
  followX: number; // Posição horizontal do cursor (0 a 1 normalizado)
  followY: number; // Posição vertical do cursor (0 a 1 normalizado)
  isCovered: boolean;
}

export const Eyes: React.FC<EyesProps> = ({ followX, followY, isCovered }) => {
  // Mapeia a posição do cursor para o movimento das pupilas
  const leftPupilProps = useAnimatedProps(() => {
    const x = 200 + followX * 6; // 200 é a posição central, ±3 de movimento
    const y = 120 + followY * 4; // 120 é a posição central, ±2 de movimento
    return {
      cx: x,
      cy: isCovered ? 24 : y, // Se coberto, olha para baixo
    };
  });

  const rightPupilProps = useAnimatedProps(() => {
    const x = 240 + followX * 6; // 240 é a posição central, ±3 de movimento
    const y = 120 + followY * 4; // 120 é a posição central, ±2 de movimento
    return {
      cx: x,
      cy: isCovered ? 24 : y,
    };
  });

  return (
    <G>
      {/* Olho esquerdo */}
      <Circle cx={200} cy={120} r={8} fill="#5e0f1a" /> {/* Esclera */}
      <AnimatedCircle
        animatedProps={leftPupilProps}
        r={4}
        fill="#ff0000"
      />

      {/* Olho direito */}
      <Circle cx={240} cy={120} r={8} fill="#5e0f1a" /> {/* Esclera */}
      <AnimatedCircle
        animatedProps={rightPupilProps}
        r={4}
        fill="#ff0000"
      />
    </G>
  );
};