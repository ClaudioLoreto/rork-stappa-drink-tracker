import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Clock, Plus, X, AlertCircle } from 'lucide-react-native';
import { useLanguage } from '@/contexts/LanguageContext';
import { api } from '@/services/api';
import Colors from '@/constants/colors';
import Card from './Card';
import Button from './Button';
import { FormInput } from './Form';
import BottomSheet from './BottomSheet';
import { ModalSuccess, ModalError } from './ModalKit';
import { WeeklySchedule, DaySchedule, TimeSlot, ClosurePeriod } from '@/types';

interface ScheduleManagerProps {
  establishmentId: string;
  token: string;
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

export default function ScheduleManager({ establishmentId, token }: ScheduleManagerProps) {
  const { t } = useLanguage();
  
  const [schedule, setSchedule] = useState<WeeklySchedule | null>(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [loading, setLoading] = useState(false);
  const [closurePeriods, setClosurePeriods] = useState<ClosurePeriod[]>([]);
  
  const [editDay, setEditDay] = useState<keyof WeeklySchedule | null>(null);
  const [editSlots, setEditSlots] = useState<TimeSlot[]>([]);
  const [editIsOpen, setEditIsOpen] = useState(false);
  
  const [showClosureModal, setShowClosureModal] = useState(false);
  const [closureStart, setClosureStart] = useState('');
  const [closureEnd, setClosureEnd] = useState('');
  const [closureReason, setClosureReason] = useState('');
  
  const [successModal, setSuccessModal] = useState({ visible: false, message: '' });
  const [errorModal, setErrorModal] = useState({ visible: false, message: '' });

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      const data = await api.schedule.get(token, establishmentId);
      if (data) {
        setSchedule(data);
      } else {
        // Initialize default schedule (all closed)
        const defaultSchedule: WeeklySchedule = {
          monday: { isOpen: false, slots: [] },
          tuesday: { isOpen: false, slots: [] },
          wednesday: { isOpen: false, slots: [] },
          thursday: { isOpen: false, slots: [] },
          friday: { isOpen: false, slots: [] },
          saturday: { isOpen: false, slots: [] },
          sunday: { isOpen: false, slots: [] },
        };
        setSchedule(defaultSchedule);
      }
      
      const establishments = await api.establishments.list(token);
      const est = establishments.find(e => e.id === establishmentId);
      if (est) {
        setIsRecurring(est.isRecurring || false);
        setClosurePeriods(est.closurePeriods || []);
      }
    } catch (error) {
      console.error('Failed to load schedule:', error);
    }
  };

  const handleSaveSchedule = async () => {
    if (!schedule) return;
    
    setLoading(true);
    try {
      await api.schedule.update(token, establishmentId, schedule, isRecurring);
      setSuccessModal({ visible: true, message: t('schedule.scheduleUpdated') });
    } catch (error) {
      setErrorModal({ visible: true, message: t('common.error') });
    } finally {
      setLoading(false);
    }
  };

  const handleEditDay = (day: keyof WeeklySchedule) => {
    if (!schedule) return;
    const daySchedule = schedule[day];
    setEditDay(day);
    setEditIsOpen(daySchedule.isOpen);
    setEditSlots([...daySchedule.slots]);
  };

  const handleSaveDay = () => {
    if (!schedule || !editDay) return;
    
    setSchedule({
      ...schedule,
      [editDay]: {
        isOpen: editIsOpen,
        slots: editSlots,
      },
    });
    setEditDay(null);
  };

  const addSlot = () => {
    setEditSlots([...editSlots, { from: '09:00', to: '17:00' }]);
  };

  const updateSlot = (index: number, field: 'from' | 'to', value: string) => {
    const newSlots = [...editSlots];
    newSlots[index][field] = value;
    setEditSlots(newSlots);
  };

  const removeSlot = (index: number) => {
    setEditSlots(editSlots.filter((_, i) => i !== index));
  };

