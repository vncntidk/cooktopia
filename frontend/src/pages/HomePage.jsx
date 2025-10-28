import React from 'react';
import HeaderSidebarLayout from '../components/HeaderSidebarLayout';
import HomeFeed from "../components/HomeFeed";

export default function HomePage() {
  return (
    <HeaderSidebarLayout>
      <HomeFeed />
    </HeaderSidebarLayout>
  );
}
