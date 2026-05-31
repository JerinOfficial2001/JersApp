import React from 'react';
import {Path, Svg} from 'react-native-svg';

export default function Send({color}) {
  return (
    <Svg
      width="27"
      height="21"
      viewBox="0 0 47 41"
      fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <Path
        d="M3.73333 39.8173C2.84444 40.1728 2 40.0946 1.2 39.5826C0.4 39.0706 0 38.3266 0 37.3506V25.3506L21.3333 20.0173L0 14.684V2.68396C0 1.70618 0.4 0.962179 1.2 0.451957C2 -0.0582657 2.84444 -0.136489 3.73333 0.217289L44.8 17.5506C45.9111 18.0395 46.4667 18.8617 46.4667 20.0173C46.4667 21.1728 45.9111 21.9951 44.8 22.484L3.73333 39.8173Z"
        fill={color ? color : 'white'}
      />
    </Svg>
  );
}
