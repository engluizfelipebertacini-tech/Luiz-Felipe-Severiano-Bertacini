import React, { useState } from 'react';
import { 
  Briefcase, 
  Plus, 
  Search, 
  CheckCircle2, 
  Clock, 
  User, 
  Calendar, 
  Building2, 
  ChevronRight, 
  CheckSquare,
  MapPin,
  ChevronDown
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { ServiceItem } from '../types';

export const ServicesView: React.FC = () => {
  const { services, clients, updateServiceStage, addService } = useData();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  // New Service Modal
  const [showModal, setShowModal] = useState(false);
  const [clientId, setClientId] = useState('');
  const [title, setTitle] = useState('');
  const [serviceType, setServiceType] = useState('Inspeção Predial Conforme NBR 16747');
  const [serviceCategory, setServiceCategory] = useState('Engenharia Diagnóstica');
  const [contractedValue, setContractedValue] = useState<number>(14000);
  const [technicalLead, setTechnicalLead] = useState('Eng. Carlos Eduardo Bertacini');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedEndDate, setExpectedEndDate] = useState(new Date(Date.now() + 20 * 86400000).toISOString().split('T')[0]);
  const [address, setAddress] = useState('');

  const filteredServices = services.filter((s) => {
    const matchSearch = s.code.toLowerCase().includes(search.toLowerCase()) ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.clientName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'todos' || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    await addService({
      clientId: client.id,
      clientName: client.name,
      title,
      serviceCategory,
      serviceType,
      object: `Prestação de serviços de ${serviceType} para ${client.name}`,
      address: address || client.address,
      technicalLead,
      team: `${technicalLead}, Mariana Silveira`,
      startDate,
      expectedEndDate,
      contractedValue: Number(contractedValue),
      currentStage: 'Contratação e Abertura de ART',
      status: 'planejamento',
      stages: [
        { id: `stg-${Date.now()}-1`, name: 'Contratação e Abertura de ART', order: 1, responsible: 'Mariana Silveira', dueDate: startDate, status: 'em_andamento' },
        { id: `stg-${Date.now()}-2`, name: 'Planejamento e Documentação Técnica', order: 2, responsible: technicalLead, dueDate: expectedEndDate, status: 'pendente' },
        { id: `stg-${Date.now()}-3`, name: 'Diligência e Execução em Campo', order: 3, responsible: technicalLead, dueDate: expectedEndDate, status: 'pendente' },
        { id: `stg-${Date.now()}-4`, name: 'Elaboração e Revisão do Laudo', order: 4, responsible: technicalLead, dueDate: expectedEndDate, status: 'pendente' },
        { id: `stg-${Date.now()}-5`, name: 'Entrega Final e Encerramento', order: 5, responsible: 'Mariana Silveira', dueDate: expectedEndDate, status: 'pendente' },
      ],
    });

    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-sky-600" />
            Serviços & Gestão de Projetos
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Acompanhamento das etapas técnicas, responsáveis e prazos de entrega dos trabalhos contratados.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-xs transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Novo Serviço
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Buscar por código, título ou cliente..."
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
            <option value="planejamento">Planejamento</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="concluido">Concluído</option>
          </select>
        </div>

        <span className="text-slate-500 font-medium">
          {filteredServices.length} serviço(s) registrado(s)
        </span>
      </div>

      {/* Service Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredServices.map((srv) => {
          const completedStages = srv.stages.filter(s => s.status === 'concluido').length;
          const totalStages = srv.stages.length;
          const progressPercent = Math.round((completedStages / totalStages) * 100);

          return (
            <div
              key={srv.id}
              className="bg-white rounded-xl border border-slate-200 hover:border-sky-300 p-5 shadow-2xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-xs font-bold text-sky-700">{srv.code}</span>
                    <span className="text-[10px] text-slate-400 ml-2">Início: {new Date(srv.startDate).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    srv.status === 'em_andamento' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    srv.status === 'concluido' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {srv.status === 'em_andamento' ? 'Em Execução' : srv.status === 'concluido' ? 'Concluído' : 'Planejamento'}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-1 leading-snug">
                  {srv.title}
                </h3>
                <p className="text-xs text-slate-600 flex items-center gap-1 mb-2">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {srv.clientName}
                </p>

                {srv.address && (
                  <p className="text-xs text-slate-500 flex items-center gap-1 mb-3">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {srv.address}
                  </p>
                )}

                {/* Progress bar */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Etapa: <strong className="text-slate-800">{srv.currentStage}</strong></span>
                    <span className="font-bold text-slate-700">{progressPercent}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-sky-600 transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Bottom details & stages action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="text-slate-500">
                  <p>RT: <strong className="text-slate-700">{srv.technicalLead.split(' ')[0]}</strong></p>
                  <p className="text-[11px]">Prazo: {new Date(srv.expectedEndDate).toLocaleDateString('pt-BR')}</p>
                </div>

                <button
                  onClick={() => setSelectedService(srv)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold flex items-center gap-1"
                >
                  Ver Etapas & Ações <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Service Detail Modal with Stages Checklist */}
      {selectedService && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 text-xs space-y-4">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-sky-700 block">{selectedService.code}</span>
                <h2 className="text-base font-bold text-slate-900">{selectedService.title}</h2>
                <p className="text-slate-500 text-xs">Cliente: {selectedService.clientName}</p>
              </div>
              <button
                onClick={() => setSelectedService(null)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 grid grid-cols-2 gap-3 text-slate-700">
              <div>
                <p><strong>Responsável Técnico:</strong> {selectedService.technicalLead}</p>
                <p><strong>Equipe:</strong> {selectedService.team}</p>
              </div>
              <div>
                <p><strong>Valor Contratado:</strong> {selectedService.contractedValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                <p><strong>Previsão de Término:</strong> {new Date(selectedService.expectedEndDate).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>

            {/* Stages Flow */}
            <div className="space-y-2">
              <h3 className="font-bold text-slate-800 uppercase tracking-wide text-xs">
                Fluxo de Etapas Técnicas
              </h3>
              <div className="space-y-2">
                {selectedService.stages.map((stage) => (
                  <div
                    key={stage.id}
                    className="p-3 border border-slate-200 rounded-lg flex items-center justify-between bg-white"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-600">
                          {stage.order}
                        </span>
                        <span className={`font-semibold ${stage.status === 'concluido' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {stage.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 ml-7">
                        Resp: {stage.responsible} • Prazo: {new Date(stage.dueDate).toLocaleDateString('pt-BR')}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {stage.status !== 'concluido' ? (
                        <button
                          onClick={() => {
                            updateServiceStage(selectedService.id, stage.id, 'concluido');
                            // Update local view state
                            setSelectedService(prev => prev ? {
                              ...prev,
                              stages: prev.stages.map(s => s.id === stage.id ? { ...s, status: 'concluido' } : s)
                            } : null);
                          }}
                          className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-[11px] font-semibold border border-emerald-200 flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3" /> Concluir Etapa
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                          Concluído
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedService(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg font-semibold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Service Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Iniciar Novo Serviço / Projeto
            </h2>

            <form onSubmit={handleCreateService} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Cliente *</label>
                <select
                  required
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                  value={clientId}
                  onChange={(e) => {
                    setClientId(e.target.value);
                    const c = clients.find(cl => cl.id === e.target.value);
                    if (c && c.address) setAddress(c.address);
                  }}
                >
                  <option value="">Selecione um cliente...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Título do Serviço *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Inspeção Predial de Manutenção e Fachadas"
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tipo de Serviço</label>
                  <select
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                  >
                    <option value="Inspeção Predial Conforme NBR 16747">Inspeção Predial NBR 16747</option>
                    <option value="Vistoria Cautelar de Vizinhança">Vistoria Cautelar</option>
                    <option value="Parecer Técnico de Patologia">Parecer Técnico</option>
                    <option value="Perícia Judicial">Perícia Judicial</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Valor Contratado (R$)</label>
                  <input
                    type="number"
                    required
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                    value={contractedValue}
                    onChange={(e) => setContractedValue(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Responsável Técnico</label>
                  <select
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                    value={technicalLead}
                    onChange={(e) => setTechnicalLead(e.target.value)}
                  >
                    <option value="Eng. Luiz Felipe Bertacini">Eng. Luiz Felipe Bertacini</option>
                    <option value="Eng. Carlos Eduardo Bertacini">Eng. Carlos Eduardo Bertacini</option>
                    <option value="Eng. Rodrigo Alencar">Eng. Rodrigo Alencar</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Prazo Previsto</label>
                  <input
                    type="date"
                    required
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                    value={expectedEndDate}
                    onChange={(e) => setExpectedEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Local / Endereço</label>
                <input
                  type="text"
                  placeholder="Endereço da vistoria"
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
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
                  Criar Serviço
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
