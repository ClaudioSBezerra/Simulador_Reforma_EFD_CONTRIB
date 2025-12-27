
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MercadoriasPanel from './components/MercadoriasPanel';
import EnergiaPanel from './components/EnergiaPanel';
import FretePanel from './components/FretePanel';
import SpedImporter from './components/SpedImporter';
import LoginPanel from './components/LoginPanel';
import { ViewType, User } from './types';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.LOGIN);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    // Redireciona para Importação conforme solicitado após o login
    setCurrentView(ViewType.IMPORTE);
  };

  const renderView = () => {
    switch (currentView) {
      case ViewType.LOGIN:
        return <LoginPanel onLogin={handleLogin} />;
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

  // Se não estiver logado, mostra apenas a tela de login sem a Sidebar
  if (currentView === ViewType.LOGIN) {
    return renderView();
  }

  return (
    <div className="flex h-screen bg-[#101922] overflow-hidden">
      <Sidebar 
        activeView={currentView} 
        onViewChange={setCurrentView} 
        user={currentUser}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;
