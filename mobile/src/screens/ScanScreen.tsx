import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert
} from 'react-native';

interface Props {
  onScanSuccess: (animalCode: string) => void;
  onClose: () => void;
  lang: 'en' | 'hi' | 'ta';
}

export const ScanScreen: React.FC<Props> = ({ onScanSuccess, onClose, lang }) => {
  const [manualCode, setManualCode] = useState<string>('');

  const handleSimulateScan = (code: string) => {
    onScanSuccess(code);
  };

  const handleManualSubmit = () => {
    if (!manualCode.trim()) {
      Alert.alert("Input Required", "Please enter a valid animal code (e.g., COW_055).");
      return;
    }
    onScanSuccess(manualCode.trim().toUpperCase());
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕ Close</Text>
        </TouchableOpacity>
        <Text style={styles.title}>📷 Cow Ear Tag Scanner</Text>
        <Text style={styles.subtitle}>Align ear tag barcode or RFID tag within frame</Text>
      </View>

      {/* Simulated Scanner Viewport */}
      <View style={styles.scannerViewport}>
        <View style={styles.scannerBox}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
          <View style={styles.laserLine} />
          <Text style={styles.scanningText}>Scanning Active...</Text>
        </View>
      </View>

      {/* Demo Quick Select Buttons */}
      <View style={styles.quickSelectArea}>
        <Text style={styles.quickTitle}>Quick Demo Animal Tags:</Text>
        <View style={styles.tagRow}>
          <TouchableOpacity style={[styles.tagBtn, { backgroundColor: '#fee2e2' }]} onPress={() => handleSimulateScan("COW_055")}>
            <Text style={[styles.tagText, { color: '#ef4444' }]}>COW_055 (High Risk)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tagBtn, { backgroundColor: '#fef3c7' }]} onPress={() => handleSimulateScan("COW_023")}>
            <Text style={[styles.tagText, { color: '#f59e0b' }]}>COW_023 (Moderate)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tagBtn, { backgroundColor: '#d1fae5' }]} onPress={() => handleSimulateScan("COW_012")}>
            <Text style={[styles.tagText, { color: '#10b981' }]}>COW_012 (Safe)</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Manual Entry Fallback */}
      <View style={styles.manualEntry}>
        <TextInput
          style={styles.input}
          placeholder="Or Enter Tag Manually (e.g. COW_001)..."
          placeholderTextColor="#9ca3af"
          value={manualCode}
          onChangeText={setManualCode}
          autoCapitalize="characters"
        />
        <TouchableOpacity style={styles.submitBtn} onPress={handleManualSubmit}>
          <Text style={styles.submitBtnText}>Lookup</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 20,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
  },
  closeBtn: {
    alignSelf: 'flex-start',
    padding: 8,
    marginBottom: 10,
  },
  closeBtnText: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
  },
  scannerViewport: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  scannerBox: {
    width: 250,
    height: 250,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  laserLine: {
    width: '90%',
    height: 2,
    backgroundColor: '#0284c7',
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
  },
  scanningText: {
    color: '#38bdf8',
    fontSize: 12,
    marginTop: 16,
    fontWeight: '600',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#38bdf8',
  },
  topLeft: { top: -2, left: -2, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 10 },
  topRight: { top: -2, right: -2, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 10 },
  bottomLeft: { bottom: -2, left: -2, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 10 },
  bottomRight: { bottom: -2, right: -2, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 10 },
  quickSelectArea: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: 14,
    borderRadius: 12,
  },
  quickTitle: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  manualEntry: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 10,
    paddingHorizontal: 14,
    color: '#ffffff',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  submitBtn: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 18,
    justifyContent: 'center',
    borderRadius: 10,
  },
  submitBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  }
});
