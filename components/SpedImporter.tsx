import React, { useState } from 'react';
import { parseSpedLine, mapC100, mapC500, mapC600, mapD100 } from '../services/spedService';
import { supabase } from '../services/supabase';

const SpedImporter: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [summary, setSummary] = useState<{ cnpj: string; records: number } | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setProgress(0);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      let cnpjMain = '';
      const recordsToInsert: any[] = [];

      // 1. Identificar CNPJ (Registro 0000)
      for (const line of lines) {
        const fields = parseSpedLine(line);
        if (fields[1] === '0000') {
          cnpjMain = fields[7];
          break;
        }
      }

      // 2. Buscar Filial_ID no Supabase
      const { data: filial } = await supabase
        .from('filiais')
        .select('id, tenant_id')
        .eq('cnpj', cnpjMain)
        .single();

      if (!filial) {
        alert('Empresa com CNPJ ' + cnpjMain + ' não encontrada no cadastro do sistema.');
        setIsUploading(false);
        return;
      }

      // 3. Processar Registros
      for (let i = 0; i < lines.length; i++) {
        const fields = parseSpedLine(lines[i]);
        const reg = fields[1];
        let mapped = null;

        if (reg === 'C100') mapped = { ...mapC100(fields), reg: 'C100' };
        else if (reg === 'C500') mapped = { ...mapC500(fields), reg: 'C500' };
        else if (reg === 'C600') mapped = { ...mapC600(fields), reg: 'C600' };
        else if (reg === 'D100') mapped = { ...mapD100(fields), reg: 'D100' };

        if (mapped && mapped.dt_doc) {
          recordsToInsert.push({
            ...mapped,
            filial_id: filial.id,
            tenant_id: filial.tenant_id,
            mes_ano: mapped.dt_doc.substring(5, 7) + '/' + mapped.dt_doc.substring(0, 4)
          });
        }

        if (i % 500 === 0) setProgress(Math.round((i / lines.length) * 100));
      }

      // 4. Salvar no Supabase (Batch insert)
      if (recordsToInsert.length > 0) {
        const { error } = await supabase.from('sped_registros').insert(recordsToInsert);
        if (error) console.error('Erro ao salvar no banco:', error);
      }

      setSummary({ cnpj: cnpjMain, records: recordsToInsert.length });
      setIsUploading(false);
      setProgress(100);
    };

    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-white">Importação SPED Cloud</h2>
        <p className="text-[#92adc9] text-base">Os dados serão processados e armazenados no Supabase para análise histórica.</p>
      </div>

      <div className="flex flex-col items-center gap-6 rounded-xl border-2 border-dashed border-[#324d67] bg-[#1a2632]/50 hover:bg-[#1a2632] hover:border-primary/50 transition-all px-6 py-14 group cursor-pointer relative">
        <input type="file" accept=".txt" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
        <div className="p-4 rounded-full bg-[#233648] group-hover:bg-[#233648]/80 transition-colors">
          <span className="material-symbols-outlined text-white text-[48px]">database</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <p className="text-white text-lg font-bold">Enviar EFD Contribuições</p>
          <p className="text-[#92adc9] text-sm text-center">Os registros C100, C500 e D100 serão extraídos automaticamente.</p>
        </div>
      </div>

      {isUploading && (
        <div className="flex flex-col gap-3 p-5 rounded-xl bg-[#1a2632] border border-[#233648]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white text-sm font-medium">Sincronizando com Supabase...</span>
            <span className="text-white text-sm font-bold">{progress}%</span>
          </div>
          <div className="w-full bg-[#324d67] rounded-full h-2 overflow-hidden">
            <div className="bg-primary h-full transition-all" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      )}

      {summary && !isUploading && (
        <div className="p-6 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-4">
          <span className="material-symbols-outlined text-green-500 text-3xl">check_circle</span>
          <div>
            <h4 className="text-green-500 font-bold">Base de Dados Atualizada</h4>
            <p className="text-[#92adc9] text-xs">
              CNPJ: {summary.cnpj} | {summary.records} novos registros persistidos.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpedImporter;