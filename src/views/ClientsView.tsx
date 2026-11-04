import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  Briefcase, 
  DollarSign, 
  Calendar, 
  MoreVertical, 
  Edit, 
  Trash2, 
  ChevronRight,
  User,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { Client, ClientType } from '../types';

interface ClientsViewProps {
  onOpenNewProposalWithClient?: (client: Client) => void;
  onOpenNewInspectionWithClient?: (client: Client) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  onOpenNewProposalWithClient,
  onOpenNewInspectionWithClient,
}) => {
  const { clients, proposals, services, inspections, financialEntries, addClient, updateClient, deleteClient } = useData();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('todos');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [activeTab, setActiveTab] = useState<'propostas' | 'servicos' | 'vistorias' | 'financeiro'>('propostas');

  // New Client Modal
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<ClientType>('condominio');
  const [document, setDocument] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('São Paulo');
  const [state, setState] = useState('SP');
  const [cep, setCep] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [notes, setNotes] = useState('');
  const [commercialResponsible, setCommercialResponsible] = useState('Mariana Silveira');

  const filteredClients = clients.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
      c.document.includes(search) || 
      c.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'todos' || c.type === typeFilter;
    return matchSearch && matchType;
  });

  const handleOpenCreate = () => {
    setEditingClient(null);
    setName('');
    setType('condominio');
    setDocument('');
    setEmail('');
    setPhone('');
    setAddress('');
    setCity('São Paulo');
    setState('SP');
    setCep('');
    setContactPerson('');
    setNotes('');
    setCommercialResponsible('Mariana Silveira');
    setShowModal(true);
  };

  const handleOpenEdit = (c: Client) => {
    setEditingClient(c);
    setName(c.name);
    setType(c.type);
    setDocument(c.document);
    setEmail(c.email);
    setPhone(c.phone);
    setAddress(c.address);
    setCity(c.city);
    setState(c.state);
    setCep(c.cep);
    setContactPerson(c.contactPerson);
    setNotes(c.notes || '');
    setCommercialResponsible(c.commercialResponsible);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClient) {
      await updateClient(editingClient.id, {
        name,
        type,
        document,
        email,
        phone,
        address,
        city,
        state,
        cep,
        contactPerson,
        notes,
        commercialResponsible,
      });
    } else {
      await addClient({
        name,
        type,
        document,
        email,
        phone,
        address,
        city,
        state,
        cep,
        contactPerson,
        notes,
        commercialResponsible,
      });
    }
    setShowModal(false);
  };

  const getClientProposals = (clientId: string) => proposals.filter(p => p.clientId === clientId);
  const getClientServices = (clientId: string) => services.filter(s => s.clientId === clientId);
  const getClientInspections = (clientId: string) => inspections.filter(i => i.clientId === clientId);
  const getClientFinancials = (clientId: string) => financialEntries.filter(f => f.clientId === clientId);

  const clientTypeLabels: Record<ClientType, { label: string; color: string }> = {
    condominio: { label: 'Condomínio', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    empresa: { label: 'Empresa', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    escritorio_advocacia: { label: 'Escritório de Advocacia', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    construtora: { label: 'Construtora / Incorporadora', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    pessoa_fisica: { label: 'Pessoa Física', color: 'bg-slate-50 text-slate-700 border-slate-200' },
    outro: { label: 'Outro', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-sky-600" />
            Clientes & Gestão de Contratantes
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cadastro de condomínios, construtoras, escritórios de advocacia e histórico unificado de relacionamento.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-xs transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Novo Cliente
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Buscar por nome, CNPJ, síndico ou cidade..."
              className="w-full bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 focus:outline-none"
          >
            <option value="todos">Todos os Tipos de Cliente</option>
            <option value="condominio">Condomínios</option>
            <option value="escritorio_advocacia">Escritórios de Advocacia</option>
            <option value="construtora">Construtoras / Incorporadoras</option>
            <option value="empresa">Empresas Comerciais</option>
            <option value="pessoa_fisica">Pessoas Físicas</option>
          </select>
        </div>

        <span className="text-slate-500 font-medium">
          {filteredClients.length} cliente(s) cadastrado(s)
        </span>
      </div>

      {/* Client List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => {
          const clientProps = getClientProposals(client.id);
          const clientSrvs = getClientServices(client.id);
          return (
            <div
              key={client.id}
              className="bg-white rounded-xl border border-slate-200 hover:border-sky-300 p-5 shadow-2xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${clientTypeLabels[client.type]?.color}`}>
                    {clientTypeLabels[client.type]?.label}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(client)}
                      className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600"
                      title="Editar dados"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Deseja excluir o cliente ${client.name}?`)) {
                          deleteClient(client.id);
                        }
                      }}
                      className="p-1 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mb-1 leading-snug">
                  {client.name}
                </h3>
                <p className="text-[11px] text-slate-400 mb-3">Doc: {client.document || 'Não informado'}</p>

                <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                  <p className="flex items-center gap-2 truncate">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{client.contactPerson}</span>
                  </p>
                  <p className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{client.phone}</span>
                  </p>
                  <p className="flex items-center gap-2 truncate text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{client.address}, {client.city}/{client.state}</span>
                  </p>
                </div>
              </div>

              {/* Bottom quick stats & details button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span title="Propostas">{clientProps.length} prop.</span>
                  <span>•</span>
                  <span title="Serviços ativos">{clientSrvs.length} serv.</span>
                </div>

                <button
                  onClick={() => setSelectedClient(client)}
                  className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
                >
                  Ver Histórico <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Client Detail Full Modal */}
      {selectedClient && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col p-6 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border mb-1.5 inline-block ${clientTypeLabels[selectedClient.type]?.color}`}>
                  {clientTypeLabels[selectedClient.type]?.label}
                </span>
                <h2 className="text-lg font-bold text-slate-900">{selectedClient.name}</h2>
                <p className="text-xs text-slate-500">
                  {selectedClient.document} • Contato: {selectedClient.contactPerson} ({selectedClient.phone})
                </p>
              </div>
              <button
                onClick={() => setSelectedClient(null)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold p-1 rounded"
              >
                ✕
              </button>
            </div>

            {/* Sub-tabs */}
            <div className="flex border-b border-slate-200 text-xs font-semibold gap-4 pt-3">
              <button
                onClick={() => setActiveTab('propostas')}
                className={`pb-2 border-b-2 transition-colors ${activeTab === 'propostas' ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-500'}`}
              >
                Propostas ({getClientProposals(selectedClient.id).length})
              </button>
              <button
                onClick={() => setActiveTab('servicos')}
                className={`pb-2 border-b-2 transition-colors ${activeTab === 'servicos' ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-500'}`}
              >
                Serviços ({getClientServices(selectedClient.id).length})
              </button>
              <button
                onClick={() => setActiveTab('vistorias')}
                className={`pb-2 border-b-2 transition-colors ${activeTab === 'vistorias' ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-500'}`}
              >
                Vistorias ({getClientInspections(selectedClient.id).length})
              </button>
              <button
                onClick={() => setActiveTab('financeiro')}
                className={`pb-2 border-b-2 transition-colors ${activeTab === 'financeiro' ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-500'}`}
              >
                Financeiro ({getClientFinancials(selectedClient.id).length})
              </button>
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3 text-xs">
              {activeTab === 'propostas' && (
                <div>
                  {getClientProposals(selectedClient.id).length === 0 ? (
                    <p className="text-slate-400 py-6 text-center">Nenhuma proposta gerada para este cliente.</p>
                  ) : (
                    getClientProposals(selectedClient.id).map(p => (
                      <div key={p.id} className="p-3 border border-slate-100 rounded-lg bg-slate-50/50 flex justify-between items-center mb-2">
                        <div>
                          <span className="font-bold text-slate-800">{p.code} — {p.serviceType}</span>
                          <p className="text-[11px] text-slate-500 mt-0.5">Emitida em {new Date(p.createdAt).toLocaleDateString('pt-BR')} • Status: {p.status}</p>
                        </div>
                        <span className="font-bold text-emerald-600">{p.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'servicos' && (
                <div>
                  {getClientServices(selectedClient.id).length === 0 ? (
                    <p className="text-slate-400 py-6 text-center">Nenhum serviço em execução para este cliente.</p>
                  ) : (
                    getClientServices(selectedClient.id).map(s => (
                      <div key={s.id} className="p-3 border border-slate-100 rounded-lg bg-slate-50/50 flex justify-between items-center mb-2">
                        <div>
                          <span className="font-bold text-slate-800">{s.code} — {s.title}</span>
                          <p className="text-[11px] text-slate-500 mt-0.5">Etapa: {s.currentStage} • Responsável: {s.technicalLead}</p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded">{s.status}</span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'vistorias' && (
                <div>
                  {getClientInspections(selectedClient.id).length === 0 ? (
                    <p className="text-slate-400 py-6 text-center">Nenhuma vistoria registrada para este cliente.</p>
                  ) : (
                    getClientInspections(selectedClient.id).map(i => (
                      <div key={i.id} className="p-3 border border-slate-100 rounded-lg bg-slate-50/50 flex justify-between items-center mb-2">
                        <div>
                          <span className="font-bold text-slate-800">{i.type}</span>
                          <p className="text-[11px] text-slate-500 mt-0.5">Data: {i.date} às {i.time} • Responsável: {i.responsible}</p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">{i.status}</span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'financeiro' && (
                <div>
                  {getClientFinancials(selectedClient.id).length === 0 ? (
                    <p className="text-slate-400 py-6 text-center">Nenhum lançamento financeiro para este cliente.</p>
                  ) : (
                    getClientFinancials(selectedClient.id).map(f => (
                      <div key={f.id} className="p-3 border border-slate-100 rounded-lg bg-slate-50/50 flex justify-between items-center mb-2">
                        <div>
                          <span className="font-bold text-slate-800">{f.description}</span>
                          <p className="text-[11px] text-slate-500 mt-0.5">Vencimento: {new Date(f.dueDate).toLocaleDateString('pt-BR')} • Status: {f.status}</p>
                        </div>
                        <span className="font-bold text-slate-800">{f.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedClient(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold"
              >
                Fechar Histórico
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New/Edit Client Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200">
            <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              {editingClient ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nome ou Razão Social *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Condomínio Edifício Grand Boulevard"
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tipo de Cliente</label>
                  <select
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                    value={type}
                    onChange={(e) => setType(e.target.value as ClientType)}
                  >
                    <option value="condominio">Condomínio</option>
                    <option value="escritorio_advocacia">Escritório de Advocacia</option>
                    <option value="construtora">Construtora / Incorporadora</option>
                    <option value="empresa">Empresa</option>
                    <option value="pessoa_fisica">Pessoa Física</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">CNPJ ou CPF</label>
                  <input
                    type="text"
                    placeholder="00.000.000/0000-00"
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                    value={document}
                    onChange={(e) => setDocument(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Contato Principal *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nome do Síndico / Gestor"
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Telefone / WhatsApp *</label>
                  <input
                    type="text"
                    required
                    placeholder="(11) 90000-0000"
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">E-mail</label>
                <input
                  type="email"
                  placeholder="administracao@cliente.com.br"
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Endereço do Imóvel</label>
                  <input
                    type="text"
                    placeholder="Rua, número, bairro"
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Cidade / UF</label>
                  <input
                    type="text"
                    placeholder="São Paulo/SP"
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                    value={`${city}/${state}`}
                    onChange={(e) => {
                      const parts = e.target.value.split('/');
                      setCity(parts[0] || 'São Paulo');
                      setState(parts[1] || 'SP');
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Responsável Comercial</label>
                <select
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                  value={commercialResponsible}
                  onChange={(e) => setCommercialResponsible(e.target.value)}
                >
                  <option value="Mariana Silveira">Mariana Silveira</option>
                  <option value="Eng. Luiz Felipe Bertacini">Eng. Luiz Felipe Bertacini</option>
                  <option value="Eng. Carlos Eduardo Bertacini">Eng. Carlos Eduardo Bertacini</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Observações Técnicas / Histórico</label>
                <textarea
                  rows={2}
                  placeholder="Características da edificação, anomalias relatadas, histórico..."
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
                  {editingClient ? 'Atualizar Dados' : 'Cadastrar Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
