/**
 * HardLister Polymorphic Form Interface Router
 * Swaps out sub-form configuration blocks without re-rendering context trees.
 */

import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView } from 'react-native';
import { HardGoodsCategory, HardGoodsItem } from '../types/hardgoods';

export default function DynamicFormRouter() {
  const [selectedCategory, setSelectedCategory] = useState<HardGoodsCategory>('Camera Gear');
  const [formData, setFormData] = useState<Partial<HardGoodsItem>>({
    primaryCategory: 'Camera Gear',
    modelNumber: '',
    serialNumber: '',
    inspectionNotes: ''
  });

  const updateField = (key: keyof HardGoodsItem, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>New Gear Manifest Entry</Text>
      
      {/* Structural Universal Base Form Elements */}
      <View style={styles.card}>
        <Text style={styles.label}>Model / Part Number *</Text>
        <TextInput 
          style={styles.input}
          placeholder="e.g., ILCE-7RM5 or DCF891"
          placeholderTextColor="#4b5563"
          value={formData.modelNumber}
          onChangeText={(val) => updateField('modelNumber', val)}
        />

        <Text style={styles.label}>Serial Number *</Text>
        <TextInput 
          style={styles.input}
          placeholder="Required for tracking identity"
          placeholderTextColor="#4b5563"
          value={formData.serialNumber}
          onChangeText={(val) => updateField('serialNumber', val)}
        />
      </View>

      {/* Conditional Interface Injection Branches */}
      {selectedCategory === 'Camera Gear' && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Gold-Standard Optics Calibration</Text>
          <Text style={styles.label}>Shutter Count / Run-Hours</Text>
          <TextInput 
            style={styles.input}
            keyboardType="numeric"
            placeholder="e.g., 14205"
            placeholderTextColor="#4b5563"
            onChangeText={(val) => updateField('shutterCountOrHours', parseInt(val) || 0)}
          />
          {/* Inject additional optical dropdown menus and lens mounts selections here */}
        </View>
      )}

      {selectedCategory === 'Electronics' && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Computing Hardware Environment</Text>
          <Text style={styles.label}>Storage / Memory Profile</Text>
          <TextInput 
            style={styles.input}
            placeholder="e.g., 32GB RAM / 1TB SSD"
            placeholderTextColor="#4b5563"
            onChangeText={(val) => updateField('storageRamProfile', val)}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f1117' },
  content: { padding: 16 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#e8eaf6', marginBottom: 16 },
  card: { backgroundColor: '#1a1d27', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#2a2d3a' },
  label: { color: '#94a3b8', fontSize: 13, marginBottom: 6, marginTop: 10, fontWeight: '500' },
  input: { backgroundColor: '#0f1117', color: '#e8eaf6', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#2a2d3a', fontSize: 14 },
  sectionContainer: { marginTop: 16, padding: 16, backgroundColor: '#131622', borderRadius: 12, borderWidth: 1, borderColor: '#1e293b' },
  sectionHeader: { color: '#4f6ef7', fontWeight: '700', fontSize: 15, marginBottom: 8 }
});