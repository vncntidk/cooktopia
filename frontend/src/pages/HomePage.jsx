import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { logPageVisit } from '../services/pageTracking';
import HeaderSidebarLayout from '../components/HeaderSidebarLayout';
import HomeFeed from "../components/HomeFeed";

export default function HomePage() {
  const { user } = useAuth();

  useEffect(() => {
    logPageVisit('home');
  }, []);

  const name = user?.displayName || user?.email || 'Guest';

  return (
    <HeaderSidebarLayout>
      <HomeFeed />
    </HeaderSidebarLayout>
  );
}
