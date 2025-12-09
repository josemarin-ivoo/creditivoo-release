import React from 'react';
import Svg, {G, Path, Circle, Rect} from 'react-native-svg';
import {IVOO_COLORS} from '../styles';

interface PhoneIllustrationProps {
  width?: number | string;
  height?: number | string;
}

const PhoneIllustration: React.FC<PhoneIllustrationProps> = ({
  width = 120,
  height = 169,
}) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 120 169" fill="none">
      {/* Phone Outline */}
      <Path
        d="M84.4 0H35.6C15.9 0 0 15.9 0 35.6v98c0 19.7 15.9 35.6 35.6 35.6h48.8c19.7 0 35.6-15.9 35.6-35.6v-98C120 15.9 104.1 0 84.4 0z"
        fill="#E5E5E5"
        stroke="#CCCCCC"
        strokeWidth="2"
      />
      {/* Phone Screen */}
      <Path
        d="M76.3 10H43.7c-2.8 0-5.1 2.3-5.1 5.1v125.8c0 2.8 2.3 5.1 5.1 5.1h32.6c2.8 0 5.1-2.3 5.1-5.1V15.1c0-2.8-2.3-5.1-5.1-5.1z"
        fill="#FFFFFF"
      />
      {/* Green Circle with Envelope */}
      <Circle cx="60" cy="55" r="26" fill={IVOO_COLORS.primary} />
      {/* Envelope Icon */}
      <G transform="translate(50, 45)">
        <Path
          d="M10 5L5 9l5 4v6h10v-6l5-4-5-4H10zm0 2h10l3 2.5L15 12H5l-3-2.5L5 7z"
          fill={IVOO_COLORS.white}
        />
      </G>
      {/* Bottom Line */}
      <Path
        d="M0 155h120"
        stroke="#E5E5E5"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </Svg>
  );
};

export default PhoneIllustration;

