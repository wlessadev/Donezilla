import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import ThemeToggle from '../components/ThemeToggle';

export default function ProfileScreen() {
  const { theme } = useTheme();
  const styles = getStyles(theme);

  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar} />
        <Text style={styles.name}>John Doe</Text>
        <Text style={styles.email}>john@example.com</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <View style={styles.preferenceItem}>
          <Text style={styles.preferenceText}>Theme</Text>
          <ThemeToggle />
        </View>

        <View style={styles.preferenceItem}>
          <Text style={styles.preferenceText}>Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            thumbColor={theme === 'light' ? '#5865F2' : '#7289da'}
            trackColor={{ false: '#767577', true: theme === 'light' ? '#5865F2' : '#7289da' }}
          />
        </View>
      </View>
    </View>
  );
}

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: theme === 'light' ? '#fff' : 
                     theme === 'dark' ? '#36393f' : '#202225',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme === 'light' ? '#ddd' : '#5865F2',
    marginBottom: 15,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme === 'light' ? '#000' : '#fff',
  },
  email: {
    fontSize: 16,
    color: theme === 'light' ? '#666' : '#aaa',
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: theme === 'light' ? '#000' : '#fff',
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme === 'light' ? '#eee' : '#2f3136',
  },
  preferenceText: {
    fontSize: 16,
    color: theme === 'light' ? '#000' : '#fff',
  },
});