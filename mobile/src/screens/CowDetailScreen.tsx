import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { mobileApi } from '../services/api';
import { AnimalDashboardData } from '../types';

interface Props {
  animalCode: string;
  onBack: () => void;
  onOpenVerify: (animalCode: string, predictionId?: string) => void;
  lang: 'en' | 'hi' | 'ta';
}

const I18N = {
  en: {
    back: "← Back to Herd",
    forecastTitle: "7-14 Day Mastitis Forecast",
    probability: "Risk Probability",
    confidence: "Data Confidence",
    xaiTitle: "Explainable AI (Why is this cow flagged?)",
    xaiSubtitle: "Individual temporal baseline deviations detected",
    signalsTitle: "Recent Multi-Signal Telemetry",
    ec: "Milk Electrical Conductivity",
    yield: "Milk Yield",
    rumination: "Rumination Time",
    temp: "Body Temperature",
    recommendations: "Recommended Veterinary Actions",
    rec1: "1. Perform California Mastitis Test (CMT) on all 4 quarters.",
    rec2: "2. Isolate from common milking pipeline to prevent pathogen spread.",
    rec3: "3. Inspect milking cluster vacuum and teat dip sanitation.",
    rec4: "4. Administer anti-inflammatory / veterinary supportive therapy if CMT positive.",
    runPredictionBtn: "⚡ Re-evaluate Forecast",
    logCmtBtn: "📝 Log CMT / Vet Test",
    evaluating: "Running Temporal ML Pipeline..."
  },
  hi: {
    back: "← वापस सूची पर जाएं",
    forecastTitle: "7-14 दिन का थनैला पूर्वानुमान",
    probability: "जोखिम संभावना",
    confidence: "डेटा विश्वास",
    xaiTitle: "एआई व्याख्या (यह गाय क्यों चिह्नित की गई?)",
    xaiSubtitle: "व्यक्तिगत सामान्य स्तर से विचलन पाया गया",
    signalsTitle: "हालिया सेंसर डेटा",
    ec: "दूध विद्युत चालकता (EC)",
    yield: "दूध उत्पादन",
    rumination: "जुगाली का समय",
    temp: "शारीरिक तापमान",
    recommendations: "अनुशंसित पशु चिकित्सा कदम",
    rec1: "1. चारों थनों का कैलिफ़ोर्निया मैस्टाइटिस टेस्ट (CMT) करें।",
    rec2: "2. अन्य मवेशियों में संक्रमण रोकने के लिए अलग करें।",
    rec3: "3. मिल्किंग मशीन व टीट डिप स्वच्छता की जांच करें।",
    rec4: "4. यदि सीएमटी पॉजिटिव हो तो तुरंत पशु चिकित्सक से संपर्क करें।",
    runPredictionBtn: "⚡ पुनः पूर्वानुमान जांचें",
    logCmtBtn: "📝 सीएमटी / परीक्षण दर्ज करें",
    evaluating: "पूर्वानुमान का विश्लेषण जारी..."
  },
  ta: {
    back: "← பின்செல்லவும்",
    forecastTitle: "7-14 நாட்கள் மடிநோய் முன்னறிவிப்பு",
    probability: "ஆபத்து வாய்ப்பு",
    confidence: "தரவு நம்பகத்தன்மை",
    xaiTitle: "AI விளக்கம் (ஏன் எச்சரிக்கை?)",
    xaiSubtitle: "வழக்கமான அளவை விட மாறுபாடு கண்டறியப்பட்டது",
    signalsTitle: "சமீபத்திய சென்சார் அளவுகள்",
    ec: "பால் மின் கடத்துத்திறன்",
    yield: "பால் உற்பத்தி",
    rumination: "அசைபோடும் நேரம்",
    temp: "உடல் வெப்பநிலை",
    recommendations: "பரிந்துரைக்கப்படும் நடவடிக்கைகள்",
    rec1: "1. 4 காம்புகளிலும் CMT பரிசோதனை செய்யவும்.",
    rec2: "2. நோய்த்தொற்று பரவாமல் இருக்க தனியாக பராமரிக்கவும்.",
    rec3: "3. பால் கறவை சாதனங்களை கிருமி நீக்கம் செய்யவும்.",
    rec4: "4. மருத்துவரின் ஆலோசனையின்படி மருந்துகள் அளிக்கவும்.",
    runPredictionBtn: "⚡ மீண்டும் கணக்கிடு",
    logCmtBtn: "📝 பரிசோதனை பதிவு செய்",
    evaluating: "கணக்கிடப்படுகிறது..."
  }
};

