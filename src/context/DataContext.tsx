import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs,
  getDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, getCalendarAccessToken } from '../firebase';
import { 
  Client, 
  Opportunity, 
  Proposal, 
  ServiceItem, 
  Inspection, 
  ExpertCase, 
  TechnicalDocument, 
  Task, 
  CalendarEventItem, 
  FinancialEntry, 
  CompanySettings, 
  ActivityLog,
  PipelineStage,
  ProposalStatus,
  ServiceStage
} from '../types';
import { useAuth } from './AuthContext';
import { createGoogleCalendarEvent, fetchGoogleCalendarEvents } from '../services/googleCalendarService';

interface DataContextType {
  clients: Client[];
  opportunities: Opportunity[];
  proposals: Proposal[];
  services: ServiceItem[];
  inspections: Inspection[];
  expertCases: ExpertCase[];
  documents: TechnicalDocument[];
  tasks: Task[];
  calendarEvents: CalendarEventItem[];
  financialEntries: FinancialEntry[];
  companySettings: CompanySettings;
  activityLogs: ActivityLog[];
  isLoading: boolean;
  
  // Clients
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Promise<string>;
  updateClient: (id: string, client: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;

  // Opportunities
  addOpportunity: (opp: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateOpportunityStage: (id: string, stage: PipelineStage) => Promise<void>;
  deleteOpportunity: (id: string) => Promise<void>;

  // Proposals
  addProposal: (proposal: Omit<Proposal, 'id' | 'code' | 'sequence' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateProposal: (id: string, proposal: Partial<Proposal>) => Promise<void>;
  approveProposal: (id: string) => Promise<void>;
  duplicateProposal: (id: string) => Promise<string>;
  convertProposalToService: (proposalId: string) => Promise<string>;

  // Services
  addService: (service: Omit<ServiceItem, 'id' | 'code' | 'createdAt'>) => Promise<string>;
  updateService: (id: string, data: Partial<ServiceItem>) => Promise<void>;
  updateServiceStage: (serviceId: string, stageId: string, status: 'pendente' | 'em_andamento' | 'concluido') => Promise<void>;

  // Inspections
  addInspection: (insp: Omit<Inspection, 'id' | 'createdAt'>) => Promise<string>;
  updateInspection: (id: string, data: Partial<Inspection>) => Promise<void>;

  // Expert Cases (Perícias)
  addExpertCase: (item: Omit<ExpertCase, 'id' | 'createdAt'>) => Promise<string>;
  updateExpertCase: (id: string, data: Partial<ExpertCase>) => Promise<void>;

  // Documents
  addDocument: (docItem: Omit<TechnicalDocument, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateDocumentStatus: (id: string, status: any) => Promise<void>;

  // Tasks
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<string>;
  updateTaskStatus: (id: string, status: any) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  // Financial
  addFinancialEntry: (entry: Omit<FinancialEntry, 'id' | 'createdAt'>) => Promise<string>;
  updateFinancialStatus: (id: string, status: any, paymentDate?: string) => Promise<void>;

  // Settings
  updateCompanySettings: (settings: Partial<CompanySettings>) => Promise<void>;

  // Google Calendar Sync
  syncWithGoogleCalendar: () => Promise<number>;
  logActivity: (action: string, entityType: string, entityId: string, details: string) => Promise<void>;
}

const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  corporateName: 'BERTACINI ENGENHARIA E DIAGNÓSTICO LTDA',
  tradeName: 'Bertacini Engenharia',
  cnpj: '48.123.456/0001-89',
  crea: 'CREA-SP 2459871',
  technicalResponsible: 'Eng. Luiz Felipe Bertacini',
  technicalResponsibleCrea: 'CREA-SP 5069874123',
  email: 'contato@bertaciniengenharia.com.br',
  phone: '(11) 3289-4500',
  address: 'Av. Paulista, 1754 - Conj. 1102 - Bela Vista',
  city: 'São Paulo',
  state: 'SP',
  cep: '01310-920',
  website: 'www.bertaciniengenharia.com.br',
};

// Seed sample data for Bertacini Engenharia if empty
const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli-1',
    name: 'Condomínio Edifício Grand Boulevard',
    type: 'condominio',
    document: '12.345.678/0001-90',
    email: 'administracao@grandboulevard.com.br',
    phone: '(11) 3890-1122',
    address: 'Rua Oscar Freire, 1420',
    city: 'São Paulo',
    state: 'SP',
    cep: '01426-001',
    contactPerson: 'Dr. Roberto Mendes (Síndico Profissional)',
    notes: 'Prédio residencial com 28 pavimentos, 15 anos de construção. Infiltrações no 2º subsolo e fissuras nas fachadas norte.',
    commercialResponsible: 'Mariana Silveira',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'cli-2',
    name: 'Advocacia Pinheiro & Associados',
    type: 'escritorio_advocacia',
    document: '23.456.789/0001-01',
    email: 'contato@pinheiroadv.com.br',
    phone: '(11) 3105-8800',
    address: 'Av. Brigadeiro Faria Lima, 2014 - 8º andar',
    city: 'São Paulo',
    state: 'SP',
    cep: '01451-000',
    contactPerson: 'Dra. Vanessa Pinheiro (Sócia)',
    notes: 'Assistência técnica pericial judicial e pareceres técnicos pré-processuais.',
    commercialResponsible: 'Eng. Luiz Felipe Bertacini',
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
  },
  {
    id: 'cli-3',
    name: 'Incorporadora e Construtora Horizon Alpha',
    type: 'construtora',
    document: '34.567.890/0001-12',
    email: 'engenharia@horizonalpha.com.br',
    phone: '(11) 4567-9000',
    address: 'Al. Rio Negro, 500 - Alphaville',
    city: 'Barueri',
    state: 'SP',
    cep: '06454-000',
    contactPerson: 'Eng. Marcelo Toledo (Diretor de Obras)',
    notes: 'Vistoria cautelar de vizinhança para lançamento de 2 torres comerciais.',
    commercialResponsible: 'Eng. Carlos Eduardo Bertacini',
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
];

const INITIAL_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp-1',
    clientId: 'cli-1',
    clientName: 'Condomínio Edifício Grand Boulevard',
    title: 'Laudo de Inspeção Predial de Segurança e Manutenção',
    stage: 'proposta_enviada',
    estimatedValue: 14800,
    serviceCategory: 'Engenharia Diagnóstica',
    responsible: 'Eng. Luiz Felipe Bertacini',
    notes: 'Aguardando assembleia de condomínio dia 15 para aprovação orçamentária.',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'opp-2',
    clientId: 'cli-3',
    clientName: 'Incorporadora e Construtora Horizon Alpha',
    title: 'Vistoria Cautelar de Vizinhança (42 imóveis lindeiros)',
    stage: 'em_negociacao',
    estimatedValue: 28500,
    serviceCategory: 'Vistorias Técnicas',
    responsible: 'Mariana Silveira',
    notes: 'Negociação sobre o parcelamento dos honorários em 3x.',
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'opp-3',
    clientId: 'cli-2',
    clientName: 'Advocacia Pinheiro & Associados',
    title: 'Parecer Técnico de Vícios Construtivos e Desaprumo',
    stage: 'aprovada',
    estimatedValue: 12000,
    serviceCategory: 'Perícias e Pareceres',
    responsible: 'Eng. Carlos Eduardo Bertacini',
    notes: 'Proposta aceita! Pronta para conversão em projeto e agendamento de vistoria.',
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
];

const INITIAL_PROPOSALS: Proposal[] = [
  {
    id: 'prop-1',
    code: 'PROP-2026-0041',
    sequence: 41,
    clientId: 'cli-1',
    clientName: 'Condomínio Edifício Grand Boulevard',
    opportunityId: 'opp-1',
    serviceCategory: 'Engenharia Diagnóstica',
    serviceType: 'Inspeção Predial Conforme NBR 16747',
    object: 'Realização de Inspeção Predial global para avaliação do estado de conservação, segurança e manutenção dos sistemas construtivos do Condomínio Grand Boulevard.',
    address: 'Rua Oscar Freire, 1420 - Cerqueira César, São Paulo/SP',
    characteristics: 'Torre única, 28 pavimentos tipo, 2 subsolos de garagem, área construída de 14.500 m².',
    scope: '1. Vistoria sensorial de todos os sistemas comuns;\n2. Análise de fachadas e elementos estruturais aparentes;\n3. Verificação de impermeabilização dos subsolos e cobertura;\n4. Auditoria documental e de planos de manutenção (NBR 5674);\n5. Classificação das anomalias quanto ao grau de risco (Crítico, Regular, Mínimo);',
    methodology: 'Inspeção predial Nível 2 conforme diretrizes do IBAPE/SP e ABNT NBR 16747:2020. Análise sensorial, testes não destrutivos com termografia e ensaios pontuais.',
    applicableStandards: 'ABNT NBR 16747, ABNT NBR 5674, ABNT NBR 15575 e Norma de Inspeção Predial Nacional do IBAPE.',
    deliverables: 'Laudo Técnico de Inspeção Predial completo em via digital (PDF assinado com certificado ICP-Brasil) contendo fichas de anomalias, relatório fotográfico com localização e Anotação de Responsabilidade Técnica (ART) registrada no CREA-SP.',
    limitations: 'Não estão inclusos ensaios destrutivos ou aberturas em elementos estruturais sem autorização prévia por escrito.',
    executionPeriod: '20 dias úteis a contar da vistoria in loco',
    validityPeriod: '20 dias',
    totalValue: 14800,
    paymentTerms: '50% de sinal na aprovação contratual e 50% na entrega da versão final do Laudo.',
    status: 'enviada',
    responsible: 'Eng. Luiz Felipe Bertacini',
    version: 1,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'prop-2',
    code: 'PROP-2026-0042',
    sequence: 42,
    clientId: 'cli-2',
    clientName: 'Advocacia Pinheiro & Associados',
    opportunityId: 'opp-3',
    serviceCategory: 'Perícias e Pareceres',
    serviceType: 'Parecer Técnico de Engenharia',
    object: 'Elaboração de parecer técnico circunstanciado sobre recalque diferencial e fissuras no imóvel situado na Rua dos Pinheiros.',
    address: 'Rua dos Pinheiros, 850 - Pinheiros, São Paulo/SP',
    characteristics: 'Edificação comercial de 3 pavimentos em alvenaria estrutural.',
    scope: 'Mapeamento de fissuras com fissurômetro acrílico, ensaio de prumo, análise do solo e projeto de fundações.',
    methodology: 'Investigação pericial conforme ABNT NBR 13752.',
    applicableStandards: 'ABNT NBR 13752, ABNT NBR 6118, ABNT NBR 6122.',
    deliverables: 'Parecer técnico fundamentado com quesitos preliminares respondidos e ART.',
    limitations: 'Depende de acesso às dependências dos imóveis vizinhos.',
    executionPeriod: '12 dias úteis',
    validityPeriod: '15 dias',
    totalValue: 12000,
    paymentTerms: '30% no aceite, 30% após a vistoria e 40% na entrega do laudo.',
    status: 'aprovada_cliente',
    responsible: 'Eng. Carlos Eduardo Bertacini',
    version: 1,
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: 'srv-1',
    code: 'SRV-2026-0018',
    proposalId: 'prop-2',
    clientId: 'cli-2',
    clientName: 'Advocacia Pinheiro & Associados',
    title: 'Parecer Técnico de Recalque e Fissuras - Pinheiros',
    serviceCategory: 'Perícias e Pareceres',
    serviceType: 'Parecer Técnico de Engenharia',
    object: 'Parecer técnico de engenharia diagnóstica sobre patologias estruturais e recalque.',
    address: 'Rua dos Pinheiros, 850 - Pinheiros, São Paulo/SP',
    technicalLead: 'Eng. Carlos Eduardo Bertacini',
    team: 'Eng. Rodrigo Alencar, Eng. Carlos Bertacini',
    startDate: '2026-11-03',
    expectedEndDate: '2026-11-20',
    contractedValue: 12000,
    currentStage: 'Agendamento e Diligência em Campo',
    status: 'em_andamento',
    stages: [
      { id: 'stg-1', name: 'Contratação e Abertura de ART', order: 1, responsible: 'Mariana Silveira', dueDate: '2026-11-04', status: 'concluido', completedAt: '2026-11-03' },
      { id: 'stg-2', name: 'Planejamento e Documentação Técnica', order: 2, responsible: 'Eng. Carlos Bertacini', dueDate: '2026-11-06', status: 'concluido', completedAt: '2026-11-05' },
      { id: 'stg-3', name: 'Agendamento e Diligência em Campo', order: 3, responsible: 'Eng. Rodrigo Alencar', dueDate: '2026-11-08', status: 'em_andamento' },
      { id: 'stg-4', name: 'Organização dos Registros e Ensaios', order: 4, responsible: 'Eng. Rodrigo Alencar', dueDate: '2026-11-12', status: 'pendente' },
      { id: 'stg-5', name: 'Elaboração do Parecer Técnico', order: 5, responsible: 'Eng. Carlos Bertacini', dueDate: '2026-11-16', status: 'pendente' },
      { id: 'stg-6', name: 'Revisão Técnica e Aprovação RT', order: 6, responsible: 'Eng. Luiz Felipe Bertacini', dueDate: '2026-11-18', status: 'pendente' },
      { id: 'stg-7', name: 'Entrega ao Cliente e Encerramento', order: 7, responsible: 'Mariana Silveira', dueDate: '2026-11-20', status: 'pendente' },
    ],
    notes: 'ART recolhida sob o nº 2802723026. Vistoria agendada para 08/11 às 09:30.',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
];

const INITIAL_INSPECTIONS: Inspection[] = [
  {
    id: 'insp-1',
    serviceId: 'srv-1',
    clientId: 'cli-2',
    clientName: 'Advocacia Pinheiro & Associados',
    type: 'Vistoria Técnica Diagnóstica',
    address: 'Rua dos Pinheiros, 850 - Pinheiros, São Paulo/SP',
    date: '2026-11-08',
    time: '09:30',
    responsible: 'Eng. Rodrigo Alencar',
    participants: 'Eng. Rodrigo Alencar, Dra. Vanessa Pinheiro, Síndico vizinho',
    status: 'agendada',
    objective: 'Mapeamento visual e geométrico de fissuras em alvenarias e vigas de transição.',
    scope: 'Vistoria nos pavimentos térreo, mezanino e subsolo. Aplicação de selos de vidro para monitoramento.',
    checklist: [
      { id: 'chk-1', system: 'Estruturas', checkItem: 'Identificar trincas ativas ou passivas com fissurômetro', status: 'pendente' },
      { id: 'chk-2', system: 'Fundações / Subsolo', checkItem: 'Verificar indícios de umidade ascendente e recalques em pilares', status: 'pendente' },
      { id: 'chk-3', system: 'Fachadas e Alvenarias', checkItem: 'Fotografar desaprumo e afastamentos entre juntas', status: 'pendente' },
    ],
    photos: [],
    googleCalendarEventId: 'evt-bertacini-insp-1',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

const INITIAL_EXPERT_CASES: ExpertCase[] = [
  {
    id: 'exp-1',
    caseNumber: '1023456-82.2025.8.26.0100',
    court: 'TJSP',
    branch: '34ª Vara Cível Central',
    district: 'Comarca da Capital - SP',
    judge: 'Dr. Fernando Antonio Maia',
    plaintiff: 'Condomínio Residencial Parque dos Pássaros',
    defendant: 'Construtora Metropolitana S/A',
    plaintiffLawyer: 'Dr. Márcio Queiroz (OAB/SP 142.990)',
    defendantLawyer: 'Dra. Helena Vaz (OAB/SP 205.114)',
    technicalAssistants: 'Eng. Paulo Miranda (Autor), Eng. Renata Gusmão (Ré)',
    questions: '1) Há infiltrações crônicas na laje de cobertura?\n2) As mantas asfálticas atendem à NBR 9575?\n3) O valor estimado de reparação e prazo.',
    appointmentDate: '2026-10-15',
    feeAcceptanceDate: '2026-10-28',
    fees: 18500,
    proceduralDeadline: '2026-11-25',
    inspectionDate: '2026-11-12',
    reportDeliveryDeadline: '2026-12-05',
    status: 'diligencia_agendada',
    notes: 'Honorários periciais já depositados em conta judicial. Diligência com intimação das partes agendada para 12/11 às 14h00.',
    createdAt: new Date(Date.now() - 18 * 86400000).toISOString(),
  },
];

const INITIAL_DOCUMENTS: TechnicalDocument[] = [
  {
    id: 'doc-1',
    title: 'Minuta do Laudo Técnico Pericial - Processo 1023456-82',
    type: 'laudo_pericial',
    serviceId: 'srv-1',
    clientId: 'cli-2',
    clientName: 'Advocacia Pinheiro & Associados',
    author: 'Eng. Luiz Felipe Bertacini',
    reviewer: 'Eng. Carlos Eduardo Bertacini',
    version: 1,
    status: 'elaboracao',
    content: 'Estrutura inicial do laudo pericial contendo histórico dos autos, descrição do imóvel periciado e metodologia conforme NBR 13752.',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

const INITIAL_TASKS: Task[] = [
  {
    id: 'tsk-1',
    title: 'Emitir e recolher ART do parecer Pinheiros',
    responsible: 'Mariana Silveira',
    priority: 'alta',
    dueDate: '2026-11-04',
    status: 'concluida',
    category: 'Administrativo',
    clientId: 'cli-2',
    clientName: 'Advocacia Pinheiro & Associados',
    serviceId: 'srv-1',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'tsk-2',
    title: 'Preparar termo de diligência e peticionar data no processo 1023456-82',
    responsible: 'Eng. Luiz Felipe Bertacini',
    priority: 'urgente',
    dueDate: '2026-11-05',
    status: 'em_andamento',
    category: 'Perícia Judicial',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'tsk-3',
    title: 'Calibrar fissurômetros e carregar termovisor para vistoria de 08/11',
    responsible: 'Eng. Rodrigo Alencar',
    priority: 'media',
    dueDate: '2026-11-07',
    status: 'pendente',
    category: 'Equipamentos e Campo',
    serviceId: 'srv-1',
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_CALENDAR_EVENTS: CalendarEventItem[] = [
  {
    id: 'cal-1',
    title: 'Vistoria Técnica - Recalque Pinheiros',
    type: 'Vistoria Técnica',
    clientId: 'cli-2',
    clientName: 'Advocacia Pinheiro & Associados',
    responsible: 'Eng. Rodrigo Alencar',
    startDate: '2026-11-08T09:30:00-03:00',
    endDate: '2026-11-08T12:00:00-03:00',
    location: 'Rua dos Pinheiros, 850 - SP',
    description: 'Vistoria técnica diagnóstica em conjunto com assistente técnico do cliente.',
    googleCalendarEventId: 'evt-bertacini-1',
    status: 'confirmado',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cal-2',
    title: 'Diligência Pericial Judicial - 34ª Vara Cível',
    type: 'Perícia Judicial',
    responsible: 'Eng. Luiz Felipe Bertacini',
    startDate: '2026-11-12T14:00:00-03:00',
    endDate: '2026-11-12T17:00:00-03:00',
    location: 'Condomínio Residencial Parque dos Pássaros',
    description: 'Diligência pericial com presença dos assistentes técnicos e partes.',
    googleCalendarEventId: 'evt-bertacini-2',
    status: 'confirmado',
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_FINANCIAL_ENTRIES: FinancialEntry[] = [
  {
    id: 'fin-1',
    type: 'receita',
    category: 'Honorários Técnicos',
    description: 'Sinal 30% - Parecer Técnico Recalque Pinheiros',
    value: 3600,
    dueDate: '2026-11-05',
    paymentDate: '2026-11-03',
    paymentMethod: 'PIX',
    status: 'pago',
    clientId: 'cli-2',
    clientName: 'Advocacia Pinheiro & Associados',
    serviceId: 'srv-1',
    proposalId: 'prop-2',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'fin-2',
    type: 'receita',
    category: 'Honorários Técnicos',
    description: '2ª Parcela 30% - Pós Vistoria Parecer Pinheiros',
    value: 3600,
    dueDate: '2026-11-12',
    status: 'a_vencer',
    clientId: 'cli-2',
    clientName: 'Advocacia Pinheiro & Associados',
    serviceId: 'srv-1',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'fin-3',
    type: 'receita',
    category: 'Honorários Periciais',
    description: 'Depósito Judicial Honorários Perícia - Proc. 1023456-82',
    value: 18500,
    dueDate: '2026-10-28',
    paymentDate: '2026-10-28',
    paymentMethod: 'Depósito Judicial',
    status: 'pago',
    description_notes: 'Valor garantido em conta judicial do TJSP',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  } as any,
  {
    id: 'fin-4',
    type: 'despesa',
    category: 'Taxas e CREA',
    description: 'Taxa de ART de Desempenho de Cargo e Parecer',
    value: 96.50,
    dueDate: '2026-11-04',
    paymentDate: '2026-11-03',
    paymentMethod: 'Boleto CREA-SP',
    status: 'pago',
    serviceId: 'srv-1',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'fin-5',
    type: 'despesa',
    category: 'Deslocamento e Combustível',
    description: 'Combustível e estacionamento diligências capital',
    value: 280,
    dueDate: '2026-11-10',
    status: 'a_vencer',
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_LOGS: ActivityLog[] = [
  {
    id: 'log-1',
    userId: 'user-admin',
    userName: 'Eng. Luiz Felipe Bertacini',
    action: 'Inicialização da Plataforma',
    entityType: 'Sistema',
    entityId: 'sys-0',
    details: 'Configurações institucionais e estrutura de engenharia diagnóstica carregadas com sucesso.',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: 'log-2',
    userId: 'user-operacional',
    userName: 'Mariana Silveira',
    action: 'Proposta Criada',
    entityType: 'Proposta',
    entityId: 'prop-1',
    details: 'Elaborada proposta PROP-2026-0041 para Condomínio Edifício Grand Boulevard.',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
];

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // States with initial localStorage / Seed fallback
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('bertacini_clients');
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [opportunities, setOpportunities] = useState<Opportunity[]>(() => {
    const saved = localStorage.getItem('bertacini_opportunities');
    return saved ? JSON.parse(saved) : INITIAL_OPPORTUNITIES;
  });

  const [proposals, setProposals] = useState<Proposal[]>(() => {
    const saved = localStorage.getItem('bertacini_proposals');
    return saved ? JSON.parse(saved) : INITIAL_PROPOSALS;
  });

  const [services, setServices] = useState<ServiceItem[]>(() => {
    const saved = localStorage.getItem('bertacini_services');
    return saved ? JSON.parse(saved) : INITIAL_SERVICES;
  });

  const [inspections, setInspections] = useState<Inspection[]>(() => {
    const saved = localStorage.getItem('bertacini_inspections');
    return saved ? JSON.parse(saved) : INITIAL_INSPECTIONS;
  });

  const [expertCases, setExpertCases] = useState<ExpertCase[]>(() => {
    const saved = localStorage.getItem('bertacini_expert_cases');
    return saved ? JSON.parse(saved) : INITIAL_EXPERT_CASES;
  });

  const [documents, setDocuments] = useState<TechnicalDocument[]>(() => {
    const saved = localStorage.getItem('bertacini_documents');
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('bertacini_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [calendarEvents, setCalendarEvents] = useState<CalendarEventItem[]>(() => {
    const saved = localStorage.getItem('bertacini_calendar_events');
    return saved ? JSON.parse(saved) : INITIAL_CALENDAR_EVENTS;
  });

  const [financialEntries, setFinancialEntries] = useState<FinancialEntry[]>(() => {
    const saved = localStorage.getItem('bertacini_financial');
    return saved ? JSON.parse(saved) : INITIAL_FINANCIAL_ENTRIES;
  });

  const [companySettings, setCompanySettings] = useState<CompanySettings>(() => {
    const saved = localStorage.getItem('bertacini_company_settings');
    return saved ? JSON.parse(saved) : DEFAULT_COMPANY_SETTINGS;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('bertacini_logs');
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  // Local storage persistence helper
  const persist = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // Log Activity Helper
  const logActivity = async (action: string, entityType: string, entityId: string, details: string) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId: currentUser.uid,
      userName: currentUser.name,
      action,
      entityType,
      entityId,
      details,
      timestamp: new Date().toISOString(),
    };
    const updated = [newLog, ...activityLogs].slice(0, 100);
    setActivityLogs(updated);
    persist('bertacini_logs', updated);

    // Try firestore
    try {
      await setDoc(doc(db, 'activity_logs', newLog.id), newLog);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, `activity_logs/${newLog.id}`);
    }
  };

  // CLIENTS
  const addClient = async (clientData: Omit<Client, 'id' | 'createdAt'>): Promise<string> => {
    const id = `cli-${Date.now()}`;
    const newClient: Client = {
      ...clientData,
      id,
      createdAt: new Date().toISOString(),
    };
    const updated = [newClient, ...clients];
    setClients(updated);
    persist('bertacini_clients', updated);
    await logActivity('Cliente Cadastrado', 'Cliente', id, `Cadastrado cliente: ${newClient.name} (${newClient.type})`);

    try {
      await setDoc(doc(db, 'clients', id), newClient);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `clients/${id}`);
    }
    return id;
  };

  const updateClient = async (id: string, clientData: Partial<Client>) => {
    const updated = clients.map(c => c.id === id ? { ...c, ...clientData } : c);
    setClients(updated);
    persist('bertacini_clients', updated);
    await logActivity('Cliente Atualizado', 'Cliente', id, `Atualização de dados cadastrais`);

    try {
      await updateDoc(doc(db, 'clients', id), clientData);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `clients/${id}`);
    }
  };

  const deleteClient = async (id: string) => {
    const client = clients.find(c => c.id === id);
    const updated = clients.filter(c => c.id !== id);
    setClients(updated);
    persist('bertacini_clients', updated);
    await logActivity('Cliente Excluído', 'Cliente', id, `Removido cliente: ${client?.name || id}`);

    try {
      await deleteDoc(doc(db, 'clients', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `clients/${id}`);
    }
  };

  // OPPORTUNITIES
  const addOpportunity = async (oppData: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const id = `opp-${Date.now()}`;
    const newOpp: Opportunity = {
      ...oppData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newOpp, ...opportunities];
    setOpportunities(updated);
    persist('bertacini_opportunities', updated);
    await logActivity('Oportunidade Criada', 'Oportunidade', id, `Nova oportunidade: ${newOpp.title} (${newOpp.stage})`);

    try {
      await setDoc(doc(db, 'opportunities', id), newOpp);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `opportunities/${id}`);
    }
    return id;
  };

  const updateOpportunityStage = async (id: string, stage: PipelineStage) => {
    const opp = opportunities.find(o => o.id === id);
    const updated = opportunities.map(o => o.id === id ? { ...o, stage, updatedAt: new Date().toISOString() } : o);
    setOpportunities(updated);
    persist('bertacini_opportunities', updated);
    await logActivity('Etapa de Oportunidade Atualizada', 'Oportunidade', id, `Oportunidade ${opp?.title || id} movida para ${stage}`);

    try {
      await updateDoc(doc(db, 'opportunities', id), { stage, updatedAt: new Date().toISOString() });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `opportunities/${id}`);
    }
  };

  const deleteOpportunity = async (id: string) => {
    const opp = opportunities.find(o => o.id === id);
    const updated = opportunities.filter(o => o.id !== id);
    setOpportunities(updated);
    persist('bertacini_opportunities', updated);
    await logActivity('Oportunidade Removida', 'Oportunidade', id, `Removida oportunidade: ${opp?.title || id}`);

    try {
      await deleteDoc(doc(db, 'opportunities', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `opportunities/${id}`);
    }
  };

  // PROPOSALS
  const addProposal = async (proposalData: Omit<Proposal, 'id' | 'code' | 'sequence' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const sequence = proposals.length + 42;
    const code = `PROP-2026-${String(sequence).padStart(4, '0')}`;
    const id = `prop-${Date.now()}`;
    const newProposal: Proposal = {
      ...proposalData,
      id,
      code,
      sequence,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newProposal, ...proposals];
    setProposals(updated);
    persist('bertacini_proposals', updated);
    await logActivity('Proposta Elaborada', 'Proposta', id, `Gerada proposta técnica ${code} para ${newProposal.clientName}`);

    try {
      await setDoc(doc(db, 'proposals', id), newProposal);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `proposals/${id}`);
    }
    return id;
  };

  const updateProposal = async (id: string, data: Partial<Proposal>) => {
    const updated = proposals.map(p => p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p);
    setProposals(updated);
    persist('bertacini_proposals', updated);
    await logActivity('Proposta Atualizada', 'Proposta', id, `Atualização de proposta ${id}`);

    try {
      await updateDoc(doc(db, 'proposals', id), { ...data, updatedAt: new Date().toISOString() });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `proposals/${id}`);
    }
  };

  const approveProposal = async (id: string) => {
    const prop = proposals.find(p => p.id === id);
    if (!prop) return;
    await updateProposal(id, { status: 'aprovada_cliente' });
    await logActivity('Proposta Aprovada pelo Cliente', 'Proposta', id, `Proposta ${prop.code} aprovada com sucesso! Valor: R$ ${prop.totalValue}`);
  };

  const duplicateProposal = async (id: string): Promise<string> => {
    const source = proposals.find(p => p.id === id);
    if (!source) throw new Error('Proposta não encontrada');
    const { id: _oldId, code: _oldCode, sequence: _oldSeq, createdAt: _c, updatedAt: _u, ...rest } = source;
    return await addProposal({
      ...rest,
      object: `${source.object} (Cópia)`,
      status: 'elaboracao',
      version: 1,
    });
  };

  // AUTOMATION: Convert approved proposal into active service with stages & initial financial entry
  const convertProposalToService = async (proposalId: string): Promise<string> => {
    const prop = proposals.find(p => p.id === proposalId);
    if (!prop) throw new Error('Proposta não encontrada');

    const srvSeq = services.length + 19;
    const code = `SRV-2026-${String(srvSeq).padStart(4, '0')}`;
    const serviceId = `srv-${Date.now()}`;

    const defaultStages: ServiceStage[] = [
      { id: `stg-${Date.now()}-1`, name: 'Contratação e Emissão de ART', order: 1, responsible: prop.responsible, dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0], status: 'em_andamento' },
      { id: `stg-${Date.now()}-2`, name: 'Planejamento e Documentação Técnica', order: 2, responsible: prop.responsible, dueDate: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0], status: 'pendente' },
      { id: `stg-${Date.now()}-3`, name: 'Agendamento e Diligência em Campo', order: 3, responsible: prop.responsible, dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0], status: 'pendente' },
      { id: `stg-${Date.now()}-4`, name: 'Organização dos Registros e Ensaios', order: 4, responsible: prop.responsible, dueDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0], status: 'pendente' },
      { id: `stg-${Date.now()}-5`, name: 'Elaboração da Minuta Técnica', order: 5, responsible: prop.responsible, dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0], status: 'pendente' },
      { id: `stg-${Date.now()}-6`, name: 'Revisão Técnica e Validação RT', order: 6, responsible: 'Eng. Luiz Felipe Bertacini', dueDate: new Date(Date.now() + 17 * 86400000).toISOString().split('T')[0], status: 'pendente' },
      { id: `stg-${Date.now()}-7`, name: 'Entrega do Laudo e ART ao Cliente', order: 7, responsible: prop.responsible, dueDate: new Date(Date.now() + 20 * 86400000).toISOString().split('T')[0], status: 'pendente' },
    ];

    const newService: ServiceItem = {
      id: serviceId,
      code,
      proposalId: prop.id,
      clientId: prop.clientId,
      clientName: prop.clientName,
      title: `${prop.serviceType} - ${prop.clientName}`,
      serviceCategory: prop.serviceCategory,
      serviceType: prop.serviceType,
      object: prop.object,
      address: prop.address,
      technicalLead: prop.responsible,
      team: `${prop.responsible}, Mariana Silveira`,
      startDate: new Date().toISOString().split('T')[0],
      expectedEndDate: new Date(Date.now() + 20 * 86400000).toISOString().split('T')[0],
      contractedValue: prop.totalValue,
      currentStage: 'Contratação e Emissão de ART',
      status: 'planejamento',
      stages: defaultStages,
      createdAt: new Date().toISOString(),
    };

    const updatedServices = [newService, ...services];
    setServices(updatedServices);
    persist('bertacini_services', updatedServices);

    // Create automatic task
    await addTask({
      title: `Providenciar ART e documentação inicial para ${code}`,
      responsible: prop.responsible,
      priority: 'alta',
      dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      status: 'pendente',
      category: 'Técnico / Administrativo',
      clientId: prop.clientId,
      clientName: prop.clientName,
      serviceId,
    });

    // Create automatic financial receivable entry (50% signal)
    await addFinancialEntry({
      type: 'receita',
      category: 'Honorários Técnicos',
      description: `1ª Parcela (Sinal) - Serviço ${code} (${prop.clientName})`,
      value: prop.totalValue * 0.5,
      dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      status: 'a_vencer',
      clientId: prop.clientId,
      clientName: prop.clientName,
      serviceId,
      proposalId: prop.id,
    });

    await updateProposal(proposalId, { status: 'aprovada_cliente' });
    await logActivity('Serviço Criado Automaticamente', 'Serviço', serviceId, `Proposta ${prop.code} convertida no serviço operacional ${code}`);

    try {
      await setDoc(doc(db, 'services', serviceId), newService);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `services/${serviceId}`);
    }

    return serviceId;
  };

  // SERVICES
  const addService = async (serviceData: Omit<ServiceItem, 'id' | 'code' | 'createdAt'>): Promise<string> => {
    const srvSeq = services.length + 20;
    const code = `SRV-2026-${String(srvSeq).padStart(4, '0')}`;
    const id = `srv-${Date.now()}`;
    const newService: ServiceItem = {
      ...serviceData,
      id,
      code,
      createdAt: new Date().toISOString(),
    };
    const updated = [newService, ...services];
    setServices(updated);
    persist('bertacini_services', updated);
    await logActivity('Serviço Criado', 'Serviço', id, `Criado serviço ${code}: ${newService.title}`);

    try {
      await setDoc(doc(db, 'services', id), newService);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `services/${id}`);
    }
    return id;
  };

  const updateService = async (id: string, data: Partial<ServiceItem>) => {
    const updated = services.map(s => s.id === id ? { ...s, ...data } : s);
    setServices(updated);
    persist('bertacini_services', updated);
    await logActivity('Serviço Atualizado', 'Serviço', id, `Atualização do serviço ${id}`);

    try {
      await updateDoc(doc(db, 'services', id), data);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `services/${id}`);
    }
  };

