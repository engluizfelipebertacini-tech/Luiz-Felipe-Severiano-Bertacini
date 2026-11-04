import React, { useState } from 'react';
import { 
  Files, 
  Plus, 
  Search, 
  FileText, 
  Download, 
  CheckCircle2, 
  Clock, 
  User, 
  Building2,
  FileDown
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { TechnicalDocument, DocumentType, DocumentStatus } from '../types';

export const DocumentsView: React.FC = () => {
  const { documents, clients, services, addDocument, updateDocumentStatus } = useData();
  const { currentUser } = useAuth();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('todos');
  const [showModal, setShowModal] = useState(false);

  // New Document
  const [title, setTitle] = useState('');
  const [type, setType] = useState<DocumentType>('laudo_inspecao');
  const [clientId, setClientId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [author, setAuthor] = useState(currentUser.name);
  const [reviewer, setReviewer] = useState('Eng. Luiz Felipe Bertacini');
  const [content, setContent] = useState('');

  const filteredDocs = documents.filter((d) => {
    const matchSearch = d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.author.toLowerCase().includes(search.toLowerCase()) ||
      (d.clientName && d.clientName.toLowerCase().includes(search.toLowerCase()));
    const matchType = typeFilter === 'todos' || d.type === typeFilter;
    return matchSearch && matchType;
  });

  const docTypeLabels: Record<DocumentType, string> = {
    laudo_inspecao: 'Laudo de Inspeção Predial',
    laudo_patologia: 'Laudo de Manifestações Patológicas',
    laudo_pericial: 'Laudo Pericial Judicial',
    parecer_tecnico: 'Parecer Técnico de Engenharia',
    relatorio_fotografico: 'Relatório Fotográfico',
    art: 'ART - Anotação de Responsabilidade Técnica',
    proposta: 'Proposta Comercial',
    contrato: 'Contrato de Prestação de Serviços',
    peticao: 'Petição / Manifestação aos Autos',
    outro: 'Outro Documento',
  };

  const statusLabels: Record<DocumentStatus, { label: string; color: string }> = {
    elaboracao: { label: 'Em Elaboração', color: 'bg-slate-100 text-slate-700' },
    aguardando_revisao: { label: 'Aguardando Revisão RT', color: 'bg-amber-100 text-amber-800' },
    em_revisao: { label: 'Em Revisão Técnica', color: 'bg-blue-100 text-blue-800' },
    aprovado: { label: 'Aprovado para Entrega', color: 'bg-emerald-100 text-emerald-800' },
    entregue: { label: 'Entregue ao Cliente', color: 'bg-purple-100 text-purple-800' },
    arquivado: { label: 'Arquivado', color: 'bg-slate-100 text-slate-500' },
  };

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find(c => c.id === clientId);

    await addDocument({
      title,
      type,
      clientId: client?.id,
      clientName: client?.name,
      serviceId: serviceId || undefined,
      author,
      reviewer,
      version: 1,
      status: 'elaboracao',
      content,
    });

    setShowModal(false);
    setTitle('');
    setContent('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Files className="w-5 h-5 text-sky-600" />
            Laudos & Documentos Técnicos
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Central de minutas, relatórios fotográficos, laudos periciais e ARTs com controle de versão e revisão técnica.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-xs transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" /> Registrar Documento Técnico
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Buscar por título, autor, cliente..."
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
            <option value="todos">Todos os Tipos de Documento</option>
            <option value="laudo_inspecao">Laudos de Inspeção</option>
            <option value="laudo_pericial">Laudos Periciais</option>
            <option value="parecer_tecnico">Pareceres Técnicos</option>
            <option value="art">ARTs</option>
          </select>
        </div>

        <span className="text-slate-500 font-medium">
          {filteredDocs.length} documento(s) cadastrado(s)
        </span>
      </div>

      {/* Document List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
            <tr>
              <th className="py-3 px-4">Documento / Tipo</th>
              <th className="py-3 px-4">Cliente / Serviço</th>
              <th className="py-3 px-4">Autor / Revisor</th>
              <th className="py-3 px-4">Versão</th>
              <th className="py-3 px-4">Status da Revisão</th>
              <th className="py-3 px-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {filteredDocs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  Nenhum documento técnico registrado.
                </td>
              </tr>
            ) : (
              filteredDocs.map((docItem) => (
                <tr key={docItem.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 block">{docItem.title}</span>
                    <span className="text-[10px] text-slate-400">{docTypeLabels[docItem.type]}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-800 block">{docItem.clientName || 'Geral'}</span>
                    <span className="text-[10px] text-slate-400">{new Date(docItem.createdAt).toLocaleDateString('pt-BR')}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <div>Elaborador: <strong>{docItem.author.split(' ')[0]}</strong></div>
                    <div className="text-[10px] text-slate-400">Revisor: {docItem.reviewer?.split(' ')[0] || 'RT'}</div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">
                    v{docItem.version}.0
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusLabels[docItem.status]?.color}`}>
                      {statusLabels[docItem.status]?.label}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {docItem.status === 'elaboracao' && (
                        <button
                          onClick={() => updateDocumentStatus(docItem.id, 'aguardando_revisao')}
                          className="px-2 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded text-[10px] font-semibold hover:bg-amber-100"
                        >
                          Enviar p/ Revisão
                        </button>
                      )}
                      {docItem.status === 'aguardando_revisao' && (
                        <button
                          onClick={() => updateDocumentStatus(docItem.id, 'aprovado')}
                          className="px-2 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-semibold hover:bg-emerald-100"
                        >
                          Aprovar Minuta
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* New Document Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200">
            <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Registrar Minuta de Laudo ou Documento
            </h2>

            <form onSubmit={handleCreateDocument} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Título do Documento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Laudo Técnico de Inspeção Predial - Grand Boulevard"
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tipo de Documento</label>
                  <select
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                    value={type}
                    onChange={(e) => setType(e.target.value as DocumentType)}
                  >
                    <option value="laudo_inspecao">Laudo de Inspeção Predial</option>
                    <option value="laudo_patologia">Laudo de Patologias</option>
                    <option value="laudo_pericial">Laudo Pericial Judicial</option>
                    <option value="parecer_tecnico">Parecer Técnico</option>
                    <option value="relatorio_fotografico">Relatório Fotográfico</option>
                    <option value="art">ART</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Cliente Vinculado</label>
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
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Autor / Elaborador</label>
                  <select
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                  >
                    <option value="Eng. Luiz Felipe Bertacini">Eng. Luiz Felipe Bertacini</option>
                    <option value="Eng. Carlos Eduardo Bertacini">Eng. Carlos Eduardo Bertacini</option>
                    <option value="Eng. Rodrigo Alencar">Eng. Rodrigo Alencar</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Revisor Responsável Técnico</label>
                  <select
                    className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                    value={reviewer}
                    onChange={(e) => setReviewer(e.target.value)}
                  >
                    <option value="Eng. Luiz Felipe Bertacini">Eng. Luiz Felipe Bertacini (RT)</option>
                    <option value="Eng. Carlos Eduardo Bertacini">Eng. Carlos Eduardo Bertacini</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Minuta / Resumo Técnico</label>
                <textarea
                  rows={4}
                  placeholder="Introdução, conclusões preliminares ou observações da minuta..."
                  className="w-full p-2 border border-slate-200 rounded-lg text-slate-800"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
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
                  Salvar Documento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
