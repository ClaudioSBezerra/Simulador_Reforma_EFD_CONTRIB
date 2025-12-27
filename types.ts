
export enum ViewType {
  LOGIN = 'login',
  DASHBOARD = 'dashboard',
  MERCADORIAS = 'mercadorias',
  ENERGIA = 'energia',
  FRETE = 'frete',
  IMPORTE = 'importe'
}

export interface User {
  id: string;
  nome: string;
  email: string;
  role: 'master' | 'empresa';
  tenant_id: string;
  avatar_url?: string;
}

export interface Aliquota {
  ano: number;
  perc_ibs: number;
  perc_cbs: number;
  perc_reduc_icms: number;
}

export interface Tenant {
  id: string;
  nome: string;
}

export interface Empresa {
  id: string;
  grupo_id: string;
  nome_razao: string;
  cnpj_raiz: string;
}

export interface Filial {
  id: string;
  empresa_id: string;
  cnpj: string;
  nome_fantasia: string;
  uf: string;
}

export interface SpedRecord {
  id: string;
  ind_oper?: '0' | '1';
  tipo_reg?: 'C500' | 'C600';
  dt_doc: string;
  vl_doc: number;
  vl_bc_icms: number;
  vl_icms: number;
  vl_pis: number;
  vl_cofins: number;
  num_doc?: string;
  cnpj_c010?: string;
  mes_ano?: string;
}
