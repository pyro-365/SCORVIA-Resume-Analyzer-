import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ScreeningProvider, useScreening } from './context/ScreeningContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import HomePage from './pages/HomePage';
import JDInputPage from './pages/JDInputPage';
import JDReviewPage from './pages/JDReviewPage';
import SkillDictionaryPage from './pages/SkillDictionaryPage';
import ResumeUploadPage from './pages/ResumeUploadPage';
import ProcessingPage from './pages/ProcessingPage';
import ResultsPage from './pages/ResultsPage';
import CandidateDetailPage from './pages/CandidateDetailPage';
import EvaluationPage from './pages/EvaluationPage';
import SettingsPage from './pages/SettingsPage';

function ToastContainer() {
  const { toastMessage } = useScreening();
  if (!toastMessage) return null;
  const { message, type } = toastMessage;
  const cls = type === 'error' ? 'toast toast-error' : type === 'success' ? 'toast toast-success' : 'toast toast-info';
  return (
    <div className={cls} role="alert" aria-live="polite">
      <span>{message}</span>
    </div>
  );
}

export default function App() {
  return (
    <ScreeningProvider>
      <Router>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/jd-input" element={<JDInputPage />} />
              <Route path="/jd-review" element={<JDReviewPage />} />
              <Route path="/skill-dictionary" element={<SkillDictionaryPage />} />
              <Route path="/resume-upload" element={<ResumeUploadPage />} />
              <Route path="/processing" element={<ProcessingPage />} />
              <Route path="/results" element={<ResultsPage />} />
              <Route path="/results/:candidateId" element={<CandidateDetailPage />} />
              <Route path="/evaluation" element={<EvaluationPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </main>
          <Footer />
          <ToastContainer />
        </div>
      </Router>
    </ScreeningProvider>
  );
}
