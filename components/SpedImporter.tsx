
import React, { useState } from 'react';
import { parseSpedLine, mapC100, mapC500, mapC600, mapD100 } from '../services/spedService';
import { supabase } from '../services/supabase';

const SpedImporter: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [log, setLog] = useState<string[]>([]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setLog(["Iniciando leitura do arquivo SPED..."]);
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      let currentFilialId = '';
      let currentPaiId = '';

      for (let i = 0; i < lines.length; i++) {
        const fields = parseSpedLine(lines[i]);
        const reg = fields[1];

        // Registro 0000: Identifica a Filial no Banco
        if (reg === '0000') {
          const cnpj = fields[7];
          const { data: filial } = await supabase.from('filiais').select('id').eq('cnpj', cnpj).single();
          if (filial) {
            currentFilialId = filial.id;
            setLog(prev => [...prev, `Filial Identificada: ${cnpj}`]);
          } else {
            alert(`CNPJ ${cnpj} não cadastrado no sistema. Realize o cadastro da filial primeiro.`);
            setIsUploading(false);
            return;
          }
        }

        // Registros C010 ou D010: Criam o registro Pai (estabelecimentos_periodo)
        if ((reg === 'C010' || reg === 'D010') && currentFilialId) {
          const cnpjEstab = fields[2];
          const mes_ano = lines[0].split('|')[4].substring(2, 8); // Pega competência do 0000
          
          const { data: pai } = await supabase.from('estabelecimentos_periodo').insert([{
            filial_id: currentFilialId,
            cnpj_estab: cnpjEstab,
            registro_tipo: reg,
            mes_ano: mes_ano
          }]).select().single();
          
          if (pai) {
            currentPaiId = pai.id;
            setLog(prev => [...prev, `Estabelecimento Aberto: ${cnpjEstab} (${reg})`]);
          }
        }

        // Inserção dos registros filhos vinculados ao Pai recém criado
        if (currentPaiId) {
          if (reg === 'C100') {
            await supabase.from('registro_c100').insert([{ ...mapC100(fields), pai_id: currentPaiId }]);
          } else if (reg === 'C500' || reg === 'C600') {
            await supabase.from('registro_energia_agua').insert([{ 
              ...mapC500(fields), 
              pai_id: currentPaiId, 
              tipo_reg: reg 
            }]);
          } else if (reg === 'D100') {
            await supabase.from('registro_transportes').insert([{ ...mapD100(fields), pai_id: currentPaiId }]);
          }
        }

        if (i % 100 === 0) setProgress(Math.round((i / lines.length) * 100));
      }

      setLog(prev => [...prev, "Importação Persistida com Sucesso!"]);
      setIsUploading(false);
      setProgress(100);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-white">Processador EFD Contribuições</h2>
        <p className="text-[#92adc9]">Os dados serão estruturados relacionalmente para simulação tributária.</p>
      </div>

      <div className="relative group border-2 border-dashed border-[#324d67] rounded-2xl bg-[#1a2632]/30 p-12 text-center cursor-pointer hover:border-primary transition-all">
        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
        <span className="material-symbols-outlined text-5xl text-primary mb-4">clinical_notes</span>
        <p className="text-white font-bold text-lg">Upload de Arquivo SPED</p>
        <p className="text-[#567089] text-xs mt-2">Serão extraídos registros C100, C500, C600, D100 e D500</p>
      </div>

      {isUploading && (
        <div className="bg-[#15202b] p-6 rounded-xl border border-[#233648] space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-white text-sm font-bold animate-pulse">Sincronizando com Supabase...</span>
            <span className="text-primary font-mono">{progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-[#233648] rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="text-[10px] font-mono text-emerald-500/80 h-32 overflow-y-auto bg-[#101922] p-3 rounded-lg border border-[#233648]">
            {log.map((l, i) => <div key={i} className="mb-1">{`> ${l}`}</div>)}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpedImporter;
