import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, SafeAreaView, Platform, Image, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Weld } from '../types/Weld';
import { WeldCard } from '../components/WeldCard';

interface HomeScreenProps {
  welds: Weld[];
  trashWelds: Weld[];
  onAddWeld: () => void;
  onViewWeld: (weld: Weld) => void;
  onEditWeld: (weld: Weld) => void;
  onDeleteWeld: (weld: Weld) => void;
  onRecoverWeld: (weld: Weld) => void;
  onPermanentlyDeleteWeld: (weld: Weld) => void;
  onNavigate: (screen: 'home' | 'add' | 'view' | 'settings') => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ 
  welds, 
  trashWelds,
  onAddWeld, 
  onViewWeld, 
  onEditWeld,
  onDeleteWeld,
  onRecoverWeld,
  onPermanentlyDeleteWeld,
  onNavigate
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Detect optimal cards per row based on screen size and orientation
  const [dimensions, setDimensions] = useState({
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({ width: window.width, height: window.height });
    });

    return () => subscription?.remove();
  }, []);

  const screenWidth = dimensions.width;
  const screenHeight = dimensions.height;
  const isLandscape = screenWidth > screenHeight;
  
  // Determine optimal cards per row
  let cardsPerRow = 2; // Default for small screens
  if (screenWidth > 800) {
    cardsPerRow = 4; // Large tablets
  } else if (screenWidth > 600 || isLandscape) {
    cardsPerRow = 3; // Medium tablets or landscape
  }
  // Phone portrait stays at 2 cards per row
  
  const canFitThreeCards = cardsPerRow >= 3;
  const canFitFourCards = cardsPerRow >= 4;

  // Filter welds based on search query (search by weld number or welder name)
  const filteredWelds = useMemo(() => {
    if (!searchQuery.trim()) return welds;
    
    return welds.filter(weld => 
      (weld.weldNumber && weld.weldNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (weld.welderName && weld.welderName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (weld.wpsNumberAndTitle && weld.wpsNumberAndTitle.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [welds, searchQuery]);

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView style={styles.container}>
        <View style={styles.headerSpacer} />
        
        {/* Title Section */}
        <View style={styles.titleSection}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>jSteel Pro</Text>
          </View>
        </View>
        
        {/* Subtitle - Outside titleSection for left alignment */}
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitle}>Weld Inspection Management</Text>
        </View>
      
      {/* Search Box */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by Weld Number, Welder Name, or WPS..."
          placeholderTextColor="#64748b"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity 
            style={styles.clearSearchButton}
            onPress={() => setSearchQuery('')}
          >
            <Text style={styles.clearSearchText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Active Welds */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Active Welds ({filteredWelds.length})</Text>
      </View>
      
      <View style={styles.weldsGrid}>
        {filteredWelds.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>
              {searchQuery.trim() ? 'No welds found' : 'No welds yet'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery.trim() 
                ? `No welds found matching "${searchQuery}"`
                : 'Add your first weld inspection to get started'
              }
            </Text>
          </View>
        ) : (
          filteredWelds.map((weld) => (
            <WeldCard
              key={weld.id}
              weld={weld}
              onView={onViewWeld}
              onEdit={onEditWeld}
              onDelete={onDeleteWeld}
              canFitThreeCards={canFitThreeCards}
              canFitFourCards={canFitFourCards}
            />
          ))
        )}
      </View>

      {/* Trash Section */}
      {trashWelds.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🗑️ Trash ({trashWelds.length})</Text>
          </View>
          
          <View style={styles.weldsGrid}>
            {trashWelds.map((weld) => (
              <WeldCard
                key={weld.id}
                weld={weld}
                onView={onViewWeld}
                onEdit={onEditWeld}
                onDelete={onPermanentlyDeleteWeld}
                onRecover={onRecoverWeld}
                isTrash={true}
                canFitThreeCards={canFitThreeCards}
                canFitFourCards={canFitFourCards}
              />
            ))}
          </View>
        </>
      )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 0,
    paddingBottom: 20,
  },
  headerSpacer: {
    height: Platform.OS === 'android' ? 20 : 0,
  },
  titleSection: {
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: Platform.OS === 'android' ? 15 : 10,
    marginBottom: 15,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  settingsButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0f172a',
    textAlign: 'left',
    flex: 1,
  },
  subtitleContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop: -20,
  },
  subtitle: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'left',
  },
  weldsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    padding: 15,
    paddingHorizontal: 15,
    // Debug: add border to see grid container
    // borderWidth: 1,
    // borderColor: 'red',
  },
  emptyState: {
    width: '100%',
    alignItems: 'center',
    padding: 50,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 10,
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 20,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    paddingVertical: 0,
  },
  clearSearchButton: {
    padding: 5,
  },
  clearSearchText: {
    fontSize: 20,
    color: '#64748b',
  },
  sectionHeader: {
    marginHorizontal: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  trashHelpText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 5,
    fontStyle: 'italic',
  },
});
