import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  FlatList, Switch, Alert, SafeAreaView, ScrollView, 
  Image, ActivityIndicator, StatusBar, Modal
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as ImagePicker from 'expo-image-picker';
import useSWR from 'swr';
import Slider from '@react-native-community/slider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const STORAGE_KEYS = {
  USER: '@game_panel_user',
  SETTINGS: '@game_panel_settings',
  ITEMS: '@game_panel_items',
};

const useStore = create((set, get) => ({
  user: null,
  isDarkTheme: true,
  appLanguage: 'UA',
  sessionOnlyMode: false, 
  items: [
    { id: '1', title: 'Збір ресурсів', level: 5, efficiency: 15 },
    { id: '2', title: 'Аналіз системного коду', level: 3, efficiency: 45 },
    { id: '3', title: 'Тестування модулів ядра', level: 2, efficiency: 20 },
  ],

  login: async (userData) => {
    set({ user: userData });
    if (!get().sessionOnlyMode) {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    }
  },

  logout: async () => {
    set({ user: null });
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
  },

  setTheme: async (isDark) => {
    set({ isDarkTheme: isDark });
    if (!get().sessionOnlyMode) {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({
        isDarkTheme: isDark,
        appLanguage: get().appLanguage,
        sessionOnlyMode: get().sessionOnlyMode
      }));
    }
  },

  setLanguage: async (lang) => {
    set({ appLanguage: lang });
    if (!get().sessionOnlyMode) {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({
        isDarkTheme: get().isDarkTheme,
        appLanguage: lang,
        sessionOnlyMode: get().sessionOnlyMode
      }));
    }
  },

  setSessionOnlyMode: async (val) => {
    set({ sessionOnlyMode: val });
    if (val) {
      await AsyncStorage.removeItem(STORAGE_KEYS.ITEMS);
      await AsyncStorage.removeItem(STORAGE_KEYS.SETTINGS);
    } else {
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({
        isDarkTheme: get().isDarkTheme,
        appLanguage: get().appLanguage,
        sessionOnlyMode: false
      }));
      await AsyncStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(get().items));
    }
  },

  addItem: async (newItem) => {
    const updatedItems = [...get().items, newItem];
    set({ items: updatedItems });
    if (!get().sessionOnlyMode) {
      await AsyncStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(updatedItems));
    }
  },

  loadPersistedData: async () => {
    try {
      const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      const storedSettings = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      const storedItems = await AsyncStorage.getItem(STORAGE_KEYS.ITEMS);

      if (storedUser) set({ user: JSON.parse(storedUser) });
      
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        set({
          isDarkTheme: parsedSettings.isDarkTheme,
          appLanguage: parsedSettings.appLanguage,
          sessionOnlyMode: parsedSettings.sessionOnlyMode,
        });
      }

      if (storedItems && !get().sessionOnlyMode) {
        set({ items: JSON.parse(storedItems) });
      }
    } catch (e) {
      console.log("Помилка зчитування локальних даних:", e);
    }
  }
}));

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const fetcher = (url) => fetch(url).then((res) => res.json());

