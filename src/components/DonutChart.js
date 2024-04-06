// components/DonutChart.js
import React from 'react';
import {View} from 'react-native';
import {Path, Svg} from 'react-native-svg';
const DonutChart = ({data, width, height}) => {
  const total = data.reduce((acc, {value}) => acc + 2, 0);
  const innerRadius = width / 7;
  const outerRadius = width / 8;

  let startAngle = 0;
  const spaceBetween = data?.length > 1 ? 5 : 1; // Adjust this value to increase or decrease space between slices

  const chartData = data.map(({value, color}) => {
    const angle = (2 / total) * (360 - spaceBetween * data.length); // Adjusting for space between slices
    const innerStart = polarToCartesian(
      width / 2,
      height / 2,
      innerRadius,
      startAngle,
    );
    const outerStart = polarToCartesian(
      width / 2,
      height / 2,
      outerRadius,
      startAngle,
    );
    const innerEnd = polarToCartesian(
      width / 2,
      height / 2,
      innerRadius,
      startAngle + angle,
    );
    const outerEnd = polarToCartesian(
      width / 2,
      height / 2,
      outerRadius,
      startAngle + angle,
    );

    const largeArcFlag = angle <= 180 ? '0' : '1';

    const path = [
      `M ${outerStart.x} ${outerStart.y}`,
      `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y}`,
      `L ${innerEnd.x} ${innerEnd.y}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStart.x} ${innerStart.y}`,
      'Z', // Close path
    ].join(' ');

    startAngle += angle + spaceBetween; // Increment startAngle for the next slice
    return {path, color};
  });

  return (
    <Svg
      style={{
        position: 'absolute',
        alignItems: 'center',
        display: 'flex',
        justifyContent: 'center',
        left: '-125%',
      }}
      width={width}
      height={height}>
      {chartData.map(({path, color}, index) => (
        <Path key={index} d={path} fill={'#14ff56'} />
      ))}
    </Svg>
  );
};

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

export default DonutChart;
