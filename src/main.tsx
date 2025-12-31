import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { requestNotificationPermission } from './services/pushNotification.service'
import './index.css'
import App from './App.tsx'

/**
 * React Query client configuration
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
})

// Request notification permission on app start
if ('Notification' in window && Notification.permission === 'default') {
  // Request permission after a short delay to avoid blocking initial render
  setTimeout(() => {
    requestNotificationPermission().catch(console.error);
  }, 2000);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)
