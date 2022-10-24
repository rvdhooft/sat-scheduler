import React from 'react';
import ReactDOM from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import App from './App';
import { StudentProvider } from './contexts/studentContext';
import Fallback from './Fallback';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={Fallback}>
      <StudentProvider>
        <App />
      </StudentProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
