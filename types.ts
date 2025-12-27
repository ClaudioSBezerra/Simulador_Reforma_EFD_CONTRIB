

export enum ViewType {
  LOGIN = 'login',
  DASHBOARD = 'dashboard',
  MERCADORIAS = 'mercadorias',
  ENERGIA = 'energia',
  FRETE = 'frete',
  IMPORTE = 'importe'
}

// Added avatar_url property to User interface to fix TypeScript error in Sidebar.tsx
export interface User {
  id: string;
  nome: string;
  email: string;
  role: 'master' | 'empresa';
  tenant_id?: string;
  avatar_url?: string;
}

export interface Aliquota {
  ano: number;
  perc_ibs: number;
  perc_cbs: number;
  perc_reduc_icms: number;
}

export interface AnaliseRecord {
  filial_cnpj: string;
  dt_doc: string;
  ind_oper?: string;
  tipo_reg?: string;
  vl_doc: number;
  icms_atual: number;
  pis_cofins_atual: number;
  icms_projetado: number;
  ibs_projetado: number;
  cbs_projetado: number;
  ano_simulacao: number;
}
