
export enum ViewType {
  DASHBOARD = 'dashboard',
  MERCADORIAS = 'mercadorias',
  ENERGIA = 'energia',
  FRETE = 'frete',
  IMPORTE = 'importe'
}

export interface Aliquota {
  ano: number;
  perc_ibs: number;
  perc_cbs: number;
  perc_reduc_icms: number;
}

export interface SpedRecord {
  id: string;
  ind_oper: '0' | '1';
  dt_doc: string;
  vl_doc: number;
  vl_bc_icms: number;
  vl_icms: number;
  vl_pis: number;
  vl_cofins: number;
  num_doc?: string;
  cnpj_c010?: string;
  chave_nfe?: string;
  consumo?: number;
}
