import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Header, { type AppView } from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import PostedJobs from './pages/PostedJobs';
import JobListings from './pages/JobListings';
import './index.css';

// Requirement #13 (FE): Configure TanStack Query with sensible defaults
// - staleTime: avoid refetching too aggressively
// - retry: don't hammer backend on errors
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const [view, setView] = useState<AppView>('recruiter');

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
          {/* Top navigation bar */}
          <Header view={view} onViewChange={setView} />

          {/* Body: Sidebar (recruiter only) + Main content */}
          <div className="flex flex-1 overflow-hidden">
            {view === 'recruiter' && <Sidebar />}
            <main className="flex-1 overflow-y-auto">
              {view === 'recruiter' ? <PostedJobs /> : <JobListings />}
            </main>
          </div>
        </div>

        {/* Global toast notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              fontSize: '13px',
              borderRadius: '10px',
              padding: '10px 14px',
            },
            success: { iconTheme: { primary: '#7c3aed', secondary: '#fff' } },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
