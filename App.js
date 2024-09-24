import { useState, useEffect, useRef } from 'react';
import { Text, View, Button, Platform, TextInput, TouchableOpacity } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function App() {
 const [title, setTitle] = useState('');
 const [body, setBody] = useState('');
 const [time, setTime] = useState('');
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => console.log('token=>'));

    if (Platform.OS === 'android') {
      Notifications.getNotificationChannelsAsync().then(value => console.log('value'));
    }
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('nott');
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('response');
    });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(notificationListener.current);
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  async function schedulePushNotification() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        data: { data: 'goes here', test: { test1: 'more data' } },
      },
      trigger: { seconds: 5 },
    });
  }

  console.log(time, body, title, "check");

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <TextInput onChangeText={(txt) => setTitle(txt)} value={title} placeholder='Enter Notification Titile' style={{  width: '90%', height: 50, borderWidth: 1, paddingLeft: 20 }} />
      <TextInput onChangeText={(txt) => setBody(txt)} value={body} placeholder='Enter Notification Body' style={{  width: '90%', height: 50, borderWidth: 1, paddingLeft: 20, marginTop: 20  }} />

      <TextInput onChangeText={(txt) => setTime(txt)} value={time} placeholder='Enter Notification Time' style={{  width: '90%', height: 50, borderWidth: 1, paddingLeft: 20, marginTop: 20 }} />
  <TouchableOpacity  onPress={async() => {
  await schedulePushNotification();
}} style={{ width: '90%', height: 50, backgroundColor: 'blue', justifyContent: 'center', alignItems: 'center', marginTop: 50  }}>
<Text style={{ color: 'white'  }} 

>Send Notification</Text>

  </TouchableOpacity>
    </View>
  );
}



async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    // Learn more about projectId:
    // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
    // EAS projectId is used here.
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      if (!projectId) {
        throw new Error('Project ID not found');
      }
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log(token);
    } catch (e) {
      token = `${e}`;
    }
  } else {
    alert('Must use physical device for Push Notifications');
  }

  return token;
}
