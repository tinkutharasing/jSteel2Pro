import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface BottomNavigationProps {
  currentScreen: 'home' | 'add' | 'settings';
  onNavigate: (screen: 'home' | 'add' | 'settings') => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ 
  currentScreen, 
  onNavigate 
}) => {
  return (
    <View style={styles.container}>
      {/* Home Tab */}
      <TouchableOpacity 
        style={[styles.tab, currentScreen === 'home' && styles.activeTab]} 
        onPress={() => onNavigate('home')}
      >
        <Text style={[styles.tabIcon, currentScreen === 'home' && styles.activeTabIcon]}>
          🏠
        </Text>
        <Text style={[styles.tabLabel, currentScreen === 'home' && styles.activeTabLabel]}>
          Home
        </Text>
      </TouchableOpacity>

      {/* Add Tab - Centered with prominent plus */}
      <TouchableOpacity 
        style={[styles.addTab, currentScreen === 'add' && styles.activeAddTab]} 
        onPress={() => onNavigate('add')}
      >
        <Text style={[styles.addIcon, currentScreen === 'add' && styles.activeAddIcon]}>
          +
        </Text>
        <Text style={[styles.addLabel, currentScreen === 'add' && styles.activeAddLabel]}>
          Add Weld
        </Text>
      </TouchableOpacity>

      {/* Settings Tab */}
      <TouchableOpacity 
        style={[styles.tab, currentScreen === 'settings' && styles.activeTab]} 
        onPress={() => onNavigate('settings')}
      >
        <Text style={[styles.tabIcon, currentScreen === 'settings' && styles.activeTabIcon]}>
          ⚙️
        </Text>
        <Text style={[styles.tabLabel, currentScreen === 'settings' && styles.activeTabLabel]}>
          Settings
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingBottom: 30,
    paddingTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  activeTab: {
    // Active state styling
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 4,
    opacity: 0.6,
  },
  activeTabIcon: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  addTab: {
    flex: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginHorizontal: 10,
    backgroundColor: '#667eea',
    borderRadius: 20,
    paddingVertical: 12,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  activeAddTab: {
    backgroundColor: '#5a67d8',
  },
  addIcon: {
    fontSize: 28,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  activeAddIcon: {
    color: '#ffffff',
  },
  addLabel: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  activeAddLabel: {
    color: '#ffffff',
  },
});
