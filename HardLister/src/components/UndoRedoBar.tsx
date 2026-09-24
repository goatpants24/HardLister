import React, { memo } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface Props {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  historyLength?: number;
}

/**
 * UndoRedoBar
 * Memoized bottom bar providing interactive step-by-step history undo/redo controls.
 */
export default memo(function UndoRedoBar({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  historyLength = 0,
}: Props) {
  return (
    <View style={styles.bar}>
      <TouchableOpacity
        style={[styles.btn, !canUndo && styles.btnDisabled]}
        onPress={onUndo}
        disabled={!canUndo}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityLabel="Undo"
        accessibilityHint="Reverts the last form modification"
        accessibilityRole="button"
        accessibilityState={{ disabled: !canUndo }}
      >
        <Text style={[styles.icon, !canUndo && styles.iconDisabled]}>↩</Text>
        <Text style={[styles.label, !canUndo && styles.labelDisabled]}>Undo</Text>
      </TouchableOpacity>

      {historyLength > 0 && (
        <View
          style={styles.badge}
          accessible={true}
          accessibilityRole="text"
          accessibilityLabel={`${historyLength} change${historyLength === 1 ? '' : 's'} in history`}
        >
          <Text style={styles.badgeText}>{historyLength}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.btn, !canRedo && styles.btnDisabled]}
        onPress={onRedo}
        disabled={!canRedo}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityLabel="Redo"
        accessibilityHint="Reapplies the previously undone modification"
        accessibilityRole="button"
        accessibilityState={{ disabled: !canRedo }}
      >
        <Text style={[styles.icon, !canRedo && styles.iconDisabled]}>↪</Text>
        <Text style={[styles.label, !canRedo && styles.labelDisabled]}>Redo</Text>
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#13151f',
    borderTopWidth: 1,
    borderTopColor: '#2a2d3a',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#252836',
  },
  btnDisabled: {
    backgroundColor: '#1a1d27',
    opacity: 0.5,
  },
  icon: {
    fontSize: 16,
    color: '#818cf8',
  },
  iconDisabled: {
    color: '#475569',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#e2e8f0',
  },
  labelDisabled: {
    color: '#475569',
  },
  badge: {
    backgroundColor: '#4f6ef7',
    borderRadius: 10,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
  },
});
