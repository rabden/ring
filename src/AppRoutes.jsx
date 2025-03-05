import React, { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import LoadingScreen from './components/LoadingScreen';

// Lazy-loaded components
const Home = lazy(() => import('./pages/Home'));
const Inspiration = lazy(() => import('./pages/Inspiration'));
const SingleImageView = lazy(() => import('./pages/SingleImageView'));
const ImageGenerator = lazy(() => import('./pages/ImageGenerator'));
const QueueMonitor = lazy(() => import('./pages/QueueMonitor'));
// Add other imports as needed

export default function AppRoutes() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<ImageGenerator />} />
        <Route path="/inspiration" element={<Inspiration />} />
        <Route path="/image/:id" element={<SingleImageView />} />
        <Route path="/queue" element={<QueueMonitor />} />
        {/* Add other routes as needed */}
      </Routes>
    </Suspense>
  );
}
