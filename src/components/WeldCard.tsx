import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Weld } from '../types/Weld';
import { formatDateToUS } from '../utils/dateUtils';

interface WeldCardProps {
  weld: Weld;
  weldIndex: number;
  onView: (weld: Weld) => void;
  onEdit: (weld: Weld, index: number) => void;
  onDelete: (weld: Weld) => void;
  onRecover?: (weld: Weld) => void;
  isTrash?: boolean;
  canFitThreeCards?: boolean;
  canFitFourCards?: boolean;
  canFitFiveCards?: boolean;
  canFitSixCards?: boolean;
}

export const WeldCard: React.FC<WeldCardProps> = ({ weld, weldIndex, onView, onEdit, onDelete, onRecover, isTrash = false, canFitThreeCards = false, canFitFourCards = false, canFitFiveCards = false, canFitSixCards = false }) => {

  // Calculate if this is the last card in a row
  const getCardsPerRow = () => {
    if (canFitSixCards) return 6;
    if (canFitFiveCards) return 5;
    if (canFitFourCards) return 4;
    if (canFitThreeCards) return 3;
    return 2; // Default for mobile
  };
  
  const cardsPerRow = getCardsPerRow();
  const isLastInRow = (weldIndex + 1) % cardsPerRow === 0;

  // Dynamic styles based on screen size
  const cardStyle = [
    styles.weldCard,
    canFitThreeCards && !canFitFourCards && styles.weldCardTablet,
    canFitFourCards && !canFitFiveCards && styles.weldCardFour,
    canFitFiveCards && !canFitSixCards && styles.weldCardFive,
    canFitSixCards && styles.weldCardSix,
    isTrash && styles.trashCard,
    isLastInRow && styles.lastCardInRow
  ];

  return (
    <View style={cardStyle}>
      {/* Bigger Date Display */}
      <Text style={styles.weldCardDate}>{formatDateToUS(weld.date)}</Text>
      
      {/* Weld IDs Display */}
      <View style={styles.weldIdsContainer}>
        <Text style={styles.weldIdText}>Weld: {weld.weldNumber}</Text>
        <Text style={styles.weldIdText}>WID: {weld.widNumber}</Text>
      </View>
      
      {/* Compact Action Icons */}
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.iconButton} onPress={() => onView(weld)}>
          <Text style={styles.iconText}>👁️</Text>
        </TouchableOpacity>
        {!isTrash && (
          <TouchableOpacity style={styles.iconButton} onPress={() => onEdit(weld, weldIndex)}>
            <Text style={styles.iconText}>✏️</Text>
          </TouchableOpacity>
        )}
        {!isTrash ? (
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={() => onDelete(weld)}
          >
            <Text style={styles.iconText}>🗑️</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity 
              style={[styles.iconButton, styles.recoverButton]} 
              onPress={() => onRecover?.(weld)}
            >
              <Text style={[styles.iconText, styles.recoverIconText]}>♻️</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.iconButton, styles.permanentDeleteButton]} 
              onPress={() => onDelete(weld)}
            >
              <Text style={[styles.iconText, styles.permanentDeleteIconText]}>🗑️</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  weldCard: {
    width: '48%', // Perfect width for 2 columns
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minHeight: 140,
    marginBottom: 16,
    marginRight: '4%', // Add right margin for proper spacing
    // Remove any shadows
    elevation: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  lastCardInRow: {
    marginRight: 0, // Remove right margin for last card in row
  },
  weldCardTablet: {
    width: '30%', // 3 columns for wider screens - reduced to fit with margin
    minHeight: 120,
    padding: 12,
    marginRight: '3.33%', // Add right margin for 3-column spacing
    // Remove any shadows
    elevation: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  weldCardFour: {
    width: '22%', // 4 columns for large tablets - reduced to fit with margin
    minHeight: 120,
    padding: 12,
    marginRight: '2%', // Add right margin for 4-column spacing
    // Remove any shadows
    elevation: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  weldCardFive: {
    width: '18%', // 5 columns for very large landscape screens
    minHeight: 120,
    padding: 12,
    marginRight: '1.6%', // Add right margin for 5-column spacing
    // Remove any shadows
    elevation: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  weldCardSix: {
    width: '15%', // 6 columns for extremely large landscape screens
    minHeight: 120,
    padding: 12,
    marginRight: '1.33%', // Add right margin for 6-column spacing
    // Remove any shadows
    elevation: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  trashCard: {
    backgroundColor: '#fef2f2',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    opacity: 0.8,
  },
  weldCardId: {
    fontSize: 22,
    fontWeight: '900',
    color: '#000000',
    marginBottom: 8,
  },
  weldCardWelder: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '700',
    marginBottom: 8,
  },
  weldCardDate: {
    fontSize: 18,
    color: '#1e293b',
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  weldCardWPS: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 5,
  },
  weldCardLocation: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 5,
  },
  weldCardInspector: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 15,
  },
  weldIdsContainer: {
    marginBottom: 12,
    alignItems: 'center',
  },
  weldIdText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500',
    marginBottom: 2,
    textAlign: 'center',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 8,
    paddingHorizontal: 4,
  },
  iconButton: {
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 28,
    minHeight: 28,
    borderRadius: 6,
  },
  iconText: {
    fontSize: 18,
    color: '#3b82f6',
  },
  recoverButton: {
    // No background for trash items
  },
  recoverIconText: {
    color: '#22c55e',
  },
  permanentDeleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  permanentDeleteIconText: {
    color: '#ef4444',
  },

});
