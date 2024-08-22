import AsyncStorage from '@react-native-async-storage/async-storage';

export const GET_FROM_STORAGE = async key => {
  try {
    const result = await AsyncStorage.getItem(key);
    const storededData = result ? JSON.parse(result) : null;
    return storededData;
  } catch (error) {
    console.log('Error occured while getting data from storage');
  }
};
export const POST_TO_STORAGE = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.log('Error occured while getting data from storage');
  }
};