  const handleAddClosure = async () => {
    if (!closureStart || !closureEnd) {
      Alert.alert(t('common.error'), t('schedule.fillDates'));
      return;
    }
    
    setLoading(true);
    try {
      const newPeriod = await api.schedule.addClosurePeriod(
        token,
        establishmentId,
        closureStart,
        closureEnd,
        closureReason
      );
      setClosurePeriods([...closurePeriods, newPeriod]);
      setShowClosureModal(false);
      setClosureStart('');
      setClosureEnd('');
      setClosureReason('');
      setSuccessModal({ visible: true, message: t('schedule.closureAdded') });
    } catch (error) {
      setErrorModal({ visible: true, message: t('common.error') });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveClosure = async (closureId: string) => {
    setLoading(true);
    try {
      await api.schedule.removeClosurePeriod(token, establishmentId, closureId);
      setClosurePeriods(closurePeriods.filter(p => p.id !== closureId));
      setSuccessModal({ visible: true, message: t('schedule.closureRemoved') });
    } catch (error) {
      setErrorModal({ visible: true, message: t('common.error') });
    } finally {
      setLoading(false);
    }
  };

  if (!schedule) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <Clock size={24} color={Colors.orange} />
          <Text style={styles.title}>{t('schedule.scheduleManagement')}</Text>
        </View>
        
        <View style={styles.recurringRow}>
          <Text style={styles.label}>{t('schedule.recurringWeekly')}</Text>
          <Switch
            value={isRecurring}
            onValueChange={setIsRecurring}
            trackColor={{ true: Colors.orange, false: Colors.border }}
          />
        </View>
        
        {!isRecurring && (
          <View style={styles.warningBox}>
            <AlertCircle size={20} color={Colors.orange} />
            <Text style={styles.warningText}>{t('schedule.recurringWarning')}</Text>
          </View>
        )}
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionTitle}>{t('schedule.weeklySchedule')}</Text>
        {DAYS.map(day => (
          <TouchableOpacity
            key={day}
            style={styles.dayRow}
            onPress={() => handleEditDay(day)}
          >
            <View style={styles.dayLeft}>
              <Text style={styles.dayName}>{t(`schedule.${day}`)}</Text>
              <Text style={styles.dayStatus}>
                {schedule[day].isOpen
                  ? schedule[day].slots.map(s => `${s.from}-${s.to}`).join(', ')
                  : t('schedule.closed')}
              </Text>
            </View>
            <View style={[styles.statusDot, schedule[day].isOpen && styles.statusDotOpen]} />
          </TouchableOpacity>
        ))}
      </Card>

      <Card style={styles.card}>
        <View style={styles.closureHeader}>
          <Text style={styles.sectionTitle}>{t('schedule.closurePeriods')}</Text>
          <TouchableOpacity onPress={() => setShowClosureModal(true)}>
            <Plus size={24} color={Colors.orange} />
          </TouchableOpacity>
        </View>
        
        {closurePeriods.length === 0 ? (
          <Text style={styles.emptyText}>{t('schedule.noClosures')}</Text>
        ) : (
          closurePeriods.map(period => (
            <View key={period.id} style={styles.closureItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.closureDate}>
                  {new Date(period.startDate).toLocaleDateString()} - {new Date(period.endDate).toLocaleDateString()}
                </Text>
                {period.reason && <Text style={styles.closureReason}>{period.reason}</Text>}
              </View>
              <TouchableOpacity onPress={() => handleRemoveClosure(period.id)}>
                <X size={20} color={Colors.error} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </Card>

      <Button
        title={t('common.save')}
        onPress={handleSaveSchedule}
        loading={loading}
        style={styles.saveButton}
      />

      {/* Edit Day Modal */}
      <BottomSheet
        visible={editDay !== null}
        onClose={() => setEditDay(null)}
        title={editDay ? t(`schedule.${editDay}`) : ''}
      >
        <ScrollView style={styles.modalContent}>
          <View style={styles.openRow}>
            <Text style={styles.label}>{t('schedule.isOpen')}</Text>
            <Switch
              value={editIsOpen}
              onValueChange={setEditIsOpen}
              trackColor={{ true: Colors.orange, false: Colors.border }}
            />
          </View>

          {editIsOpen && (
            <>
              <Text style={styles.slotTitle}>{t('schedule.timeSlots')}</Text>
              {editSlots.map((slot, index) => (
                <View key={index} style={styles.slotRow}>
                  <FormInput
                    label={t('schedule.from')}
                    value={slot.from}
                    onChangeText={(v) => updateSlot(index, 'from', v)}
                    placeholder="09:00"
                    style={styles.timeInput}
                  />
                  <FormInput
                    label={t('schedule.to')}
                    value={slot.to}
                    onChangeText={(v) => updateSlot(index, 'to', v)}
                    placeholder="17:00"
                    style={styles.timeInput}
                  />
                  <TouchableOpacity
                    onPress={() => removeSlot(index)}
                    style={styles.removeButton}
                  >
                    <X size={20} color={Colors.error} />
                  </TouchableOpacity>
                </View>
              ))}
              
              <Button
                title={t('schedule.addTimeSlot')}
                onPress={addSlot}
                variant="secondary"
              />
            </>
          )}
          
          <Button
            title={t('common.save')}
            onPress={handleSaveDay}
            style={styles.topMargin}
          />
        </ScrollView>
      </BottomSheet>

      {/* Add Closure Modal */}
      <BottomSheet
        visible={showClosureModal}
        onClose={() => setShowClosureModal(false)}
        title={t('schedule.addClosure')}
      >
        <View style={styles.modalContent}>
          <FormInput
            label={t('schedule.startDate')}
            value={closureStart}
            onChangeText={setClosureStart}
            placeholder="YYYY-MM-DD"
          />
          <FormInput
            label={t('schedule.endDate')}
            value={closureEnd}
            onChangeText={setClosureEnd}
            placeholder="YYYY-MM-DD"
          />
          <FormInput
            label={t('schedule.reason')}
            value={closureReason}
            onChangeText={setClosureReason}
            placeholder={t('schedule.reasonPlaceholder')}
            multiline
          />
          <Button
            title={t('common.save')}
            onPress={handleAddClosure}
            loading={loading}
          />
        </View>
      </BottomSheet>

      <ModalSuccess
        visible={successModal.visible}
        onClose={() => setSuccessModal({ visible: false, message: '' })}
        title={t('common.success')}
        message={successModal.message}
      />

      <ModalError
        visible={errorModal.visible}
        onClose={() => setErrorModal({ visible: false, message: '' })}
        title={t('common.error')}
        message={errorModal.message}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: Colors.text.secondary,
  },
  card: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text.primary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text.primary,
    marginBottom: 12,
  },
  recurringRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  label: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  warningBox: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.amber + '20',
    marginTop: 12,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  dayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dayLeft: {
    flex: 1,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    textTransform: 'capitalize' as const,
  },
  dayStatus: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.error,
  },
  statusDotOpen: {
    backgroundColor: Colors.success,
  },
  closureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  closureItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closureDate: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text.primary,
  },
  closureReason: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.text.secondary,
    fontSize: 14,
    paddingVertical: 20,
  },
  saveButton: {
    marginVertical: 20,
  },
  modalContent: {
    paddingBottom: 20,
  },
  openRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  slotTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text.primary,
    marginBottom: 12,
  },
  slotRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  timeInput: {
    flex: 1,
  },
  removeButton: {
    padding: 12,
    marginBottom: 8,
  },
  topMargin: {
    marginTop: 16,
  },
});
