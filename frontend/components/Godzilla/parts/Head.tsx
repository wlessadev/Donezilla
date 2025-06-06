import React from 'react';
import { G, Polygon, Path, Circle } from 'react-native-svg';

export const Head: React.FC = () => {
    return (
        <G>
            {/* Polígono principal da cabeça */}
            <Polygon
                points="110,250 325,250 275,90 215,70 155,90"
                fill="black"
                stroke="red"
                strokeWidth="2"
            />

            {/* Primeira linha (olho esquerdo) */}
            <Path
                d="M 206,165 L 196,155"
                fill="none"
                stroke="red"
                strokeWidth="1"
            />
            {/* Ponto abaixo da primeira linha */}
            <Circle
                cx="196"  // Ponto médio entre 206 e 196, afastado 3 unidades
                cy="164"  // Abaixo da coordenada Y (165), subido 4 unidades
                r="1.5"   // Raio pequeno para parecer um ponto
                fill="red"
            />

            {/* Segunda linha (olho direito) */}
            <Path
                d="M 239,155 L 229,165"
                fill="none"
                stroke="red"
                strokeWidth="1"
            />
            {/* Ponto abaixo da segunda linha */}
            <Circle
                cx="239"  // Ponto médio entre 239 e 229, afastado 3 unidades
                cy="164"  // Abaixo da coordenada Y (165), subido 4 unidades
                r="1.5"
                fill="red"
            />
            <Path
                d="M 160,160 L 185,190 H 250 L 275,160"
                fill="none"
                stroke="red"
                strokeWidth="1"
            />
            <Path
                d="M 150,185 L 170,215 H 265 L 285,185"
                fill="none"
                stroke="red"
                strokeWidth="1"
            />
        </G>
    );
};
