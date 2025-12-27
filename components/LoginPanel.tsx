
import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { User } from '../types';

interface LoginPanelProps {
  onLogin: (user: User) => void;
}

const LoginPanel: React.FC<LoginPanelProps> = ({ onLogin }) => {
  const [step, setStep] = useState<'login' | 'tenant' | 'empresa' | 'filial'>('login');
  const [loading, setLoading] = useState(false);
  
  // Form States
  const [tenantName, setTenantName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [cnpjRaiz, setCnpjRaiz] = useState('');
  const [filialCnpj, setFilialCnpj] = useState('');
  const [filialUf, setFilialUf] = useState('');

  const [createdTenantId, setCreatedTenantId] = useState<string | null>(null);
  const [createdEmpresaId, setCreatedEmpresaId] = useState<string | null>(null);

  const handleStartOnboarding = () => setStep('tenant');

  const createTenant = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('tenants').insert([{ nome: tenantName }]).select().single();
    if (data) {
      setCreatedTenantId(data.id);
      setStep('empresa');
    }
    setLoading(false);
  };

  const createEmpresa = async () => {
    setLoading(true);
    const { data: grupo } = await supabase.from('grupos_empresariais').insert([{ tenant_id: createdTenantId, nome: 'Grupo ' + companyName }]).select().single();
    if (grupo) {
      const { data: empresa } = await supabase.from('empresas').insert([{ grupo_id: grupo.id, nome_razao: companyName, cnpj_raiz: cnpjRaiz }]).select().single();
      if (empresa) {
        setCreatedEmpresaId(empresa.id);
        setStep('filial');
      }
    }
    setLoading(false);
  };

  const createFilial = async () => {
    setLoading(true);
    const { data } = await supabase.from('filiais').insert([{ empresa_id: createdEmpresaId, cnpj: filialCnpj, uf: filialUf, nome_fantasia: companyName }]).select().single();
    if (data) {
      // Mock login final
      onLogin({
        id: 'user-new',
        nome: 'Administrador',
        email: 'admin@' + tenantName.toLowerCase().replace(/ /g, '') + '.com',
        role: 'master',
        tenant_id: createdTenantId!
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#101922] p-6">
      <div className="max-w-md w-full bg-[#15202b] p-8 rounded-2xl border border-[#233648] shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-primary/20 mb-4">
            <span className="material-symbols-outlined text-primary text-4xl">analytics</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Fiscal Analytics</h1>
          <p className="text-[#92adc9] text-sm">Configuração de Ambiente SPED</p>
        </div>

        {step === 'login' && (
          <div className="space-y-6">
            <button
              onClick={() => onLogin({ id: 'u1', nome: 'João Master', email: 'joao@master.com', role: 'master', tenant_id: 't1' })}
              className="w-full py-4 bg-[#192633] border border-[#233648] rounded-xl text-white font-bold hover:border-primary transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">login</span> Entrar com Usuário Existente
            </button>
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-[#233648]"></div>
              <span className="flex-shrink mx-4 text-[#567089] text-xs font-bold uppercase">Ou</span>
              <div className="flex-grow border-t border-[#233648]"></div>
            </div>
            <button
              onClick={handleStartOnboarding}
              className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all"
            >
              Criar Novo Tenant / Empresa
            </button>
          </div>
        )}

        {step === 'tenant' && (
          <div className="space-y-4">
            <h2 className="text-white font-bold">1. Novo Locatário (Tenant)</h2>
            <input 
              className="w-full bg-[#192633] border border-[#233648] p-3 rounded-lg text-white" 
              placeholder="Nome da Holding / Consultoria" 
              value={tenantName}
              onChange={e => setTenantName(e.target.value)}
            />
            <button onClick={createTenant} disabled={loading} className="w-full bg-primary p-3 rounded-lg font-bold">Continuar</button>
          </div>
        )}

        {step === 'empresa' && (
          <div className="space-y-4">
            <h2 className="text-white font-bold">2. Dados da Empresa</h2>
            <input 
              className="w-full bg-[#192633] border border-[#233648] p-3 rounded-lg text-white" 
              placeholder="Razão Social" 
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
            />
            <input 
              className="w-full bg-[#192633] border border-[#233648] p-3 rounded-lg text-white" 
              placeholder="CNPJ Raiz (8 dígitos)" 
              maxLength={8}
              value={cnpjRaiz}
              onChange={e => setCnpjRaiz(e.target.value)}
            />
            <button onClick={createEmpresa} disabled={loading} className="w-full bg-primary p-3 rounded-lg font-bold">Continuar</button>
          </div>
        )}

        {step === 'filial' && (
          <div className="space-y-4">
            <h2 className="text-white font-bold">3. Cadastro da Filial (SPED Target)</h2>
            <input 
              className="w-full bg-[#192633] border border-[#233648] p-3 rounded-lg text-white" 
              placeholder="CNPJ Completo (apenas números)" 
              value={filialCnpj}
              onChange={e => setFilialCnpj(e.target.value)}
            />
            <input 
              className="w-full bg-[#192633] border border-[#233648] p-3 rounded-lg text-white" 
              placeholder="UF (ex: SP)" 
              maxLength={2}
              value={filialUf}
              onChange={e => setFilialUf(e.target.value.toUpperCase())}
            />
            <button onClick={createFilial} disabled={loading} className="w-full bg-primary p-3 rounded-lg font-bold">Finalizar Cadastro</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPanel;
