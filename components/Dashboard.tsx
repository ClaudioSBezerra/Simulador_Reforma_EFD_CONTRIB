
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
          <h2 className="text-2xl font-bold text-white">Dashboard de Transição Tributária</h2>
          <p className="text-[#92adc9] text-sm">Projeção escalonada de IBS e CBS vs. Carga PIS/COFINS (2027-2033).</p>
        </div>
        <div className="flex gap-2">
            <button className="bg-[#233648] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#324d67] transition-colors">Exportar PDF</button>
            <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">Relatórios</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Carga Atual (Média)', value: 'R$ 1.25M', delta: '+2.1%', up: true },
          { label: 'Projeção CBS (2027)', value: 'R$ 450k', delta: '-5%', up: false },
          { label: 'Projeção IBS (2027)', value: 'R$ 799k', delta: '+12%', up: true },
          { label: 'Redução ICMS (Final)', value: '100%', delta: '2033', up: true },
        ].map((card, idx) => (
          <div key={idx} className="bg-[#15202b] p-5 rounded-xl border border-[#233648] shadow-sm">
            <p className="text-[#92adc9] text-[10px] font-bold uppercase tracking-widest mb-2">{card.label}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-white">{card.value}</h3>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${card.up ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                {card.delta}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#15202b] p-6 rounded-xl border border-[#233648] shadow-lg">
        <h3 className="text-lg font-bold text-white mb-6">Escalonamento de Alíquotas (IBS + CBS)</h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#233648" vertical={false} />
              <XAxis dataKey="name" stroke="#92adc9" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#92adc9" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#192633', border: '1px solid #324d67', borderRadius: '8px' }} 
                itemStyle={{ color: '#fff', fontSize: '12px' }}
                cursor={{ fill: '#233648', opacity: 0.4 }}
              />
              <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '20px' }} />
              <Bar dataKey="atual" name="Carga PIS/COF Atual (%)" fill="#324d67" radius={[4, 4, 0, 0]} barSize={40} />
              <Bar dataKey="cbs" name="Alíquota CBS (%)" fill="#137fec" radius={[4, 4, 0, 0]} barSize={40} />
              <Bar dataKey="ibs" name="Alíquota IBS (%)" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
