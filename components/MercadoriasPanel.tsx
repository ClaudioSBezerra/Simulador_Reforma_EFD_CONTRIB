
import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { TRANSITION_ALIQUOTS } from '../constants';
import { AnaliseRecord } from '../types';

const MercadoriasPanel: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(2027);
  const [activeTab, setActiveTab] = useState<'0' | '1'>('1');
  const [records, setRecords] = useState<AnaliseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [selectedYear, activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('view_analise_mercadorias')
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
          <h2 className="text-2xl font-bold text-white">Análise de Mercadorias (View)</h2>
          <p className="text-[#92adc9] text-sm">Carga Projetada via ViewAnaliseMercadorias SQL</p>
        </div>
        <select 
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="bg-[#192633] border border-[#324d67] text-white px-4 py-2 rounded-lg outline-none font-bold"
        >
          {TRANSITION_ALIQUOTS.map(a => <option key={a.ano} value={a.ano}>Transição {a.ano}</option>)}
        </select>
      </div>

      <div className="bg-[#15202b] rounded-xl border border-[#233648] overflow-hidden">
        <div className="flex border-b border-[#233648]">
          <button onClick={() => setActiveTab('0')} className={`px-6 py-4 text-xs font-bold ${activeTab === '0' ? 'text-primary border-b-2 border-primary' : 'text-[#92adc9]'}`}>Entradas</button>
          <button onClick={() => setActiveTab('1')} className={`px-6 py-4 text-xs font-bold ${activeTab === '1' ? 'text-primary border-b-2 border-primary' : 'text-[#92adc9]'}`}>Saídas</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#192633] text-[#567089] text-[10px] uppercase font-bold tracking-widest border-b border-[#233648]">
              <tr>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4 text-right">VL DOC</th>
                <th className="px-6 py-4 text-right">PIS/COFINS Hist.</th>
                <th className="px-6 py-4 text-right text-indigo-400">IBS Proj.</th>
                <th className="px-6 py-4 text-right text-emerald-400">CBS Proj.</th>
                <th className="px-6 py-4 text-right text-yellow-500">ICMS Liq.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#233648]">
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-10 text-[#567089]">Consultando Views no Supabase...</td></tr>
              ) : records.map((rec, i) => (
                <tr key={i} className="hover:bg-[#1c2a38] transition-colors">
                  <td className="px-6 py-4 text-xs text-white">{new Date(rec.dt_doc).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-right font-mono text-white">{formatCurrency(rec.vl_doc)}</td>
                  <td className="px-6 py-4 text-sm text-right font-mono text-[#92adc9]">{formatCurrency(rec.pis_cofins_atual)}</td>
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

export default MercadoriasPanel;
