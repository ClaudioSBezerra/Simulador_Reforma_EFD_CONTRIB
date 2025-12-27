
import React, { useState } from 'react';
import { parseSpedLine, parseBrazilianNumber } from '../services/spedService';

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
      let cnpj = '';
      let recordCount = 0;

      for (let i = 0; i < lines.length; i++) {
        const fields = parseSpedLine(lines[i]);
        if (fields[1] === '0000') {
          cnpj = fields[7];
        }
        if (fields[1] === 'C100' || fields[1] === 'C500' || fields[1] === 'D100') {
          recordCount++;
        }

        if (i % 100 === 0) {
          setProgress(Math.round((i / lines.length) * 100));
        }
      }

      setSummary({ cnpj, records: recordCount });
      setIsUploading(false);
      setProgress(100);
    };

    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-white">Importação de Arquivos SPED</h2>
        <p className="text-[#92adc9] text-base">Gerencie o envio de arquivos fiscais para processamento e simulação da Reforma.</p>
      </div>

      <div className="flex flex-col items-center gap-6 rounded-xl border-2 border-dashed border-[#324d67] bg-[#1a2632]/50 hover:bg-[#1a2632] hover:border-primary/50 transition-all px-6 py-14 group cursor-pointer relative">
        <input 
            type="file" 
            accept=".txt" 
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer" 
        />
        <div className="p-4 rounded-full bg-[#233648] group-hover:bg-[#233648]/80 transition-colors">
          <span className="material-symbols-outlined text-white text-[48px]">cloud_upload</span>
        </div>
        <div className="flex max-w-[480px] flex-col items-center gap-2">
          <p className="text-white text-lg font-bold leading-tight text-center">Arraste e solte seu arquivo SPED aqui</p>
          <p className="text-[#92adc9] text-sm font-normal text-center">Suporta arquivos .txt do SPED Fiscal e Contribuições (Máx 50MB)</p>
        </div>
        <button className="flex min-w-[84px] items-center justify-center rounded-lg h-10 px-6 bg-primary hover:bg-primary/90 transition-colors text-white text-sm font-bold">
          Selecionar do Computador
        </button>
      </div>

      {isUploading && (
        <div className="flex flex-col gap-3 p-5 rounded-xl bg-[#1a2632] border border-[#233648]">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg text-primary">
                <span className="material-symbols-outlined">description</span>
              </div>
              <div className="flex flex-col">
                <p className="text-white text-sm font-medium">Processando arquivo...</p>
                <p className="text-[#92adc9] text-xs">Aguarde a leitura dos registros</p>
              </div>
            </div>
            <p className="text-white text-sm font-bold">{progress}%</p>
          </div>
          <div className="w-full bg-[#324d67] rounded-full h-2 overflow-hidden">
            <div 
              className="bg-primary h-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {summary && !isUploading && (
        <div className="p-6 rounded-xl bg-green-500/10 border border-green-500/20">
          <h4 className="text-green-500 font-bold mb-2">Importação Concluída com Sucesso</h4>
          <p className="text-[#92adc9] text-sm">
            CNPJ Identificado: <span className="text-white font-mono">{summary.cnpj}</span><br />
            Total de Documentos Processados: <span className="text-white font-mono">{summary.records}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default SpedImporter;
