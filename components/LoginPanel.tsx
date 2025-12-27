
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { User } from '../types';

interface LoginPanelProps {
  onLogin: (user: User) => void;
}

const LoginPanel: React.FC<LoginPanelProps> = ({ onLogin }) => {
  const [step, setStep] = useState<'auth' | 'tenant' | 'empresa' | 'filial'>('auth');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auth States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Onboarding States
  const [tenantName, setTenantName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [cnpjRaiz, setCnpjRaiz] = useState('');
  const [filialCnpj, setFilialCnpj] = useState('');
  const [filialUf, setFilialUf] = useState('');

  const [sessionUid, setSessionUid] = useState<string | null>(null);
  const [createdTenantId, setCreatedTenantId] = useState<string | null>(null);
  const [createdEmpresaId, setCreatedEmpresaId] = useState<string | null>(null);

  const handleAuth = async () => {
    setLoading(true);
    setError('');
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSessionUid(data.user?.id || null);
        setStep('tenant');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        // Verificar se tem perfil
        const { data: profile } = await supabase.from('perfil_usuario').select('*').eq('id', data.user.id).single();
        if (profile && profile.tenant_id) {
          onLogin({ id: data.user.id, email: data.user.email!, role: profile.nivel_acesso, tenant_id: profile.tenant_id });
        } else {
          setSessionUid(data.user.id);
          setStep('tenant');
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createTenant = async () => {
    setLoading(true);
    const { data: tenant, error: tErr } = await supabase.from('tenants').insert([{ nome: tenantName }]).select().single();
    if (tenant) {
      setCreatedTenantId(tenant.id);
      // Criar perfil do usuário vinculado ao tenant
      await supabase.from('perfil_usuario').insert([{
        id: sessionUid,
        tenant_id: tenant.id,
        email: email,
        nivel_acesso: 'master'
      }]);
      setStep('empresa');
    } else {
      setError(tErr.message);
    }
    setLoading(false);
  };

  const createEmpresa = async () => {
    setLoading(true);
    // Criar Grupo
    const { data: grupo } = await supabase.from('grupos_empresariais').insert([{ tenant_id: createdTenantId, nome: 'Grupo ' + companyName }]).select().single();
    if (grupo) {
      // Criar Empresa
      const { data: empresa } = await supabase.from('empresas').insert([{ grupo_id: grupo.id, nome_razao: companyName, cnpj_raiz: cnpjRaiz }]).select().single();
      if (empresa) {
        setCreatedEmpresaId(empresa.id);
        // Vincular usuário à empresa
        await supabase.from('usuario_empresa_vinculo').insert([{ perfil_id: sessionUid, empresa_id: empresa.id }]);
        setStep('filial');
      }
    }
    setLoading(false);
  };

  const createFilial = async () => {
    setLoading(true);
    const { data: filial } = await supabase.from('filiais').insert([{ 
      empresa_id: createdEmpresaId, 
      cnpj: filialCnpj, 
      uf: filialUf, 
      nome_fantasia: companyName 
    }]).select().single();
    
    if (filial) {
      onLogin({ id: sessionUid!, email, role: 'master', tenant_id: createdTenantId! });
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
          <p className="text-[#92adc9] text-sm">Simulador de Reforma Tributária</p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-xs mb-6 text-center">{error}</div>}

        {step === 'auth' && (
          <div className="space-y-4">
            <div className="flex bg-[#192633] p-1 rounded-xl mb-4">
              <button 
                onClick={() => setMode('login')} 
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mode === 'login' ? 'bg-primary text-white shadow-lg' : 'text-[#92adc9]'}`}
              >Entrar</button>
              <button 
                onClick={() => setMode('signup')} 
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${mode === 'signup' ? 'bg-primary text-white shadow-lg' : 'text-[#92adc9]'}`}
              >Cadastrar</button>
            </div>
            <input 
              className="w-full bg-[#192633] border border-[#233648] p-3 rounded-lg text-white text-sm outline-none focus:border-primary transition-colors" 
              placeholder="E-mail corporativo" 
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <input 
              className="w-full bg-[#192633] border border-[#233648] p-3 rounded-lg text-white text-sm outline-none focus:border-primary transition-colors" 
              placeholder="Senha" 
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button 
              onClick={handleAuth} 
              disabled={loading}
              className="w-full bg-primary py-3 rounded-lg font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
            >
              {loading ? <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : (mode === 'login' ? 'Acessar Painel' : 'Criar Conta')}
            </button>
          </div>
        )}

        {step === 'tenant' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-white font-bold text-lg">Configurar Tenant</h2>
            <p className="text-[#92adc9] text-xs">O locatário é a entidade master (ex: Holding ou Escritório).</p>
            <input 
              className="w-full bg-[#192633] border border-[#233648] p-3 rounded-lg text-white" 
              placeholder="Nome da Organização" 
              value={tenantName}
              onChange={e => setTenantName(e.target.value)}
            />
            <button onClick={createTenant} disabled={loading} className="w-full bg-primary p-3 rounded-lg font-bold">Próximo Passo</button>
          </div>
        )}

        {step === 'empresa' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-white font-bold text-lg">Criar Empresa Base</h2>
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
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-white font-bold text-lg">Vincular Filial SPED</h2>
            <p className="text-[#92adc9] text-xs">Cadastre a filial cujos arquivos SPED serão processados inicialmente.</p>
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
            <button onClick={createFilial} disabled={loading} className="w-full bg-primary p-3 rounded-lg font-bold">Finalizar e Abrir Simulador</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPanel;
