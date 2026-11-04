import React, { useState } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Check, 
  FileText, 
  Building2, 
  DollarSign, 
  Clock, 
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Client, Opportunity, Proposal } from '../types';

interface ProposalWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedOpportunity?: Opportunity | null;
  preSelectedClient?: Client | null;
}

export const ProposalWizardModal: React.FC<ProposalWizardModalProps> = ({
  isOpen,
  onClose,
  preSelectedOpportunity,
  preSelectedClient,
}) => {
  const { clients, addProposal, companySettings } = useData();
  const { currentUser } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Form State
  const [clientId, setClientId] = useState(preSelectedClient?.id || preSelectedOpportunity?.clientId || '');
  const [serviceCategory, setServiceCategory] = useState(preSelectedOpportunity?.serviceCategory || 'Engenharia Diagnóstica');
  const [serviceType, setServiceType] = useState('Inspeção Predial Conforme NBR 16747');
  const [object, setObject] = useState('');
  const [address, setAddress] = useState(preSelectedClient?.address || '');
  const [characteristics, setCharacteristics] = useState('Edifício residencial multifamiliar com 22 pavimentos e 2 subsolos.');
  const [scope, setScope] = useState('');
  const [methodology, setMethodology] = useState('Vistoria técnica sensorial e análise de manifestações patológicas com registro fotográfico e ensaios não destrutivos.');
  const [applicableStandards, setApplicableStandards] = useState('ABNT NBR 16747, ABNT NBR 5674, ABNT NBR 15575 e Norma IBAPE.');
  const [deliverables, setDeliverables] = useState('Laudo Técnico Digital assinado com certificação ICP-Brasil, fichas de anomalias com classificação de risco e ART registrada no CREA-SP.');
  const [limitations, setLimitations] = useState('Acesso livre e irrestrito às áreas comuns e locais a serem inspecionados. Ensaios destrutivos não inclusos.');
  const [totalValue, setTotalValue] = useState<number>(preSelectedOpportunity?.estimatedValue || 12000);
  const [paymentTerms, setPaymentTerms] = useState('50% na aprovação contratual e 50% na entrega da versão final do Laudo.');
  const [executionPeriod, setExecutionPeriod] = useState('15 dias úteis a contar da vistoria in loco');
  const [validityPeriod, setValidityPeriod] = useState('15 dias');
  const [responsible, setResponsible] = useState(currentUser.name);

  if (!isOpen) return null;

  const selectedClientObj = clients.find(c => c.id === clientId);

  // AI Generation Trigger using /api/ai/generate-scope
  const handleGenerateAiScope = async () => {
    setIsGeneratingAi(true);
    setAiError(null);
    try {
      const res = await fetch('/api/ai/generate-scope', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType,
          serviceCategory,
          clientName: selectedClientObj?.name || 'Cliente',
          propertyType: characteristics,
          propertyAddress: address,
          notes: preSelectedOpportunity?.notes || '',
        }),
      });

      if (!res.ok) {
        throw new Error('Falha ao comunicar com o Assistente Bertacini.');
      }

      const data = await res.json();
      if (data.object) setObject(data.object);
      if (data.scope) setScope(data.scope);
      if (data.methodology) setMethodology(data.methodology);
      if (data.applicableStandards) setApplicableStandards(data.applicableStandards);
      if (data.deliverables) setDeliverables(data.deliverables);
      if (data.limitations) setLimitations(data.limitations);
      if (data.paymentSuggestion) setPaymentTerms(data.paymentSuggestion);
      if (data.recommendedDuration) setExecutionPeriod(`${data.recommendedDuration} dias úteis a contar da vistoria`);
    } catch (err: any) {
      setAiError(err?.message || 'Erro ao gerar proposta com IA.');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleFinish = async () => {
    if (!clientId || !selectedClientObj) return;

    await addProposal({
      clientId: selectedClientObj.id,
      clientName: selectedClientObj.name,
      opportunityId: preSelectedOpportunity?.id,
      serviceCategory,
      serviceType,
      object: object || `Realização de ${serviceType} para ${selectedClientObj.name}.`,
      address: address || selectedClientObj.address,
      characteristics,
      scope: scope || 'Vistoria e elaboração de laudo pericial circunstanciado.',
      methodology,
      applicableStandards,
      deliverables,
      limitations,
      executionPeriod,
      validityPeriod,
      totalValue: Number(totalValue),
      paymentTerms,
      status: 'elaboracao',
      responsible,
      version: 1,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider block">
              Assistente de Propostas Comerciais
            </span>
            <h2 className="text-base font-bold text-slate-900">
              Nova Proposta Técnica & Comercial
            </h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-slate-700">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 1 ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-600'}`}>1</span>
            <span>Cliente</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <div className="flex items-center gap-1.5 text-slate-700">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 2 ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-600'}`}>2</span>
            <span>Serviço</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <div className="flex items-center gap-1.5 text-slate-700">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 3 ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-600'}`}>3</span>
            <span>Escopo & IA</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <div className="flex items-center gap-1.5 text-slate-700">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 4 ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-600'}`}>4</span>
            <span>Honorários</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <div className="flex items-center gap-1.5 text-slate-700">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 5 ? 'bg-sky-600 text-white' : 'bg-slate-200 text-slate-600'}`}>5</span>
            <span>Revisão</span>
          </div>
        </div>

        {/* Step Body */}
        <div className="flex-1 overflow-y-auto p-6 text-xs space-y-4">
          {/* STEP 1: CLIENT */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800">Selecione o Cliente Contratante</h3>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Cliente *</label>
                <select
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-800 text-xs"
                  value={clientId}
                  onChange={(e) => {
                    setClientId(e.target.value);
                    const sel = clients.find(c => c.id === e.target.value);
                    if (sel && sel.address) setAddress(sel.address);
                  }}
                >
                  <option value="">Selecione um cliente cadastrado...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.type}) - {c.document}</option>
                  ))}
                </select>
              </div>

              {selectedClientObj && (
                <div className="bg-sky-50 border border-sky-100 p-3.5 rounded-xl space-y-1 text-slate-700">
                  <p className="font-bold text-sky-950 text-xs">{selectedClientObj.name}</p>
                  <p>Contato Principal: {selectedClientObj.contactPerson} ({selectedClientObj.phone})</p>
                  <p>E-mail: {selectedClientObj.email}</p>
                  <p>Local do Imóvel: {selectedClientObj.address}, {selectedClientObj.city}/{selectedClientObj.state}</p>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: SERVICE */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800">Classificação do Serviço Técnico</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Categoria</label>
                  <select
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-800"
                    value={serviceCategory}
                    onChange={(e) => setServiceCategory(e.target.value)}
                  >
                    <option value="Engenharia Diagnóstica">Engenharia Diagnóstica</option>
                    <option value="Perícias e Pareceres">Perícias e Pareceres</option>
                    <option value="Sistemas Prediais e Fachadas">Sistemas Prediais e Fachadas</option>
                    <option value="Vistorias Cautelares e Locatícias">Vistorias Cautelares e Locatícias</option>
                    <option value="Consultoria Técnica">Consultoria Técnica</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tipo de Serviço</label>
                  <select
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-800"
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                  >
                    <option value="Inspeção Predial Conforme NBR 16747">Inspeção Predial Conforme NBR 16747</option>
                    <option value="Vistoria Cautelar de Vizinhança">Vistoria Cautelar de Vizinhança</option>
                    <option value="Laudo de Vícios Construtivos">Laudo de Vícios Construtivos</option>
                    <option value="Parecer Técnico Pericial">Parecer Técnico Pericial</option>
                    <option value="Inspeção de Fachadas e Vedações">Inspeção de Fachadas e Vedações</option>
                    <option value="Diagnóstico de Infiltrações e Impermeabilização">Diagnóstico de Infiltrações e Impermeabilização</option>
                    <option value="Plano de Manutenção Predial NBR 5674">Plano de Manutenção Predial NBR 5674</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Características do Imóvel / Estrutura</label>
                <input
                  type="text"
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                  value={characteristics}
                  onChange={(e) => setCharacteristics(e.target.value)}
                  placeholder="Ex: Edifício residencial com 25 andares, 2 subsolos e área de 18.000m²"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Endereço do Local Inspecionado</label>
                <input
                  type="text"
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* STEP 3: TECHNICAL SCOPE & AI */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-800">Escopo Técnico e Metodologia</h3>
                
                {/* AI Scope Generator Button */}
                <button
                  type="button"
                  onClick={handleGenerateAiScope}
                  disabled={isGeneratingAi}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs hover:from-amber-600 hover:to-amber-700 transition-all disabled:opacity-60"
                >
                  {isGeneratingAi ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Gerando com Assistente Bertacini...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Gerar com Inteligência Artificial</span>
                    </>
                  )}
                </button>
              </div>

              {aiError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-[11px]">
                  {aiError}
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-700 block mb-1">1. Objeto da Contratação *</label>
                <textarea
                  rows={2}
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                  value={object}
                  onChange={(e) => setObject(e.target.value)}
                  placeholder="Descrição clara e formal da finalidade do trabalho técnico..."
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">2. Escopo Técnico Detalhado *</label>
                <textarea
                  rows={4}
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  placeholder="Itens inclusos, etapas de inspeção, áreas a vistoriar..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">3. Metodologia</label>
                  <textarea
                    rows={2}
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                    value={methodology}
                    onChange={(e) => setMethodology(e.target.value)}
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">4. Normas ABNT / IBAPE Aplicáveis</label>
                  <textarea
                    rows={2}
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                    value={applicableStandards}
                    onChange={(e) => setApplicableStandards(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">5. Entregáveis</label>
                  <textarea
                    rows={2}
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                    value={deliverables}
                    onChange={(e) => setDeliverables(e.target.value)}
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">6. Limitações Técnicas</label>
                  <textarea
                    rows={2}
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                    value={limitations}
                    onChange={(e) => setLimitations(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: COMMERCIAL TERMS */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800">Honorários e Condições Comerciais</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Valor Total dos Honorários (R$) *</label>
                  <input
                    type="number"
                    required
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-900 font-bold text-base"
                    value={totalValue}
                    onChange={(e) => setTotalValue(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Responsável pela Elaboração</label>
                  <select
                    className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-800"
                    value={responsible}
                    onChange={(e) => setResponsible(e.target.value)}
                  >
                    <option value="Eng. Luiz Felipe Bertacini">Eng. Luiz Felipe Bertacini</option>
                    <option value="Eng. Carlos Eduardo Bertacini">Eng. Carlos Eduardo Bertacini</option>
                    <option value="Mariana Silveira">Mariana Silveira</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Condições de Pagamento</label>
                <input
                  type="text"
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Prazo de Execução</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                    value={executionPeriod}
                    onChange={(e) => setExecutionPeriod(e.target.value)}
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Validade da Proposta</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                    value={validityPeriod}
                    onChange={(e) => setValidityPeriod(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800">Revisão Geral da Minuta</h3>

              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3 text-slate-700">
                <div className="flex justify-between items-start pb-2 border-b border-slate-200">
                  <div>
                    <span className="font-bold text-slate-900 text-sm">{serviceType}</span>
                    <p className="text-slate-500">Contratante: {selectedClientObj?.name}</p>
                  </div>
                  <span className="text-base font-bold text-sky-700">
                    {totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>

                <div>
                  <strong className="text-slate-900 block">Objeto:</strong>
                  <p className="text-slate-600 mt-0.5">{object || 'Definido conforme especificações técnicas.'}</p>
                </div>

                <div>
                  <strong className="text-slate-900 block">Escopo Resumido:</strong>
                  <p className="text-slate-600 mt-0.5 line-clamp-3">{scope || 'Vistoria e elaboração de laudo.'}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-200">
                  <span>Prazo: <strong>{executionPeriod}</strong></span>
                  <span>Pagamento: <strong>{paymentTerms}</strong></span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 italic text-center">
                A proposta será salva com identificador sequencial único e estará pronta para download em Word (.docx) ou PDF.
              </p>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="flex items-center gap-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50"
            >
              <ChevronLeft className="w-4 h-4" /> Voltar
            </button>
          ) : (
            <div></div>
          )}

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={() => {
                if (currentStep === 1 && !clientId) {
                  alert('Por favor, selecione um cliente.');
                  return;
                }
                setCurrentStep(currentStep + 1);
              }}
              className="flex items-center gap-1 px-4 py-2 bg-sky-600 text-white rounded-lg text-xs font-semibold hover:bg-sky-500"
            >
              Avançar <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-500 shadow-xs"
            >
              <Check className="w-4 h-4" /> Salvar e Gerar Proposta
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
