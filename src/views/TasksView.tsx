import React, { useState } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Trash2, 
  User, 
  Building2,
  Calendar
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Task, TaskPriority, TaskStatus } from '../types';

export const TasksView: React.FC = () => {
  const { tasks, clients, services, addTask, updateTaskStatus, deleteTask } = useData();
  const { currentUser } = useAuth();

  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<'todas' | 'minhas' | 'atrasadas' | 'concluidas'>('todas');
  const [showModal, setShowModal] = useState(false);

  // New Task
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [responsible, setResponsible] = useState(currentUser.name);
  const [priority, setPriority] = useState<TaskPriority>('media');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('Administrativo');
  const [clientId, setClientId] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const filteredTasks = tasks.filter((t) => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.responsible.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase());

    if (!matchSearch) return false;

    if (filterMode === 'minhas') {
      return t.responsible === currentUser.name;
    }
    if (filterMode === 'atrasadas') {
      return (t.dueDate < today && t.status !== 'concluida') || t.status === 'atrasada';
    }
    if (filterMode === 'concluidas') {
      return t.status === 'concluida';
    }
    return true;
  });

  const priorityLabels: Record<TaskPriority, { label: string; color: string }> = {
    baixa: { label: 'Baixa', color: 'bg-slate-100 text-slate-700 border-slate-200' },
    media: { label: 'Média', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    alta: { label: 'Alta', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    urgente: { label: 'Urgente', color: 'bg-rose-50 text-rose-700 border-rose-200 font-bold' },
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find(c => c.id === clientId);

    await addTask({
      title,
      description,
      responsible,
      priority,
      dueDate,
      status: 'pendente',
      category,
      clientId: client?.id,
      clientName: client?.name,
    });

    setShowModal(false);
    setTitle('');
    setDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-sky-600" />
            Tarefas Internas & Planejamento
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Coordenação de rotinas administrativas, emissão de ARTs, preparo de perícias e pesquisas técnicas.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-xs transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Nova Tarefa
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg">
            <button
              onClick={() => setFilterMode('todas')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${filterMode === 'todas' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilterMode('minhas')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${filterMode === 'minhas' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
            >
              Minhas Tarefas
            </button>
            <button
              onClick={() => setFilterMode('atrasadas')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${filterMode === 'atrasadas' ? 'bg-rose-50 text-rose-800 font-bold shadow-xs' : 'text-slate-600'}`}
            >
              Atrasadas
            </button>
            <button
              onClick={() => setFilterMode('concluidas')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${filterMode === 'concluidas' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
            >
              Concluídas
            </button>
          </div>

          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Buscar tarefa..."
              className="w-full bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <span className="text-slate-500 font-medium">
          {filteredTasks.length} tarefa(s) listada(s)
        </span>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs divide-y divide-slate-100">
        {filteredTasks.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            Nenhuma tarefa encontrada neste filtro.
          </div>
        ) : (
          filteredTasks.map((t) => {
            const isOverdue = t.dueDate < today && t.status !== 'concluida';
            return (
              <div
                key={t.id}
                className="p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => updateTaskStatus(t.id, t.status === 'concluida' ? 'pendente' : 'concluida')}
                    className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                      t.status === 'concluida' ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 hover:border-sky-500'
                    }`}
                  >
                    {t.status === 'concluida' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.category}</span>
                    <h4 className={`font-semibold text-slate-900 ${t.status === 'concluida' ? 'line-through text-slate-400' : ''}`}>
                      {t.title}
                    </h4>

                    {t.clientName && (
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        {t.clientName}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                      <span>Resp: <strong className="text-slate-600">{t.responsible}</strong></span>
                      <span>•</span>
                      <span className={`flex items-center gap-1 ${isOverdue ? 'text-rose-600 font-bold' : ''}`}>
                        <Calendar className="w-3 h-3" />
                        {new Date(t.dueDate).toLocaleDateString('pt-BR')} {isOverdue && '(Vencida)'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${priorityLabels[t.priority]?.color}`}>
                    {priorityLabels[t.priority]?.label}
                  </span>

                  <button
                    onClick={() => {
                      if (confirm('Deseja excluir esta tarefa?')) deleteTask(t.id);
                    }}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
                    title="Excluir"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Task Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Nova Tarefa Interna
            </h2>

            <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Título da Tarefa *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Emitir ART e recolher taxa CREA"
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                    <option value="Eng. Rodrigo Alencar">Eng. Rodrigo Alencar</option>
                    <option value="Beatriz Fontes">Beatriz Fontes</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Prioridade</label>
                  <select
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Prazo de Conclusão *</label>
                  <input
                    type="date"
                    required
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Categoria</label>
                  <select
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="Administrativo">Administrativo</option>
                    <option value="Perícia Judicial">Perícia Judicial</option>
                    <option value="Equipamentos e Campo">Equipamentos e Campo</option>
                    <option value="Comercial">Comercial</option>
                    <option value="Financeiro">Financeiro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Cliente Vinculado (Opcional)</label>
                <select
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                >
                  <option value="">Nenhum / Uso Interno</option>
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
                  className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-500 font-semibold"
                >
                  Criar Tarefa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
