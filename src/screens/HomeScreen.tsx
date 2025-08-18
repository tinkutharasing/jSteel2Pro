import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, SafeAreaView, Platform, Image } from 'react-native';
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
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ 
  welds, 
  trashWelds,
  onAddWeld, 
  onViewWeld, 
  onEditWeld,
  onDeleteWeld,
  onRecoverWeld,
  onPermanentlyDeleteWeld
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter welds based on search query (search by weld number)
  const filteredWelds = useMemo(() => {
    if (!searchQuery.trim()) return welds;
    
    return welds.filter(weld => 
      weld.weldNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      weld.wps.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [welds, searchQuery]);

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView style={styles.container}>
        <View style={styles.headerSpacer} />
        
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>jSteel Pro</Text>
          <Text style={styles.subtitle}>Professional Weld Inspection Management</Text>
        </View>
      
      {/* Search Box */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by Weld Number or WPS..."
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
    marginTop: Platform.OS === 'android' ? 30 : 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 40,
  },
  weldsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 20,
    paddingHorizontal: 20,
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
    marginBottom: 20,
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
    marginBottom: 10,
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