  const updateServiceStage = async (serviceId: string, stageId: string, status: 'pendente' | 'em_andamento' | 'concluido') => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    const updatedStages = service.stages.map(st => {
      if (st.id === stageId) {
        return {
          ...st,
          status,
          completedAt: status === 'concluido' ? new Date().toISOString() : undefined,
        };
      }
      return st;
    });

    const activeStage = updatedStages.find(st => st.status === 'em_andamento') || updatedStages.find(st => st.status === 'pendente');
    const allDone = updatedStages.every(st => st.status === 'concluido');

    await updateService(serviceId, {
      stages: updatedStages,
      currentStage: activeStage?.name || 'Concluído',
      status: allDone ? 'concluido' : service.status,
    });
  };

  // INSPECTIONS
  const addInspection = async (inspData: Omit<Inspection, 'id' | 'createdAt'>): Promise<string> => {
    const id = `insp-${Date.now()}`;
    let googleCalendarEventId = undefined;

    // Try Google Calendar sync if token is available
    const accessToken = getCalendarAccessToken();
    if (accessToken) {
      try {
        const startDateTime = `${inspData.date}T${inspData.time}:00-03:00`;
        const endDateTime = `${inspData.date}T${Number(inspData.time.split(':')[0]) + 2}:00:00-03:00`;
        const gEvent = await createGoogleCalendarEvent(accessToken, {
          summary: `[VISTORIA] ${inspData.type} - ${inspData.clientName}`,
          location: inspData.address,
          description: `Objetivo: ${inspData.objective}\nResponsável: ${inspData.responsible}\nBertacini Engenharia`,
          start: { dateTime: startDateTime },
          end: { dateTime: endDateTime },
        });
        googleCalendarEventId = gEvent.id;
      } catch (err) {
        console.warn('Google Calendar sync skipped for inspection:', err);
      }
    }

    const newInsp: Inspection = {
      ...inspData,
      id,
      googleCalendarEventId,
      createdAt: new Date().toISOString(),
    };
    const updated = [newInsp, ...inspections];
    setInspections(updated);
    persist('bertacini_inspections', updated);

    // Also register on calendar events
    const newCalEvent: CalendarEventItem = {
      id: `cal-insp-${id}`,
      title: `${newInsp.type} - ${newInsp.clientName}`,
      type: 'Vistoria Predial',
      clientId: newInsp.clientId,
      clientName: newInsp.clientName,
      serviceId: newInsp.serviceId,
      responsible: newInsp.responsible,
      startDate: `${newInsp.date}T${newInsp.time}:00-03:00`,
      endDate: `${newInsp.date}T${Number(newInsp.time.split(':')[0]) + 2}:00:00-03:00`,
      location: newInsp.address,
      description: newInsp.objective,
      googleCalendarEventId,
      createdAt: new Date().toISOString(),
    };
    const updatedCal = [newCalEvent, ...calendarEvents];
    setCalendarEvents(updatedCal);
    persist('bertacini_calendar_events', updatedCal);

    await logActivity('Vistoria Agendada', 'Vistoria', id, `Agendada vistoria de campo em ${newInsp.date} às ${newInsp.time} para ${newInsp.clientName}`);

    try {
      await setDoc(doc(db, 'inspections', id), newInsp);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `inspections/${id}`);
    }
    return id;
  };

  const updateInspection = async (id: string, data: Partial<Inspection>) => {
    const updated = inspections.map(i => i.id === id ? { ...i, ...data } : i);
    setInspections(updated);
    persist('bertacini_inspections', updated);
    await logActivity('Vistoria Atualizada', 'Vistoria', id, `Atualização de vistoria técnica ${id}`);

    try {
      await updateDoc(doc(db, 'inspections', id), data);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `inspections/${id}`);
    }
  };

  // EXPERT CASES
  const addExpertCase = async (itemData: Omit<ExpertCase, 'id' | 'createdAt'>): Promise<string> => {
    const id = `exp-${Date.now()}`;
    const newCase: ExpertCase = {
      ...itemData,
      id,
      createdAt: new Date().toISOString(),
    };
    const updated = [newCase, ...expertCases];
    setExpertCases(updated);
    persist('bertacini_expert_cases', updated);
    await logActivity('Perícia Judicial Cadastrada', 'Perícia', id, `Cadastrado processo nº ${newCase.caseNumber} - ${newCase.court}`);

    try {
      await setDoc(doc(db, 'expert_cases', id), newCase);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `expert_cases/${id}`);
    }
    return id;
  };

  const updateExpertCase = async (id: string, data: Partial<ExpertCase>) => {
    const updated = expertCases.map(c => c.id === id ? { ...c, ...data } : c);
    setExpertCases(updated);
    persist('bertacini_expert_cases', updated);
    await logActivity('Perícia Atualizada', 'Perícia', id, `Atualização do processo pericial ${id}`);

    try {
      await updateDoc(doc(db, 'expert_cases', id), data);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `expert_cases/${id}`);
    }
  };

  // DOCUMENTS
  const addDocument = async (docData: Omit<TechnicalDocument, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    const id = `doc-${Date.now()}`;
    const newDocItem: TechnicalDocument = {
      ...docData,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newDocItem, ...documents];
    setDocuments(updated);
    persist('bertacini_documents', updated);
    await logActivity('Documento Técnico Registrado', 'Documento', id, `Documento ${newDocItem.title} registrado`);

    try {
      await setDoc(doc(db, 'technical_documents', id), newDocItem);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `technical_documents/${id}`);
    }
    return id;
  };

  const updateDocumentStatus = async (id: string, status: any) => {
    const updated = documents.map(d => d.id === id ? { ...d, status, updatedAt: new Date().toISOString() } : d);
    setDocuments(updated);
    persist('bertacini_documents', updated);
    await logActivity('Status de Documento Atualizado', 'Documento', id, `Status alterado para ${status}`);

    try {
      await updateDoc(doc(db, 'technical_documents', id), { status, updatedAt: new Date().toISOString() });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `technical_documents/${id}`);
    }
  };

  // TASKS
  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt'>): Promise<string> => {
    const id = `tsk-${Date.now()}`;
    const newTask: Task = {
      ...taskData,
      id,
      createdAt: new Date().toISOString(),
    };
    const updated = [newTask, ...tasks];
    setTasks(updated);
    persist('bertacini_tasks', updated);
    await logActivity('Tarefa Criada', 'Tarefa', id, `Criada tarefa: ${newTask.title}`);

    try {
      await setDoc(doc(db, 'tasks', id), newTask);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `tasks/${id}`);
    }
    return id;
  };

  const updateTaskStatus = async (id: string, status: any) => {
    const updated = tasks.map(t => t.id === id ? { ...t, status } : t);
    setTasks(updated);
    persist('bertacini_tasks', updated);
    await logActivity('Status de Tarefa Atualizado', 'Tarefa', id, `Status da tarefa alterado para ${status}`);

    try {
      await updateDoc(doc(db, 'tasks', id), { status });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `tasks/${id}`);
    }
  };

  const deleteTask = async (id: string) => {
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated);
    persist('bertacini_tasks', updated);
    await logActivity('Tarefa Removida', 'Tarefa', id, `Tarefa excluída`);

    try {
      await deleteDoc(doc(db, 'tasks', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `tasks/${id}`);
    }
  };

  // FINANCIAL
  const addFinancialEntry = async (entryData: Omit<FinancialEntry, 'id' | 'createdAt'>): Promise<string> => {
    const id = `fin-${Date.now()}`;
    const newEntry: FinancialEntry = {
      ...entryData,
      id,
      createdAt: new Date().toISOString(),
    };
    const updated = [newEntry, ...financialEntries];
    setFinancialEntries(updated);
    persist('bertacini_financial', updated);
    await logActivity('Lançamento Financeiro', 'Financeiro', id, `Lançamento de ${newEntry.type}: ${newEntry.description} (R$ ${newEntry.value})`);

    try {
      await setDoc(doc(db, 'financial_entries', id), newEntry);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `financial_entries/${id}`);
    }
    return id;
  };

  const updateFinancialStatus = async (id: string, status: any, paymentDate?: string) => {
    const updated = financialEntries.map(f => f.id === id ? { 
      ...f, 
      status, 
      paymentDate: paymentDate || (status === 'pago' ? new Date().toISOString().split('T')[0] : f.paymentDate) 
    } : f);
    setFinancialEntries(updated);
    persist('bertacini_financial', updated);
    await logActivity('Status Financeiro Atualizado', 'Financeiro', id, `Status financeiro alterado para ${status}`);

    try {
      await updateDoc(doc(db, 'financial_entries', id), { 
        status, 
        paymentDate: paymentDate || (status === 'pago' ? new Date().toISOString().split('T')[0] : null) 
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `financial_entries/${id}`);
    }
  };

  // SETTINGS
  const updateCompanySettings = async (settingsData: Partial<CompanySettings>) => {
    const updated = { ...companySettings, ...settingsData };
    setCompanySettings(updated);
    persist('bertacini_company_settings', updated);
    await logActivity('Configurações Institucionais Atualizadas', 'Configuração', 'main', `Dados da Bertacini Engenharia atualizados`);

    try {
      await setDoc(doc(db, 'company_settings', 'main'), updated);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `company_settings/main`);
    }
  };

  // GOOGLE CALENDAR SYNC
  const syncWithGoogleCalendar = async (): Promise<number> => {
    const token = getCalendarAccessToken();
    if (!token) {
      throw new Error('Conta Google não conectada. Conecte sua conta nas configurações ou no botão Conectar Google Calendar.');
    }

    const events = await fetchGoogleCalendarEvents(token);
    let importedCount = 0;

    for (const gEvt of events) {
      if (!gEvt.start?.dateTime && !gEvt.start?.date) continue;
      const start = gEvt.start.dateTime || `${gEvt.start.date}T09:00:00-03:00`;
      const end = gEvt.end?.dateTime || `${gEvt.end?.date || gEvt.start.date}T10:00:00-03:00`;

      const exists = calendarEvents.some(e => e.googleCalendarEventId === gEvt.id);
      if (!exists) {
        const item: CalendarEventItem = {
          id: `cal-g-${gEvt.id}`,
          title: gEvt.summary || 'Compromisso Google Calendar',
          type: 'Google Calendar Externo',
          responsible: currentUser.name,
          startDate: start,
          endDate: end,
          location: gEvt.location || '',
          description: gEvt.description || '',
          googleCalendarEventId: gEvt.id,
          createdAt: new Date().toISOString(),
        };
        calendarEvents.push(item);
        importedCount++;
      }
    }

    if (importedCount > 0) {
      const updated = [...calendarEvents];
      setCalendarEvents(updated);
      persist('bertacini_calendar_events', updated);
    }

    await logActivity('Sincronização com Google Calendar', 'Agenda', 'calendar-sync', `Sincronizados ${events.length} eventos do Google Calendar.`);
    return importedCount;
  };

  return (
    <DataContext.Provider
      value={{
        clients,
        opportunities,
        proposals,
        services,
        inspections,
        expertCases,
        documents,
        tasks,
        calendarEvents,
        financialEntries,
        companySettings,
        activityLogs,
        isLoading,
        addClient,
        updateClient,
        deleteClient,
        addOpportunity,
        updateOpportunityStage,
        deleteOpportunity,
        addProposal,
        updateProposal,
        approveProposal,
        duplicateProposal,
        convertProposalToService,
        addService,
        updateService,
        updateServiceStage,
        addInspection,
        updateInspection,
        addExpertCase,
        updateExpertCase,
        addDocument,
        updateDocumentStatus,
        addTask,
        updateTaskStatus,
        deleteTask,
        addFinancialEntry,
        updateFinancialStatus,
        updateCompanySettings,
        syncWithGoogleCalendar,
        logActivity,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
