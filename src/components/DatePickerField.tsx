import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Platform, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface DatePickerFieldProps {
  label: string;
  value: string;
  onDateChange: (date: string) => void;
  placeholder?: string;
  required?: boolean;
}

export const DatePickerField: React.FC<DatePickerFieldProps> = ({ 
  label, 
  value, 
  onDateChange, 
  placeholder = "MM/DD/YYYY",
  required = false 
}) => {
  // Parse ISO date string safely - Fixed to prevent timezone issues
  const parseISODate = (isoString: string): Date => {
    if (!isoString) return new Date();
    
    // Split the ISO string and create date in local timezone
    const [year, month, day] = isoString.split('-').map(Number);
    return new Date(year, month - 1, day); // month is 0-indexed
  };

  const [showPicker, setShowPicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(value ? parseISODate(value) : new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(value ? parseISODate(value) : new Date());

  // Convert date to US format (MM/DD/YYYY) - Fixed to prevent timezone issues
  const formatDateToUS = (date: Date): string => {
    // Use local methods to avoid timezone shifts
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  // Convert US format date back to ISO string for storage - Fixed timezone handling
  const formatDateToISO = (date: Date): string => {
    // Create date in local timezone to avoid shifts
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    
    // Create date string in YYYY-MM-DD format without timezone conversion
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  // Generate calendar data for the current month
  const calendarData = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Create array of dates for the month
    const dates: (Date | null)[] = [];
    
    // Add empty cells for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      dates.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      dates.push(new Date(year, month, day));
    }
    
    // Ensure we have complete weeks by adding empty cells at the end if needed
    const totalCells = dates.length;
    const remainingCells = totalCells % 7;
    if (remainingCells > 0) {
      for (let i = 0; i < (7 - remainingCells); i++) {
        dates.push(null);
      }
    }
    
    return dates;
  }, [currentMonth]);

  // Get month and year display text
  const monthYearText = currentMonth.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  // Handle date confirmation
  const handleDateConfirm = () => {
    const isoDate = formatDateToISO(selectedDate);
    onDateChange(isoDate);
    setShowPicker(false);
  };

  // Handle date cancel
  const handleDateCancel = () => {
    setSelectedDate(value ? parseISODate(value) : new Date());
    setCurrentMonth(value ? parseISODate(value) : new Date());
    setShowPicker(false);
  };

  // Check if a date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  // Check if a date is selected
  const isSelected = (date: Date) => {
    return date.getDate() === selectedDate.getDate() && 
           date.getMonth() === selectedDate.getMonth() && 
           date.getFullYear() === selectedDate.getFullYear();
  };

  const displayValue = value ? formatDateToUS(parseISODate(value)) : '';

  return (
    <View style={styles.formField}>
      <Text style={styles.fieldLabel}>
        {label} {required && '*'}
      </Text>
      
      <TouchableOpacity 
        style={styles.dateInput} 
        onPress={() => setShowPicker(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.dateText, !displayValue && styles.placeholderText]}>
          {displayValue || placeholder}
        </Text>
        <Icon name="calendar-outline" size={20} color="#64748b" />
      </TouchableOpacity>

      {/* Compact Calendar Modal */}
      <Modal
        visible={showPicker}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date</Text>
              <TouchableOpacity onPress={handleDateCancel}>
                <Icon name="close" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
            
            {/* Month Navigation */}
            <View style={styles.monthNavigation}>
              <TouchableOpacity 
                style={styles.navButton} 
                onPress={goToPreviousMonth}
              >
                <Icon name="chevron-back" size={16} color="#3b82f6" />
              </TouchableOpacity>
              
              <Text style={styles.monthYearText}>{monthYearText}</Text>
              
              <TouchableOpacity 
                style={styles.navButton} 
                onPress={goToNextMonth}
              >
                <Icon name="chevron-forward" size={16} color="#3b82f6" />
              </TouchableOpacity>
            </View>
            
            {/* Compact Calendar Grid */}
            <View style={styles.calendarContainer}>
              {/* Day Headers */}
              <View style={styles.dayHeaders}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                  <Text key={`day-${index}`} style={styles.dayHeader}>
                    {day}
                  </Text>
                ))}
              </View>
              
              {/* Calendar Days */}
              <View style={styles.calendarGrid}>
                {Array.from({ length: Math.ceil(calendarData.length / 7) }, (_, weekIndex) => (
                  <View key={`week-${weekIndex}`} style={styles.calendarRow}>
                    {calendarData.slice(weekIndex * 7, (weekIndex + 1) * 7).map((date, dayIndex) => (
                      <TouchableOpacity
                        key={`day-${weekIndex}-${dayIndex}`}
                        style={[
                          styles.calendarDay,
                          date && isToday(date) && styles.today,
                          date && isSelected(date) && styles.selectedDay,
                          !date && styles.emptyDay
                        ]}
                        onPress={() => date && handleDateSelect(date)}
                        disabled={!date}
                      >
                        {date && (
                          <Text style={[
                            styles.dayText,
                            isToday(date) && styles.todayText,
                            isSelected(date) && styles.selectedDayText
                          ]}>
                            {date.getDate()}
                          </Text>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                ))}
              </View>
            </View>
            
            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <TouchableOpacity 
                style={styles.quickButton}
                onPress={() => {
                  const today = new Date();
                  setSelectedDate(today);
                  setCurrentMonth(today);
                }}
              >
                <Text style={styles.quickButtonText}>Today</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.quickButton}
                onPress={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  setSelectedDate(tomorrow);
                  setCurrentMonth(tomorrow);
                }}
              >
                <Text style={styles.quickButtonText}>Tomorrow</Text>
              </TouchableOpacity>
            </View>
            
            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={handleDateCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmButton} 
                onPress={handleDateConfirm}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  formField: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 6,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'solid',
    borderRadius: 12,
    minHeight: 56,
  },
  dateText: {
    fontSize: 16,
    color: '#0f172a',
    flex: 1,
  },
  placeholderText: {
    color: '#64748b',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 350,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
  },
  monthYearText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  calendarContainer: {
    marginBottom: 16,
  },
  dayHeaders: {
    flexDirection: 'row',
    marginBottom: 8,
    minHeight: 24,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarGrid: {
    gap: 1,
  },
  calendarRow: {
    flexDirection: 'row',
    gap: 1,
    minHeight: 34,
  },
  calendarDay: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minHeight: 32,
    minWidth: 32,
  },
  emptyDay: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  today: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  selectedDay: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e293b',
  },
  todayText: {
    color: '#1d4ed8',
    fontWeight: '700',
  },
  selectedDayText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    gap: 8,
  },
  quickButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  quickButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  confirmButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#3b82f6',
    borderRadius: 6,
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});
