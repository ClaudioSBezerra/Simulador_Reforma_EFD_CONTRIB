
import React, { useState, useMemo } from 'react';
import { SpedRecord } from '../types';
import { TRANSITION_ALIQUOTS } from '../constants';

const MercadoriasPanel: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number>(2027);
  const [activeTab, setActiveTab] = useState<'0' | '1'>('1'); // 0: Entrada, 1: Saída
  const [filterCnpj, setFilterCnpj] = useState<string>('all');
  const [filterPeriod, setFilterPeriod] = useState<string>('all');

  const currentAliquota = TRANSITION_ALIQUOTS.find(a => a.ano === selectedYear)!;

  const rawRecords: SpedRecord[] = [
    { id: '1', ind_oper: '1', dt_doc: '2023-10-01', vl_doc: 15000, vl_bc_icms: 15000, vl_icms: 2700, vl_pis: 247.5, vl_cofins: 1140, num_doc: '1593', cnpj_c010: '12.345.678/0001-90' },
    { id: '2', ind_oper: '1', dt_doc: '2023-10-15', vl_doc: 5000, vl_bc_icms: 5000, vl_icms: 900, vl_pis: 82.5, vl_cofins: 380, num_doc: '1598', cnpj_c010: '12.345.678/0001-90' },
    { id: '3', ind_oper: '1', dt_doc: '2023-11-03', vl_doc: 8200, vl_bc_icms: 8200, vl_icms: 1485, vl_pis: 135.3, vl_cofins: 623.2, num_doc: '1594', cnpj_c010: '12.345.678/0001-90' },
    { id: '4', ind_oper: '0', dt_doc: '2023-12-05', vl_doc: 45000, vl_bc_icms: 45000, vl_icms: 8100, vl_pis: 742.5, vl_cofins: 3420, num_doc: '1602', cnpj_c010: '98.765.432/0001-01' },
    { id: '5', ind_oper: '0', dt_doc: '2023-12-10', vl_doc: 12000, vl_bc_icms: 12000, vl_icms: 2160, vl_pis: 198, vl_cofins: 912, num_doc: '1603', cnpj_c010: '98.765.432/0001-01' },
  ];

  const formatMesAno = (dtStr: string) => {
    try {
      const date = new Date(dtStr);
      return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
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
        return rec.ind_oper === activeTab && 
               (filterCnpj === 'all' || rec.cnpj_c010 === filterCnpj) &&
               (filterPeriod === 'all' || ma === filterPeriod);
      })
      .forEach(rec => {
        const ma = formatMesAno(rec.dt_doc);
        const key = `${rec.cnpj_c010}-${ma}`;
        if (!groups[key]) {
          groups[key] = { cnpj_c010: rec.cnpj_c010, mesAno: ma, vl_doc: 0, vl_icms: 0, vl_pis: 0, vl_cofins: 0, vl_bc_icms: 0 };
        }
        groups[key].vl_doc += rec.vl_doc;
        groups[key].vl_icms += rec.vl_icms;
        groups[key].vl_pis += rec.vl_pis;
        groups[key].vl_cofins += rec.vl_cofins;
        groups[key].vl_bc_icms += rec.vl_bc_icms;
      });
    return Object.values(groups);
  }, [rawRecords, activeTab, filterCnpj, filterPeriod]);

  const calculateProjections = (rec: any) => {
    // Alinhado com View do Supabase
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
          <h2 className="text-2xl font-bold text-white">Mercadorias (Registro C100)</h2>
          <p className="text-[#92adc9] text-sm">Projeções fiscais baseadas no Valor do Documento.</p>
        </div>
        <select 
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="bg-[#192633] border border-[#324d67] text-white px-4 py-2 rounded-lg outline-none font-bold text-sm"
        >
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
        <button onClick={() => setActiveTab('0')} className={`px-6 py-3 text-sm font-bold transition-colors ${activeTab === '0' ? 'text-primary border-b-2 border-primary' : 'text-[#92adc9] hover:text-white'}`}>Entradas</button>
        <button onClick={() => setActiveTab('1')} className={`px-6 py-3 text-sm font-bold transition-colors ${activeTab === '1' ? 'text-primary border-b-2 border-primary' : 'text-[#92adc9] hover:text-white'}`}>Saídas</button>
      </div>

      <div className="bg-[#15202b] rounded-xl border border-[#233648] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-[#192633] text-[#92adc9] text-[10px] uppercase font-bold tracking-widest border-b border-[#233648]">
              <tr>
                <th className="px-4 py-4">Estabelecimento</th>
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

export default MercadoriasPanel;
