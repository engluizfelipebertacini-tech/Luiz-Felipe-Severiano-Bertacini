import React, { useState } from 'react';
import { 
  DollarSign, 
  Plus, 
  Search, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  Clock, 
  FileDown, 
  Calendar,
  Building2,
  Filter
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { FinancialEntry, FinancialType, FinancialStatus } from '../types';
import { generateFinancialReportPdf } from '../services/pdfService';

export const FinancialView: React.FC = () => {
  const { financialEntries, clients, services, companySettings, addFinancialEntry, updateFinancialStatus } = useData();
  const { canAccessFinancials } = useAuth();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'todos' | 'receita' | 'despesa'>('todos');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [showModal, setShowModal] = useState(false);

  // New Entry
  const [type, setType] = useState<FinancialType>('receita');
  const [category, setCategory] = useState('Honorários Técnicos');
  const [description, setDescription] = useState('');
  const [value, setValue] = useState<number>(5000);
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('PIX');
  const [status, setStatus] = useState<FinancialStatus>('a_vencer');
  const [clientId, setClientId] = useState('');

  if (!canAccessFinancials) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500">
        <DollarSign className="w-12 h-12 mx-auto text-slate-300 mb-2" />
        <h2 className="text-base font-bold text-slate-800">Acesso Restrito ao Módulo Financeiro</h2>
        <p className="text-xs text-slate-400 mt-1">
          Seu perfil de usuário não possui permissão de controladoria financeira. Contate o Administrador da Bertacini Engenharia.
        </p>
      </div>
    );
  }

  const filteredEntries = financialEntries.filter((f) => {
    const matchSearch = f.description.toLowerCase().includes(search.toLowerCase()) ||
      (f.clientName && f.clientName.toLowerCase().includes(search.toLowerCase())) ||
      f.category.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'todos' || f.type === typeFilter;
    const matchStatus = statusFilter === 'todos' || f.status === statusFilter;
    return matchSearch && matchType && matchStatus;
  });

  const totalReceitas = financialEntries
    .filter(f => f.type === 'receita')
    .reduce((acc, curr) => acc + curr.value, 0);

  const receitasRecebidas = financialEntries
    .filter(f => f.type === 'receita' && f.status === 'pago')
    .reduce((acc, curr) => acc + curr.value, 0);

  const receitasPendentes = financialEntries
    .filter(f => f.type === 'receita' && (f.status === 'a_vencer' || f.status === 'previsto'))
    .reduce((acc, curr) => acc + curr.value, 0);

  const totalDespesas = financialEntries
    .filter(f => f.type === 'despesa')
    .reduce((acc, curr) => acc + curr.value, 0);

  const saldoLiquido = receitasRecebidas - totalDespesas;

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find(c => c.id === clientId);

    await addFinancialEntry({
      type,
      category,
      description,
      value: Number(value),
      dueDate,
      paymentMethod,
      status,
      clientId: client?.id,
      clientName: client?.name,
    });

    setShowModal(false);
    setDescription('');
  };

  const handleExportPdf = () => {
    generateFinancialReportPdf(filteredEntries, companySettings);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            Gestão Financeira & Controladoria
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Controle gerencial de receitas de propostas aprovadas, despesas operacionais e fluxo de caixa.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportPdf}
            className="flex items-center gap-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-lg transition-all"
          >
            <FileDown className="w-4 h-4 text-slate-500" /> Exportar Balancete PDF
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" /> Novo Lançamento
          </button>
        </div>
      </div>

      {/* Financial Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Receitas Recebidas</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-700">
            {receitasRecebidas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <span className="text-[10px] text-slate-400">Total liquidado em conta</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">A Receber</span>
            <Clock className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-xl font-bold text-sky-700">
            {receitasPendentes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <span className="text-[10px] text-slate-400">Propostas e parcelas a vencer</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Despesas Totais</span>
            <ArrowDownRight className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl font-bold text-rose-700">
            {totalDespesas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <span className="text-[10px] text-slate-400">Operacionais, CREA e logística</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Resultado Operacional</span>
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className={`text-xl font-bold ${saldoLiquido >= 0 ? 'text-indigo-900' : 'text-rose-700'}`}>
            {saldoLiquido.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
          <span className="text-[10px] text-slate-400">Saldo realizado</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg">
            <button
              onClick={() => setTypeFilter('todos')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${typeFilter === 'todos' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
            >
              Todos
            </button>
            <button
              onClick={() => setTypeFilter('receita')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${typeFilter === 'receita' ? 'bg-emerald-50 text-emerald-800 font-bold shadow-xs' : 'text-slate-600'}`}
            >
              Receitas
            </button>
            <button
              onClick={() => setTypeFilter('despesa')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${typeFilter === 'despesa' ? 'bg-rose-50 text-rose-800 font-bold shadow-xs' : 'text-slate-600'}`}
            >
              Despesas
            </button>
          </div>

          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Buscar lançamento..."
              className="w-full bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <span className="text-slate-500 font-medium">
          {filteredEntries.length} lançamento(s) filtrado(s)
        </span>
      </div>

      {/* Financial Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
            <tr>
              <th className="py-3 px-4">Vencimento</th>
              <th className="py-3 px-4">Tipo / Categoria</th>
              <th className="py-3 px-4">Descrição</th>
              <th className="py-3 px-4">Cliente / Fornecedor</th>
              <th className="py-3 px-4">Forma</th>
              <th className="py-3 px-4">Valor</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredEntries.map((f) => (
              <tr key={f.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 font-medium text-slate-800">
                  {new Date(f.dueDate).toLocaleDateString('pt-BR')}
                </td>
                <td className="py-3 px-4">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    f.type === 'receita' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}>
                    {f.type === 'receita' ? 'RECEITA' : 'DESPESA'}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{f.category}</span>
                </td>
                <td className="py-3 px-4 font-semibold text-slate-900">
                  {f.description}
                </td>
                <td className="py-3 px-4 text-slate-600">
                  {f.clientName || 'Bertacini Engenharia'}
                </td>
                <td className="py-3 px-4 text-slate-500">
                  {f.paymentMethod || 'PIX'}
                </td>
                <td className="py-3 px-4 font-bold text-sm">
                  <span className={f.type === 'receita' ? 'text-emerald-700' : 'text-rose-700'}>
                    {f.type === 'receita' ? '+' : '-'} {f.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    f.status === 'pago' ? 'bg-emerald-100 text-emerald-800' :
                    f.status === 'vencido' ? 'bg-rose-100 text-rose-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {f.status === 'pago' ? 'Pago' : f.status === 'vencido' ? 'Vencido' : 'A Vencer'}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  {f.status !== 'pago' && (
                    <button
                      onClick={() => updateFinancialStatus(f.id, 'pago')}
                      className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-[10px] font-bold border border-emerald-200"
                    >
                      Confirmar Pagamento
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Financial Entry Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Novo Lançamento Financeiro
            </h2>

            <form onSubmit={handleCreateEntry} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tipo de Lançamento</label>
                  <select
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                    value={type}
                    onChange={(e) => setType(e.target.value as FinancialType)}
                  >
                    <option value="receita">Receita (Honorários)</option>
                    <option value="despesa">Despesa (Custos)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Categoria</label>
                  <select
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {type === 'receita' ? (
                      <>
                        <option value="Honorários Técnicos">Honorários Técnicos</option>
                        <option value="Honorários Periciais">Honorários Periciais</option>
                        <option value="Consultoria Predial">Consultoria Predial</option>
                      </>
                    ) : (
                      <>
                        <option value="Taxas e CREA">Taxas e CREA (ART)</option>
                        <option value="Deslocamento e Combustível">Deslocamento e Combustível</option>
                        <option value="Equipamentos e Ensaios">Equipamentos e Ensaios</option>
                        <option value="Softwares e Infraestrutura">Softwares e Infraestrutura</option>
                        <option value="Administrativo">Administrativo</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Descrição do Lançamento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Parcela 1/2 - Laudo Grand Boulevard"
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Valor (R$) *</label>
                  <input
                    type="number"
                    required
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 font-bold"
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Data de Vencimento *</label>
                  <input
                    type="date"
                    required
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Forma de Pagamento</label>
                  <select
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="PIX">PIX</option>
                    <option value="Transferência Bancária">Transferência Bancária</option>
                    <option value="Boleto Bancário">Boleto Bancário</option>
                    <option value="Depósito Judicial">Depósito Judicial</option>
                    <option value="Cartão Corporativo">Cartão Corporativo</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Status Inicial</label>
                  <select
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as FinancialStatus)}
                  >
                    <option value="a_vencer">A Vencer</option>
                    <option value="pago">Pago / Liquidado</option>
                    <option value="previsto">Previsto</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Cliente Vinculado</label>
                <select
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                >
                  <option value="">Nenhum / Despesa interna</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 font-semibold"
                >
                  Salvar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
