import React, { useState } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, FlatList, 
  SafeAreaView, StatusBar, Switch, Modal, TextInput, 
  ScrollView, Alert, KeyboardAvoidingView, Platform 
} from 'react-native';
// Примітка: якщо слайдер не встановлено, можна замінити його на TextInput
import Slider from '@react-native-community/slider'; 

export default function App() {
  // --- СТАН (STATE) ---
  const [items, setItems] = useState([
    { id: '1', title: 'Збір ресурсів', level: 5, efficiency: 15, desc: 'Базовий процес видобутку енергії для системи.' },
    { id: '2', title: 'Аналіз коду', level: 3, efficiency: 45, desc: 'Автоматичне виправлення багів у реальному часі.' },
  ]);

  const [currentScreen, setCurrentScreen] = useState('list'); // list, settings, add
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [navVisible, setNavVisible] = useState(false);
  const [detailItem, setDetailItem] = useState(null);

  // Форма нового елемента
  const [newName, setNewName] = useState('');
  const [newEff, setNewEff] = useState(10);
  const [userName, setUserName] = useState('Admin_User');

  // --- ЛОГІКА ---
  const addItem = () => {
    if (newName.trim() === '') return Alert.alert("Помилка", "Введіть назву!");
    const newItem = {
      id: Math.random().toString(),
      title: newName,
      level: 1,
      efficiency: parseInt(newEff),
      desc: "Новий автоматизований процес, доданий користувачем."
    };
    setItems([newItem, ...items]);
    setNewName('');
    setCurrentScreen('list');
  };

  const deleteItem = (id) => {
    setItems(items.filter(item => item.id !== id));
    setDetailItem(null);
  };

  // --- КОМПОНЕНТИ ---
  const NavMenu = () => (
    <Modal visible={navVisible} animationType="fade" transparent={true}>
      <TouchableOpacity style={styles.modalOverlay} onPress={() => setNavVisible(false)}>
        <View style={styles.navModal}>
          <Text style={styles.menuTitle}>Навігація</Text>
          <TouchableOpacity style={styles.menuBtn} onPress={() => {setCurrentScreen('list'); setNavVisible(false)}}>
            <Text style={styles.menuBtnText}>📋 Список процесів</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuBtn} onPress={() => {setCurrentScreen('add'); setNavVisible(false)}}>
            <Text style={styles.menuBtnText}>➕ Додати новий</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuBtn} onPress={() => {setCurrentScreen('settings'); setNavVisible(false)}}>
            <Text style={styles.menuBtnText}>⚙️ Налаштування</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, isDarkMode ? styles.bgDark : styles.bgLight]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={[styles.title, isDarkMode ? styles.textDark : styles.textLight]}>
          GamePanel <Text style={{color: '#deff9a'}}>v2.0</Text>
        </Text>
        <TouchableOpacity style={styles.burger} onPress={() => setNavVisible(true)}>
          <View style={[styles.burgerLine, {backgroundColor: isDarkMode ? '#fff' : '#000'}]} />
          <View style={[styles.burgerLine, {backgroundColor: isDarkMode ? '#fff' : '#000'}]} />
          <View style={[styles.burgerLine, {backgroundColor: isDarkMode ? '#fff' : '#000'}]} />
        </TouchableOpacity>
      </View>

      {/* ЕКРАН 1: СПИСОК */}
      {currentScreen === 'list' && (
        <FlatList 
          data={items}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <TouchableOpacity style={styles.card} onPress={() => setDetailItem(item)}>
              <View>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSub}>Рівень: {item.level} | +{item.efficiency}/s</Text>
              </View>
              <Text style={{fontSize: 24}}>➔</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text style={styles.empty}>Список порожній...</Text>}
        />
      )}

      {/* ЕКРАН 2: НАЛАШТУВАННЯ */}
      {currentScreen === 'settings' && (
        <ScrollView style={styles.padding}>
          <Text style={styles.label}>Ім'я користувача:</Text>
          <TextInput 
            style={styles.input} 
            value={userName} 
            onChangeText={setUserName} 
            placeholder="Введіть нікнейм"
            placeholderTextColor="#999"
          />
          
          <View style={styles.row}>
            <Text style={styles.label}>Темна тема:</Text>
            <Switch value={isDarkMode} onValueChange={setIsDarkMode} />
          </View>

          <Text style={styles.label}>Гучність ефектів: {Math.floor(newEff)}%</Text>
          <Slider
            style={{width: '100%', height: 40}}
            minimumValue={0}
            maximumValue={100}
            value={50}
            minimumTrackTintColor="#deff9a"
            maximumTrackTintColor="#555"
          />
        </ScrollView>
      )}

      {/* ЕКРАН 3: ДОДАВАННЯ */}
      {currentScreen === 'add' && (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.padding}>
          <Text style={styles.label}>Назва нового процесу:</Text>
          <TextInput 
            style={styles.input} 
            value={newName} 
            onChangeText={setNewName}
            placeholder="Напр: Квантовий двигун"
            placeholderTextColor="#999"
          />
          <Text style={styles.label}>Початкова ефективність: {newEff}</Text>
          <TextInput 
            style={styles.input} 
            keyboardType="numeric"
            value={newEff.toString()} 
            onChangeText={setNewEff}
          />
          <TouchableOpacity style={styles.saveBtn} onPress={addItem}>
            <Text style={styles.saveBtnText}>Зберегти процес</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      )}

      {/* МОДАЛЬНЕ ВІКНО ДЕТАЛЕЙ */}
      <Modal visible={!!detailItem} animationType="slide" transparent={true}>
        <View style={styles.detailOverlay}>
          <View style={styles.detailContent}>
            <Text style={styles.detailTitle}>{detailItem?.title}</Text>
            <Text style={styles.detailDesc}>{detailItem?.desc}</Text>
            <View style={styles.stats}>
               <Text>⚡ Ефективність: {detailItem?.efficiency}</Text>
               <Text>📈 Рівень: {detailItem?.level}</Text>
            </View>
            <TouchableOpacity style={styles.delBtn} onPress={() => deleteItem(detailItem.id)}>
              <Text style={styles.delBtnText}>Видалити цей елемент</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setDetailItem(null)}>
              <Text style={styles.closeBtnText}>Закрити</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <NavMenu />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgDark: { backgroundColor: '#121212' },
  bgLight: { backgroundColor: '#f0f0f0' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    padding: 20, 
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333'
  },
  title: { fontSize: 28, fontWeight: 'bold' },
  textDark: { color: '#fff' },
  textLight: { color: '#000' },
  burger: { width: 30, height: 20, justifyContent: 'space-between' },
  burgerLine: { height: 3, width: '100%', borderRadius: 2 },
  card: { 
    backgroundColor: '#1e1e1e', 
    margin: 10, 
    padding: 20, 
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 5,
    borderLeftColor: '#deff9a'
  },
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  cardSub: { color: '#aaa', marginTop: 5 },
  padding: { padding: 20 },
  label: { color: '#deff9a', fontSize: 16, marginBottom: 10, marginTop: 15 },
  input: { 
    backgroundColor: '#252525', 
    color: '#fff', 
    padding: 15, 
    borderRadius: 10,
    fontSize: 16 
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 },
  saveBtn: { backgroundColor: '#deff9a', padding: 15, borderRadius: 10, marginTop: 30, alignItems: 'center' },
  saveBtnText: { color: '#000', fontWeight: 'bold', fontSize: 18 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
  navModal: { backgroundColor: '#1e1e1e', width: '80%', padding: 30, borderRadius: 20 },
  menuTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  menuBtn: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#333' },
  menuBtnText: { color: '#deff9a', fontSize: 18 },
  detailOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'flex-end' },
  detailContent: { backgroundColor: '#1e1e1e', padding: 30, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  detailTitle: { color: '#fff', fontSize: 26, fontWeight: 'bold' },
  detailDesc: { color: '#ccc', fontSize: 16, marginTop: 15, lineHeight: 24 },
  stats: { backgroundColor: '#deff9a', padding: 15, borderRadius: 10, marginTop: 20 },
  delBtn: { marginTop: 20, padding: 15, alignItems: 'center', borderWidth: 1, borderColor: '#ff4444', borderRadius: 10 },
  delBtnText: { color: '#ff4444', fontWeight: 'bold' },
  closeBtn: { marginTop: 15, padding: 15, alignItems: 'center' },
  closeBtnText: { color: '#aaa' },
  empty: { color: '#555', textAlign: 'center', marginTop: 50, fontSize: 18 }
});