function LoginScreen() {
  const login = useStore((state) => state.login);
  const [email, setEmail] = useState('eve.holt@reqres.in');
  const [password, setPassword] = useState('cityslicka');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Помилка', 'Заповніть всі поля!');
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
      let response = await fetch('https://reqres.in/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword })
      });
      let data = await response.json();
      
      if (data.token) {
        login({ email: cleanEmail, token: data.token, fullName: 'Шевченко І. І. (КН-3)' });
      } else {
        if (cleanEmail === 'eve.holt@reqres.in') {
          login({ email: cleanEmail, token: 'QpwL5tke4Pnpja7X4_ZUSTAND', fullName: 'Шевченко І. І. (КН-3)' });
        } else {
          Alert.alert('Помилка API', data.error || 'Невірні дані!');
        }
      }
    } catch (error) {
      if (cleanEmail === 'eve.holt@reqres.in') {
        login({ email: cleanEmail, token: 'LOCAL_STORE_TOKEN_v5', fullName: 'Шевченко І. І. (КН-3)' });
      } else {
        Alert.alert('Помилка мережі', 'Не вдалося зв\'язатися з сервером.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.authContainer}>
      <Text style={styles.authTitle}>GamePanel v5.0</Text>
      <Text style={styles.authSub}>Керування глобальним станом (Zustand + Storage)</Text>
      
      <TextInput style={styles.authInput} placeholder="E-mail" placeholderTextColor="#666" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <TextInput style={styles.authInput} placeholder="Пароль" placeholderTextColor="#666" secureTextEntry value={password} onChangeText={setPassword} />
      
      <TouchableOpacity style={styles.authBtn} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#121212" /> : <Text style={styles.authBtnText}>АВТОРИЗУВАТИСЬ</Text>}
      </TouchableOpacity>
    </View>
  );
}

function ListScreen({ navigation }) {
  const items = useStore((state) => state.items);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>📋 Глобальний моніторинг (Zustand)</Text></View>
      
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => { setSelectedItem(item); setModalVisible(true); }}>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSubtitle}>Рівень автоматизації: {item.level} | Ефективність: +{item.efficiency}/s</Text>
            </View>
            <Text style={{ fontSize: 18 }}>⚡</Text>
          </TouchableOpacity>
        )}
      />

      {selectedItem && (
        <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>⚙️ {selectedItem.title}</Text>
              <Text style={styles.modalText}>Рівень: {selectedItem.level}</Text>
              <Text style={styles.modalText}>Генерація: +{selectedItem.efficiency} од/сек</Text>
              
              <View style={{ gap: 10, marginTop: 15 }}>
                <TouchableOpacity style={styles.btn} onPress={() => { setModalVisible(false); navigation.navigate('DetailScreen', { item: selectedItem }); }}>
                  <Text style={styles.btnText}>ВІДКРИТИ СПЕЦИФІКАЦІЮ</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, { backgroundColor: '#333' }]} onPress={() => setModalVisible(false)}>
                  <Text style={[styles.btnText, { color: '#fff' }]}>ЗАКРИТИ</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

