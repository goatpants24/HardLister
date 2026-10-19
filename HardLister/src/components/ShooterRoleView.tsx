/**
 * ShooterRoleView
 * Dedicated Shooter Role interface featuring vocal dictation input for hardware specs,
 * model & serial number focus, hardware photo asset capture, and final confirmation readout.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { HardGoodsCategory, HardGoodsItem } from '../types/hardgoods';
import { ShooterManifest, VocalFieldKey, VocalFieldEntry } from '../types/ingestion';

interface ShooterRoleViewProps {
  initialCategory?: HardGoodsCategory;
  onManifestConfirmed: (manifest: ShooterManifest) => void;
  onCancel: () => void;
}

const VOCAL_FIELD_CONFIGS: { key: VocalFieldKey; label: string; placeholder: string; required?: boolean }[] = [
  { key: 'title', label: 'Item Title', placeholder: 'e.g., DeWalt 20V Max Brushless Drill', required: true },
  { key: 'brand', label: 'Brand / Manufacturer', placeholder: 'e.g., DeWalt, Sony, Milwaukee', required: true },
  { key: 'modelNumber', label: 'Model / Part Number', placeholder: 'e.g., DCD791B or ILCE-7RM5', required: true },
  { key: 'serialNumber', label: 'Serial Number', placeholder: 'e.g., DW-2026-889102', required: true },
  { key: 'primaryCategory', label: 'Primary Category', placeholder: 'Tools, Camera Gear, Electronics, Appliances' },
  { key: 'condition', label: 'Condition State', placeholder: 'Used, New, Damaged/Parts' },
  { key: 'inspectionNotes', label: 'Inspector Diagnostics', placeholder: 'Vocal notes on physical scuffs or performance...' },
];

export default function ShooterRoleView({
  initialCategory = 'Camera Gear',
  onManifestConfirmed,
  onCancel
}: ShooterRoleViewProps) {
  const itemSKU = useMemo(() => 'YYHL-SHOOT-' + Math.floor(1000 + Math.random() * 9000), []);

  // Vocal Field States
  const [vocalValues, setVocalValues] = useState<Record<VocalFieldKey, string>>({
    title: '',
    brand: '',
    modelNumber: '',
    serialNumber: '',
    primaryCategory: initialCategory,
    condition: 'Used',
    inspectionNotes: '',
  });

  const [activeDictationField, setActiveDictationField] = useState<VocalFieldKey | null>(null);
  const [dictationLoading, setDictationLoading] = useState(false);

  // Photos State
  const [photos, setPhotos] = useState<{
    tagModel?: string;
    front?: string;
    back?: string;
    lSide?: string;
    rSide?: string;
    top?: string;
    bottom?: string;
  }>({});

  const [highContrastTagActive, setHighContrastTagActive] = useState(true);

  // Confirmation View State
  const [showConfirmationStep, setShowConfirmationStep] = useState(false);

  const updateVocalValue = (key: VocalFieldKey, value: string) => {
    setVocalValues(prev => ({ ...prev, [key]: value }));
  };

  const updatePhotoSlot = (key: keyof typeof photos, uri: string | undefined) => {
    setPhotos(prev => ({ ...prev, [key]: uri }));
  };

  // Simulate Hands-Free Vocal Dictation for a field
  const startVocalDictation = (fieldKey: VocalFieldKey) => {
    setActiveDictationField(fieldKey);
    setDictationLoading(true);

    setTimeout(() => {
      let simulatedSpeech = '';
      if (fieldKey === 'title') simulatedSpeech = 'Sony Alpha A7R V Full Frame Mirrorless Body';
      else if (fieldKey === 'brand') simulatedSpeech = 'Sony';
      else if (fieldKey === 'modelNumber') simulatedSpeech = 'ILCE-7RM5';
      else if (fieldKey === 'serialNumber') simulatedSpeech = 'SN-3891024-HL';
      else if (fieldKey === 'primaryCategory') simulatedSpeech = 'Camera Gear';
      else if (fieldKey === 'condition') simulatedSpeech = 'Used - Pristine Optical Sensor';
      else if (fieldKey === 'inspectionNotes') simulatedSpeech = 'Verified clean shutter count 4,120 actuations. Ports fully sealed.';

      updateVocalValue(fieldKey, simulatedSpeech);
      setDictationLoading(false);
      setActiveDictationField(null);
    }, 1200);
  };

  const handleSimulateAllDictation = () => {
    setDictationLoading(true);
    setTimeout(() => {
      setVocalValues({
        title: 'DeWalt 20V Max XR Brushless Hammer Drill',
        brand: 'DeWalt',
        modelNumber: 'DCD996B',
        serialNumber: 'DW-772910-US',
        primaryCategory: 'Tools',
        condition: 'Used - Light Shop Wear',
        inspectionNotes: 'Motor brushes 95% intact, dual operating voltage steps verified.',
      });
      setPhotos({
        tagModel: `file://hardlister/shooter_tag_DCD996B.jpg`,
        front: `file://hardlister/shooter_front_DCD996B.jpg`,
        back: `file://hardlister/shooter_back_DCD996B.jpg`,
      });
      setDictationLoading(false);
    }, 1000);
  };

  const handleProceedToConfirmation = () => {
    if (!vocalValues.title.trim() || !vocalValues.serialNumber.trim()) {
      return;
    }
    setShowConfirmationStep(true);
  };

  const handleFinalConfirmAndSubmit = () => {
    const itemData: Partial<HardGoodsItem> = {
      itemNumber: itemSKU,
      title: vocalValues.title,
      brand: vocalValues.brand,
      modelNumber: vocalValues.modelNumber,
      serialNumber: vocalValues.serialNumber,
      primaryCategory: vocalValues.primaryCategory,
      condition: vocalValues.condition,
      inspectionNotes: vocalValues.inspectionNotes,
      dateListed: new Date().toISOString().split('T')[0],
      photos: photos,
      stateItemName: vocalValues.title || vocalValues.modelNumber,
      stateCondition: vocalValues.condition || 'Used',
      stateOperationalState: 'Working',
      stateComponentState: 'Complete',
      statePackagingMethod: 'Original Box',
      consolidatedStateString: `${vocalValues.title}:${vocalValues.condition}:Working:Complete:Original Box`,
      numericStateCode: `${vocalValues.title}:1:1:1:1`
    };

    const manifest: ShooterManifest = {
      manifestId: 'MANIF-' + Math.floor(10000 + Math.random() * 90000),
      itemSKU,
      timestamp: new Date().toISOString(),
      vocalFields: vocalValues,
      photos,
      highContrastTagActive,
      isConfirmed: true,
      itemData
    };

    onManifestConfirmed(manifest);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.headerBox}>
        <Text style={styles.headerTitle}>🎯 Shooter Role: Vocal Ingestion Pipeline</Text>
        <Text style={styles.headerSubtitle}>
          Hands-free vocal dictation & rapid hardware asset capture for tools, optics & gear.
        </Text>
        <Text style={styles.skuBadge}>Target Manifest SKU: {itemSKU}</Text>
      </View>

      {!showConfirmationStep ? (
        <>
          {/* Vocal Dictation Speed Actions */}
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionHeader}>🎙️ Hands-Free Vocal Dictation Panel</Text>
              <TouchableOpacity
                style={styles.autoSimulateBtn}
                onPress={handleSimulateAllDictation}
                disabled={dictationLoading}
              >
                {dictationLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.autoSimulateBtnText}>⚡ Auto-Dictate Demo Manifest</Text>
                )}
              </TouchableOpacity>
            </View>

            {VOCAL_FIELD_CONFIGS.map((field) => {
              const value = vocalValues[field.key];
              const isDictatingThis = activeDictationField === field.key;

              return (
                <View key={field.key} style={styles.fieldBlock}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.fieldLabel}>
                      {field.label} {field.required ? '*' : ''}
                    </Text>

                    <TouchableOpacity
                      style={[styles.dictateBtn, isDictatingThis && styles.dictateBtnActive]}
                      onPress={() => startVocalDictation(field.key)}
                      disabled={dictationLoading}
                    >
                      <Text style={styles.dictateBtnText}>
                        {isDictatingThis ? '🎙️ Dictating...' : '🎤 Speak Input'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <TextInput
                    style={[styles.input, isDictatingThis && styles.inputDictating]}
                    value={value}
                    placeholder={field.placeholder}
                    placeholderTextColor="#4b5563"
                    onChangeText={(val) => updateVocalValue(field.key, val)}
                  />
                </View>
              );
            })}
          </View>

          {/* Rapid Gear Photo Capture Grid */}
          <View style={[styles.card, { marginTop: 16 }]}>
            <Text style={styles.sectionHeader}>📸 Hardware Asset Capture Slots</Text>
            <Text style={styles.helperText}>
              Ensure model & serial tag plates are captured with maximum readability.
            </Text>

            {/* Serial / Tag Plate Slot */}
            <View style={styles.photoSlotCard}>
              <View style={styles.rowBetween}>
                <Text style={styles.photoSlotLabel}>🏷️ Serial Tag / Model Plate Photo (CRITICAL)</Text>
                {photos.tagModel && <Text style={styles.checkIcon}>✅ Captured</Text>}
              </View>

              <TouchableOpacity
                style={[styles.contrastToggleBtn, highContrastTagActive && styles.contrastToggleBtnActive]}
                onPress={() => setHighContrastTagActive(!highContrastTagActive)}
              >
                <Text style={styles.contrastToggleText}>
                  {highContrastTagActive ? '🔵 High Contrast Active (+200% Tag Readability)' : '⚪ Boost Contrast'}
                </Text>
              </TouchableOpacity>

              {photos.tagModel ? (
                <View style={styles.photoAttachedBox}>
                  <Text style={styles.photoUriText}>Attached: {photos.tagModel}</Text>
                  <TouchableOpacity style={styles.removeBtn} onPress={() => updatePhotoSlot('tagModel', undefined)}>
                    <Text style={styles.removeBtnText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.captureSlotBtn}
                  onPress={() => updatePhotoSlot('tagModel', `file://hardlister/shooter_tag_${vocalValues.modelNumber || 'SERIAL'}.jpg`)}
                >
                  <Text style={styles.captureSlotBtnText}>📸 Capture Tag / Serial Plate</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* General Gear Photo Slots */}
            {[
              { key: 'front', label: 'Front Photo' },
              { key: 'back', label: 'Back / Ports Photo' },
              { key: 'lSide', label: 'Side / Wear Checks Photo' }
            ].map((slot) => {
              const slotKey = slot.key as keyof typeof photos;
              const hasPhoto = !!photos[slotKey];

              return (
                <View key={slotKey} style={styles.photoSlotCard}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.photoSlotLabel}>{slot.label}</Text>
                    {hasPhoto && <Text style={styles.checkIcon}>✅ Captured</Text>}
                  </View>

                  {hasPhoto ? (
                    <View style={styles.photoAttachedBox}>
                      <Text style={styles.photoUriText}>Attached: {photos[slotKey]}</Text>
                      <TouchableOpacity style={styles.removeBtn} onPress={() => updatePhotoSlot(slotKey, undefined)}>
                        <Text style={styles.removeBtnText}>Remove</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.captureSlotBtn}
                      onPress={() => updatePhotoSlot(slotKey, `file://hardlister/shooter_${slotKey}_${vocalValues.modelNumber || 'ITEM'}.jpg`)}
                    >
                      <Text style={styles.captureSlotBtnText}>📸 Capture {slot.label}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>

          {/* Action Footer */}
          <View style={styles.actionFooter}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmStepBtn,
                (!vocalValues.title.trim() || !vocalValues.serialNumber.trim()) && styles.btnDisabled
              ]}
              disabled={!vocalValues.title.trim() || !vocalValues.serialNumber.trim()}
              onPress={handleProceedToConfirmation}
            >
              <Text style={styles.confirmStepBtnText}>Proceed to Vocal Readout Confirmation ➔</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        /* Vocal Confirmation View */
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>📋 Shooter Vocal Readout Confirmation</Text>
          <Text style={styles.helperText}>
            Review the dictated voice entries and captured photos before pushing to the Monitor Audit Queue.
          </Text>

          <View style={styles.readoutCard}>
            <Text style={styles.readoutSKU}>SKU: {itemSKU}</Text>

            <View style={styles.readoutRow}>
              <Text style={styles.readoutLabel}>Title:</Text>
              <Text style={styles.readoutValue}>{vocalValues.title || 'N/A'}</Text>
            </View>

            <View style={styles.readoutRow}>
              <Text style={styles.readoutLabel}>Brand:</Text>
              <Text style={styles.readoutValue}>{vocalValues.brand || 'N/A'}</Text>
            </View>

            <View style={styles.readoutRowHighlight}>
              <Text style={styles.readoutLabelHighlight}>Model / Part #:</Text>
              <Text style={styles.readoutValueHighlight}>{vocalValues.modelNumber || 'N/A'}</Text>
            </View>

            <View style={styles.readoutRowHighlight}>
              <Text style={styles.readoutLabelHighlight}>Serial #:</Text>
              <Text style={styles.readoutValueHighlight}>{vocalValues.serialNumber || 'N/A'}</Text>
            </View>

            <View style={styles.readoutRow}>
              <Text style={styles.readoutLabel}>Category:</Text>
              <Text style={styles.readoutValue}>{vocalValues.primaryCategory || 'N/A'}</Text>
            </View>

            <View style={styles.readoutRow}>
              <Text style={styles.readoutLabel}>Condition:</Text>
              <Text style={styles.readoutValue}>{vocalValues.condition || 'N/A'}</Text>
            </View>

            <View style={styles.readoutRow}>
              <Text style={styles.readoutLabel}>Vocal Notes:</Text>
              <Text style={styles.readoutValue}>{vocalValues.inspectionNotes || 'None'}</Text>
            </View>

            <Text style={[styles.readoutLabel, { marginTop: 12 }]}>Attached Photos Matrix:</Text>
            <Text style={styles.photoSummaryText}>
              - Tag Plate: {photos.tagModel ? '✅ Captured (Contrast Active)' : '❌ Missing'}
            </Text>
            <Text style={styles.photoSummaryText}>
              - Front View: {photos.front ? '✅ Captured' : '❌ Missing'}
            </Text>
            <Text style={styles.photoSummaryText}>
              - Back View: {photos.back ? '✅ Captured' : '❌ Missing'}
            </Text>
          </View>

          <View style={styles.confirmationActionRow}>
            <TouchableOpacity style={styles.editBackBtn} onPress={() => setShowConfirmationStep(false)}>
              <Text style={styles.editBackBtnText}>✏️ Re-Dictate Fields</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.finalSubmitBtn} onPress={handleFinalConfirmAndSubmit}>
              <Text style={styles.finalSubmitBtnText}>✅ Confirm & Ingest Manifest</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1117' },
  content: { padding: 16 },
  headerBox: { marginBottom: 14, backgroundColor: '#131622', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#1e293b' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#818cf8', marginBottom: 4 },
  headerSubtitle: { color: '#94a3b8', fontSize: 12, marginBottom: 8, lineHeight: 16 },
  skuBadge: { color: '#38bdf8', fontSize: 11, fontWeight: '700', fontFamily: 'monospace' },

  card: { backgroundColor: '#1a1d27', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#2a2d3a' },
  sectionHeader: { color: '#4f6ef7', fontWeight: '800', fontSize: 14, marginBottom: 4 },
  helperText: { color: '#64748b', fontSize: 11, marginBottom: 12, lineHeight: 14 },

  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  autoSimulateBtn: { backgroundColor: '#6366f1', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  autoSimulateBtnText: { color: '#ffffff', fontSize: 11, fontWeight: '700' },

  fieldBlock: { marginTop: 12 },
  fieldLabel: { color: '#cbd5e1', fontSize: 12, fontWeight: '600' },
  dictateBtn: { backgroundColor: '#111420', borderWidth: 1, borderColor: '#3b82f6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  dictateBtnActive: { backgroundColor: '#2563eb' },
  dictateBtnText: { color: '#60a5fa', fontSize: 10, fontWeight: '700' },

  input: { backgroundColor: '#0f1117', color: '#e8eaf6', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#2a2d3a', fontSize: 13, marginTop: 4 },
  inputDictating: { borderColor: '#38bdf8', backgroundColor: 'rgba(56, 189, 248, 0.1)' },

  photoSlotCard: { backgroundColor: '#111420', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#1e293b', marginTop: 10 },
  photoSlotLabel: { color: '#e2e8f0', fontSize: 12, fontWeight: '700' },
  checkIcon: { color: '#10b981', fontSize: 11, fontWeight: '700' },

  contrastToggleBtn: { backgroundColor: '#1e293b', paddingVertical: 6, borderRadius: 6, alignItems: 'center', marginTop: 6, marginBottom: 6 },
  contrastToggleBtnActive: { backgroundColor: '#0284c7' },
  contrastToggleText: { color: '#ffffff', fontSize: 10, fontWeight: '700' },

  captureSlotBtn: { backgroundColor: '#2563eb', paddingVertical: 8, borderRadius: 6, alignItems: 'center', marginTop: 4 },
  captureSlotBtnText: { color: '#ffffff', fontSize: 11, fontWeight: '700' },

  photoAttachedBox: { backgroundColor: '#0f172a', padding: 8, borderRadius: 6, marginTop: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  photoUriText: { color: '#94a3b8', fontSize: 10, fontFamily: 'monospace', flex: 1, marginRight: 8 },
  removeBtn: { backgroundColor: '#ef4444', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  removeBtnText: { color: '#ffffff', fontSize: 10, fontWeight: '700' },

  actionFooter: { flexDirection: 'row', gap: 10, marginTop: 16 },
  cancelBtn: { backgroundColor: '#1e293b', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, justifyContent: 'center' },
  cancelBtnText: { color: '#94a3b8', fontSize: 13, fontWeight: '600' },
  confirmStepBtn: { flex: 1, backgroundColor: '#10b981', paddingVertical: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  confirmStepBtnText: { color: '#ffffff', fontSize: 13, fontWeight: '700' },
  btnDisabled: { opacity: 0.5 },

  // Readout Card styles
  readoutCard: { backgroundColor: '#0f1117', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#2a2d3a', marginVertical: 12 },
  readoutSKU: { color: '#818cf8', fontSize: 12, fontWeight: '700', fontFamily: 'monospace', marginBottom: 8 },
  readoutRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#1a1d27' },
  readoutRowHighlight: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, backgroundColor: 'rgba(56, 189, 248, 0.1)', paddingHorizontal: 6, borderRadius: 4, marginVertical: 4 },
  readoutLabel: { color: '#94a3b8', fontSize: 12 },
  readoutValue: { color: '#f1f5f9', fontSize: 12, fontWeight: '600' },
  readoutLabelHighlight: { color: '#38bdf8', fontSize: 12, fontWeight: '700' },
  readoutValueHighlight: { color: '#ffffff', fontSize: 12, fontWeight: '800', fontFamily: 'monospace' },
  photoSummaryText: { color: '#cbd5e1', fontSize: 11, fontFamily: 'monospace', marginTop: 2 },

  confirmationActionRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  editBackBtn: { backgroundColor: '#1e293b', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 8, justifyContent: 'center' },
  editBackBtnText: { color: '#cbd5e1', fontSize: 12, fontWeight: '700' },
  finalSubmitBtn: { flex: 1, backgroundColor: '#4f6ef7', paddingVertical: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  finalSubmitBtnText: { color: '#ffffff', fontSize: 13, fontWeight: '700' }
});
