import React, { useState } from 'react';
import { 
  Scale, 
  Plus, 
  Search, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  DollarSign, 
  FileText, 
  CheckCircle2,
  ChevronRight,
  Shield,
  HelpCircle
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { ExpertCase, ExpertCaseStatus } from '../types';

export const ExpertCasesView: React.FC = () => {
  const { expertCases, addExpertCase, updateExpertCase } = useData();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [selectedCase, setSelectedCase] = useState<ExpertCase | null>(null);

  // New Case Modal
  const [showModal, setShowModal] = useState(false);
  const [caseNumber, setCaseNumber] = useState('');
  const [court, setCourt] = useState('TJSP');
  const [branch, setBranch] = useState('2ª Vara Cível Central');
  const [district, setDistrict] = useState('Comarca da Capital - SP');
  const [judge, setJudge] = useState('');
  const [plaintiff, setPlaintiff] = useState('');
  const [defendant, setDefendant] = useState('');
  const [fees, setFees] = useState<number>(15000);
  const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [inspectionDate, setInspectionDate] = useState('');
  const [proceduralDeadline, setProceduralDeadline] = useState('');
  const [reportDeliveryDeadline, setReportDeliveryDeadline] = useState('');
  const [status, setStatus] = useState<ExpertCaseStatus>('nomeacao');
  const [questions, setQuestions] = useState('');
  const [notes, setNotes] = useState('');

  const filteredCases = expertCases.filter((c) => {
    const matchSearch = c.caseNumber.toLowerCase().includes(search.toLowerCase()) ||
      c.court.toLowerCase().includes(search.toLowerCase()) ||
      c.branch.toLowerCase().includes(search.toLowerCase()) ||
      c.plaintiff.toLowerCase().includes(search.toLowerCase()) ||
      c.defendant.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'todos' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusConfig: Record<ExpertCaseStatus, { label: string; color: string }> = {
    nomeacao: { label: 'Nomeação do Perito', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    proposta_honorarios: { label: 'Estimativa de Honorários', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    diligencia_agendada: { label: 'Diligência Agendada', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    laudo_em_elaboracao: { label: 'Laudo em Elaboração', color: 'bg-orange-50 text-orange-700 border-orange-200' },
    laudo_entregue: { label: 'Laudo Protocolado', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    esclarecimentos: { label: 'Esclarecimentos / Quesitos', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    encerrado: { label: 'Perícia Encerrada', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  };

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    await addExpertCase({
      caseNumber,
      court,
      branch,
      district,
      judge,
      plaintiff,
      defendant,
      fees: Number(fees),
      appointmentDate,
      inspectionDate: inspectionDate || undefined,
      proceduralDeadline: proceduralDeadline || undefined,
      reportDeliveryDeadline: reportDeliveryDeadline || undefined,
      status,
      questions,
      notes,
    });

    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Scale className="w-5 h-5 text-sky-600" />
            Perícias Judiciais & Assistência Técnica
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestão processual de nomeações, quesitos periciais, prazos processuais e diligências em campo.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-xs transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Cadastrar Processo Pericial
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Buscar por número do processo, vara, partes..."
              className="w-full bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 focus:outline-none"
          >
            <option value="todos">Todas as Situações</option>
            <option value="nomeacao">Nomeação</option>
            <option value="diligencia_agendada">Diligência Agendada</option>
            <option value="laudo_em_elaboracao">Laudo em Elaboração</option>
            <option value="laudo_entregue">Laudo Protocolado</option>
          </select>
        </div>

        <span className="text-slate-500 font-medium">
          {filteredCases.length} processo(s) registrado(s)
        </span>
      </div>

      {/* Cases List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCases.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-xl border border-slate-200 hover:border-sky-300 p-5 shadow-2xs transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusConfig[c.status]?.color}`}>
                  {statusConfig[c.status]?.label}
                </span>
                <span className="text-xs font-bold text-slate-900">
                  {c.fees ? c.fees.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'A arbitrar'}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 mb-1 font-mono tracking-tight">
                Proc. {c.caseNumber}
              </h3>
              <p className="text-xs text-slate-600 mb-2">
                {c.court} — {c.branch} ({c.district})
              </p>

              <div className="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-[11px] text-slate-700 mb-3">
                <p><strong>Autor:</strong> {c.plaintiff}</p>
                <p><strong>Réu:</strong> {c.defendant}</p>
                {c.inspectionDate && (
                  <p className="text-purple-700 font-semibold">
                    Diligência agendada: {new Date(c.inspectionDate).toLocaleDateString('pt-BR')}
                  </p>
                )}
                {c.proceduralDeadline && (
                  <p className="text-rose-700 font-semibold">
                    Prazo processual fatal: {new Date(c.proceduralDeadline).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Nomeação: {new Date(c.appointmentDate || c.createdAt).toLocaleDateString('pt-BR')}
              </span>
              <button
                onClick={() => setSelectedCase(c)}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold flex items-center gap-1"
              >
                Ficha dos Autos <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Case Details Modal */}
      {selectedCase && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 text-xs space-y-4">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border mb-1 inline-block ${statusConfig[selectedCase.status]?.color}`}>
                  {statusConfig[selectedCase.status]?.label}
                </span>
                <h2 className="text-base font-bold text-slate-900 font-mono">
                  {selectedCase.caseNumber}
                </h2>
                <p className="text-slate-500 text-xs">{selectedCase.court} • {selectedCase.branch}</p>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 grid grid-cols-2 gap-3 text-slate-700">
                <div>
                  <p><strong>Comarca:</strong> {selectedCase.district}</p>
                  <p><strong>Juiz:</strong> {selectedCase.judge || 'Não informado'}</p>
                </div>
                <div>
                  <p><strong>Honorários Periciais:</strong> {selectedCase.fees?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                  <p><strong>Diligência:</strong> {selectedCase.inspectionDate || 'A agendar'}</p>
                </div>
              </div>

              <div>
                <strong className="text-slate-800 block mb-1">Partes & Patronos:</strong>
                <div className="space-y-1 bg-white p-2.5 border border-slate-200 rounded-lg">
                  <p><strong>Requerente:</strong> {selectedCase.plaintiff} ({selectedCase.plaintiffLawyer || 'Adv. Autor'})</p>
                  <p><strong>Requerido:</strong> {selectedCase.defendant} ({selectedCase.defendantLawyer || 'Adv. Réu'})</p>
                  <p><strong>Assistentes Técnicos:</strong> {selectedCase.technicalAssistants || 'Não indicados'}</p>
                </div>
              </div>

              {selectedCase.questions && (
                <div>
                  <strong className="text-slate-800 block mb-1">Quesitos Formulados nos Autos:</strong>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg whitespace-pre-line text-slate-700 font-mono text-[11px]">
                    {selectedCase.questions}
                  </div>
                </div>
              )}

              {selectedCase.notes && (
                <div>
                  <strong className="text-slate-800 block mb-1">Observações Processuais:</strong>
                  <p className="text-slate-600 bg-slate-50 p-2.5 border border-slate-200 rounded-lg">
                    {selectedCase.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedCase(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg font-semibold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Case Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200">
            <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Cadastrar Processo Pericial
            </h2>

            <form onSubmit={handleCreateCase} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Número do Processo Judicial *</label>
                <input
                  type="text"
                  required
                  placeholder="0000000-00.2026.8.26.0100"
                  className="w-full p-2 border border-slate-200 rounded-lg font-mono text-slate-800"
                  value={caseNumber}
                  onChange={(e) => setCaseNumber(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tribunal</label>
                  <input
                    type="text"
                    required
                    placeholder="TJSP"
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                    value={court}
                    onChange={(e) => setCourt(e.target.value)}
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Vara Cível *</label>
                  <input
                    type="text"
                    required
                    placeholder="34ª Vara Cível Central"
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Autor / Requerente *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nome do autor"
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                    value={plaintiff}
                    onChange={(e) => setPlaintiff(e.target.value)}
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Réu / Requerido *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nome do réu"
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                    value={defendant}
                    onChange={(e) => setDefendant(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Honorários Estimados (R$)</label>
                  <input
                    type="number"
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 font-bold"
                    value={fees}
                    onChange={(e) => setFees(Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Situação Inicial</label>
                  <select
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ExpertCaseStatus)}
                  >
                    <option value="nomeacao">Nomeação</option>
                    <option value="proposta_honorarios">Estimativa de Honorários</option>
                    <option value="diligencia_agendada">Diligência Agendada</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Data da Diligência</label>
                  <input
                    type="date"
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                    value={inspectionDate}
                    onChange={(e) => setInspectionDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Prazo Processual Fatal</label>
                  <input
                    type="date"
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                    value={proceduralDeadline}
                    onChange={(e) => setProceduralDeadline(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Quesitos Preliminares</label>
                <textarea
                  rows={2}
                  placeholder="Quesitos formulados pelas partes..."
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 font-mono text-[11px]"
                  value={questions}
                  onChange={(e) => setQuestions(e.target.value)}
                />
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
                  className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-500 font-semibold"
                >
                  Cadastrar Processo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
