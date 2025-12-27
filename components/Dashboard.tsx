
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TRANSITION_ALIQUOTS } from '../constants';
import { supabase } from '../services/supabase';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    vl_doc: 0,
    vl_piscofins_atual: 0,
    vl_ibs_projetado: 0,
    vl_cbs_projetado: 0,
    records: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    // Usamos a view de mercadorias como proxy para estatísticas gerais
    const { data } = await supabase
      .from('view_analise_mercadorias')
      .select('vl_doc, pis_cofins_atual, ibs_projetado, cbs_projetado')
      .eq('ano_simulacao', 2027); 

    if (data && data.length > 0) {
      const totals = data.reduce((acc: any, curr: any) => ({
        vl_doc: acc.vl_doc + (curr.vl_doc || 0),
        vl_piscofins_atual: acc.vl_piscofins_atual + (curr.pis_cofins_atual || 0),
        vl_ibs_projetado: acc.vl_ibs_projetado + (curr.ibs_projetado || 0),
        vl_cbs_projetado: acc.vl_cbs_projetado + (curr.cbs_projetado || 0),
      }), { vl_doc: 0, vl_piscofins_atual: 0, vl_ibs_projetado: 0, vl_cbs_projetado: 0 });

      setStats({ ...totals, records: data.length });
    }
  };

  const dataChart = TRANSITION_ALIQUOTS.map(a => ({
    name: a.ano.toString(),
    cbs: a.perc_cbs,
    ibs: a.perc_ibs,
    atual: 9.25,
  }));

  const formatCurrency = (v: number) => {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white">Consolidado Tributário</h2>
          <p className="text-[#92adc9] text-sm">Base de dados relacional sincronizada via Supabase Views.</p>
        </div>
        <button className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-primary/90 transition-all" onClick={fetchStats}>
          Atualizar Métricas
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Faturamento Base', value: formatCurrency(stats.vl_doc), delta: 'Total SPED', color: 'text-white' },
          { label: 'PIS/COFINS Hist.', value: formatCurrency(stats.vl_piscofins_atual), delta: 'Carga Atual', color: 'text-[#92adc9]' },
          { label: 'IBS + CBS (2027)', value: formatCurrency(stats.vl_ibs_projetado + stats.vl_cbs_projetado), delta: 'Projeção', color: 'text-primary' },
          { label: 'Impacto Estimado', value: formatCurrency((stats.vl_ibs_projetado + stats.vl_cbs_projetado) - stats.vl_piscofins_atual), delta: 'Diferença', color: 'text-yellow-500' },
        ].map((card, idx) => (
          <div key={idx} className="bg-[#15202b] p-5 rounded-2xl border border-[#233648] shadow-sm">
            <p className="text-[#567089] text-[10px] font-bold uppercase tracking-widest mb-3">{card.label}</p>
            <h3 className={`text-xl font-bold ${card.color}`}>{card.value}</h3>
            <p className="text-[#567089] text-[10px] mt-1 font-medium">{card.delta}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#15202b] p-8 rounded-2xl border border-[#233648] shadow-xl">
        <h3 className="text-lg font-bold text-white mb-8">Transição das Alíquotas (2027-2033)</h3>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#233648" vertical={false} />
              <XAxis dataKey="name" stroke="#567089" fontSize={12} axisLine={false} tickLine={false} />
              <YAxis stroke="#567089" fontSize={12} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#192633', border: '1px solid #324d67', borderRadius: '12px' }} 
                cursor={{ fill: '#233648', opacity: 0.4 }}
              />
              <Legend verticalAlign="top" align="right" />
              <Bar dataKey="atual" name="PIS/COF Ref." fill="#233648" radius={[4, 4, 0, 0]} barSize={35} />
              <Bar dataKey="cbs" name="CBS" fill="#137fec" radius={[4, 4, 0, 0]} barSize={35} />
              <Bar dataKey="ibs" name="IBS" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={35} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
