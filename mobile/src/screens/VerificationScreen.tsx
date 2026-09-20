import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert
} from 'react-native';
import { mobileApi } from '../services/api';

interface Props {
  animalCode: string;
  predictionId?: string;
  onClose: () => void;
  lang: 'en' | 'hi' | 'ta';
}

export const VerificationScreen: React.FC<Props> = ({ animalCode, predictionId, onClose, lang }) => {
  const [cmtResult, setCmtResult] = useState<string>('Negative');
  const [sccValue, setSccValue] = useState<string>('150000');
  const [vetConfirmed, setVetConfirmed] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  const cmtOptions = ['Negative', 'Trace', '1+ (Mild)', '2+ (Moderate)', '3+ (Severe)'];

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await mobileApi.recordVerification({
        animal_id: animalCode,
        prediction_id: predictionId,
        cmt_result: cmtResult,
        scc_value: parseInt(sccValue, 10) || 150000,
        veterinary_confirmation: vetConfirmed,
        notes: notes
      });

      Alert.alert(
        "Verification Saved",
        `CMT Result '${cmtResult}' and diagnostic logs successfully synced to cloud.`,
        [{ text: "OK", onPress: onClose }]
      );
    } catch (e) {
      Alert.alert("Error", "Could not save verification.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Field Verification & CMT Log</Text>
        <Text style={styles.subtitle}>Animal Code: <Text style={{ fontWeight: 'bold' }}>{animalCode}</Text></Text>
      </View>

      {/* Form Section */}
      <View style={styles.card}>
        <Text style={styles.label}>1. California Mastitis Test (CMT) Score</Text>
        <View style={styles.cmtRow}>
          {cmtOptions.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.cmtChip, cmtResult === opt && styles.cmtChipActive]}
              onPress={() => setCmtResult(opt)}
            >
              <Text style={[styles.cmtChipText, cmtResult === opt && styles.cmtChipTextActive]}>
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>2. Somatic Cell Count (SCC cells/mL)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={sccValue}
          onChangeText={setSccValue}
          placeholder="e.g. 250000"
        />

        <Text style={styles.label}>3. Veterinary Clinical Confirmation</Text>
        <TouchableOpacity
          style={[styles.toggleBtn, vetConfirmed && styles.toggleBtnActive]}
          onPress={() => setVetConfirmed(!vetConfirmed)}
        >
          <Text style={[styles.toggleBtnText, vetConfirmed && styles.toggleBtnTextActive]}>
            {vetConfirmed ? "✓ Confirmed by Attending Veterinarian" : "○ Not Yet Formally Confirmed"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>4. Clinical Notes / Observations</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          multiline
          numberOfLines={4}
          value={notes}
          onChangeText={setNotes}
          placeholder="Enter teat condition, milk clots, or treatment administered..."
        />

        <TouchableOpacity
          style={[styles.submitBtn, saving && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={saving}
        >
          <Text style={styles.submitBtnText}>{saving ? "Saving..." : "Save & Sync Verification"}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  closeBtn: {
    marginBottom: 8,
  },
  closeBtnText: {
    color: '#e0f2fe',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 13,
    color: '#bae6fd',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 14,
    marginBottom: 6,
  },
  cmtRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  cmtChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  cmtChipActive: {
    backgroundColor: '#0284c7',
    borderColor: '#0284c7',
  },
  cmtChipText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  cmtChipTextActive: {
    color: '#ffffff',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    fontSize: 14,
    color: '#1e293b',
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },
  toggleBtn: {
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignItems: 'center',
  },
  toggleBtnActive: {
    backgroundColor: '#dbeafe',
    borderColor: '#0284c7',
  },
  toggleBtnText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  toggleBtnTextActive: {
    color: '#0284c7',
  },
  submitBtn: {
    backgroundColor: '#0284c7',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  }
});
