
import React, { useState, useMemo } from 'react';
import { SpedRecord } from '../types';
import { TRANSITION_ALIQUOTS } from '../constants';

const EnergiaPanel: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(2027);
  const [activeTab, setActiveTab] = useState<'C500' | 'C600'>('C500');
  const [filterCnpj, setFilterCnpj] = useState<string>('all');
  const [filterPeriod, setFilterPeriod] = useState<string>('all');

  const currentAliquota = TRANSITION_ALIQUOTS.find(a => a.ano === selectedYear)!;

  const rawRecords: SpedRecord[] = [
    { id: 'e1', tipo_reg: 'C500', dt_doc: '2023-10-15', vl_doc: 125400, vl_bc_icms: 125400, vl_pis: 1200, vl_cofins: 5600, vl_icms: 22572, cnpj_c010: '12.345.678/0001-90' },
    { id: 'e2', tipo_reg: 'C500', dt_doc: '2023-11-10', vl_doc: 45000, vl_bc_icms: 45000, vl_pis: 430, vl_cofins: 1980, vl_icms: 8100, cnpj_c010: '12.345.678/0001-90' },
    { id: 'e3', tipo_reg: 'C600', dt_doc: '2023-10-20', vl_doc: 89400, vl_bc_icms: 89400, vl_pis: 800, vl_cofins: 3800, vl_icms: 16092, cnpj_c010: '98.765.432/0001-01' },
  ];

  const formatMesAno = (dt: string) => {
    try {
      const d = new Date(dt);
      return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    } catch { return '--/----'; }
  };

  const filterOptions = useMemo(() => {
    const cnpjs = new Set<string>();
    const periods = new Set<string>();
    rawRecords.forEach(rec => {
      if (rec.cnpj_c010) cnpjs.add(rec.cnpj_c010);
      periods.add(formatMesAno(rec.dt_doc));
    });
    return { cnpjs: Array.from(cnpjs).sort(), periods: Array.from(periods).sort() };
  }, [rawRecords]);

  const aggregatedRecords = useMemo(() => {
    const groups: Record<string, any> = {};
    rawRecords
      .filter(rec => {
        const ma = formatMesAno(rec.dt_doc);
        return rec.tipo_reg === activeTab && 
               (filterCnpj === 'all' || rec.cnpj_c010 === filterCnpj) &&
               (filterPeriod === 'all' || ma === filterPeriod);
      })
      .forEach(rec => {
        const ma = formatMesAno(rec.dt_doc);
        const key = `${rec.cnpj_c010}-${ma}`;
        if (!groups[key]) {
          groups[key] = { cnpj_c010: rec.cnpj_c010, mesAno: ma, vl_doc: 0, vl_icms: 0, vl_pis: 0, vl_cofins: 0 };
        }
        groups[key].vl_doc += rec.vl_doc;
        groups[key].vl_icms += rec.vl_icms;
        groups[key].vl_pis += rec.vl_pis;
        groups[key].vl_cofins += rec.vl_cofins;
      });
    return Object.values(groups);
  }, [rawRecords, activeTab, filterCnpj, filterPeriod]);

  const calculateProjections = (rec: any) => {
    // Alinhado com View do Supabase (view_analise_energia)
    const icms_projetado = rec.vl_icms - (rec.vl_icms * currentAliquota.perc_reduc_icms / 100);
    const ibs_projetado = rec.vl_doc * (currentAliquota.perc_ibs / 100);
    const cbs_projetado = rec.vl_doc * (currentAliquota.perc_cbs / 100);
    return { icms_projetado, ibs_projetado, cbs_projetado };
  };

  const formatCurrency = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Água e Energia (C500/C600)</h2>
          <p className="text-[#92adc9] text-sm">Monitoramento de créditos e débitos de utilidades.</p>
        </div>
        <select value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="bg-[#192633] border border-[#324d67] text-white px-4 py-2 rounded-lg outline-none font-bold text-sm">
          {TRANSITION_ALIQUOTS.map(a => <option key={a.ano} value={a.ano}>Simular Transição {a.ano}</option>)}
        </select>
      </div>

      <div className="bg-[#15202b] p-4 rounded-xl border border-[#233648] flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1.5">
          <label className="text-[#92adc9] text-[10px] uppercase font-bold tracking-wider">Filtrar por CNPJ</label>
          <select value={filterCnpj} onChange={e => setFilterCnpj(e.target.value)} className="bg-[#192633] border border-[#324d67] text-white px-3 py-2 rounded-lg outline-none text-sm min-w-[200px]">
            <option value="all">Todos os CNPJs</option>
            {filterOptions.cnpjs.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[#92adc9] text-[10px] uppercase font-bold tracking-wider">Período</label>
          <select value={filterPeriod} onChange={e => setFilterPeriod(e.target.value)} className="bg-[#192633] border border-[#324d67] text-white px-3 py-2 rounded-lg outline-none text-sm min-w-[150px]">
            <option value="all">Todos os Meses</option>
            {filterOptions.periods.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <div className="flex border-b border-[#233648]">
        <button onClick={() => setActiveTab('C500')} className={`px-6 py-3 text-sm font-bold transition-colors ${activeTab === 'C500' ? 'text-primary border-b-2 border-primary' : 'text-[#92adc9] hover:text-white'}`}>Créditos (C500)</button>
        <button onClick={() => setActiveTab('C600')} className={`px-6 py-3 text-sm font-bold transition-colors ${activeTab === 'C600' ? 'text-primary border-b-2 border-primary' : 'text-[#92adc9] hover:text-white'}`}>Débitos (C600)</button>
      </div>

      <div className="bg-[#15202b] rounded-xl border border-[#233648] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-[#192633] text-[#92adc9] text-[10px] uppercase font-bold tracking-widest border-b border-[#233648]">
              <tr>
                <th className="px-4 py-4">CNPJ Estab.</th>
                <th className="px-4 py-4">Período</th>
                <th className="px-4 py-4 text-right">VL DOC</th>
                <th className="px-4 py-4 text-right">ICMS ATUAL</th>
                <th className="px-4 py-4 text-right text-yellow-500">ICMS PROJ.</th>
                <th className="px-4 py-4 text-right">PIS/COF ATUAL</th>
                <th className="px-4 py-4 text-right text-primary">IBS PROJ.</th>
                <th className="px-4 py-4 text-right text-primary">CBS PROJ.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#233648]">
              {aggregatedRecords.map((rec, i) => {
                const proj = calculateProjections(rec);
                return (
                  <tr key={i} className="hover:bg-[#1c2a38]">
                    <td className="px-4 py-4 text-xs font-mono text-[#92adc9]">{rec.cnpj_c010}</td>
                    <td className="px-4 py-4 text-xs font-bold text-white uppercase">{rec.mesAno}</td>
                    <td className="px-4 py-4 text-sm text-right font-mono text-white">{formatCurrency(rec.vl_doc)}</td>
                    <td className="px-4 py-4 text-sm text-right font-mono text-[#92adc9]">{formatCurrency(rec.vl_icms)}</td>
                    <td className="px-4 py-4 text-sm text-right font-mono font-bold text-yellow-500">{formatCurrency(proj.icms_projetado)}</td>
                    <td className="px-4 py-4 text-sm text-right font-mono text-[#92adc9]">{formatCurrency(rec.vl_pis + rec.vl_cofins)}</td>
                    <td className="px-4 py-4 text-sm text-right font-mono font-bold text-primary">{formatCurrency(proj.ibs_projetado)}</td>
                    <td className="px-4 py-4 text-sm text-right font-mono font-bold text-primary">{formatCurrency(proj.cbs_projetado)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EnergiaPanel;
