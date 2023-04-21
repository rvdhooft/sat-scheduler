import React from 'react';
import ReactDOM from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import App from './App';
import Fallback from './Fallback';

if (import.meta.env.VITE_APP_LOGROCKET_KEY) {
  import('logrocket').then(({ default: LogRocket }) => {
    LogRocket.init(import.meta.env.VITE_APP_LOGROCKET_KEY);
  });
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={Fallback}>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
