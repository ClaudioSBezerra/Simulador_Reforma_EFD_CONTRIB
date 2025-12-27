
import React from 'react';
import { User } from '../types';

interface LoginPanelProps {
  onLogin: (user: User) => void;
}

const LoginPanel: React.FC<LoginPanelProps> = ({ onLogin }) => {
  const mockUsers: User[] = [
    { 
      id: 'u1', 
      nome: 'João Silva', 
      email: 'joao.master@grupo.com.br', 
      role: 'master', 
      tenant_id: 't1',
      avatar_url: 'JS'
    },
    { 
      id: 'u2', 
      nome: 'Maria Souza', 
      email: 'maria.filial@empresa.com.br', 
      role: 'empresa', 
      tenant_id: 't1',
      avatar_url: 'MS'
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#101922] p-6">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="inline-flex p-3 rounded-2xl bg-primary/20 mb-4">
            <span className="material-symbols-outlined text-primary text-4xl">analytics</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Fiscal Analytics</h1>
          <p className="mt-2 text-[#92adc9] text-sm">Simulador de Reforma Tributária (2027-2033)</p>
        </div>

        <div className="bg-[#15202b] p-8 rounded-2xl border border-[#233648] shadow-2xl space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Bem-vindo</h2>
            <p className="text-[#92adc9] text-xs">Selecione seu perfil de acesso para continuar:</p>
          </div>

          <div className="grid gap-4">
            {mockUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => onLogin(user)}
                className="flex items-center gap-4 p-4 rounded-xl border border-[#233648] bg-[#192633] hover:border-primary/50 hover:bg-[#1e2d3d] transition-all text-left group"
              >
                <div className={`size-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-lg ${
                  user.role === 'master' ? 'bg-indigo-600' : 'bg-emerald-600'
                }`}>
                  {user.avatar_url}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm truncate">{user.nome}</p>
                  <p className="text-[#92adc9] text-[10px] uppercase font-semibold tracking-wider">
                    {user.role === 'master' ? 'Acesso Master (Grupo)' : 'Acesso Empresa (Filial)'}
                  </p>
                </div>
                <span className="material-symbols-outlined text-[#324d67] group-hover:text-primary transition-colors">arrow_forward</span>
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-[#233648]">
            <p className="text-center text-[10px] text-[#567089]">
              Protegido por Supabase Row Level Security (RLS)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPanel;
