import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Briefcase, 
  FileText, 
  Users, 
  Download, 
  CheckCircle2, 
  PieChart,
  FileDown
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { generateFinancialReportPdf } from '../services/pdfService';

export const ReportsView: React.FC = () => {
  const { proposals, services, inspections, financialEntries, clients, companySettings } = useData();

  // Commercial Metrics
  const totalProposals = proposals.length;
  const approvedProposals = proposals.filter(p => p.status === 'aprovada_cliente').length;
  const conversionRate = totalProposals > 0 ? Math.round((approvedProposals / totalProposals) * 100) : 0;
  const totalProposalValue = proposals.reduce((acc, curr) => acc + curr.totalValue, 0);
  const averageTicket = totalProposals > 0 ? totalProposalValue / totalProposals : 0;

  // Financial Metrics
  const totalReceitasRecebidas = financialEntries
    .filter(f => f.type === 'receita' && f.status === 'pago')
    .reduce((acc, curr) => acc + curr.value, 0);

  const totalDespesas = financialEntries
    .filter(f => f.type === 'despesa')
    .reduce((acc, curr) => acc + curr.value, 0);

  const saldoOperacional = totalReceitasRecebidas - totalDespesas;

  // Category Distribution
  const categoryCount: Record<string, number> = {};
  proposals.forEach(p => {
    categoryCount[p.serviceCategory] = (categoryCount[p.serviceCategory] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-sky-600" />
            Relatórios & Indicadores Gerenciais (BI)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Métricas de conversão de propostas, desempenho operacional em campo e balancete financeiro da empresa.
          </p>
        </div>

        <button
          onClick={() => generateFinancialReportPdf(financialEntries, companySettings)}
          className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-xs transition-all self-start md:self-auto"
        >
          <FileDown className="w-4 h-4" /> Exportar Relatório Executivo PDF
        </button>
      </div>

      {/* Primary KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block mb-1">Taxa de Conversão</span>
          <div className="text-2xl font-bold text-emerald-700">{conversionRate}%</div>
          <span className="text-[10px] text-slate-400">{approvedProposals} de {totalProposals} propostas aprovadas</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block mb-1">Ticket Médio das Propostas</span>
          <div className="text-2xl font-bold text-slate-900">
            {averageTicket.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
          </div>
          <span className="text-[10px] text-slate-400">Média por orçamento técnico</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block mb-1">Volume de Vistorias</span>
          <div className="text-2xl font-bold text-sky-700">{inspections.length}</div>
          <span className="text-[10px] text-slate-400">Atividades de campo registradas</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block mb-1">Margem Operacional</span>
          <div className="text-2xl font-bold text-indigo-700">
            {saldoOperacional.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
          </div>
          <span className="text-[10px] text-slate-400">Receitas pagas - despesas</span>
        </div>
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Share */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <PieChart className="w-4 h-4 text-sky-600" />
            Distribuição de Serviços por Categoria
          </h3>

          <div className="space-y-3 text-xs">
            {Object.entries(categoryCount).map(([category, count]) => {
              const pct = Math.round((count / totalProposals) * 100);
              return (
                <div key={category} className="space-y-1">
                  <div className="flex justify-between text-slate-700 font-medium">
                    <span>{category}</span>
                    <span className="font-bold">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-sky-600 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Operational Status */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-sky-600" />
            Status da Operação de Engenharia
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-[11px] text-slate-500 font-semibold block">Clientes Ativos</span>
              <span className="text-lg font-bold text-slate-900">{clients.length}</span>
              <p className="text-[10px] text-slate-400 mt-0.5">Condomínios e contratantes</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-[11px] text-slate-500 font-semibold block">Serviços Contratados</span>
              <span className="text-lg font-bold text-slate-900">{services.length}</span>
              <p className="text-[10px] text-slate-400 mt-0.5">Com ART aberta no CREA</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-[11px] text-slate-500 font-semibold block">Laudos Finalizados</span>
              <span className="text-lg font-bold text-emerald-700">
                {inspections.filter(i => i.status === 'finalizada').length}
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5">Vistorias concluídas com laudo</p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-[11px] text-slate-500 font-semibold block">Receitas Previstas</span>
              <span className="text-lg font-bold text-sky-700">
                {financialEntries.filter(f => f.type === 'receita').length} parcelas
              </span>
              <p className="text-[10px] text-slate-400 mt-0.5">Lançadas em contas a receber</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
