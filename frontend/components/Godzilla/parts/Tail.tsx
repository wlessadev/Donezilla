import React from 'react';
import { G, Polygon } from 'react-native-svg';
import Animated, { interpolate, useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';

const AnimatedPolygon = Animated.createAnimatedComponent(Polygon);

interface TailProps {
  coverEyes: boolean;
  coverOneEye: boolean;
}

export const Tail: React.FC<TailProps> = ({ coverEyes, coverOneEye }) => {
  const tailPosition = useSharedValue(0);

  React.useEffect(() => {
    if (coverEyes) {
      tailPosition.value = withTiming(1, { duration: 300 });
    } else if (coverOneEye) {
      tailPosition.value = withTiming(0.5, { duration: 300 });
    } else {
      tailPosition.value = withTiming(0, { duration: 300 });
    }
  }, [coverEyes, coverOneEye]);

  const tailProps = useAnimatedProps(() => {
    const xOffset = interpolate(tailPosition.value, [0, 0.5, 1], [0, 30, 60]);
    const yOffset = interpolate(tailPosition.value, [0, 0.5, 1], [0, -10, -20]);
    
    return {
      points: `
        60,40 
        80,30 
        100,50 
        120,30 
        140,40
        ${140 + xOffset},${40 + yOffset}
        120,60
        100,40
        80,60
        60,40
      `,
    };
  });

  return (
    <G>
      <AnimatedPolygon
        animatedProps={tailProps}
        fill="black"
        stroke="red"
        strokeWidth="1"
      />
      {/* Escamas */}
      <AnimatedPolygon
        animatedProps={tailProps}
        points="80,40 90,35 100,45 90,50"
        fill="red"
      />
      <AnimatedPolygon
        animatedProps={tailProps}
        points="100,35 110,30 120,40 110,45"
        fill="red"
      />
    </G>
  );
};