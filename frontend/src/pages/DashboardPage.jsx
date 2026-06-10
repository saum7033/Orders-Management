import React from 'react';
import SectionCard from '../components/SectionCard';

export default function DashboardPage() {
  return (
    <div style={{ padding: 24 }}>
      <SectionCard title="Dashboard">

        <div style={{ color: '#6ee7b7', fontSize: 12 }}>
          🚀 Dashboard coming soon...
          <br />
          (You will add analytics like total orders, pending, revenue etc.)
        </div>

      </SectionCard>
    </div>
  );
}