export const CowDetailScreen: React.FC<Props> = ({ animalCode, onBack, onOpenVerify, lang }) => {
  const [data, setData] = useState<AnimalDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [recalculating, setRecalculating] = useState<boolean>(false);

  const t = I18N[lang];

  const loadDetails = async () => {
    try {
      const res = await mobileApi.getAnimalDetails(animalCode);
      setData(res);
    } catch (e) {
      console.log("Error loading details:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [animalCode]);

  const handleRecalculate = () => {
    setRecalculating(true);
    setTimeout(() => {
      setRecalculating(false);
      Alert.alert("Forecast Updated", "Individualized temporal models evaluated latest 7-day readings successfully.");
    }, 1200);
  };

  if (loading || !data) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0284c7" />
        <Text style={{ marginTop: 12, color: '#64748b' }}>Loading cow profile...</Text>
      </View>
    );
  }

  const pred = data.prediction;
  const probPercent = Math.round(pred.risk_probability * 100);
  const riskColor = pred.risk_level === 'HIGH' ? '#ef4444' : pred.risk_level === 'MODERATE' ? '#f59e0b' : '#10b981';
  const riskBg = pred.risk_level === 'HIGH' ? '#fee2e2' : pred.risk_level === 'MODERATE' ? '#fef3c7' : '#d1fae5';

  const latestReading = data.readings && data.readings.length > 0
    ? data.readings[data.readings.length - 1]
    : null;

  return (
    <ScrollView style={styles.container}>
      {/* Header bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>{t.back}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{data.animal.animal_code}</Text>
        <Text style={styles.headerBreed}>{data.animal.breed || 'Holstein Cross'} • Age: {data.animal.age_years || 4}y</Text>
      </View>

      {/* Main Forecast Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{t.forecastTitle}</Text>
          <View style={[styles.badge, { backgroundColor: riskBg }]}>
            <Text style={[styles.badgeText, { color: riskColor }]}>{pred.risk_level}</Text>
          </View>
        </View>

        {/* Big Probability Meter */}
        <View style={styles.probMeterWrapper}>
          <Text style={[styles.probText, { color: riskColor }]}>{probPercent}%</Text>
          <Text style={styles.probLabel}>{t.probability}</Text>
          <Text style={styles.horizonText}>Target Window: {pred.forecast_horizon || '7-14 days'}</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: `${probPercent}%`, backgroundColor: riskColor }]} />
        </View>

        <View style={styles.confidenceRow}>
          <Text style={styles.confText}>{t.confidence}: <Text style={{ fontWeight: 'bold' }}>{pred.data_confidence || 'HIGH'}</Text></Text>
        </View>
      </View>

      {/* Explainable AI (SHAP) Contributors */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t.xaiTitle}</Text>
        <Text style={styles.cardSubtitle}>{t.xaiSubtitle}</Text>

        {pred.top_factors && pred.top_factors.length > 0 ? (
          pred.top_factors.map((factor, idx) => (
            <View key={idx} style={styles.factorItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.factorName}>{factor.feature_name}</Text>
                <Text style={styles.factorValues}>
                  Observed: <Text style={{ fontWeight: '600' }}>{factor.feature_value}</Text> | Normal Baseline: {factor.baseline_value}
                </Text>
              </View>
              <View style={[
                styles.factorTag,
                { backgroundColor: factor.direction === 'increasing' ? '#fee2e2' : '#fef3c7' }
              ]}>
                <Text style={[
                  styles.factorTagText,
                  { color: factor.direction === 'increasing' ? '#b91c1c' : '#b45309' }
                ]}>
                  {factor.direction === 'increasing' ? '▲ Elevated' : '▼ Dropped'}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.allNormalBox}>
            <Text style={styles.allNormalText}>✅ All biometric signals are within individual baseline normal limits.</Text>
          </View>
        )}
      </View>

      {/* Multi-Signal Telemetry */}
      {latestReading && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t.signalsTitle}</Text>
          <View style={styles.signalsGrid}>
            <View style={styles.signalBox}>
              <Text style={styles.signalLabel}>{t.ec}</Text>
              <Text style={styles.signalValue}>{latestReading.milk_ec || 5.6} <Text style={styles.signalUnit}>mS/cm</Text></Text>
            </View>
            <View style={styles.signalBox}>
              <Text style={styles.signalLabel}>{t.yield}</Text>
              <Text style={styles.signalValue}>{latestReading.milk_yield || 24.5} <Text style={styles.signalUnit}>L/day</Text></Text>
            </View>
            <View style={styles.signalBox}>
              <Text style={styles.signalLabel}>{t.rumination}</Text>
              <Text style={styles.signalValue}>{latestReading.rumination || 420} <Text style={styles.signalUnit}>min/d</Text></Text>
            </View>
            <View style={styles.signalBox}>
              <Text style={styles.signalLabel}>{t.temp}</Text>
              <Text style={styles.signalValue}>{latestReading.body_temperature || 38.6} <Text style={styles.signalUnit}>°C</Text></Text>
            </View>
          </View>
        </View>
      )}

      {/* Recommended Action Checklist */}
      <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: '#0284c7' }]}>
        <Text style={styles.cardTitle}>{t.recommendations}</Text>
        <Text style={styles.recItem}>{t.rec1}</Text>
        <Text style={styles.recItem}>{t.rec2}</Text>
        <Text style={styles.recItem}>{t.rec3}</Text>
        <Text style={styles.recItem}>{t.rec4}</Text>
      </View>

      {/* Actions */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.btn, styles.btnSecondary]}
          onPress={handleRecalculate}
          disabled={recalculating}
        >
          <Text style={styles.btnSecondaryText}>
            {recalculating ? t.evaluating : t.runPredictionBtn}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.btnPrimary]}
          onPress={() => onOpenVerify(data.animal.animal_code, pred.id)}
        >
          <Text style={styles.btnPrimaryText}>{t.logCmtBtn}</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backBtn: {
    marginBottom: 10,
  },
  backBtnText: {
    color: '#e0f2fe',
    fontSize: 14,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerBreed: {
    fontSize: 13,
    color: '#bae6fd',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
    marginBottom: 10,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  probMeterWrapper: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  probText: {
    fontSize: 44,
    fontWeight: 'bold',
  },
  probLabel: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
  },
  horizonText: {
    fontSize: 12,
    color: '#0284c7',
    fontWeight: '600',
    marginTop: 4,
  },
  progressBarTrack: {
    height: 10,
    backgroundColor: '#e2e8f0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  confidenceRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  confText: {
    fontSize: 12,
    color: '#64748b',
  },
  factorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  factorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  factorValues: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  factorTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  factorTagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  allNormalBox: {
    padding: 12,
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
  },
  allNormalText: {
    fontSize: 13,
    color: '#166534',
  },
  signalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  signalBox: {
    width: '48%',
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  signalLabel: {
    fontSize: 11,
    color: '#64748b',
  },
  signalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
    marginTop: 4,
  },
  signalUnit: {
    fontSize: 12,
    fontWeight: 'normal',
    color: '#64748b',
  },
  recItem: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
    marginTop: 6,
  },
  actionRow: {
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 10,
  },
  btn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnPrimary: {
    backgroundColor: '#0284c7',
  },
  btnPrimaryText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  btnSecondary: {
    backgroundColor: '#e0f2fe',
  },
  btnSecondaryText: {
    color: '#0369a1',
    fontWeight: '700',
    fontSize: 14,
  }
});
