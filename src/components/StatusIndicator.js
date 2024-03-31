import React, {useEffect, useState} from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import {ProgressBar} from 'react-native-paper';

const StatusIndicator = ({totalStatus, currentStatus}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (progress < 1) {
        setProgress(prevProgress => prevProgress + 0.1);
      } else {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [progress]);

  const statusNumbers = Array.from(
    {length: totalStatus},
    (_, index) => index + 1,
  );

  const statusNumberWidth = totalStatus > 5 ? 16 : 100 / totalStatus;

  return (
    <View style={styles.container}>
      <View style={styles.statusNumbersContainer}>
        {statusNumbers.map(number => (
          <View
            key={number}
            style={[
              styles.statusNumber,
              {
                width: `${statusNumberWidth}%`,
                backgroundColor: number === currentStatus ? '#008169' : '#ccc',
              },
            ]}></View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  statusNumbersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    width: '100%',
  },
  statusNumber: {
    height: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 5,
  },
});

export default StatusIndicator;
