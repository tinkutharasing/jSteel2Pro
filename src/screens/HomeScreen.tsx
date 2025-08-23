import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, SafeAreaView, Platform, Image, Dimensions } from 'react-native';
import { Weld } from '../types/Weld';
import { WeldCardData } from '../types/WeldCard';
import { WeldCard } from '../components/WeldCard';

interface HomeScreenProps {
  weldCards: WeldCardData[];
  trashCards: WeldCardData[];
  onViewWeld: (weld: Weld) => void;
  onEditWeld: (weld: Weld, index: number) => void;
  onDeleteWeld: (weld: Weld) => void;
  onRecoverWeld: (weld: Weld) => void;
  onPermanentlyDeleteWeld: (weld: Weld) => void;
  onClearTrash: () => void;
  onTrashAll: () => void;
  onNavigate: (screen: 'home' | 'view' | 'settings' | 'bulk-edit') => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ 
  weldCards, 
  trashCards,
  onViewWeld, 
  onEditWeld,
  onDeleteWeld,
  onRecoverWeld,
  onPermanentlyDeleteWeld,
  onClearTrash,
  onTrashAll,
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
  
  // Determine optimal cards per row for landscape orientation
  let cardsPerRow = 3; // Default for landscape (minimum 3 cards)
  if (screenWidth > 1200) {
    cardsPerRow = 6; // Very large landscape screens
  } else if (screenWidth > 900) {
    cardsPerRow = 5; // Large landscape screens
  } else if (screenWidth > 700) {
    cardsPerRow = 4; // Medium landscape screens
  }
  // Landscape orientation ensures we can always fit at least 3 cards
  
  const canFitThreeCards = cardsPerRow >= 3;
  const canFitFourCards = cardsPerRow >= 4;
  const canFitFiveCards = cardsPerRow >= 5;
  const canFitSixCards = cardsPerRow >= 6;

  // Filter weld cards based on search query (search by weld number or WPS)
  const filteredWeldCards = useMemo(() => {
    if (!searchQuery.trim()) return weldCards;
    
    return weldCards.filter(card => 
      card.welds.some(weld => 
        (weld.weldNumber && weld.weldNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (weld.wpsNumberAndTitle && weld.wpsNumberAndTitle.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    );
  }, [weldCards, searchQuery]);

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

      {/* Active Weld Cards */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Active Weld Cards ({filteredWeldCards.length})</Text>
          {filteredWeldCards.length > 0 && (
            <TouchableOpacity 
              style={styles.trashAllButton} 
              onPress={() => {
                if (onTrashAll) {
                  onTrashAll();
                }
              }}
            >
              <Text style={styles.trashAllButtonText}>🗑️ Trash All</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <View style={styles.weldsGrid}>
        {filteredWeldCards.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>
              {searchQuery.trim() ? 'No weld cards found' : 'No weld cards yet'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery.trim() 
                ? `No weld cards found matching "${searchQuery}"`
                : 'Add your first weld card to get started'
              }
            </Text>
          </View>
        ) : (
          filteredWeldCards.map((card, index) => (
            <WeldCard
              key={card.cardId}
              weld={card.welds[0]} // Show first weld for display purposes
              weldIndex={index}
              onView={onViewWeld}
              onEdit={onEditWeld}
              onDelete={onDeleteWeld}
              canFitThreeCards={canFitThreeCards}
              canFitFourCards={canFitFourCards}
              canFitFiveCards={canFitFiveCards}
              canFitSixCards={canFitSixCards}
            />
          ))
        )}
      </View>

      {/* Trash Section */}
      {trashCards.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>🗑️ Trash ({trashCards.length})</Text>
              <TouchableOpacity 
                style={styles.clearTrashButton} 
                onPress={() => {
                  // Show confirmation dialog before clearing trash
                  if (onClearTrash) {
                    onClearTrash();
                  }
                }}
              >
                <Text style={styles.clearTrashButtonText}>🗑️ Empty Trash</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.weldsGrid}>
            {trashCards.map((card, index) => (
              <WeldCard
                key={card.cardId}
                weld={card.welds[0]}
                weldIndex={index}
                onView={onViewWeld}
                onEdit={onEditWeld}
                onDelete={onPermanentlyDeleteWeld}
                onRecover={() => onRecoverWeld(card.welds[0])}
                isTrash={true}
                canFitThreeCards={canFitThreeCards}
                canFitFourCards={canFitFourCards}
                canFitFiveCards={canFitFiveCards}
                canFitSixCards={canFitSixCards}
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
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  clearTrashButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fef2f2',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  clearTrashButtonText: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '600',
  },
  trashAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fef3c7',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  trashAllButtonText: {
    fontSize: 12,
    color: '#d97706',
    fontWeight: '600',
  },

  trashHelpText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 5,
    fontStyle: 'italic',
  },
});
