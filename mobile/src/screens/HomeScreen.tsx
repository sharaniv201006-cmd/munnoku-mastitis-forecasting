import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { mobileApi } from '../services/api';
import { Animal, HerdSummary } from '../types';

interface Props {
  onSelectCow: (animalCode: string) => void;
  onOpenScan: () => void;
  lang: 'en' | 'hi' | 'ta';
  onToggleLang: () => void;
}

const I18N = {
  en: {
    title: "Munnokku Mastitis",
    subtitle: "AI-Powered Bovine Health & Early Forecasting",
    totalHerd: "Total Herd",
    highRisk: "High Risk",
    moderate: "Moderate",
    safe: "Low/Safe",
    earlyAlertTitle: "Early Intervention Feed",
    earlyAlertSubtitle: "Subclinical onset forecasted in 7-14 days",
    searchPlaceholder: "Search Cow Tag (e.g. COW_055)...",
    all: "ALL",
    high: "HIGH",
    mod: "MODERATE",
    low: "LOW",
    scanBtn: "📷 Scan Ear Tag",
    daysInMilk: "DIM",
    parity: "Parity",
    forecastHorizon: "Forecast: 7-14 days",
    riskProbability: "Risk"
  },
  hi: {
    title: "मुन्नोक्कु थनैला पूर्वानुमान",
    subtitle: "एआई संचालित पशु स्वास्थ्य व प्रारंभिक चेतावनी",
    totalHerd: "कुल पशु",
    highRisk: "उच्च जोखिम",
    moderate: "मध्यम जोखिम",
    safe: "सुरक्षित",
    earlyAlertTitle: "प्रारंभिक चेतावनी सूची",
    earlyAlertSubtitle: "7-14 दिनों में थनैला होने का पूर्वानुमान",
    searchPlaceholder: "पशु का टैग खोजें...",
    all: "सभी",
    high: "उच्च",
    mod: "मध्यम",
    low: "कम",
    scanBtn: "📷 टैग स्कैन करें",
    daysInMilk: "दूध के दिन",
    parity: "ब्यात",
    forecastHorizon: "पूर्वानुमान: 7-14 दिन",
    riskProbability: "जोखिम"
  },
  ta: {
    title: "முன்னோக்கு மடிநோய் முன்னறிவிப்பு",
    subtitle: "செயற்கை நுண்ணறிவு கால்நடை சுகாதார கண்காணிப்பு",
    totalHerd: "மொத்த மாடுகள்",
    highRisk: "அதிக ஆபத்து",
    moderate: "மிதமான ஆபத்து",
    safe: "பாதுகாப்பானது",
    earlyAlertTitle: "முன் எச்சரிக்கை பட்டியல்",
    earlyAlertSubtitle: "7-14 நாட்களில் நோய் வர வாய்ப்பு",
    searchPlaceholder: "மாட்டின் குறியீட்டை தேடவும்...",
    all: "அனைத்தும்",
    high: "அதிகம்",
    mod: "மிதம்",
    low: "குறைவு",
    scanBtn: "📷 காது குறி ஸ்கேன்",
    daysInMilk: "பால் கறக்கும் நாள்",
    parity: "ஈற்று",
    forecastHorizon: "முன்னறிவிப்பு: 7-14 நாட்கள்",
    riskProbability: "ஆபத்து"
  }
};

