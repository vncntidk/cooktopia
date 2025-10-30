import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import HeaderSidebarLayout from '../components/HeaderSidebarLayout';
import HomeFeed from "../components/HomeFeed";

export default function HomePage() {
  const { user } = useAuth();
  // const navigate = useNavigate();

  const name = user?.displayName || user?.email || 'Guest';

  return (
    <HeaderSidebarLayout>
      <HomeFeed />
    </HeaderSidebarLayout>
  );
}
