import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  Plus, 
  Camera, 
  Search, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Calendar,
  Building2,
  Image as ImageIcon,
  Check,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Inspection, InspectionChecklistItem, InspectionPhoto } from '../types';

export const InspectionsView: React.FC = () => {
  const { inspections, clients, services, addInspection, updateInspection } = useData();
  const { currentUser } = useAuth();

  const [search, setSearch] = useState('');
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);

  // New Inspection Modal
  const [showModal, setShowModal] = useState(false);
  const [clientId, setClientId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [type, setType] = useState('Inspeção Predial de Manutenção');
  const [address, setAddress] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('09:30');
  const [responsible, setResponsible] = useState(currentUser.name);
  const [participants, setParticipants] = useState('Engenheiro Responsável, Síndico, Zelador');
  const [objective, setObjective] = useState('');
  const [scope, setScope] = useState('');
  const [isGeneratingAiChecklist, setIsGeneratingAiChecklist] = useState(false);

  // Active Inspection In-Field Editing (Checklist & Photos)
  const [newChecklistSystem, setNewChecklistSystem] = useState('Estrutura e Vedações');
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [photoCaption, setPhotoCaption] = useState('');
  const [photoSystem, setPhotoSystem] = useState('Fachadas');

  const filteredInspections = inspections.filter((i) => {
    return i.type.toLowerCase().includes(search.toLowerCase()) ||
      i.clientName.toLowerCase().includes(search.toLowerCase()) ||
      i.address.toLowerCase().includes(search.toLowerCase());
  });

  // AI Checklist Generation
  const handleGenerateAiChecklist = async () => {
    setIsGeneratingAiChecklist(true);
    try {
      const res = await fetch('/api/ai/generate-checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceType: type,
          propertyCharacteristics: objective || 'Edifício padrão residencial',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.items && Array.isArray(data.items) && selectedInspection) {
          const newItems: InspectionChecklistItem[] = data.items.map((it: any, idx: number) => ({
            id: `chk-ai-${Date.now()}-${idx}`,
            system: it.system || 'Geral',
            checkItem: it.checkItem || String(it),
            status: 'pendente',
          }));
          const updatedChecklist = [...selectedInspection.checklist, ...newItems];
          updateInspection(selectedInspection.id, { checklist: updatedChecklist });
          setSelectedInspection({ ...selectedInspection, checklist: updatedChecklist });
        }
      }
    } catch (e) {
      console.error('Falha ao gerar checklist com IA:', e);
    } finally {
      setIsGeneratingAiChecklist(false);
    }
  };

  const handleCreateInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const defaultChecklist: InspectionChecklistItem[] = [
      { id: `chk-1`, system: 'Estruturas de Concreto', checkItem: 'Verificar armaduras expostas, desagregação e fissuras em pilares/vigas', status: 'pendente' },
      { id: `chk-2`, system: 'Fachadas e Revestimentos', checkItem: 'Identificar destacamento cerâmico, eflorescências e trincas', status: 'pendente' },
      { id: `chk-3`, system: 'Impermeabilização e Cobertura', checkItem: 'Verificar manta asfáltica, ralos, rufos e umidade em lajes', status: 'pendente' },
      { id: `chk-4`, system: 'Instalações Hidráulicas e SPDA', checkItem: 'Inspecionar barriletes, registros, para-raios e aterramentos', status: 'pendente' },
    ];

    await addInspection({
      clientId: client.id,
      clientName: client.name,
      serviceId: serviceId || undefined,
      type,
      address: address || client.address,
      date,
      time,
      responsible,
      participants,
      status: 'agendada',
      objective: objective || `Inspeção técnica presencial para verificação de manifestações patológicas.`,
      scope: scope || `Vistoria detalhada em todas as áreas comuns do condomínio.`,
      checklist: defaultChecklist,
      photos: [],
    });

    setShowModal(false);
  };

  // Add sample photo to active inspection
  const handleAddSamplePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedInspection) return;
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvt) => {
        const photoUrl = uploadEvt.target?.result as string;
        const newPhoto: InspectionPhoto = {
          id: `pht-${Date.now()}`,
          url: photoUrl,
          caption: photoCaption || `Registro fotográfico - ${photoSystem}`,
          system: photoSystem,
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        };
        const updatedPhotos = [...selectedInspection.photos, newPhoto];
        updateInspection(selectedInspection.id, { photos: updatedPhotos });
        setSelectedInspection({ ...selectedInspection, photos: updatedPhotos });
        setPhotoCaption('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateChecklistItemStatus = (itemIndex: number, newStatus: 'conforme' | 'nao_conforme' | 'nao_se_aplica') => {
    if (!selectedInspection) return;
    const updated = [...selectedInspection.checklist];
    updated[itemIndex].status = newStatus;
    updateInspection(selectedInspection.id, { checklist: updated });
    setSelectedInspection({ ...selectedInspection, checklist: updated });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-sky-600" />
            Vistorias & Inspeções de Campo
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro in loco, fotografias técnicas com sistema construtivo e checklists para laudos diagnósticos.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-xs transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Agendar Vistoria de Campo
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Buscar por tipo, cliente ou endereço..."
            className="w-full bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <span className="text-slate-500 font-medium">
          {filteredInspections.length} vistoria(s) registrada(s)
        </span>
      </div>

      {/* Inspections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInspections.map((insp) => (
          <div
            key={insp.id}
            className="bg-white rounded-xl border border-slate-200 hover:border-sky-300 p-5 shadow-2xs transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  insp.status === 'finalizada' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  insp.status === 'em_campo' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                  {insp.status === 'finalizada' ? 'Finalizada' : insp.status === 'em_campo' ? 'Em Campo' : 'Agendada'}
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {new Date(insp.date).toLocaleDateString('pt-BR')} às {insp.time}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 mb-1 leading-snug">
                {insp.type}
              </h3>
              <p className="text-xs text-slate-600 flex items-center gap-1 mb-2">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {insp.clientName}
              </p>

              <p className="text-xs text-slate-500 flex items-center gap-1 mb-3">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {insp.address}
              </p>

              <div className="flex items-center gap-3 text-[11px] text-slate-500 mb-3 bg-slate-50 p-2 rounded">
                <span>Checklist: <strong>{insp.checklist.filter(c => c.status !== 'pendente').length}/{insp.checklist.length}</strong></span>
                <span>•</span>
                <span>Fotos: <strong>{insp.photos.length}</strong></span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Resp: <strong>{insp.responsible.split(' ')[0]}</strong></span>
              <button
                onClick={() => setSelectedInspection(insp)}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-semibold flex items-center gap-1"
              >
                Abrir Ficha de Campo <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Field Inspection Active Modal (Ficha de Campo com Checklist e Fotos) */}
      {selectedInspection && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col p-6 shadow-2xl border border-slate-200 text-xs">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-sky-700 uppercase">Ficha Técnica de Campo</span>
                <h2 className="text-base font-bold text-slate-900">{selectedInspection.type}</h2>
                <p className="text-slate-500">{selectedInspection.clientName} • {selectedInspection.address}</p>
              </div>
              <button
                onClick={() => setSelectedInspection(null)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1 text-sm"
              >
                ✕
              </button>
            </div>

            {/* Content with 2 Tabs: Checklist e Relatório Fotográfico */}
            <div className="flex-1 overflow-y-auto py-4 space-y-5">
              {/* Checklist Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <h3 className="font-bold text-slate-800 text-xs uppercase flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Checklist de Manifestações Patológicas
                  </h3>
                  <button
                    onClick={handleGenerateAiChecklist}
                    disabled={isGeneratingAiChecklist}
                    className="flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded text-[11px] font-semibold hover:bg-amber-100 transition-all"
                  >
                    {isGeneratingAiChecklist ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Sugerindo com IA...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        <span>Sugerir Itens com IA</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-2">
                  {selectedInspection.checklist.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-3 border border-slate-200 rounded-lg bg-slate-50/50 flex items-center justify-between gap-3"
                    >
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-500 block">{item.system}</span>
                        <p className="font-semibold text-slate-900">{item.checkItem}</p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleUpdateChecklistItemStatus(idx, 'conforme')}
                          className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
                            item.status === 'conforme' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          Conforme
                        </button>
                        <button
                          onClick={() => handleUpdateChecklistItemStatus(idx, 'nao_conforme')}
                          className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
                            item.status === 'nao_conforme' ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          Não Conforme
                        </button>
                        <button
                          onClick={() => handleUpdateChecklistItemStatus(idx, 'nao_se_aplica')}
                          className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${
                            item.status === 'nao_se_aplica' ? 'bg-slate-700 text-white border-slate-700' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          N/A
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Photos Section */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                  <h3 className="font-bold text-slate-800 text-xs uppercase flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-sky-600" /> Registro Fotográfico de Campo ({selectedInspection.photos.length})
                  </h3>
                </div>

                {/* Upload box */}
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex flex-wrap items-center gap-3">
                  <input
                    type="text"
                    placeholder="Legenda / Anotação da anomalia"
                    className="flex-1 min-w-[200px] p-2 bg-white border border-slate-200 rounded-lg text-xs"
                    value={photoCaption}
                    onChange={(e) => setPhotoCaption(e.target.value)}
                  />
                  <select
                    value={photoSystem}
                    onChange={(e) => setPhotoSystem(e.target.value)}
                    className="p-2 bg-white border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="Estruturas">Estruturas</option>
                    <option value="Fachadas">Fachadas</option>
                    <option value="Impermeabilização">Impermeabilização</option>
                    <option value="Instalações">Instalações</option>
                    <option value="Cobertura">Cobertura</option>
                  </select>

                  <label className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-lg font-semibold cursor-pointer shadow-xs">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Adicionar Fotografia</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={handleAddSamplePhoto}
                    />
                  </label>
                </div>

                {/* Photos Grid */}
                {selectedInspection.photos.length === 0 ? (
                  <p className="text-slate-400 py-4 text-center">Nenhuma fotografia anexada a esta vistoria ainda.</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedInspection.photos.map((pht) => (
                      <div key={pht.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                        <img src={pht.url} alt={pht.caption} className="w-full h-36 object-cover bg-slate-100" />
                        <div className="p-2">
                          <span className="text-[9px] uppercase font-bold text-sky-700 block">{pht.system}</span>
                          <p className="font-semibold text-slate-800 truncate text-[11px]">{pht.caption}</p>
                          <span className="text-[10px] text-slate-400">{pht.timestamp}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  updateInspection(selectedInspection.id, { status: 'finalizada' });
                  setSelectedInspection({ ...selectedInspection, status: 'finalizada' });
                  alert('Vistoria finalizada e salva!');
                }}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-500"
              >
                Finalizar Vistoria de Campo
              </button>

              <button
                onClick={() => setSelectedInspection(null)}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg font-semibold"
              >
                Concluir Edição
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Inspection Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Agendar Nova Vistoria / Inspeção
            </h2>

            <form onSubmit={handleCreateInspection} className="space-y-3.5 text-xs">
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
                <label className="font-semibold text-slate-700 block mb-1">Tipo de Vistoria</label>
                <select
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="Inspeção Predial de Manutenção">Inspeção Predial de Manutenção</option>
                  <option value="Vistoria Cautelar de Vizinhança">Vistoria Cautelar de Vizinhança</option>
                  <option value="Vistoria de Recebimento de Imóvel">Vistoria de Recebimento de Imóvel</option>
                  <option value="Inspeção de Fachada com Termografia">Inspeção de Fachada com Termografia</option>
                  <option value="Diligência Pericial Judicial">Diligência Pericial Judicial</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Data da Vistoria *</label>
                  <input
                    type="date"
                    required
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Horário Previsto *</label>
                  <input
                    type="time"
                    required
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Endereço da Inspeção</label>
                <input
                  type="text"
                  required
                  placeholder="Endereço completo"
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Responsável Técnico</label>
                  <select
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                    value={responsible}
                    onChange={(e) => setResponsible(e.target.value)}
                  >
                    <option value="Eng. Luiz Felipe Bertacini">Eng. Luiz Felipe Bertacini</option>
                    <option value="Eng. Carlos Eduardo Bertacini">Eng. Carlos Eduardo Bertacini</option>
                    <option value="Eng. Rodrigo Alencar">Eng. Rodrigo Alencar</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Participantes</label>
                  <input
                    type="text"
                    placeholder="Síndico, assistente, zelador..."
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                    value={participants}
                    onChange={(e) => setParticipants(e.target.value)}
                  />
                </div>
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
                  Agendar e Sincronizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
