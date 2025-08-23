import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface BottomNavigationProps {
  currentScreen: 'home' | 'settings' | 'bulk-edit';
  onNavigate: (screen: 'home' | 'settings' | 'bulk-edit') => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ 
  currentScreen, 
  onNavigate 
}) => {
  return (
    <View style={styles.container}>
      



      {/* Bulk Edit Tab - Absolutely positioned at center edge */}
              <TouchableOpacity 
          style={[styles.addTab, currentScreen === 'bulk-edit' && styles.activeAddTab]} 
          onPress={() => onNavigate('bulk-edit')}
        >
          <Text style={[styles.addIcon, currentScreen === 'bulk-edit' && styles.activeAddIcon]}>
            🔥
          </Text>
          <Text style={[styles.addLabel, currentScreen === 'bulk-edit' && styles.activeAddLabel]}>
            Add Weld
          </Text>
        </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 232, 240, 0.5)',
    paddingBottom: 0,
    paddingTop: 0,
    minHeight: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative', // Added for absolute positioning of add button
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 0, // Reduced to half
  },
  activeTab: {
    // Active state styling
  },
  tabIcon: {
    fontSize: 20, // Reduced from 24 (30% reduction)
    marginBottom: 3, // Reduced from 4 (30% reduction)
    opacity: 0.6,
  },
  activeTabIcon: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 11, // Reduced from 12 (30% reduction)
    color: '#64748b',
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  addTab: {
    position: 'absolute',
    left: '50%',
    top: -115, // Moved upwards from -45
    transform: [{ translateX: -40 }], // Center horizontally (adjust for button width)
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 22,
    backgroundColor: '#3b82f6',
    borderRadius: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  activeAddTab: {
    backgroundColor: '#1e40af',
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
