
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TRANSITION_ALIQUOTS } from '../constants';

const Dashboard: React.FC = () => {
  const data = TRANSITION_ALIQUOTS.map(a => ({
    name: a.ano.toString(),
    cbs: a.perc_cbs,
    ibs: a.perc_ibs,
    atual: 9.25, // Mock PIS/COFINS Médio
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white">Visão Geral da Transição</h2>
          <p className="text-[#92adc9] text-sm">Projeção de alíquotas IBS/CBS vs. Carga atual estimada.</p>
        </div>
        <div className="flex gap-2">
            <button className="bg-[#233648] text-white px-4 py-2 rounded-lg text-sm font-medium">Exportar PDF</button>
            <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium">Nova Análise</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Carga Atual (Média)', value: 'R$ 1.25M', delta: '+2.1%', up: true },
          { label: 'Projeção CBS (2027)', value: 'R$ 450k', delta: '-5%', up: false },
          { label: 'Projeção IBS (2027)', value: 'R$ 799k', delta: '+12%', up: true },
          { label: 'Eficiência Fiscal', value: '94.2%', delta: '+0.5%', up: true },
        ].map((card, idx) => (
          <div key={idx} className="bg-[#15202b] p-5 rounded-xl border border-[#233648]">
            <p className="text-[#92adc9] text-xs font-semibold uppercase tracking-wider mb-2">{card.label}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-white">{card.value}</h3>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${card.up ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                {card.delta}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#15202b] p-6 rounded-xl border border-[#233648]">
        <h3 className="text-lg font-bold text-white mb-6">Curva de Transição das Alíquotas</h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#233648" />
              <XAxis dataKey="name" stroke="#92adc9" fontSize={12} />
              <YAxis stroke="#92adc9" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#192633', border: '1px solid #324d67' }} 
                itemStyle={{ color: '#fff' }}
              />
              <Legend />
              <Bar dataKey="atual" name="Carga PIS/COF Atual (%)" fill="#324d67" />
              <Bar dataKey="cbs" name="Alíquota CBS (%)" fill="#137fec" />
              <Bar dataKey="ibs" name="Alíquota IBS (%)" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
