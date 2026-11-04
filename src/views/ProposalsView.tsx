import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Download, 
  Copy, 
  CheckCircle2, 
  Clock, 
  Send, 
  XCircle, 
  Eye, 
  Building2, 
  FileDown,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Proposal, ProposalStatus } from '../types';
import { generateProposalDocx, downloadBlob } from '../services/docxService';
import { generateProposalPdf } from '../services/pdfService';

interface ProposalsViewProps {
  onOpenCreateWizard: () => void;
  onNavigateToService?: (serviceId: string) => void;
}

export const ProposalsView: React.FC<ProposalsViewProps> = ({
  onOpenCreateWizard,
  onNavigateToService,
}) => {
  const { proposals, companySettings, updateProposal, duplicateProposal, convertProposalToService } = useData();
  const { canApproveProposals } = useAuth();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const filteredProposals = proposals.filter((p) => {
    const matchSearch = p.code.toLowerCase().includes(search.toLowerCase()) ||
      p.clientName.toLowerCase().includes(search.toLowerCase()) ||
      p.serviceType.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'todos' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusConfig: Record<ProposalStatus, { label: string; color: string }> = {
    elaboracao: { label: 'Em Elaboração', color: 'bg-slate-100 text-slate-700 border-slate-200' },
    revisao: { label: 'Em Revisão', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    aprovada_internamente: { label: 'Aprovada Internamente', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    enviada: { label: 'Enviada ao Cliente', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    negociacao: { label: 'Em Negociação', color: 'bg-orange-50 text-orange-700 border-orange-200' },
    aprovada_cliente: { label: 'Aprovada pelo Cliente', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    recusada: { label: 'Recusada', color: 'bg-rose-50 text-rose-700 border-rose-200' },
    expirada: { label: 'Expirada', color: 'bg-slate-50 text-slate-500 border-slate-200' },
  };

  // Export to DOCX
  const handleDownloadDocx = async (prop: Proposal) => {
    setIsExporting(true);
    try {
      const blob = await generateProposalDocx(prop, companySettings);
      downloadBlob(blob, `Proposta_${prop.code}_Bertacini.docx`);
    } catch (err) {
      console.error('Erro ao gerar DOCX:', err);
      alert('Falha ao gerar arquivo DOCX da proposta.');
    } finally {
      setIsExporting(false);
    }
  };

  // Export to PDF
  const handleDownloadPdf = (prop: Proposal) => {
    try {
      generateProposalPdf(prop, companySettings);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      alert('Falha ao gerar arquivo PDF da proposta.');
    }
  };

  // Approve and convert into service
  const handleApproveAndConvert = async (prop: Proposal) => {
    if (!confirm(`Confirmar aprovação da proposta ${prop.code}? Isto criará automaticamente o Serviço Operacional com suas etapas e faturamento previsto.`)) {
      return;
    }
    const serviceId = await convertProposalToService(prop.id);
    alert(`Proposta aprovada com sucesso! O serviço correspondente foi criado no sistema.`);
    if (onNavigateToService) {
      onNavigateToService(serviceId);
    }
  };

  const handleDuplicate = async (prop: Proposal) => {
    const newId = await duplicateProposal(prop.id);
    alert(`Proposta duplicada com sucesso! Uma cópia em elaboração foi gerada.`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-600" />
            Propostas Técnicas & Comerciais
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automatização de propostas para engenharia diagnóstica, laudos, perícias e vistorias prediais.
          </p>
        </div>

        <button
          onClick={onOpenCreateWizard}
          className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-xs transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Elaborar Nova Proposta
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Buscar por código, cliente ou serviço..."
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
            <option value="todos">Todos os Status</option>
            <option value="elaboracao">Em Elaboração</option>
            <option value="revisao">Em Revisão</option>
            <option value="enviada">Enviada ao Cliente</option>
            <option value="aprovada_cliente">Aprovada pelo Cliente</option>
            <option value="recusada">Recusada</option>
          </select>
        </div>

        <span className="text-slate-500 font-medium">
          {filteredProposals.length} proposta(s) encontrada(s)
        </span>
      </div>

      {/* Proposals List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Código / Emissão</th>
                <th className="py-3 px-4">Cliente / Local</th>
                <th className="py-3 px-4">Tipo de Serviço</th>
                <th className="py-3 px-4">Valor dos Honorários</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Responsável</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredProposals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Nenhuma proposta encontrada.
                  </td>
                </tr>
              ) : (
                filteredProposals.map((prop) => (
                  <tr key={prop.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{prop.code}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(prop.createdAt).toLocaleDateString('pt-BR')} (v{prop.version})
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 block">{prop.clientName}</span>
                      <span className="text-[11px] text-slate-400 truncate block max-w-xs">{prop.address}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-800 block">{prop.serviceType}</span>
                      <span className="text-[10px] text-slate-400">{prop.serviceCategory}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 text-sm">
                        {prop.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                      <span className="text-[10px] text-slate-400 block">{prop.paymentTerms?.slice(0, 30)}...</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusConfig[prop.status]?.color}`}>
                        {statusConfig[prop.status]?.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {prop.responsible.split(' ')[0]}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Word DOCX Download */}
                        <button
                          onClick={() => handleDownloadDocx(prop)}
                          disabled={isExporting}
                          className="p-1.5 text-blue-700 hover:bg-blue-50 rounded"
                          title="Baixar DOCX (Word)"
                        >
                          <FileText className="w-4 h-4" />
                        </button>

                        {/* PDF Download */}
                        <button
                          onClick={() => handleDownloadPdf(prop)}
                          className="p-1.5 text-rose-700 hover:bg-rose-50 rounded"
                          title="Baixar PDF"
                        >
                          <FileDown className="w-4 h-4" />
                        </button>

                        {/* Duplicate */}
                        <button
                          onClick={() => handleDuplicate(prop)}
                          className="p-1.5 text-slate-500 hover:bg-slate-100 rounded"
                          title="Duplicar proposta"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        {/* Approve and convert */}
                        {prop.status !== 'aprovada_cliente' && canApproveProposals && (
                          <button
                            onClick={() => handleApproveAndConvert(prop)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded font-semibold flex items-center gap-1"
                            title="Aprovar e Criar Serviço"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedProposal(prop)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded"
                          title="Visualizar detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview Modal */}
      {selectedProposal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 text-xs space-y-4">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border mb-1 inline-block ${statusConfig[selectedProposal.status]?.color}`}>
                  {statusConfig[selectedProposal.status]?.label}
                </span>
                <h2 className="text-base font-bold text-slate-900">
                  {selectedProposal.code} — {selectedProposal.serviceType}
                </h2>
                <p className="text-slate-500 text-xs">Contratante: {selectedProposal.clientName}</p>
              </div>
              <button
                onClick={() => setSelectedProposal(null)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <strong className="text-slate-800 block">1. Objeto:</strong>
                <p className="text-slate-600">{selectedProposal.object}</p>
              </div>
              <div>
                <strong className="text-slate-800 block">2. Escopo Técnico:</strong>
                <p className="text-slate-600 whitespace-pre-line">{selectedProposal.scope}</p>
              </div>
              <div>
                <strong className="text-slate-800 block">3. Metodologia e Normas:</strong>
                <p className="text-slate-600">{selectedProposal.methodology} | Normas: {selectedProposal.applicableStandards}</p>
              </div>
              <div>
                <strong className="text-slate-800 block">4. Entregáveis:</strong>
                <p className="text-slate-600">{selectedProposal.deliverables}</p>
              </div>
              <div className="bg-sky-50 border border-sky-100 p-3 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-sky-800 block">Investimento Total</span>
                  <span className="text-base font-bold text-sky-950">
                    {selectedProposal.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
                <div className="text-right text-[11px] text-sky-900">
                  <p>Prazo: {selectedProposal.executionPeriod}</p>
                  <p>Condição: {selectedProposal.paymentTerms}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => handleDownloadDocx(selectedProposal)}
                className="px-3 py-1.5 border border-blue-200 text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 flex items-center gap-1 font-semibold"
              >
                <FileText className="w-3.5 h-3.5" /> Baixar Word (.docx)
              </button>
              <button
                onClick={() => handleDownloadPdf(selectedProposal)}
                className="px-3 py-1.5 border border-rose-200 text-rose-700 bg-rose-50 rounded-lg hover:bg-rose-100 flex items-center gap-1 font-semibold"
              >
                <FileDown className="w-3.5 h-3.5" /> Baixar PDF
              </button>
              <button
                onClick={() => setSelectedProposal(null)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded-lg font-semibold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
