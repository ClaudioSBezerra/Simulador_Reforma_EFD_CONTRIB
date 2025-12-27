
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
    const { data, error } = await supabase
      .from('view_simulacao_reforma')
      .select('*')
      .eq('reg', 'D100')
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
          <h2 className="text-2xl font-bold text-white">Frete e Transporte (D100)</h2>
          <p className="text-[#92adc9] text-sm">Análise de impactos em transportes a partir de dados reais.</p>
        </div>
        <select 
          value={selectedYear} 
          onChange={e => setSelectedYear(Number(e.target.value))}
          className="bg-[#192633] border border-[#324d67] text-white px-4 py-2 rounded-lg outline-none font-bold text-sm cursor-pointer"
        >
          {TRANSITION_ALIQUOTS.map(a => <option key={a.ano} value={a.ano}>Transição {a.ano}</option>)}
        </select>
      </div>

      <div className="flex border-b border-[#233648]">
        <button onClick={() => setActiveTab('0')} className={`px-6 py-3 text-sm font-bold transition-colors ${activeTab === '0' ? 'text-primary border-b-2 border-primary' : 'text-[#92adc9] hover:text-white'}`}>Aquisição de Frete</button>
        <button onClick={() => setActiveTab('1')} className={`px-6 py-3 text-sm font-bold transition-colors ${activeTab === '1' ? 'text-primary border-b-2 border-primary' : 'text-[#92adc9] hover:text-white'}`}>Prestação de Frete</button>
      </div>

      <div className="bg-[#15202b] rounded-xl border border-[#233648] overflow-hidden min-h-[400px]">
        {isLoading ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-[#192633] text-[#92adc9] text-[10px] uppercase font-bold tracking-widest border-b border-[#233648]">
                <tr>
                  <th className="px-4 py-4">Estabelecimento</th>
                  <th className="px-4 py-4">Data Doc.</th>
                  <th className="px-4 py-4 text-right">VL FRETE</th>
                  <th className="px-4 py-4 text-right text-yellow-500">ICMS Proj.</th>
                  <th className="px-4 py-4 text-right text-indigo-400">IBS Proj.</th>
                  <th className="px-4 py-4 text-right text-emerald-400">CBS Proj.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#233648]">
                {records.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-[#567089]">Nenhum registro de transporte encontrado.</td></tr>
                ) : (
                  records.map((rec) => (
                    <tr key={rec.id} className="hover:bg-[#1c2a38]">
                      <td className="px-4 py-4">
                        <p className="text-white text-xs font-bold">{rec.cnpj_filial}</p>
                        <p className="text-[#92adc9] text-[10px] font-mono">{rec.uf_filial}</p>
                      </td>
                      <td className="px-4 py-4 text-xs text-white">{new Date(rec.dt_doc).toLocaleDateString()}</td>
                      <td className="px-4 py-4 text-sm text-right font-mono text-white">{formatCurrency(rec.vl_doc)}</td>
                      <td className="px-4 py-4 text-sm text-right font-mono font-bold text-yellow-500">{formatCurrency(rec.vl_icms_projetado)}</td>
                      <td className="px-4 py-4 text-sm text-right font-mono font-bold text-indigo-400">{formatCurrency(rec.vl_ibs_projetado)}</td>
                      <td className="px-4 py-4 text-sm text-right font-mono font-bold text-emerald-400">{formatCurrency(rec.vl_cbs_projetado)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FretePanel;
