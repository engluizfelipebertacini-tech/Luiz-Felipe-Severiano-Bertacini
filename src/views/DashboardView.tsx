import React from 'react';
import { 
  Briefcase, 
  FileText, 
  Calendar, 
  DollarSign, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Sparkles, 
  ArrowUpRight,
  TrendingUp,
  MapPin,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

interface DashboardViewProps {
  onNavigate: (view: string) => void;
  onOpenNewProposal: () => void;
  onOpenNewInspection: () => void;
  onOpenNewClient: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenNewProposal,
  onOpenNewInspection,
  onOpenNewClient,
}) => {
  const { 
    services, 
    proposals, 
    inspections, 
    tasks, 
    financialEntries, 
    expertCases, 
    calendarEvents 
  } = useData();
  const { currentUser, canAccessFinancials } = useAuth();

  // Financial metrics
  const totalReceitasRecebidas = financialEntries
    .filter(f => f.type === 'receita' && f.status === 'pago')
    .reduce((acc, curr) => acc + curr.value, 0);

  const totalReceitasPendentes = financialEntries
    .filter(f => f.type === 'receita' && (f.status === 'a_vencer' || f.status === 'previsto'))
    .reduce((acc, curr) => acc + curr.value, 0);

  const activeServices = services.filter(s => s.status === 'em_andamento' || s.status === 'planejamento');
  const pendingProposals = proposals.filter(p => p.status === 'elaboracao' || p.status === 'revisao' || p.status === 'enviada');
  const approvedProposalsThisMonth = proposals.filter(p => p.status === 'aprovada_cliente');
  const upcomingInspections = inspections.filter(i => i.status === 'agendada');
  const pendingTasks = tasks.filter(t => t.status === 'pendente' || t.status === 'em_andamento');
  const overdueTasks = tasks.filter(t => t.status === 'atrasada' || (t.dueDate < new Date().toISOString().split('T')[0] && t.status !== 'concluida'));

  return (
    <div className="space-y-6">
      {/* Welcome Banner & Quick Actions */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-sky-950 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Bertacini Engenharia | Gestão Integrada</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-white">
            Olá, {currentUser.name.split(' ')[0]}!
          </h1>
          <p className="text-slate-300 text-xs md:text-sm mt-0.5">
            Acompanhe vistorias, propostas comerciais, perícias judiciais e prazos operacionais da empresa.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenNewProposal}
            className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" /> Nova Proposta
          </button>
          <button
            onClick={onOpenNewInspection}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 text-xs font-semibold px-3.5 py-2 rounded-lg transition-all"
          >
            <Calendar className="w-4 h-4 text-sky-400" /> Agendar Vistoria
          </button>
          <button
            onClick={() => onNavigate('assistant')}
            className="flex items-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold px-3.5 py-2 rounded-lg transition-all"
          >
            <Sparkles className="w-4 h-4" /> Assistente IA
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div 
          onClick={() => onNavigate('services')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-sky-300 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Serviços Ativos</span>
            <Briefcase className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{activeServices.length}</div>
          <span className="text-[10px] text-slate-400">Em andamento / campo</span>
        </div>

        <div 
          onClick={() => onNavigate('proposals')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-amber-300 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Propostas</span>
            <FileText className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{pendingProposals.length}</div>
          <span className="text-[10px] text-amber-600 font-medium">{approvedProposalsThisMonth.length} aprovadas</span>
        </div>

        <div 
          onClick={() => onNavigate('inspections')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-emerald-300 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Vistorias</span>
            <Calendar className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{upcomingInspections.length}</div>
          <span className="text-[10px] text-slate-400">Agendadas na semana</span>
        </div>

        <div 
          onClick={() => onNavigate('expert_cases')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-indigo-300 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Perícias</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{expertCases.length}</div>
          <span className="text-[10px] text-slate-400">Processos ativos TJ</span>
        </div>

        <div 
          onClick={() => onNavigate('tasks')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-rose-300 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider">Tarefas</span>
            <AlertTriangle className={`w-4 h-4 ${overdueTasks.length > 0 ? 'text-rose-600' : 'text-slate-400'}`} />
          </div>
          <div className="text-2xl font-bold text-slate-900">{pendingTasks.length}</div>
          <span className={`text-[10px] font-medium ${overdueTasks.length > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
            {overdueTasks.length} atrasadas
          </span>
        </div>

        {canAccessFinancials && (
          <div 
            onClick={() => onNavigate('financial')}
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-emerald-300 cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-[11px] font-medium uppercase tracking-wider">Recebido</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-lg font-bold text-emerald-700 truncate">
              {totalReceitasRecebidas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
            </div>
            <span className="text-[10px] text-slate-400 truncate block">
              + {totalReceitasPendentes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })} a receber
            </span>
          </div>
        )}
      </div>

      {/* Main Grid: Upcoming Agenda + Active Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Agenda Resumida & Serviços Próximos */}
        <div className="lg:col-span-2 space-y-6">
          {/* Agenda dos Próximos Compromissos */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-600" />
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                  Próximos Compromissos & Vistorias
                </h2>
              </div>
              <button
                onClick={() => onNavigate('agenda')}
                className="text-xs text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1"
              >
                Ver Agenda Completa <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {calendarEvents.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">Nenhum compromisso agendado para os próximos dias.</p>
            ) : (
              <div className="space-y-3">
                {calendarEvents.slice(0, 4).map((evt) => (
                  <div
                    key={evt.id}
                    className="flex items-start justify-between p-3 rounded-lg border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-900">{evt.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-medium">
                          {evt.type}
                        </span>
                      </div>
                      {evt.location && (
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          {evt.location}
                        </p>
                      )}
                      <p className="text-[11px] text-slate-400">
                        Responsável: <span className="text-slate-600 font-medium">{evt.responsible}</span>
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-semibold text-slate-800 block">
                        {new Date(evt.startDate).toLocaleDateString('pt-BR')}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {new Date(evt.startDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Serviços em Andamento e Prazos */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-sky-600" />
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                  Serviços e Projetos em Andamento
                </h2>
              </div>
              <button
                onClick={() => onNavigate('services')}
                className="text-xs text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1"
              >
                Ver Todos <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {services.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">Nenhum serviço em execução no momento.</p>
            ) : (
              <div className="space-y-3">
                {services.slice(0, 3).map((srv) => (
                  <div
                    key={srv.id}
                    className="p-3.5 rounded-lg border border-slate-100 hover:border-slate-200 bg-white space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">{srv.code} — {srv.title}</span>
                        <span className="text-[11px] text-slate-500">{srv.clientName}</span>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium border border-blue-100">
                        {srv.status === 'em_andamento' ? 'Em Andamento' : 'Planejamento'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-50">
                      <span>Etapa atual: <strong className="text-slate-700">{srv.currentStage}</strong></span>
                      <span>Prazo previsto: <strong className="text-slate-700">{new Date(srv.expectedEndDate).toLocaleDateString('pt-BR')}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Painel de Alertas & Tarefas Prioritárias */}
        <div className="space-y-6">
          {/* Alertas Operacionais e Processuais */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 text-slate-800">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-bold uppercase tracking-wide">
                Alertas da Operação
              </h2>
            </div>

            <div className="space-y-2.5 text-xs">
              {expertCases.length > 0 && (
                <div className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-900">
                  <span className="font-semibold block text-indigo-950 mb-0.5">Prazo Pericial Diligência</span>
                  Processo {expertCases[0].caseNumber} ({expertCases[0].branch}): Diligência agendada para {expertCases[0].inspectionDate}.
                </div>
              )}

              {overdueTasks.length > 0 && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-100 text-rose-900">
                  <span className="font-semibold block text-rose-950 mb-0.5">Tarefas Pendentes com Atenção</span>
                  Você possui {overdueTasks.length} tarefa(s) com prazo crítico ou vencido.
                </div>
              )}

              <div className="p-2.5 rounded-lg bg-sky-50 border border-sky-100 text-sky-900">
                <span className="font-semibold block text-sky-950 mb-0.5">Propostas em Aberto</span>
                {pendingProposals.length} propostas aguardando retorno ou deliberação em assembleia.
              </div>
            </div>
          </div>

          {/* Minhas Tarefas Rápidas */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold uppercase tracking-wide">
                  Tarefas da Equipe
                </h2>
              </div>
              <button
                onClick={() => onNavigate('tasks')}
                className="text-xs text-sky-600 font-semibold"
              >
                Todas
              </button>
            </div>

            <div className="space-y-2">
              {tasks.slice(0, 4).map((t) => (
                <div
                  key={t.id}
                  className="p-2 rounded border border-slate-100 text-xs flex items-center justify-between"
                >
                  <div className="truncate mr-2">
                    <p className={`font-medium ${t.status === 'concluida' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                      {t.title}
                    </p>
                    <p className="text-[10px] text-slate-400">{t.responsible} • Prazo: {new Date(t.dueDate).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                    t.priority === 'urgente' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {t.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
