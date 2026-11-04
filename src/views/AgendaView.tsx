import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  User, 
  Building2, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  Check
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { CalendarEventItem } from '../types';

export const AgendaView: React.FC = () => {
  const { calendarEvents, clients, services, syncWithGoogleCalendar, logActivity } = useData();
  const { currentUser, calendarConnected, loginWithGoogle } = useAuth();

  const [activeTab, setActiveTab] = useState<'mes' | 'semana' | 'lista'>('mes');
  const [selectedResponsible, setSelectedResponsible] = useState<string>('todos');
  const [selectedType, setSelectedType] = useState<string>('todos');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // New Event Modal
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Vistoria Predial');
  const [clientId, setClientId] = useState('');
  const [responsible, setResponsible] = useState(currentUser.name);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  const eventTypes = [
    'Vistoria Predial',
    'Inspeção Predial',
    'Inspeção de OAE',
    'Perícia Judicial',
    'Perícia Extrajudicial',
    'Reunião com Cliente',
    'Reunião Interna',
    'Visita Técnica',
    'Elaboração de Laudo',
    'Revisão de Documentos',
    'Prazo Processual',
    'Atividade Administrativa',
  ];

  // Filtering
  const filteredEvents = calendarEvents.filter((evt) => {
    if (selectedResponsible !== 'todos' && evt.responsible !== selectedResponsible) return false;
    if (selectedType !== 'todos' && evt.type !== selectedType) return false;
    return true;
  });

  // Check for conflicts
  const getConflicts = () => {
    const conflicts: { e1: CalendarEventItem; e2: CalendarEventItem }[] = [];
    for (let i = 0; i < filteredEvents.length; i++) {
      for (let j = i + 1; j < filteredEvents.length; j++) {
        const e1 = filteredEvents[i];
        const e2 = filteredEvents[j];
        if (e1.responsible === e2.responsible) {
          const s1 = new Date(e1.startDate).getTime();
          const en1 = new Date(e1.endDate).getTime();
          const s2 = new Date(e2.startDate).getTime();
          const en2 = new Date(e2.endDate).getTime();
          if (s1 < en2 && en1 > s2) {
            conflicts.push({ e1, e2 });
          }
        }
      }
    }
    return conflicts;
  };

  const conflicts = getConflicts();

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const count = await syncWithGoogleCalendar();
      setSyncFeedback(`Google Calendar sincronizado com sucesso! ${count} novos eventos importados.`);
      setTimeout(() => setSyncFeedback(null), 5000);
    } catch (err: any) {
      setSyncFeedback(err?.message || 'Falha na sincronização.');
      setTimeout(() => setSyncFeedback(null), 7000);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !startTime || !endTime) return;

    const startDateTime = `${date}T${startTime}:00-03:00`;
    const endDateTime = `${date}T${endTime}:00-03:00`;
    const client = clients.find(c => c.id === clientId);

    const newEvent: CalendarEventItem = {
      id: `cal-${Date.now()}`,
      title,
      type,
      clientId: client?.id,
      clientName: client?.name,
      responsible,
      startDate: startDateTime,
      endDate: endDateTime,
      location,
      description,
      createdAt: new Date().toISOString(),
    };

    calendarEvents.push(newEvent);
    localStorage.setItem('bertacini_calendar_events', JSON.stringify(calendarEvents));
    logActivity('Compromisso Agendado', 'Agenda', newEvent.id, `Criado evento ${title} para ${responsible}`);

    setShowModal(false);
    setTitle('');
    setLocation('');
    setDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-sky-600" />
            Agenda & Google Calendar Integrado
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gerenciamento consolidado de vistorias, inspeções técnicas, perícias judiciais e reuniões da equipe.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {calendarConnected ? (
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold px-3.5 py-2 rounded-lg transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Google Calendar'}</span>
            </button>
          ) : (
            <button
              onClick={loginWithGoogle}
              className="flex items-center gap-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 text-xs font-semibold px-3.5 py-2 rounded-lg transition-all"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-sky-600" />
              <span>Conectar ao Google Calendar</span>
            </button>
          )}

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" /> Novo Compromisso
          </button>
        </div>
      </div>

      {/* Sync Feedback Alert */}
      {syncFeedback && (
        <div className="p-3 bg-sky-50 border border-sky-200 text-sky-900 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
          <span>{syncFeedback}</span>
        </div>
      )}

      {/* Conflict Alert Banner */}
      {conflicts.length > 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Atenção:</strong> Conflito de horário detectado entre <strong>{conflicts[0].e1.title}</strong> e <strong>{conflicts[0].e2.title}</strong> para o mesmo responsável.
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase bg-amber-200 px-2 py-0.5 rounded text-amber-800">
            Conflito de Agenda
          </span>
        </div>
      )}

      {/* Filter and View Selector Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg">
            <button
              onClick={() => setActiveTab('mes')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${activeTab === 'mes' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
            >
              Visão Mensal
            </button>
            <button
              onClick={() => setActiveTab('semana')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${activeTab === 'semana' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
            >
              Semanal
            </button>
            <button
              onClick={() => setActiveTab('lista')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${activeTab === 'lista' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
            >
              Lista Completa
            </button>
          </div>

          {/* Responsible Filter */}
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedResponsible}
              onChange={(e) => setSelectedResponsible(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 focus:outline-none"
            >
              <option value="todos">Todos os Responsáveis</option>
              <option value="Eng. Luiz Felipe Bertacini">Eng. Luiz Felipe Bertacini</option>
              <option value="Eng. Carlos Eduardo Bertacini">Eng. Carlos Eduardo Bertacini</option>
              <option value="Eng. Rodrigo Alencar">Eng. Rodrigo Alencar</option>
              <option value="Mariana Silveira">Mariana Silveira</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 focus:outline-none"
            >
              <option value="todos">Todos os Tipos</option>
              {eventTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <span className="text-slate-500 font-medium">
          {filteredEvents.length} compromisso(s) filtrado(s)
        </span>
      </div>

      {/* Agenda Content */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <CalendarIcon className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold">Nenhum compromisso encontrado para este filtro.</p>
            <p className="text-xs text-slate-400 mt-1">Clique em "Novo Compromisso" para registrar ou sincronize com o Google Calendar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEvents.map((evt) => (
              <div
                key={evt.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-sky-300 bg-white hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100">
                      {evt.type}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {new Date(evt.startDate).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mb-1 leading-snug">
                    {evt.title}
                  </h3>

                  {evt.clientName && (
                    <p className="text-xs text-slate-600 flex items-center gap-1 mb-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {evt.clientName}
                    </p>
                  )}

                  {evt.location && (
                    <p className="text-xs text-slate-500 flex items-center gap-1 mb-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {evt.location}
                    </p>
                  )}

                  {evt.description && (
                    <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 line-clamp-2 mb-2">
                      {evt.description}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {new Date(evt.startDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {new Date(evt.endDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="font-medium text-slate-700">{evt.responsible.split(' ')[0]}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Agendar Novo Compromisso
            </h2>

            <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Título do Evento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Vistoria Predial - Condomínio Grand Boulevard"
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tipo de Atividade</label>
                  <select
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    {eventTypes.map(t => (
                      <option key={t} value={t}>{t}</option>
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
                    <option value="Eng. Luiz Felipe Bertacini">Eng. Luiz Felipe Bertacini</option>
                    <option value="Eng. Carlos Eduardo Bertacini">Eng. Carlos Eduardo Bertacini</option>
                    <option value="Eng. Rodrigo Alencar">Eng. Rodrigo Alencar</option>
                    <option value="Mariana Silveira">Mariana Silveira</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Cliente Vinculado (Opcional)</label>
                <select
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                  value={clientId}
                  onChange={(e) => {
                    setClientId(e.target.value);
                    const sel = clients.find(c => c.id === e.target.value);
                    if (sel && sel.address) setLocation(sel.address);
                  }}
                >
                  <option value="">Nenhum / Não vinculado</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Data *</label>
                  <input
                    type="date"
                    required
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Início *</label>
                  <input
                    type="time"
                    required
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Término *</label>
                  <input
                    type="time"
                    required
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Endereço / Localização</label>
                <input
                  type="text"
                  placeholder="Rua, número, complemento, cidade"
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Observações e Checklist</label>
                <textarea
                  rows={2}
                  placeholder="Equipamentos necessários, documentação a solicitar, etc."
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
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
                  Salvar Compromisso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
