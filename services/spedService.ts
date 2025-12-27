
/**
 * Splits a SPED line using the standard pipe delimiter
 */
export const parseSpedLine = (line: string): string[] => {
  if (!line) return [];
  return line.trim().split('|');
};

/**
 * Converts Brazilian numeric format (e.g., 1.500,00) to standard JavaScript number
 */
export const parseBrazilianNumber = (val: string): number => {
  if (!val) return 0;
  const clean = val.replace(/\./g, '').replace(',', '.');
  return parseFloat(clean) || 0;
};

/**
 * Format DDMMYYYY to YYYY-MM-DD
 */
export const formatSpedDate = (dateStr: string): string => {
  if (!dateStr || dateStr.length !== 8) return '';
  const d = dateStr.substring(0, 2);
  const m = dateStr.substring(2, 4);
  const y = dateStr.substring(4, 8);
  return `${y}-${m}-${d}`;
};

/**
 * Mapeia Registro C100 (Mercadorias)
 */
export const mapC100 = (fields: string[], cnpjEstab?: string) => ({
  cnpj_c010: cnpjEstab,
  ind_oper: fields[2],
  num_doc: fields[8],
  dt_doc: formatSpedDate(fields[10]),
  vl_doc: parseBrazilianNumber(fields[12]),
  vl_bc_icms: parseBrazilianNumber(fields[21]),
  vl_icms: parseBrazilianNumber(fields[22]),
  vl_pis: parseBrazilianNumber(fields[25]),
  vl_cofins: parseBrazilianNumber(fields[26]),
});

/**
 * Mapeia Registro C500 (Energia/Água - Créditos)
 */
export const mapC500 = (fields: string[], cnpjEstab?: string) => ({
  cnpj_c010: cnpjEstab,
  tipo_reg: 'C500',
  dt_doc: formatSpedDate(fields[7]),
  vl_doc: parseBrazilianNumber(fields[9]),
  vl_bc_icms: parseBrazilianNumber(fields[14]),
  vl_icms: parseBrazilianNumber(fields[15]),
  vl_pis: parseBrazilianNumber(fields[18]),
  vl_cofins: parseBrazilianNumber(fields[19]),
});

/**
 * Mapeia Registro C600 (Energia/Água - Débitos/Saídas)
 */
export const mapC600 = (fields: string[], cnpjEstab?: string) => ({
  cnpj_c010: cnpjEstab,
  tipo_reg: 'C600',
  dt_doc: formatSpedDate(fields[4]),
  vl_doc: parseBrazilianNumber(fields[6]),
  vl_bc_icms: parseBrazilianNumber(fields[7]),
  vl_icms: parseBrazilianNumber(fields[8]),
  vl_pis: parseBrazilianNumber(fields[11]),
  vl_cofins: parseBrazilianNumber(fields[12]),
});

/**
 * Mapeia Registro D100 (Frete)
 */
export const mapD100 = (fields: string[], cnpjEstab?: string) => ({
  cnpj_c010: cnpjEstab,
  ind_oper: fields[2],
  dt_doc: formatSpedDate(fields[10]),
  vl_doc: parseBrazilianNumber(fields[12]),
  vl_bc_icms: parseBrazilianNumber(fields[16]),
  vl_icms: parseBrazilianNumber(fields[17]),
  vl_pis: parseBrazilianNumber(fields[20]),
  vl_cofins: parseBrazilianNumber(fields[21]),
});
