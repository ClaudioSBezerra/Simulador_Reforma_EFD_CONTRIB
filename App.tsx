
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MercadoriasPanel from './components/MercadoriasPanel';
import EnergiaPanel from './components/EnergiaPanel';
import FretePanel from './components/FretePanel';
import SpedImporter from './components/SpedImporter';
import { ViewType } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.DASHBOARD);

  const renderView = () => {
    switch (currentView) {
      case ViewType.DASHBOARD:
        return <Dashboard />;
      case ViewType.MERCADORIAS:
        return <MercadoriasPanel />;
      case ViewType.ENERGIA:
        return <EnergiaPanel />;
      case ViewType.FRETE:
        return <FretePanel />;
      case ViewType.IMPORTE:
        return <SpedImporter />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-[#101922] overflow-hidden">
      <Sidebar activeView={currentView} onViewChange={setCurrentView} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;
