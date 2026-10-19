/**
 * MonitorRoleView
 * Dedicated Monitor Role interface providing real-time manifest queue monitoring,
 * high-contrast serial tag photo inspection, manifest data validation, and auditor approval/flagging controls.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { MonitorQueueItem, ManifestAuditStatus } from '../types/ingestion';

interface MonitorRoleViewProps {
  queueItems: MonitorQueueItem[];
  onUpdateStatus: (id: string, newStatus: ManifestAuditStatus, notes?: string) => void;
  onLoadManifestToForm: (item: MonitorQueueItem) => void;
  onClose: () => void;
}

export default function MonitorRoleView({
  queueItems,
  onUpdateStatus,
  onLoadManifestToForm,
  onClose
}: MonitorRoleViewProps) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(
    queueItems.length > 0 ? queueItems[0].id : null
  );

  const [auditorNoteInput, setAuditorNoteInput] = useState('');
  const [highContrastActive, setHighContrastActive] = useState(true);

  const selectedItem = queueItems.find(item => item.id === selectedItemId) || queueItems[0] || null;

  const pendingCount = queueItems.filter(i => i.status === 'Pending Audit').length;
  const approvedCount = queueItems.filter(i => i.status === 'Approved').length;
  const flaggedCount = queueItems.filter(i => i.status === 'Flagged').length;

  const handleApprove = (id: string) => {
    onUpdateStatus(id, 'Approved', auditorNoteInput || 'Manifest validated and approved by Monitor.');
    setAuditorNoteInput('');
  };

  const handleFlag = (id: string) => {
    onUpdateStatus(id, 'Flagged', auditorNoteInput || 'Flagged for serial/model clarity review.');
    setAuditorNoteInput('');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.headerBox}>
        <View style={styles.rowBetween}>
          <Text style={styles.headerTitle}>🖥️ Monitor Role: Audit & Verification Terminal</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Close Monitor</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>
          Real-time audit dashboard for inspecting dictated manifests, serial tag readability, and data integrity.
        </Text>

        {/* Dashboard Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#fbbf24' }]}>{pendingCount}</Text>
            <Text style={styles.statLabel}>Pending Audit</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#34d399' }]}>{approvedCount}</Text>
            <Text style={styles.statLabel}>Approved</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#f87171' }]}>{flaggedCount}</Text>
            <Text style={styles.statLabel}>Flagged</Text>
          </View>
        </View>
      </View>

      {queueItems.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No items currently in Monitor Audit Queue.</Text>
          <Text style={styles.emptySubtext}>Use Shooter Role or Manifest Form to ingest items into the queue.</Text>
        </View>
      ) : (
        <>
          {/* Queue Items Horizontal Picker */}
          <View style={styles.card}>
            <Text style={styles.sectionHeader}>📋 Ingested Manifest Queue ({queueItems.length})</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.queueScroll}>
              {queueItems.map((item) => {
                const isSelected = selectedItem?.id === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.queueChip,
                      isSelected && styles.queueChipSelected,
                      item.status === 'Approved' && styles.chipApproved,
                      item.status === 'Flagged' && styles.chipFlagged
                    ]}
                    onPress={() => setSelectedItemId(item.id)}
                  >
                    <Text style={[styles.queueChipText, isSelected && styles.queueChipTextSelected]}>
                      {item.manifest.itemSKU}
                    </Text>
                    <Text style={styles.queueChipStatus}>
                      {item.status === 'Approved' ? '✅ Approved' : item.status === 'Flagged' ? '⚠️ Flagged' : '⏳ Pending'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Selected Item Audit Card */}
          {selectedItem && (
            <View style={[styles.card, { marginTop: 16 }]}>
              <View style={styles.rowBetween}>
                <Text style={styles.sectionHeader}>🔎 Manifest Audit: {selectedItem.manifest.itemSKU}</Text>
                <View style={[
                  styles.statusBadge,
                  selectedItem.status === 'Approved' && styles.statusBadgeApproved,
                  selectedItem.status === 'Flagged' && styles.statusBadgeFlagged
                ]}>
                  <Text style={styles.statusBadgeText}>{selectedItem.status}</Text>
                </View>
              </View>

              {/* Dictated Specs Review Table */}
              <View style={styles.auditTable}>
                <View style={styles.tableRow}>
                  <Text style={styles.tableLabel}>Title:</Text>
                  <Text style={styles.tableValue}>{selectedItem.manifest.vocalFields.title || 'N/A'}</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableLabel}>Brand:</Text>
                  <Text style={styles.tableValue}>{selectedItem.manifest.vocalFields.brand || 'N/A'}</Text>
                </View>
                <View style={styles.tableRowHighlight}>
                  <Text style={styles.tableLabelHighlight}>Model / Part #:</Text>
                  <Text style={styles.tableValueHighlight}>{selectedItem.manifest.vocalFields.modelNumber || 'N/A'}</Text>
                </View>
                <View style={styles.tableRowHighlight}>
                  <Text style={styles.tableLabelHighlight}>Serial #:</Text>
                  <Text style={styles.tableValueHighlight}>{selectedItem.manifest.vocalFields.serialNumber || 'N/A'}</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableLabel}>Category:</Text>
                  <Text style={styles.tableValue}>{selectedItem.manifest.vocalFields.primaryCategory || 'N/A'}</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableLabel}>Condition:</Text>
                  <Text style={styles.tableValue}>{selectedItem.manifest.vocalFields.condition || 'N/A'}</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableLabel}>Vocal Notes:</Text>
                  <Text style={styles.tableValue}>{selectedItem.manifest.vocalFields.inspectionNotes || 'None'}</Text>
                </View>
              </View>

              {/* Serial Tag High Contrast Inspector */}
              <Text style={[styles.sectionHeader, { marginTop: 14 }]}>🔍 Serial Tag / Model Plate Clarity Inspector</Text>
              <View style={[styles.photoInspectBox, highContrastActive && styles.highContrastBox]}>
                <Text style={styles.photoUriText}>
                  📷 Tag Asset: {selectedItem.manifest.photos.tagModel || 'No Tag Photo Attached'}
                </Text>
                <TouchableOpacity
                  style={[styles.contrastToggleBtn, highContrastActive && styles.contrastToggleActive]}
                  onPress={() => setHighContrastActive(!highContrastActive)}
                >
                  <Text style={styles.contrastToggleText}>
                    {highContrastActive ? '🔵 High Contrast Inspector Active (+200% Clarity)' : '⚪ Enable High Contrast'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Auditor Notes Input */}
              <Text style={styles.inputLabel}>Auditor Diagnostics & Approval Notes</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Enter auditor review notes or validation comments..."
                placeholderTextColor="#4b5563"
                value={auditorNoteInput}
                onChangeText={setAuditorNoteInput}
              />
              {selectedItem.auditorNotes ? (
                <Text style={styles.previousNotesText}>Previous Note: {selectedItem.auditorNotes}</Text>
              ) : null}

              {/* Auditor Action Buttons */}
              <View style={styles.auditActionRow}>
                <TouchableOpacity style={styles.flagBtn} onPress={() => handleFlag(selectedItem.id)}>
                  <Text style={styles.flagBtnText}>⚠️ Flag for Review</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.loadFormBtn} onPress={() => onLoadManifestToForm(selectedItem)}>
                  <Text style={styles.loadFormBtnText}>📝 Open in Form Router</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.approveBtn} onPress={() => handleApprove(selectedItem.id)}>
                  <Text style={styles.approveBtnText}>✅ Approve Manifest</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1117' },
  content: { padding: 16 },
  headerBox: { marginBottom: 14, backgroundColor: '#131622', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#1e293b' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#38bdf8', marginBottom: 4 },
  headerSubtitle: { color: '#94a3b8', fontSize: 12, marginBottom: 12, lineHeight: 16 },
  closeBtn: { backgroundColor: '#1e293b', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  closeBtnText: { color: '#cbd5e1', fontSize: 11, fontWeight: '700' },

  statsRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  statBox: { flex: 1, backgroundColor: '#0f1117', padding: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#1e293b' },
  statNumber: { fontSize: 18, fontWeight: '800' },
  statLabel: { color: '#64748b', fontSize: 10, fontWeight: '600', marginTop: 2 },

  emptyCard: { backgroundColor: '#1a1d27', padding: 24, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#2a2d3a' },
  emptyText: { color: '#cbd5e1', fontSize: 14, fontWeight: '700' },
  emptySubtext: { color: '#64748b', fontSize: 12, marginTop: 4, textAlign: 'center' },

  card: { backgroundColor: '#1a1d27', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#2a2d3a' },
  sectionHeader: { color: '#4f6ef7', fontWeight: '800', fontSize: 14, marginBottom: 8 },

  queueScroll: { marginTop: 4 },
  queueChip: { backgroundColor: '#111420', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#1e293b', marginRight: 8, minWidth: 110 },
  queueChipSelected: { borderColor: '#38bdf8', backgroundColor: 'rgba(56, 189, 248, 0.15)' },
  chipApproved: { borderColor: '#10b981' },
  chipFlagged: { borderColor: '#ef4444' },
  queueChipText: { color: '#94a3b8', fontSize: 12, fontWeight: '700', fontFamily: 'monospace' },
  queueChipTextSelected: { color: '#ffffff' },
  queueChipStatus: { color: '#64748b', fontSize: 10, marginTop: 2 },

  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusBadge: { backgroundColor: '#334155', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusBadgeApproved: { backgroundColor: '#065f46' },
  statusBadgeFlagged: { backgroundColor: '#991b1b' },
  statusBadgeText: { color: '#ffffff', fontSize: 11, fontWeight: '700' },

  auditTable: { backgroundColor: '#0f1117', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#2a2d3a', marginVertical: 8 },
  tableRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#1a1d27' },
  tableRowHighlight: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, backgroundColor: 'rgba(56, 189, 248, 0.1)', paddingHorizontal: 6, borderRadius: 4, marginVertical: 4 },
  tableLabel: { color: '#94a3b8', fontSize: 12 },
  tableValue: { color: '#f1f5f9', fontSize: 12, fontWeight: '600' },
  tableLabelHighlight: { color: '#38bdf8', fontSize: 12, fontWeight: '700' },
  tableValueHighlight: { color: '#ffffff', fontSize: 12, fontWeight: '800', fontFamily: 'monospace' },

  photoInspectBox: { backgroundColor: '#111420', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#1e293b', marginTop: 4 },
  highContrastBox: { borderColor: '#38bdf8', borderWidth: 2, backgroundColor: '#0f172a' },
  photoUriText: { color: '#cbd5e1', fontSize: 11, fontFamily: 'monospace', marginBottom: 8 },
  contrastToggleBtn: { backgroundColor: '#1e293b', paddingVertical: 6, borderRadius: 6, alignItems: 'center' },
  contrastToggleActive: { backgroundColor: '#0284c7' },
  contrastToggleText: { color: '#ffffff', fontSize: 11, fontWeight: '700' },

  inputLabel: { color: '#94a3b8', fontSize: 12, fontWeight: '600', marginTop: 12, marginBottom: 4 },
  notesInput: { backgroundColor: '#0f1117', color: '#e8eaf6', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#2a2d3a', fontSize: 12 },
  previousNotesText: { color: '#fbbf24', fontSize: 11, marginTop: 4, fontStyle: 'italic' },

  auditActionRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  flagBtn: { backgroundColor: '#991b1b', paddingVertical: 12, paddingHorizontal: 10, borderRadius: 8, justifyContent: 'center' },
  flagBtnText: { color: '#ffffff', fontSize: 11, fontWeight: '700' },
  loadFormBtn: { backgroundColor: '#1e293b', paddingVertical: 12, paddingHorizontal: 10, borderRadius: 8, justifyContent: 'center' },
  loadFormBtnText: { color: '#cbd5e1', fontSize: 11, fontWeight: '700' },
  approveBtn: { flex: 1, backgroundColor: '#10b981', paddingVertical: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  approveBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '700' }
});
