// import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';

const StatusIndicator = ({totalStatus, currentStatus}) => {
  // Generate array of numbers from 1 to totalStatus
  const statusNumbers = Array.from(
    {length: totalStatus},
    (_, index) => index + 1,
  );

  return (
    <View style={styles.container}>
      <View style={styles.centralStatus}>
        <Image
          source={require('../assets/user.png')}
          style={styles.statusImage}
        />
      </View>
      <View style={styles.statusNumbersContainer}>
        {statusNumbers.map(number => (
          <View
            key={number}
            style={[
              styles.statusNumber,
              number === currentStatus ? styles.currentStatus : null,
            ]}>
            <Text style={styles.statusNumberText}>{number}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  centralStatus: {
    marginHorizontal: 10,
  },
  statusImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    resizeMode: 'cover',
  },
  statusNumbersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusNumber: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  currentStatus: {
    backgroundColor: '#007bff',
  },
  statusNumberText: {
    color: 'white',
  },
});

export default StatusIndicator;
