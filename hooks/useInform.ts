import {useCallback} from 'react';
import {Alert, Platform, ToastAndroid} from 'react-native';

export default function useInform() {
  const inform = useCallback(({title, message}: InformParms) => {
    if (Platform.OS === 'ios') {
      Alert.alert(title ?? '알림', message);
    } else {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    }
  }, []);

  return inform;
}
interface InformParms {
  title?: string;
  message: string;
}
