import React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Kanban, 
  FileText, 
  Briefcase, 
  ClipboardCheck, 
  Scale, 
  Files, 
  CheckSquare, 
  DollarSign, 
  BarChart3, 
  Bot, 
  Settings,
  ChevronLeft,
  ChevronRight,
  HardHat,
  Compass
} from 'lucide-react';
import { useData } from '../../context/DataContext';

interface SidebarProps {
  currentView: string;
  onSelectView: (view: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  collapsed,
  onToggleCollapse,
}) => {
  const { proposals, tasks, inspections, companySettings } = useData();

  const pendingProposalsCount = proposals.filter(p => p.status === 'elaboracao' || p.status === 'revisao').length;
  const pendingTasksCount = tasks.filter(t => t.status === 'pendente' || t.status === 'atrasada').length;
  const upcomingInspectionsCount = inspections.filter(i => i.status === 'agendada').length;

  const menuItems = [
    { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'agenda', label: 'Agenda & Calendar', icon: Calendar, badge: upcomingInspectionsCount ? upcomingInspectionsCount : undefined },
    { id: 'clients', label: 'Clientes & CRM', icon: Users },
    { id: 'crm', label: 'Funil Comercial', icon: Kanban },
    { id: 'proposals', label: 'Propostas Técnicas', icon: FileText, badge: pendingProposalsCount ? pendingProposalsCount : undefined },
    { id: 'services', label: 'Serviços & Projetos', icon: Briefcase },
    { id: 'inspections', label: 'Vistorias & Campo', icon: ClipboardCheck },
    { id: 'expert_cases', label: 'Perícias Judiciais', icon: Scale },
    { id: 'documents', label: 'Laudos & Documentos', icon: Files },
    { id: 'tasks', label: 'Tarefas Internas', icon: CheckSquare, badge: pendingTasksCount ? pendingTasksCount : undefined },
    { id: 'financial', label: 'Gestão Financeira', icon: DollarSign },
    { id: 'reports', label: 'Relatórios & KPIs', icon: BarChart3 },
    { id: 'assistant', label: 'Assistente Bertacini', icon: Bot, isAi: true },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  return (
    <aside
      className={`bg-slate-900 text-white transition-all duration-300 flex flex-col justify-between shrink-0 z-40 border-r border-slate-800 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Header / Brand */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          {!collapsed ? (
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-9 h-9 rounded-lg bg-sky-600 flex items-center justify-center text-white shrink-0 shadow-md">
                <Compass className="w-5 h-5 text-sky-100" />
              </div>
              <div className="leading-none truncate">
                <span className="font-bold text-sm tracking-wide text-white block">
                  BERTACINI
                </span>
                <span className="text-[10px] font-semibold tracking-wider text-sky-400 uppercase">
                  ENGENHARIA DIAGNÓSTICA
                </span>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-lg bg-sky-600 mx-auto flex items-center justify-center text-white shadow-md">
              <Compass className="w-6 h-6 text-sky-100" />
            </div>
          )}

          <button
            onClick={onToggleCollapse}
            className={`p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors ${
              collapsed ? 'hidden' : 'block'
            }`}
            title="Recolher menu lateral"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-8rem)] scrollbar-thin">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-sm font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform ${
                    isActive ? 'text-white' : item.isAi ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                {!collapsed && (
                  <span className="truncate flex-1 text-left flex items-center justify-between">
                    <span>{item.label}</span>
                    {item.isAi && (
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1 rounded uppercase font-bold tracking-wider">
                        IA
                      </span>
                    )}
                    {item.badge !== undefined && (
                      <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-slate-700 text-slate-200 group-hover:bg-slate-600">
                        {item.badge}
                      </span>
                    )}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer / RT & CREA Tag */}
      <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400">
        {!collapsed ? (
          <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
            <div className="flex items-center gap-2 mb-1">
              <HardHat className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="font-semibold text-slate-200 text-xs truncate">
                {companySettings.technicalResponsible || 'Eng. Luiz Felipe Bertacini'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate">
              {companySettings.technicalResponsibleCrea || 'CREA-SP 5069874123'}
            </p>
          </div>
        ) : (
          <button
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
            title="Expandir menu lateral"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
};
