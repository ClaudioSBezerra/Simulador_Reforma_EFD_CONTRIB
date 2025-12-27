
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { TRANSITION_ALIQUOTS } from '../constants';

const FretePanel: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(2027);
  const [activeTab, setActiveTab] = useState<'0' | '1'>('0');
  const [records, setRecords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [selectedYear, activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('view_analise_frete')
      .select('*')
      .eq('ind_oper', activeTab)
      .eq('ano_simulacao', selectedYear)
      .order('dt_doc', { ascending: false });

    if (data) setRecords(data);
    setIsLoading(false);
  };

  const formatCurrency = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Fretes e Transportes</h2>
          <p className="text-[#92adc9] text-sm">Projeções para o setor de logística.</p>
        </div>
        <select 
          value={selectedYear} 
          onChange={e => setSelectedYear(Number(e.target.value))}
          className="bg-[#192633] border border-[#324d67] text-white px-4 py-2 rounded-xl text-sm font-bold"
        >
          {TRANSITION_ALIQUOTS.map(a => <option key={a.ano} value={a.ano}>Ano {a.ano}</option>)}
        </select>
      </div>

      <div className="bg-[#15202b] rounded-2xl border border-[#233648] overflow-hidden">
        <div className="flex border-b border-[#233648]">
          <button onClick={() => setActiveTab('0')} className={`px-8 py-4 text-xs font-bold transition-all ${activeTab === '0' ? 'text-primary border-b-2 border-primary' : 'text-[#567089]'}`}>Entradas (Aquisição)</button>
          <button onClick={() => setActiveTab('1')} className={`px-8 py-4 text-xs font-bold transition-all ${activeTab === '1' ? 'text-primary border-b-2 border-primary' : 'text-[#567089]'}`}>Saídas (Prestação)</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#192633] text-[#567089] text-[10px] uppercase font-bold tracking-widest">
              <tr>
                <th className="px-6 py-4">Data Doc.</th>
                <th className="px-6 py-4 text-right">VL FRETE</th>
                <th className="px-6 py-4 text-right text-indigo-400">IBS</th>
                <th className="px-6 py-4 text-right text-emerald-400">CBS</th>
                <th className="px-6 py-4 text-right text-yellow-500">ICMS Proj.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#233648]">
              {isLoading ? (
                <tr><td colSpan={5} className="py-10 text-center text-[#567089] text-sm">Buscando dados relacionais...</td></tr>
              ) : records.map((rec, i) => (
                <tr key={i} className="hover:bg-[#1c2a38] transition-colors">
                  <td className="px-6 py-4 text-xs text-white">{new Date(rec.dt_doc).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-right font-mono text-white">{formatCurrency(rec.vl_doc)}</td>
                  <td className="px-6 py-4 text-sm text-right font-mono font-bold text-indigo-400">{formatCurrency(rec.ibs_projetado)}</td>
                  <td className="px-6 py-4 text-sm text-right font-mono font-bold text-emerald-400">{formatCurrency(rec.cbs_projetado)}</td>
                  <td className="px-6 py-4 text-sm text-right font-mono font-bold text-yellow-500">{formatCurrency(rec.icms_projetado)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FretePanel;
