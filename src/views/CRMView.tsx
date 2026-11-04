import React, { useState } from 'react';
import { 
  Kanban, 
  Plus, 
  DollarSign, 
  ChevronRight, 
  ChevronLeft, 
  Building2, 
  User, 
  Trash2,
  FileText,
  Sparkles
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { Opportunity, PipelineStage } from '../types';

interface CRMViewProps {
  onOpenProposalWizardForOpp?: (opp: Opportunity) => void;
}

export const CRMView: React.FC<CRMViewProps> = ({ onOpenProposalWizardForOpp }) => {
  const { opportunities, clients, addOpportunity, updateOpportunityStage, deleteOpportunity } = useData();

  const [showModal, setShowModal] = useState(false);
  const [clientId, setClientId] = useState('');
  const [title, setTitle] = useState('');
  const [estimatedValue, setEstimatedValue] = useState<number>(10000);
  const [serviceCategory, setServiceCategory] = useState('Engenharia Diagnóstica');
  const [stage, setStage] = useState<PipelineStage>('novo_contato');
  const [responsible, setResponsible] = useState('Mariana Silveira');
  const [notes, setNotes] = useState('');

  const stages: { id: PipelineStage; label: string; color: string }[] = [
    { id: 'novo_contato', label: '1. Novo Contato', color: 'border-slate-300 bg-slate-50' },
    { id: 'solicitacao_recebida', label: '2. Solicitação Recebida', color: 'border-blue-300 bg-blue-50/40' },
    { id: 'em_analise', label: '3. Em Análise Técnica', color: 'border-indigo-300 bg-indigo-50/40' },
    { id: 'visita_necessaria', label: '4. Visita Necessária', color: 'border-cyan-300 bg-cyan-50/40' },
    { id: 'proposta_elaboracao', label: '5. Proposta Elaboração', color: 'border-amber-300 bg-amber-50/40' },
    { id: 'proposta_enviada', label: '6. Proposta Enviada', color: 'border-purple-300 bg-purple-50/40' },
    { id: 'em_negociacao', label: '7. Em Negociação', color: 'border-orange-300 bg-orange-50/40' },
    { id: 'aprovada', label: '8. Aprovada 🎉', color: 'border-emerald-400 bg-emerald-50/50' },
    { id: 'perdida', label: '9. Perdida', color: 'border-rose-300 bg-rose-50/40' },
  ];

  const handleCreateOpp = async (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    await addOpportunity({
      clientId: client.id,
      clientName: client.name,
      title,
      stage,
      estimatedValue: Number(estimatedValue),
      serviceCategory,
      responsible,
      notes,
    });

    setShowModal(false);
    setTitle('');
    setNotes('');
  };

  const advanceStage = (opp: Opportunity) => {
    const currentIndex = stages.findIndex(s => s.id === opp.stage);
    if (currentIndex < stages.length - 1 && opp.stage !== 'perdida') {
      updateOpportunityStage(opp.id, stages[currentIndex + 1].id);
    }
  };

  const retreatStage = (opp: Opportunity) => {
    const currentIndex = stages.findIndex(s => s.id === opp.stage);
    if (currentIndex > 0) {
      updateOpportunityStage(opp.id, stages[currentIndex - 1].id);
    }
  };

  const totalPipelineValue = opportunities
    .filter(o => o.stage !== 'perdida')
    .reduce((acc, curr) => acc + curr.estimatedValue, 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Kanban className="w-5 h-5 text-sky-600" />
            Funil Comercial & Oportunidades (CRM)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Acompanhamento das 9 etapas de negociação com clientes da Bertacini Engenharia.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Valor em Pipeline</span>
            <span className="text-sm font-bold text-emerald-700">
              {totalPipelineValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" /> Nova Oportunidade
          </button>
        </div>
      </div>

      {/* Kanban Board (Horizontal scrollable columns) */}
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin">
        {stages.map((stg) => {
          const stageOpps = opportunities.filter(o => o.stage === stg.id);
          const stageTotal = stageOpps.reduce((acc, curr) => acc + curr.estimatedValue, 0);
          return (
            <div
              key={stg.id}
              className={`min-w-[270px] w-[270px] rounded-xl border p-3 flex flex-col justify-between shrink-0 ${stg.color}`}
            >
              <div>
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60">
                  <span className="text-xs font-bold text-slate-800">{stg.label}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-white text-slate-700 shadow-2xs">
                    {stageOpps.length}
                  </span>
                </div>
                <div className="text-[10px] font-semibold text-slate-500 mb-2.5">
                  Total: {stageTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}
                </div>

                {/* Cards Container */}
                <div className="space-y-2.5">
                  {stageOpps.map((opp) => (
                    <div
                      key={opp.id}
                      className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-2"
                    >
                      <div>
                        <span className="text-[10px] uppercase font-bold text-sky-700 block">
                          {opp.serviceCategory}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 leading-snug">
                          {opp.title}
                        </h4>
                        <p className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{opp.clientName}</span>
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                        <span className="font-bold text-emerald-700">
                          {opp.estimatedValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {opp.responsible.split(' ')[0]}
                        </span>
                      </div>

                      {opp.notes && (
                        <p className="text-[10px] text-slate-500 bg-slate-50 p-1.5 rounded line-clamp-2">
                          {opp.notes}
                        </p>
                      )}

                      {/* Card Actions: Advance, Retreat, Delete, or Convert */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-slate-400">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => retreatStage(opp)}
                            className="p-1 hover:bg-slate-100 rounded hover:text-slate-700"
                            title="Voltar etapa"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => advanceStage(opp)}
                            className="p-1 hover:bg-slate-100 rounded hover:text-slate-700"
                            title="Avançar etapa"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              if (confirm('Deseja excluir esta oportunidade?')) {
                                deleteOpportunity(opp.id);
                              }
                            }}
                            className="p-1 hover:bg-rose-50 rounded hover:text-rose-600"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          {onOpenProposalWizardForOpp && (
                            <button
                              onClick={() => onOpenProposalWizardForOpp(opp)}
                              className="text-[10px] bg-sky-50 text-sky-700 px-2 py-0.5 rounded font-semibold hover:bg-sky-100 flex items-center gap-1"
                              title="Gerar Proposta"
                            >
                              <FileText className="w-3 h-3" /> Proposta
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Opportunity Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Nova Oportunidade Comercial
            </h2>

            <form onSubmit={handleCreateOpp} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Cliente *</label>
                <select
                  required
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                >
                  <option value="">Selecione um cliente...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Título do Negócio *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Inspeção Predial NBR 16747"
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Valor Estimado (R$)</label>
                  <input
                    type="number"
                    required
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                    value={estimatedValue}
                    onChange={(e) => setEstimatedValue(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Categoria de Serviço</label>
                  <select
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                    value={serviceCategory}
                    onChange={(e) => setServiceCategory(e.target.value)}
                  >
                    <option value="Engenharia Diagnóstica">Engenharia Diagnóstica</option>
                    <option value="Perícias e Pareceres">Perícias e Pareceres</option>
                    <option value="Vistorias Técnicas">Vistorias Técnicas</option>
                    <option value="Consultoria Predial">Consultoria Predial</option>
                    <option value="Sistemas e Impermeabilização">Sistemas e Impermeabilização</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Etapa Inicial</label>
                  <select
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                    value={stage}
                    onChange={(e) => setStage(e.target.value as PipelineStage)}
                  >
                    {stages.map(s => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Responsável</label>
                  <select
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                    value={responsible}
                    onChange={(e) => setResponsible(e.target.value)}
                  >
                    <option value="Mariana Silveira">Mariana Silveira</option>
                    <option value="Eng. Luiz Felipe Bertacini">Eng. Luiz Felipe Bertacini</option>
                    <option value="Eng. Carlos Eduardo Bertacini">Eng. Carlos Eduardo Bertacini</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Observações do Alinhamento</label>
                <textarea
                  rows={2}
                  placeholder="Necessidade manifestada, prazos da assembleia, etc."
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
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
                  Criar Oportunidade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
