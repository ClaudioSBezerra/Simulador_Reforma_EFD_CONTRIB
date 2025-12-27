
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
    setLog(["Iniciando leitura do arquivo..."]);
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      let currentFilialId = '';
      let currentPaiId = '';
      let mesAno = '';

      for (let i = 0; i < lines.length; i++) {
        const fields = parseSpedLine(lines[i]);
        const reg = fields[1];

        // 1. Identificar Filial (Registro 0000)
        if (reg === '0000') {
          const cnpj = fields[7];
          const { data: filial } = await supabase.from('filiais').select('id').eq('cnpj', cnpj).single();
          if (filial) {
            currentFilialId = filial.id;
            mesAno = fields[4] + fields[5]; // Exemplo simplificado de data
            setLog(prev => [...prev, `Filial identificada: ${cnpj}`]);
          } else {
            alert(`Erro: CNPJ ${cnpj} não cadastrado.`);
            setIsUploading(false);
            return;
          }
        }

        // 2. Criar Pai (C010 / D010)
        if (reg === 'C010' || reg === 'D010') {
          const cnpjEstab = fields[2];
          const { data: pai } = await supabase.from('estabelecimentos_periodo').insert([{
            filial_id: currentFilialId,
            cnpj_estab: cnpjEstab,
            registro_tipo: reg,
            mes_ano: '012024' // Mock competencia
          }]).select().single();
          if (pai) currentPaiId = pai.id;
        }

        // 3. Inserir Filhos
        if (currentPaiId) {
          if (reg === 'C100') {
            await supabase.from('registro_c100').insert([{ ...mapC100(fields), pai_id: currentPaiId }]);
          } else if (reg === 'C500' || reg === 'C600') {
            await supabase.from('registro_energia_agua').insert([{ ...mapC500(fields), pai_id: currentPaiId, tipo_reg: reg }]);
          } else if (reg === 'D100') {
            await supabase.from('registro_transportes').insert([{ ...mapD100(fields), pai_id: currentPaiId }]);
          }
        }

        if (i % 100 === 0) setProgress(Math.round((i / lines.length) * 100));
      }

      setLog(prev => [...prev, "Importação concluída com sucesso!"]);
      setIsUploading(false);
      setProgress(100);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-white">Parser SPED SPED (Legacy/Reform)</h2>
        <p className="text-[#92adc9]">Importe arquivos da EFD Contribuições para gerar projeções IBS/CBS.</p>
      </div>

      <div className="relative group border-2 border-dashed border-[#324d67] rounded-2xl bg-[#1a2632]/30 p-12 text-center cursor-pointer hover:border-primary transition-all">
        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
        <span className="material-symbols-outlined text-5xl text-primary mb-4">upload_file</span>
        <p className="text-white font-bold">Arraste seu arquivo .txt aqui</p>
        <p className="text-[#567089] text-xs mt-2">Formatos aceitos: Leiaute EFD Contribuições v6.0+</p>
      </div>

      {isUploading && (
        <div className="bg-[#15202b] p-6 rounded-xl border border-[#233648] space-y-4">
          <div className="flex justify-between text-sm font-bold">
            <span className="text-white">Processando Linhas...</span>
            <span className="text-primary">{progress}%</span>
          </div>
          <div className="h-2 w-full bg-[#233648] rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="text-[10px] font-mono text-[#567089] h-20 overflow-y-auto bg-[#101922] p-2 rounded">
            {log.map((l, i) => <div key={i}>{l}</div>)}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpedImporter;
