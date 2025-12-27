
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
  // Replace thousand separators and then replace decimal comma with point
  const clean = val.replace(/\./g, '').replace(',', '.');
  return parseFloat(clean) || 0;
};

/**
 * Maps a C100 record from raw SPED fields (Standard Sped Contribuições layout)
 */
export const mapC100 = (fields: string[], cnpjC010?: string) => {
  return {
    cnpj_c010: cnpjC010,
    ind_oper: fields[2],
    ind_emit: fields[3],
    cod_part: fields[4],
    cod_mod: fields[5],
    cod_sit: fields[6],
    ser: fields[7],
    num_doc: fields[8],
    dt_doc: fields[10], // Format: DDMMYYYY
    vl_doc: parseBrazilianNumber(fields[12]),
    vl_bc_icms: parseBrazilianNumber(fields[21]), // Field 21 in EFD Contribuições
    vl_icms: parseBrazilianNumber(fields[22]),    // Field 22 in EFD Contribuições
    vl_pis: parseBrazilianNumber(fields[25]),     // Field 25 in EFD Contribuições
    vl_cofins: parseBrazilianNumber(fields[26]),  // Field 26 in EFD Contribuições
  };
};
