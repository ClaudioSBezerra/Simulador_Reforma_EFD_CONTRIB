
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
    const { data, error } = await supabase
      .from('view_simulacao_reforma')
      .select('vl_doc, vl_piscofins_atual, vl_ibs_projetado, vl_cbs_projetado')
      .eq('ano_simulacao', 2027); // Estatísticas base para o ano inicial de transição

    if (data && data.length > 0) {
      const totals = data.reduce((acc: any, curr: any) => ({
        vl_doc: acc.vl_doc + curr.vl_doc,
        vl_piscofins_atual: acc.vl_piscofins_atual + curr.vl_piscofins_atual,
        vl_ibs_projetado: acc.vl_ibs_projetado + curr.vl_ibs_projetado,
        vl_cbs_projetado: acc.vl_cbs_projetado + curr.vl_cbs_projetado,
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
    if (v >= 1000000) return `R$ ${(v / 1000000).toFixed(2)}M`;
    if (v >= 1000) return `R$ ${(v / 1000).toFixed(1)}k`;
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white">Consolidado do Grupo</h2>
          <p className="text-[#92adc9] text-sm">Visão geral dos impactos financeiros baseada em {stats.records} registros.</p>
        </div>
        <div className="flex gap-2">
            <button className="bg-[#233648] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#324d67] transition-colors">Exportar</button>
            <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors" onClick={fetchStats}>Atualizar</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Faturamento Base', value: formatCurrency(stats.vl_doc), delta: 'Total SPED', up: true },
          { label: 'PIS/COFINS Atual', value: formatCurrency(stats.vl_piscofins_atual), delta: 'Carga Histórica', up: false },
          { label: 'IBS + CBS (2027)', value: formatCurrency(stats.vl_ibs_projetado + stats.vl_cbs_projetado), delta: 'Projeção Inicial', up: true },
          { label: 'Diferença Carga', value: formatCurrency((stats.vl_ibs_projetado + stats.vl_cbs_projetado) - stats.vl_piscofins_atual), delta: 'Impacto Estimado', up: (stats.vl_ibs_projetado + stats.vl_cbs_projetado) > stats.vl_piscofins_atual },
        ].map((card, idx) => (
          <div key={idx} className="bg-[#15202b] p-5 rounded-xl border border-[#233648] shadow-sm">
            <p className="text-[#92adc9] text-[10px] font-bold uppercase tracking-widest mb-2">{card.label}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-xl font-bold text-white">{card.value}</h3>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${card.up ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                {card.delta}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#15202b] p-6 rounded-xl border border-[#233648] shadow-lg">
        <h3 className="text-lg font-bold text-white mb-6">Curva de Transição das Alíquotas</h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#233648" vertical={false} />
              <XAxis dataKey="name" stroke="#92adc9" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#92adc9" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#192633', border: '1px solid #324d67', borderRadius: '8px' }} 
                itemStyle={{ color: '#fff', fontSize: '12px' }}
                cursor={{ fill: '#233648', opacity: 0.4 }}
              />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '20px' }} />
              <Bar dataKey="atual" name="PIS/COF (Referência)" fill="#324d67" radius={[4, 4, 0, 0]} barSize={40} />
              <Bar dataKey="cbs" name="CBS (%)" fill="#137fec" radius={[4, 4, 0, 0]} barSize={40} />
              <Bar dataKey="ibs" name="IBS (%)" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
