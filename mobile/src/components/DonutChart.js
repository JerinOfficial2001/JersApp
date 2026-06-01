import React, {useContext} from 'react';
import {StyleSheet} from 'react-native';
import {Circle, Svg} from 'react-native-svg';
import {MyContext} from '../../App';

const DonutChart = ({data, size = 58}) => {
  const {jersAppTheme} = useContext(MyContext);
  
  if (!data || data.length === 0) return null;

  const N = data.length;
  const radius = (size - 4) / 2; // e.g. (58 - 4)/2 = 27
  const strokeWidth = 2.5;
  const center = size / 2; // 29
  const circumference = 2 * Math.PI * radius; // ~169.6
  
  const statusColor = jersAppTheme.statusIndicator || '#25D366';

  if (N === 1) {
    // Single status update - solid circle
    return (
      <Svg width={size} height={size} style={styles.svg}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke={statusColor}
          strokeWidth={strokeWidth}
        />
      </Svg>
    );
  }

  // Multiple status updates - segmented circle
  const gap = 4.5;
  const totalGapLength = N * gap;
  const segmentLength = (circumference - totalGapLength) / N;
  const strokeDasharray = `${segmentLength} ${gap}`;

  // Start rotation from top (-90 degrees)
  const rotation = -90;

  return (
    <Svg width={size} height={size} style={styles.svg}>
      <Circle
        cx={center}
        cy={center}
        r={radius}
        fill="transparent"
        stroke={statusColor}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        strokeDashoffset={0}
        transform={`rotate(${rotation} ${center} ${center})`}
        strokeLinecap="round"
      />
    </Svg>
  );
};

const styles = StyleSheet.create({
  svg: {
    position: 'absolute',
    top: -2,
    left: -2,
    zIndex: 1,
  },
});

export default DonutChart;
