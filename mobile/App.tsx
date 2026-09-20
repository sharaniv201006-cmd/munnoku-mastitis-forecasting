import React, { useState } from 'react';
import { StyleSheet, SafeAreaView, StatusBar, View } from 'react-native';
import { HomeScreen } from './src/screens/HomeScreen';
import { CowDetailScreen } from './src/screens/CowDetailScreen';
import { ScanScreen } from './src/screens/ScanScreen';
import { VerificationScreen } from './src/screens/VerificationScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'home' | 'detail' | 'scan' | 'verify'>('home');
  const [selectedCow, setSelectedCow] = useState<string>('COW_055');
  const [predictionId, setPredictionId] = useState<string | undefined>(undefined);
  const [lang, setLang] = useState<'en' | 'hi' | 'ta'>('en');

  const toggleLanguage = () => {
    if (lang === 'en') setLang('hi');
    else if (lang === 'hi') setLang('ta');
    else setLang('en');
  };

  const handleSelectCow = (animalCode: string) => {
    setSelectedCow(animalCode);
    setCurrentScreen('detail');
  };

  const handleScanSuccess = (animalCode: string) => {
    setSelectedCow(animalCode);
    setCurrentScreen('detail');
  };

  const handleOpenVerify = (animalCode: string, predId?: string) => {
    setSelectedCow(animalCode);
    setPredictionId(predId);
    setCurrentScreen('verify');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0284c7" />
      <View style={styles.screenWrapper}>
        {currentScreen === 'home' && (
          <HomeScreen
            onSelectCow={handleSelectCow}
            onOpenScan={() => setCurrentScreen('scan')}
            lang={lang}
            onToggleLang={toggleLanguage}
          />
        )}

        {currentScreen === 'detail' && (
          <CowDetailScreen
            animalCode={selectedCow}
            onBack={() => setCurrentScreen('home')}
            onOpenVerify={handleOpenVerify}
            lang={lang}
          />
        )}

        {currentScreen === 'scan' && (
          <ScanScreen
            onScanSuccess={handleScanSuccess}
            onClose={() => setCurrentScreen('home')}
            lang={lang}
          />
        )}

        {currentScreen === 'verify' && (
          <VerificationScreen
            animalCode={selectedCow}
            predictionId={predictionId}
            onClose={() => setCurrentScreen('detail')}
            lang={lang}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0284c7',
  },
  screenWrapper: {
    flex: 1,
    backgroundColor: '#f8fafc',
  }
});
