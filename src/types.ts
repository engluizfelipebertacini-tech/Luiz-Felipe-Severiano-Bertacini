export type UserRole = 'admin' | 'socio' | 'operacional' | 'engenheiro' | 'financeiro';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  crea?: string;
  cargo?: string;
  active: boolean;
  avatarUrl?: string;
  googleConnected?: boolean;
}

export interface CompanySettings {
  corporateName: string;
  tradeName: string;
  cnpj: string;
  crea: string;
  technicalResponsible: string;
  technicalResponsibleCrea: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  cep: string;
  website: string;
  logoUrl?: string;
}

export type ClientType = 'condominio' | 'empresa' | 'pessoa_fisica' | 'escritorio_advocacia' | 'construtora' | 'outro';

export interface ClientContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  isMain: boolean;
}

export interface Client {
  id: string;
  name: string;
  type: ClientType;
  document: string; // CNPJ or CPF
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  cep: string;
  contactPerson: string;
  notes?: string;
  commercialResponsible: string;
  contacts?: ClientContact[];
  createdAt: string;
}

export type PipelineStage = 
  | 'novo_contato'
  | 'solicitacao_recebida'
  | 'em_analise'
  | 'visita_necessaria'
  | 'proposta_elaboracao'
  | 'proposta_enviada'
  | 'em_negociacao'
  | 'aprovada'
  | 'perdida';

export interface Opportunity {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  stage: PipelineStage;
  estimatedValue: number;
  serviceCategory: string;
  notes?: string;
  responsible: string;
  createdAt: string;
  updatedAt: string;
}

export type ProposalStatus = 
  | 'elaboracao'
  | 'revisao'
  | 'aprovada_internamente'
  | 'enviada'
  | 'negociacao'
  | 'aprovada_cliente'
  | 'recusada'
  | 'expirada';

export interface Proposal {
  id: string;
  code: string;
  sequence: number;
  clientId: string;
  clientName: string;
  opportunityId?: string;
  serviceCategory: string;
  serviceType: string;
  object: string;
  address: string;
  characteristics?: string;
  scope: string;
  methodology: string;
  applicableStandards: string;
  deliverables: string;
  limitations: string;
  executionPeriod: string;
  validityPeriod: string;
  totalValue: number;
  paymentTerms: string;
  status: ProposalStatus;
  responsible: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export type ServiceStatus = 'planejamento' | 'em_andamento' | 'em_revisao' | 'concluido' | 'suspenso';

export interface ServiceStage {
  id: string;
  name: string;
  order: number;
  responsible: string;
  dueDate: string;
  status: 'pendente' | 'em_andamento' | 'concluido';
  completedAt?: string;
}

export interface ServiceItem {
  id: string;
  code: string;
  proposalId?: string;
  clientId: string;
  clientName: string;
  title: string;
  serviceCategory: string;
  serviceType: string;
  object: string;
  address: string;
  technicalLead: string;
  team: string;
  startDate: string;
  expectedEndDate: string;
  contractedValue: number;
  currentStage: string;
  status: ServiceStatus;
  stages: ServiceStage[];
  notes?: string;
  createdAt: string;
}

export type InspectionStatus = 'agendada' | 'em_campo' | 'finalizada' | 'cancelada';

export interface InspectionChecklistItem {
  id: string;
  system: string;
  checkItem: string;
  status: 'conforme' | 'nao_conforme' | 'nao_se_aplica' | 'pendente';
  observation?: string;
}

export interface InspectionPhoto {
  id: string;
  url: string;
  caption: string;
  system: string;
  timestamp: string;
}

export interface Inspection {
  id: string;
  serviceId?: string;
  clientId: string;
  clientName: string;
  type: string;
  address: string;
  date: string;
  time: string;
  responsible: string;
  participants?: string;
  status: InspectionStatus;
  objective: string;
  scope: string;
  checklist: InspectionChecklistItem[];
  photos: InspectionPhoto[];
  findings?: string;
  conclusion?: string;
  googleCalendarEventId?: string;
  createdAt: string;
}

export type ExpertCaseStatus = 
  | 'nomeacao'
  | 'proposta_honorarios'
  | 'diligencia_agendada'
  | 'laudo_em_elaboracao'
  | 'laudo_entregue'
  | 'esclarecimentos'
  | 'encerrado';

export interface ExpertCase {
  id: string;
  caseNumber: string; // Número do processo
  court: string; // Tribunal (ex: TJSP)
  branch: string; // Vara (ex: 2ª Vara Cível)
  district: string; // Comarca (ex: Foro Central Cível da Capital)
  judge?: string;
  plaintiff: string; // Autor / Requerente
  defendant: string; // Réu / Requerido
  plaintiffLawyer?: string;
  defendantLawyer?: string;
  technicalAssistants?: string;
  questions?: string; // Quesitos formulados
  appointmentDate?: string; // Data da nomeação
  feeAcceptanceDate?: string;
  fees?: number; // Honorários periciais
  proceduralDeadline?: string; // Prazo processual
  inspectionDate?: string; // Data da diligência
  reportDeliveryDeadline?: string; // Data de entrega do laudo
  status: ExpertCaseStatus;
  notes?: string;
  createdAt: string;
}

export type DocumentType = 
  | 'laudo_inspecao'
  | 'laudo_patologia'
  | 'laudo_pericial'
  | 'parecer_tecnico'
  | 'relatorio_fotografico'
  | 'art'
  | 'proposta'
  | 'contrato'
  | 'peticao'
  | 'outro';

export type DocumentStatus = 'elaboracao' | 'aguardando_revisao' | 'em_revisao' | 'aprovado' | 'entregue' | 'arquivado';

export interface TechnicalDocument {
  id: string;
  title: string;
  type: DocumentType;
  serviceId?: string;
  clientId?: string;
  clientName?: string;
  author: string;
  reviewer?: string;
  version: number;
  status: DocumentStatus;
  content?: string;
  fileUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskPriority = 'baixa' | 'media' | 'alta' | 'urgente';
export type TaskStatus = 'pendente' | 'em_andamento' | 'concluida' | 'atrasada';

export interface Task {
  id: string;
  title: string;
  description?: string;
  responsible: string;
  priority: TaskPriority;
  dueDate: string;
  status: TaskStatus;
  category: string;
  clientId?: string;
  clientName?: string;
  serviceId?: string;
  createdAt: string;
}

export interface CalendarEventItem {
  id: string;
  title: string;
  type: string;
  clientId?: string;
  clientName?: string;
  serviceId?: string;
  responsible: string;
  startDate: string;
  endDate: string;
  location?: string;
  description?: string;
  googleCalendarEventId?: string;
  status?: string;
  createdAt: string;
}

export type FinancialType = 'receita' | 'despesa';
export type FinancialStatus = 'previsto' | 'a_vencer' | 'pago' | 'vencido' | 'cancelado';

export interface FinancialEntry {
  id: string;
  type: FinancialType;
  category: string;
  description: string;
  value: number;
  dueDate: string;
  paymentDate?: string;
  paymentMethod?: string;
  status: FinancialStatus;
  clientId?: string;
  clientName?: string;
  serviceId?: string;
  proposalId?: string;
  receiptNotes?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  timestamp: string;
}