export const HomeScreen: React.FC<Props> = ({ onSelectCow, onOpenScan, lang, onToggleLang }) => {
  const [summary, setSummary] = useState<HerdSummary | null>(null);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [filter, setFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const t = I18N[lang];

  const loadData = async () => {
    try {
      const [sumRes, animRes] = await Promise.all([
        mobileApi.getHerdSummary(),
        mobileApi.getAnimals(filter === 'ALL' ? undefined : filter)
      ]);
      setSummary(sumRes);
      setAnimals(animRes);
    } catch (e) {
      console.log("Error fetching data:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filter]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const filteredAnimals = animals.filter(a =>
    a.animal_code.toLowerCase().includes(search.toLowerCase())
  );

  const getRiskColor = (level?: string) => {
    switch (level) {
      case 'HIGH': return '#ef4444';
      case 'MODERATE': return '#f59e0b';
      case 'LOW': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getRiskBg = (level?: string) => {
    switch (level) {
      case 'HIGH': return '#fee2e2';
      case 'MODERATE': return '#fef3c7';
      case 'LOW': return '#d1fae5';
      default: return '#f3f4f6';
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header Banner */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.appTitle}>{t.title}</Text>
            <Text style={styles.appSubtitle}>{t.subtitle}</Text>
          </View>
          <TouchableOpacity style={styles.langBtn} onPress={onToggleLang}>
            <Text style={styles.langBtnText}>{lang.toUpperCase()}</Text>
          </TouchableOpacity>
        </View>

        {/* Action Button: QR Scanner */}
        <TouchableOpacity style={styles.scanHeaderBtn} onPress={onOpenScan}>
          <Text style={styles.scanHeaderBtnText}>{t.scanBtn}</Text>
        </TouchableOpacity>
      </View>

      {/* Summary Cards */}
      <View style={styles.summaryContainer}>
        <View style={[styles.card, { borderLeftColor: '#0284c7' }]}>
          <Text style={styles.cardValue}>{summary?.total_animals ?? 100}</Text>
          <Text style={styles.cardLabel}>{t.totalHerd}</Text>
        </View>
        <View style={[styles.card, { borderLeftColor: '#ef4444' }]}>
          <Text style={[styles.cardValue, { color: '#ef4444' }]}>{summary?.high_risk ?? 4}</Text>
          <Text style={styles.cardLabel}>{t.highRisk}</Text>
        </View>
        <View style={[styles.card, { borderLeftColor: '#f59e0b' }]}>
          <Text style={[styles.cardValue, { color: '#f59e0b' }]}>{summary?.moderate_risk ?? 12}</Text>
          <Text style={styles.cardLabel}>{t.moderate}</Text>
        </View>
        <View style={[styles.card, { borderLeftColor: '#10b981' }]}>
          <Text style={[styles.cardValue, { color: '#10b981' }]}>{summary?.low_risk ?? 84}</Text>
          <Text style={styles.cardLabel}>{t.safe}</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <TextInput
          style={styles.searchInput}
          placeholder={t.searchPlaceholder}
          value={search}
          onChangeText={setSearch}
          placeholderTextColor="#9ca3af"
        />
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        {(['ALL', 'HIGH', 'MODERATE', 'LOW'] as const).map((lvl) => (
          <TouchableOpacity
            key={lvl}
            style={[styles.filterChip, filter === lvl && styles.filterChipActive]}
            onPress={() => setFilter(lvl)}
          >
            <Text style={[styles.filterChipText, filter === lvl && styles.filterChipTextActive]}>
              {lvl === 'ALL' ? t.all : lvl === 'HIGH' ? t.high : lvl === 'MODERATE' ? t.mod : t.low}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Animal Feed */}
      <View style={styles.listSection}>
        <Text style={styles.sectionTitle}>{t.earlyAlertTitle}</Text>
        <Text style={styles.sectionSubtitle}>{t.earlyAlertSubtitle}</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#0284c7" style={{ marginTop: 24 }} />
        ) : filteredAnimals.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No cattle matching criteria.</Text>
          </View>
        ) : (
          filteredAnimals.map((animal) => {
            const riskLevel = animal.latest_prediction?.risk_level || 'LOW';
            const riskProb = animal.latest_prediction?.risk_probability != null
              ? Math.round(animal.latest_prediction.risk_probability * 100)
              : 8;

            return (
              <TouchableOpacity
                key={animal.id}
                style={styles.animalCard}
                onPress={() => onSelectCow(animal.animal_code)}
                activeOpacity={0.7}
              >
                <View style={styles.animalCardHeader}>
                  <View>
                    <Text style={styles.cowCode}>{animal.animal_code}</Text>
                    <Text style={styles.breedText}>{animal.breed || 'Holstein Cross'}</Text>
                  </View>

                  <View style={[styles.riskBadge, { backgroundColor: getRiskBg(riskLevel) }]}>
                    <Text style={[styles.riskBadgeText, { color: getRiskColor(riskLevel) }]}>
                      {riskLevel} • {riskProb}%
                    </Text>
                  </View>
                </View>

                {/* Subclinical Explainable Factor Preview */}
                {animal.latest_prediction?.top_factors && animal.latest_prediction.top_factors.length > 0 && (
                  <View style={styles.factorPreview}>
                    <Text style={styles.factorPreviewText}>
                      ⚠️ {animal.latest_prediction.top_factors[0].feature_name}: {animal.latest_prediction.top_factors[0].direction === 'increasing' ? '▲ Elevated' : '▼ Decreased'}
                    </Text>
                  </View>
                )}

                <View style={styles.animalCardFooter}>
                  <Text style={styles.metaText}>{t.daysInMilk}: {animal.days_in_milk || 110}d</Text>
                  <Text style={styles.metaText}>{t.parity}: {animal.parity || 2}</Text>
                  <Text style={[styles.metaText, { color: '#0284c7', fontWeight: '600' }]}>
                    {t.forecastHorizon}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
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
  header: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  appSubtitle: {
    fontSize: 13,
    color: '#e0f2fe',
    marginTop: 2,
  },
  langBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  langBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  scanHeaderBtn: {
    marginTop: 14,
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scanHeaderBtnText: {
    color: '#0284c7',
    fontWeight: '700',
    fontSize: 14,
  },
  summaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    marginTop: 16,
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  cardLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  searchWrapper: {
    paddingHorizontal: 16,
    marginTop: 6,
  },
  searchInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 10,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
  },
  filterChipActive: {
    backgroundColor: '#0284c7',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  filterChipTextActive: {
    color: '#ffffff',
  },
  listSection: {
    paddingHorizontal: 16,
    marginTop: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 12,
  },
  animalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  animalCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cowCode: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  breedText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 1,
  },
  riskBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  riskBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  factorPreview: {
    backgroundColor: '#fffbeb',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  factorPreviewText: {
    fontSize: 12,
    color: '#b45309',
    fontWeight: '500',
  },
  animalCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f8fafc',
  },
  metaText: {
    fontSize: 12,
    color: '#64748b',
  },
  emptyBox: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
  }
});