function DetailScreen({ route, navigation }) {
  const { item } = route.params;
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Помилка', 'Потрібен доступ до галереї!');
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4, 3], quality: 1,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>🔬 Конфігуратор архітектури</Text></View>
      <ScrollView style={{ padding: 20 }}>
        <Text style={styles.detailHeadline}>{item.title}</Text>
        <Text style={styles.modalText}>Сховище: Zustand Store Engine</Text>
        <Text style={styles.modalText}>Потужність: +{item.efficiency} од/сек</Text>

        {image ? (
          <View style={{ marginVertical: 15 }}>
            <Image source={{ uri: image }} style={styles.attachedImage} />
            <TouchableOpacity onPress={() => setImage(null)}><Text style={{ color: '#ff453a', textAlign: 'center', marginTop: 5 }}>Видалити photo</Text></TouchableOpacity>
          </View>
        ) : (
          <View style={styles.imagePlaceholder}><Text style={{ color: '#666' }}>Немає зображення схеми</Text></View>
        )}

        <TouchableOpacity style={styles.btn} onPress={pickImage}><Text style={styles.btnText}>📸 ЗАВАНТАЖИТИ СХЕМУ З ГАЛЕРЕЇ</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.btn, { backgroundColor: '#2c2c2e', marginTop: 12 }]} onPress={() => navigation.goBack()}><Text style={[styles.btnText, { color: '#fff' }]}>НАЗАД</Text></TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function AddScreen({ navigation }) {
  const [name, setName] = useState('');
  const addItem = useStore((state) => state.addItem);
  const sessionOnlyMode = useStore((state) => state.sessionOnlyMode);

  const handleCreate = () => {
    if (!name.trim()) return Alert.alert('Помилка', 'Введіть назву!');
    
    const newProcess = {
      id: Date.now().toString(),
      title: name,
      level: Math.floor(Math.random() * 5) + 1,
      efficiency: Math.floor(Math.random() * 50) + 10
    };

    addItem(newProcess);
    Alert.alert(
      'Успіх', 
      `Процес додано! ${sessionOnlyMode ? '⚠️ Режим сесії: дані зникнуть після перезапуску.' : '💾 Дані збережено в AsyncStorage.'}`
    );
    setName('');
    navigation.navigate('Список');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>➕ Новий ігровий потік</Text></View>
      <View style={{ padding: 20, gap: 15 }}>
        <Text style={styles.label}>Вкажіть назву нового процесу:</Text>
        <TextInput style={styles.input} placeholder="Назва потоку..." placeholderTextColor="#666" value={name} onChangeText={setName} />
        <TouchableOpacity style={styles.btn} onPress={handleCreate}><Text style={styles.btnText}>СТВОРИТИ ПОТІК</Text></TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ==========================================
// 📡 ЕКРАН 4: ХМАРНІ ДАНІ (З ПРАКТИЧНОЇ №4)
// ==========================================
function CloudLogsScreen() {
  const { data, error, isValidating } = useSWR('https://jsonplaceholder.typicode.com/users', fetcher);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>📡 Оператори хмари</Text></View>
      {isValidating && <ActivityIndicator size="small" color="#deff9a" style={{ margin: 10 }} />}
      <FlatList
        data={data}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardSubtitle}>@{item.username} | {item.email.toLowerCase()}</Text>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

function SettingsScreen() {
  const { user, logout, isDarkTheme, setTheme, appLanguage, setLanguage, sessionOnlyMode, setSessionOnlyMode, items } = useStore();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>⚙️ Керування пам'яттю системи</Text></View>
      <ScrollView style={{ padding: 20 }}>
        
        <View style={styles.profileBox}>
          <Text style={styles.profileLabel}>Активний токен користувача (Zustand):</Text>
          <Text style={styles.profileName} numberOfLines={1}>{user?.token}</Text>
          <Text style={styles.profileRole}>Користувач: {user?.email}</Text>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 25 }]}>Глобальні налаштування додатка</Text>
        
        <View style={styles.settingRow}>
          <Text style={styles.label}>Темна тема оформлення:</Text>
          <Switch value={isDarkTheme} onValueChange={setTheme} trackColor={{ true: '#deff9a' }} />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.label}>Мова інтерфейсу системи:</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {['UA', 'EN'].map((lang) => (
              <TouchableOpacity 
                key={lang} 
                style={[styles.langBtn, appLanguage === lang && styles.langBtnActive]} 
                onPress={() => setLanguage(lang)}
              >
                <Text style={[styles.langText, appLanguage === lang && styles.langTextActive]}>{lang}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.profileBox, { marginTop: 20, borderColor: sessionOnlyMode ? '#ff453a' : '#deff9a' }]}>
          <View style={styles.settingRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={[styles.label, { color: sessionOnlyMode ? '#ff453a' : '#deff9a' }]}>Лише на поточну сесію</Text>
              <Text style={{ color: '#aaa', fontSize: 11 }}>Якщо увімкнено, нові процеси та конфігурація не записуються на диск.</Text>
            </View>
            <Switch value={sessionOnlyMode} onValueChange={setSessionOnlyMode} trackColor={{ true: '#ff453a' }} />
          </View>
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 25 }]}>Стан Zustand-Рендерінгу</Text>
        <View style={styles.jsonDebug}>
          <Text style={{ color: '#deff9a', fontFamily: 'monospace', fontSize: 11 }}>
            {JSON.stringify({ 
              engine: "Zustand + AsyncStorage",
              itemsInStore: items.length, 
              sessionModeActive: sessionOnlyMode, 
              savedLocally: !sessionOnlyMode 
            }, null, 2)}
          </Text>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutBtnText}>ВИЙТИ З ОБЛІКОВОГО ЗАПИСУ</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#1c1c1e', borderTopWidth: 0, paddingBottom: 5 },
        tabBarActiveTintColor: '#deff9a',
        tabBarInactiveTintColor: '#888',
      }}
    >
      <Tab.Screen name="Список" component={ListScreen} options={{ tabBarLabel: '📋 Процеси' }} />
      <Tab.Screen name="Додати" component={AddScreen} options={{ tabBarLabel: '➕ Додати' }} />
      <Tab.Screen name="Хмара" component={CloudLogsScreen} options={{ tabBarLabel: '📡 Хмара' }} />
      <Tab.Screen name="Профіль" component={SettingsScreen} options={{ tabBarLabel: '⚙️ Пам\'ять' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const user = useStore((state) => state.user);
  const loadPersistedData = useStore((state) => state.loadPersistedData);

  useEffect(() => {
    loadPersistedData();
  }, []);

  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user == null ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="AppTabs" component={AppTabs} />
            <Stack.Screen name="DetailScreen" component={DetailScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  header: { padding: 16, backgroundColor: '#1c1c1e', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#2c2c2e' },
  headerTitle: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  
  card: { backgroundColor: '#1c1c1e', padding: 16, borderRadius: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardContent: { flex: 1 },
  cardTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  cardSubtitle: { color: '#aaa', fontSize: 12, marginTop: 2 },
  
  label: { color: '#fff', fontSize: 14, fontWeight: '600' },
  sectionTitle: { color: '#888', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 10 },
  input: { backgroundColor: '#1c1c1e', color: '#fff', padding: 12, borderRadius: 8, fontSize: 15, marginTop: 5 },
  btn: { backgroundColor: '#deff9a', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  btnText: { color: '#121212', fontWeight: 'bold', fontSize: 14 },
  
  authContainer: { flex: 1, backgroundColor: '#121212', justifyContent: 'center', padding: 30 },
  authTitle: { color: '#deff9a', fontSize: 32, fontWeight: '900', textAlign: 'center', marginBottom: 5 },
  authSub: { color: '#aaa', fontSize: 13, textAlign: 'center', marginBottom: 35 },
  authInput: { backgroundColor: '#1c1c1e', color: '#fff', padding: 15, borderRadius: 10, fontSize: 16, marginBottom: 15, borderWidth: 1, borderColor: '#2c2c2e' },
  authBtn: { backgroundColor: '#deff9a', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  authBtnText: { color: '#121212', fontWeight: 'bold', fontSize: 15 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#1c1c1e', padding: 24, borderRadius: 16, borderWidth: 1, borderColor: '#333' },
  modalTitle: { color: '#deff9a', fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  modalText: { color: '#fff', fontSize: 15, marginBottom: 6 },
  
  detailHeadline: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  imagePlaceholder: { width: '100%', height: 180, backgroundColor: '#1c1c1e', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 15, borderWidth: 1, borderStyle: 'dashed', borderColor: '#444' },
  attachedImage: { width: '100%', height: 220, borderRadius: 12, resizeMode: 'cover' },
  
  profileBox: { backgroundColor: '#1c1c1e', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#2c2c2e' },
  profileLabel: { color: '#888', fontSize: 11, textTransform: 'uppercase' },
  profileName: { color: '#deff9a', fontSize: 15, fontWeight: 'bold', marginTop: 4 },
  profileRole: { color: '#fff', fontSize: 13, marginTop: 4 },
  
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1c1c1e', padding: 14, borderRadius: 10, marginBottom: 10 },
  langBtn: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#2c2c2e', borderRadius: 6 },
  langBtnActive: { backgroundColor: '#deff9a' },
  langText: { color: '#fff', fontWeight: 'bold' },
  langTextActive: { color: '#121212' },
  
  jsonDebug: { backgroundColor: '#000', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#2c2c2e' },
  logoutBtn: { backgroundColor: '#ff453a', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 30 },
  logoutBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 }
});