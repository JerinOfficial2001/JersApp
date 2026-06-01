import React, {useContext, useState} from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  ToastAndroid,
} from 'react-native';
import {MyContext} from '../App';
import {FAB, ActivityIndicator} from 'react-native-paper';
import {AddTextStatus} from '../src/controllers/status';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const BG_COLORS = [
  '#075E54', // Classic Teal
  '#128C7E', // WhatsApp Green
  '#9C27B0', // Purple
  '#E91E63', // Pink
  '#3F51B5', // Indigo
  '#009688', // Teal
  '#FF5722', // Deep Orange
  '#607D8B', // Blue Grey
];

export default function AddTextStatusScreen({route, navigation}) {
  const {jersAppTheme} = useContext(MyContext);
  const {id} = route.params;
  const [text, setText] = useState('');
  const [bgColorIndex, setBgColorIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const activeBg = BG_COLORS[bgColorIndex];

  const handleCycleBg = () => {
    setBgColorIndex((bgColorIndex + 1) % BG_COLORS.length);
  };

  const handlePost = async () => {
    if (!text.trim()) {
      ToastAndroid.show('Please enter status text', ToastAndroid.SHORT);
      return;
    }
    setLoading(true);
    const res = await AddTextStatus(id, text, activeBg);
    setLoading(false);
    if (res && res.status === 'ok') {
      navigation.goBack();
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: activeBg,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 24,
    },
    topBar: {
      position: 'absolute',
      top: 40,
      left: 16,
      right: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      zIndex: 10,
    },
    actionBtn: {
      padding: 10,
      backgroundColor: 'rgba(0,0,0,0.2)',
      borderRadius: 24,
    },
    input: {
      color: '#fff',
      fontSize: 28,
      textAlign: 'center',
      width: '100%',
      fontWeight: '500',
      minHeight: 150,
    },
    fabPost: {
      position: 'absolute',
      margin: 16,
      right: 8,
      bottom: 16,
      backgroundColor: '#25D366',
      borderRadius: 16,
    },
  });

  return (
    <View style={styles.container}>
      {/* Top action buttons */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="close" size={26} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={handleCycleBg}
        >
          <MaterialCommunityIcons name="palette" size={26} color="white" />
        </TouchableOpacity>
      </View>

      {/* Main Status Input */}
      <TextInput
        style={styles.input}
        multiline
        placeholder="Type a status..."
        placeholderTextColor="rgba(255,255,255,0.6)"
        value={text}
        onChangeText={setText}
        maxLength={200}
        autoFocus
      />

      {/* Post FAB */}
      {loading ? (
        <View style={[styles.fabPost, {padding: 12, borderRadius: 28}]}>
          <ActivityIndicator color="white" size="small" />
        </View>
      ) : (
        <FAB
          icon="send"
          color="white"
          style={styles.fabPost}
          onPress={handlePost}
        />
      )}
    </View>
  );
}
