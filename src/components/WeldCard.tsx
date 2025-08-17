import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Weld } from '../types/Weld';

interface WeldCardProps {
  weld: Weld;
  onView: (weld: Weld) => void;
  onEdit: (weld: Weld) => void;
  onDelete: (weld: Weld) => void;
  onRecover?: (weld: Weld) => void;
  isTrash?: boolean;
}

export const WeldCard: React.FC<WeldCardProps> = ({ weld, onView, onEdit, onDelete, onRecover, isTrash = false }) => {
  // Get status color and text
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'approved':
        return { color: '#10b981', text: '✓ Approved', bgColor: '#ecfdf5' };
      case 'rejected':
        return { color: '#ef4444', text: '✗ Rejected', bgColor: '#fef2f2' };
      case 'pending':
      default:
        return { color: '#f59e0b', text: '⏳ Pending', bgColor: '#fffbeb' };
    }
  };

  const statusInfo = getStatusInfo(weld.status || 'pending');

  return (
    <View style={[styles.weldCard, isTrash && styles.trashCard]}>
      {/* Status Indicator */}
      <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
        <Text style={[styles.statusText, { color: statusInfo.color }]}>
          {statusInfo.text}
        </Text>
      </View>
      
      <Text style={styles.weldCardId}>{weld.weldNumber}</Text>
      <Text style={styles.weldCardWPS}>WPS: {weld.wps}</Text>
      <Text style={styles.weldCardDate}>{weld.date}</Text>
      <Text style={styles.weldCardType}>{weld.typeFit}</Text>
      <Text style={styles.weldCardWelder}>Welder: {weld.welder}</Text>
      <Text style={styles.weldCardInspector}>Inspector: {weld.inspector}</Text>
      
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.iconButton} onPress={() => onView(weld)}>
          <Text style={styles.iconText}>👁️</Text>
        </TouchableOpacity>
        {!isTrash && (
          <TouchableOpacity style={styles.iconButton} onPress={() => onEdit(weld)}>
            <Text style={styles.iconText}>✏️</Text>
          </TouchableOpacity>
        )}
        {!isTrash ? (
          // Active weld - move to trash
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={() => onDelete(weld)}
          >
            <Text style={styles.iconText}>🗑️</Text>
          </TouchableOpacity>
        ) : (
          // Trashed item - show recover and permanent delete
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
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.6)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    minHeight: 160,
    marginBottom: 16,
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
  weldCardWPS: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '700',
    marginBottom: 8,
  },
  weldCardDate: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 5,
  },
  weldCardType: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 5,
  },
  weldCardWelder: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 2,
  },
  weldCardInspector: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 15,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  iconButton: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 32,
    minHeight: 32,
  },
  iconText: {
    fontSize: 20,
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
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
});
