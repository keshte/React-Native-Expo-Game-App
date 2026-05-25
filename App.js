import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  FlatList, 
  SafeAreaView, 
  StatusBar,
  Switch
} from 'react-native';

// --- ПУНКТ 7: Окремий компонент для елемента списку (Картка процесу/юніта) ---
const TeamItem = ({ title, level, efficiency, isDark }) => {
  return (
    <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
      {/* Імітація зображення/іконки за допомогою стилізованого текстового блоку */}
      <View style={styles.iconPlaceholder}>
        <Text style={styles.iconText}>🤖</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, isDark ? styles.textDark : styles.textLight]}>
          {title}
        </Text>
        <Text style={styles.cardSubtitle}>
          Рівень автоматизації: {level} | Ефективність: +{efficiency}/сек
        </Text>
      </View>
    </View>
  );
};

export default function App() {
  // --- ПУНКТ 3 & 6: Стани для перемикання екранів та налаштування теми ---
  const [currentScreen, setCurrentScreen] = useState('list'); // 'list' або 'settings'
  const [isDarkMode, setIsDarkMode] = useState(false);

  // --- ПУНКТ 5: Генерація масиву з 20+ елементів для командної гри ---
  const gameItems = Array.from({ length: 22 }, (_, index) => ({
    id: String(index + 1),
    title: `Авто-процес №${index + 1}: ${
      ['Збір ресурсів', 'Аналіз коду', 'Тестування модулів', 'Менеджмент завдань', 'Деплой серверів'][index % 5]
    }`,
    level: Math.floor(Math.random() * 10) + 1,
    efficiency: (index + 1) * 3,
  }));

  // Стилі для поточної теми
  const themeContainerStyle = isDarkMode ? styles.containerDark : styles.containerLight;
  const themeTextStyle = isDarkMode ? styles.textDark : styles.textLight;

  return (
    <SafeAreaView style={[styles.safeArea, themeContainerStyle]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* Хедер додатка */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, themeTextStyle]}>DevTeam Clicker: Automation</Text>
      </View>

      {/* --- ПУНКТ 3: Контейнер для відображення контенту в залежності від стану --- */}
      <View style={styles.contentContainer}>
        {currentScreen === 'list' ? (
          // ЕКРАН 1: Список процесів автоматизації
          <FlatList
            data={gameItems}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TeamItem 
                title={item.title} 
                level={item.level} 
                efficiency={item.efficiency} 
                isDark={isDarkMode}
              />
            )}
            contentContainerStyle={styles.listPadding}
          />
        ) : (
          // ЕКРАН 2: Налаштування
          <View style={styles.settingsScreen}>
            <Text style={[styles.sectionTitle, themeTextStyle]}>Глобальні налаштування гри</Text>
            
            <View style={[styles.settingRow, isDarkMode ? styles.rowDark : styles.rowLight]}>
              <Text style={[styles.settingLabel, themeTextStyle]}>Темна тема інтерфейсу</Text>
              <Switch
                value={isDarkMode}
                onValueChange={(value) => setIsDarkMode(value)}
                trackColor={{ false: '#767577', true: '#4caf50' }}
                thumbColor={isDarkMode ? '#fff' : '#f4f3f4'}
              />
            </View>

            <View style={[styles.settingRow, isDarkMode ? styles.rowDark : styles.rowLight]}>
              <Text style={[styles.settingLabel, themeTextStyle]}>Звукові ефекти (імітація)</Text>
              <Switch value={true} disabled={true} />
            </View>
            
            <Text style={styles.hintText}>Зміна теми впливає на всі екрани додатку.</Text>
          </View>
        )}
      </View>

      {/* --- ПУНКТ 4: Навігаційні кнопки з індикацією активного екрану --- */}
      <View style={[styles.tabBar, isDarkMode ? styles.tabBarDark : styles.tabBarLight]}>
        <TouchableOpacity 
          style={[
            styles.tabButton, 
            currentScreen === 'list' && styles.activeTabButton
          ]} 
          onPress={() => setCurrentScreen('list')}
        >
          <Text style={[
            styles.tabText, 
            currentScreen === 'list' ? styles.tabTextActive : styles.tabTextInactive
          ]}>
            📊 Процеси {currentScreen === 'list' ? '•' : ''}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.tabButton, 
            currentScreen === 'screen2' || currentScreen === 'settings' && styles.activeTabButton // підтримка назви стану
          ]} 
          onPress={() => setCurrentScreen('settings')}
        >
          <Text style={[
            styles.tabText, 
            currentScreen === 'settings' ? styles.tabTextActive : styles.tabTextInactive
          ]}>
            ⚙️ Налаштування {currentScreen === 'settings' ? '•' : ''}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// --- Стилізація компонентів ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: '#f5f5f7',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  header: {
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
  },
  listPadding: {
    padding: 16,
  },
  // Стилі для карток (Пункт 5 та 7)
  card: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // для Android
  },
  cardLight: {
    backgroundColor: '#ffffff',
  },
  cardDark: {
    backgroundColor: '#1e1e1e',
  },
  iconPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e1f5fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconText: {
    fontSize: 24,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#757575',
  },
  // Екран налаштувань
  settingsScreen: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
  },
  rowLight: {
    backgroundColor: '#fff',
  },
  rowDark: {
    backgroundColor: '#1e1e1e',
  },
  settingLabel: {
    fontSize: 16,
  },
  hintText: {
    fontSize: 12,
    color: '#9e9e9e',
    textAlign: 'center',
    marginTop: 10,
  },
  // Таб-бар (Пункт 4)
  tabBar: {
    flexDirection: 'row',
    height: 60,
    borderTopWidth: 1,
  },
  tabBarLight: {
    backgroundColor: '#ffffff',
    borderTopColor: '#e0e0e0',
  },
  tabBarDark: {
    backgroundColor: '#1e1e1e',
    borderTopColor: '#333333',
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTabButton: {
    borderTopWidth: 3,
    borderTopColor: '#2196f3', // синій індикатор активності
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#2196f3',
  },
  tabTextInactive: {
    color: '#8e8e93',
  },
  // Текстові теми
  textLight: {
    color: '#000000',
  },
  textDark: {
    color: '#ffffff',
  },
});