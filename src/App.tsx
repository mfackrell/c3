import { Navigate, Route, Routes } from 'react-router-dom';
import { SiteLayout } from './components/SiteLayout';
import { HomePage } from './pages/HomePage';
import { ModelPage } from './pages/ModelPage';
import { TimingPage } from './pages/TimingPage';

export function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/model" element={<ModelPage />} />
        <Route path="/timing" element={<TimingPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
