import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { Overview } from './pages/Overview';
import { AnimalIntelligence } from './pages/AnimalIntelligence';
import { Verification } from './pages/Verification';
import { ModelIntelligence } from './pages/ModelIntelligence';
import { Animals } from './pages/Animals';
import { RiskAlerts } from './pages/RiskAlerts';
import { HerdIntelligence } from './pages/HerdIntelligence';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Overview />} />
          <Route path="animals" element={<Animals />} />
          <Route path="animals/:id" element={<AnimalIntelligence />} />
          <Route path="alerts" element={<RiskAlerts />} />
          <Route path="herd" element={<HerdIntelligence />} />
          <Route path="verification" element={<Verification />} />
          <Route path="model" element={<ModelIntelligence />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
