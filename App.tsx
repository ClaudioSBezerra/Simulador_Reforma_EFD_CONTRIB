
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MercadoriasPanel from './components/MercadoriasPanel';
import EnergiaPanel from './components/EnergiaPanel';
import FretePanel from './components/FretePanel';
import SpedImporter from './components/SpedImporter';
import LoginPanel from './components/LoginPanel';
import { ViewType, User } from './types';
import { supabase } from './services/supabase';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.LOGIN);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Verificar sessão ativa ao carregar
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfile(session.user.id, session.user.email!);
      } else {
        setIsInitializing(false);
      }
    });

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfile(session.user.id, session.user.email!);
      } else {
        setCurrentUser(null);
        setCurrentView(ViewType.LOGIN);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (uid: string, email: string) => {
    const { data: profile } = await supabase
      .from('perfil_usuario')
      .select('*, tenant_id')
      .eq('id', uid)
      .single();

    if (profile) {
      setCurrentUser({
        id: uid,
        email: email,
        nome: profile.email.split('@')[0],
        role: profile.nivel_acesso as 'master' | 'empresa',
        tenant_id: profile.tenant_id
      });
      // Se tiver tenant, vai para dashboard, se não, LoginPanel cuida do onboarding
      if (profile.tenant_id) {
        setCurrentView(ViewType.DASHBOARD);
      }
    } else {
      // Caso o auth exista mas o perfil não (onboarding incompleto)
      setCurrentUser({ id: uid, email: email, role: 'empresa' });
      setCurrentView(ViewType.LOGIN);
    }
    setIsInitializing(false);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setCurrentView(ViewType.DASHBOARD);
  };

  if (isInitializing) {
    return <div className="h-screen flex items-center justify-center bg-[#101922] text-primary">Carregando Ambiente Fiscal...</div>;
  }

  const renderView = () => {
    switch (currentView) {
      case ViewType.LOGIN:
        return <LoginPanel onLogin={handleLoginSuccess} />;
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
