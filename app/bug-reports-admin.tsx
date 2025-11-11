import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { api } from '@/services/api';
import Colors from '@/constants/colors';
import { BugReport } from '@/types';
import Card from '@/components/Card';

export default function BugReportsAdminScreen() {
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const [reports, setReports] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<BugReport['status'] | 'ALL'>('ALL');

  useEffect(() => {
    loadReports();
  }, [filter]);

  const loadReports = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const data = await api.bugReports.list(
        token,
        filter !== 'ALL' ? { status: filter } : undefined
      );
      setReports(data);
    } catch (error) {
      console.error('Failed to load bug reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: BugReport['status']) => {
    const colors = {
      OPEN: '#FF9800',
      IN_PROGRESS: '#2196F3',
      RESOLVED: '#4CAF50',
      CLOSED: '#9E9E9E',
    };
    return colors[status];
  };

  const getStatusIcon = (status: BugReport['status']) => {
    const icons = {
      OPEN: AlertCircle,
      IN_PROGRESS: Clock,
      RESOLVED: CheckCircle,
      CLOSED: XCircle,
    };
    const Icon = icons[status];
    return <Icon size={18} color={getStatusColor(status)} />;
  };

  const getSeverityColor = (severity: BugReport['severity']) => {
    const colors = {
      LOW: '#4CAF50',
      MEDIUM: '#FF9800',
      HIGH: '#FF5722',
      CRITICAL: '#D32F2F',
    };
    return colors[severity];
  };

  const handleStatusChange = async (reportId: string, newStatus: BugReport['status']) => {
    if (!token) return;

    try {
      await api.bugReports.updateStatus(token, reportId, newStatus);
      loadReports();
    } catch (error) {
      console.error('Failed to update status:', error);
      Alert.alert(t('common.error'), 'Impossibile aggiornare lo stato');
    }
  };

  const handleDelete = async (reportId: string) => {
    if (!token) return;

    Alert.alert(
      'Conferma eliminazione',
      'Sei sicuro di voler eliminare questa segnalazione?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await api.bugReports.delete(token, reportId);
              loadReports();
            } catch (error) {
              console.error('Failed to delete report:', error);
              Alert.alert(t('common.error'), 'Impossibile eliminare la segnalazione');
            }
          },
        },
      ]
    );
  };

  // Redirect se non ROOT
  if (user?.role !== 'ROOT') {
    router.back();
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>{t('bugReport.allReports')}</Text>
          <Text style={styles.headerSubtitle}>{reports.length} segnalazioni</Text>
        </View>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
      >
        {(['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const).map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              filter === status && styles.filterButtonActive,
            ]}
            onPress={() => setFilter(status)}
          >
            <Text
              style={[
                styles.filterText,
                filter === status && styles.filterTextActive,
              ]}
            >
              {status === 'ALL' ? 'Tutti' : t(`bugReport.status${status.charAt(0) + status.slice(1).toLowerCase()}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadReports} />
        }
      >
        {reports.length === 0 ? (
          <View style={styles.emptyState}>
            <AlertCircle size={48} color={Colors.text.secondary} />
            <Text style={styles.emptyText}>{t('bugReport.noReports')}</Text>
          </View>
        ) : (
          reports.map((report) => (
            <Card key={report.id} style={styles.reportCard}>
              {/* Header */}
              <View style={styles.reportHeader}>
                <View style={styles.reportHeaderLeft}>
                  {getStatusIcon(report.status)}
                  <View
                    style={[
                      styles.severityDot,
                      { backgroundColor: getSeverityColor(report.severity) },
                    ]}
                  />
                  <Text style={styles.reportCategory}>{report.category}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(report.status) + '20' },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(report.status) },
                    ]}
                  >
                    {t(`bugReport.status${report.status.charAt(0) + report.status.slice(1).toLowerCase()}`)}
                  </Text>
                </View>
              </View>

              {/* Content */}
              <Text style={styles.reportTitle}>{report.title}</Text>
              <Text style={styles.reportDescription} numberOfLines={3}>
                {report.description}
              </Text>

              {/* Meta Info */}
              <View style={styles.reportMeta}>
                <Text style={styles.metaText}>
                  👤 {report.username} ({report.userRole})
                </Text>
                <Text style={styles.metaText}>
                  📱 {report.deviceInfo}
                </Text>
                <Text style={styles.metaText}>
                  📅 {new Date(report.createdAt).toLocaleDateString('it-IT')}
                </Text>
              </View>

              {/* Actions */}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.actionButtonPrimary]}
                  onPress={() => {
                    Alert.alert(
                      report.title,
                      report.description +
                        '\n\n' +
                        `Categoria: ${report.category}\n` +
                        `Gravità: ${report.severity}\n` +
                        `Utente: ${report.username} (${report.userRole})\n` +
                        `Device: ${report.deviceInfo}\n` +
                        `App: ${report.appVersion}\n` +
                        `Creato: ${new Date(report.createdAt).toLocaleString('it-IT')}`
                    );
                  }}
                >
                  <Text style={styles.actionButtonText}>Dettagli</Text>
                </TouchableOpacity>

                {report.status !== 'RESOLVED' && (
                  <TouchableOpacity
                    style={[styles.actionButton, styles.actionButtonSuccess]}
                    onPress={() => handleStatusChange(report.id, 'RESOLVED')}
                  >
                    <CheckCircle size={16} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Risolvi</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={[styles.actionButton, styles.actionButtonDanger]}
                  onPress={() => handleDelete(report.id)}
                >
                  <XCircle size={16} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>Elimina</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterButtonActive: {
    backgroundColor: Colors.orange + '20',
    borderColor: Colors.orange,
  },
  filterText: {
    fontSize: 13,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: Colors.orange,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.text.secondary,
    marginTop: 12,
  },
  reportCard: {
    marginBottom: 12,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  reportHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  reportCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  reportDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  reportMeta: {
    gap: 4,
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  metaText: {
    fontSize: 11,
    color: Colors.text.secondary,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonPrimary: {
    backgroundColor: Colors.orange,
  },
  actionButtonSuccess: {
    backgroundColor: '#4CAF50',
  },
  actionButtonDanger: {
    backgroundColor: '#D32F2F',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
