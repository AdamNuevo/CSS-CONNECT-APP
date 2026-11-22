import React from 'react';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../src/context/AuthContext';
import { TabBarProvider } from '../src/context/TabBarContext';
import { StatusBar } from 'expo-status-bar';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TabBarProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }} />
        </TabBarProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
