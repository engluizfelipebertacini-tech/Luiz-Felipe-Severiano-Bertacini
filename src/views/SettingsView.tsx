import React, { useState } from 'react';
import { 
  Settings, 
  Building2, 
  Shield, 
  Users, 
  Calendar, 
  Clock, 
  Save, 
  HardHat, 
  Upload, 
  CheckCircle2, 
  History,
  Lock
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { CompanySettings } from '../types';

export const SettingsView: React.FC = () => {
  const { companySettings, updateCompanySettings, activityLogs } = useData();
  const { currentUser, availableUsers, canEditSettings, loginWithGoogle, calendarConnected } = useAuth();

  const [activeTab, setActiveTab] = useState<'empresa' | 'usuarios' | 'integracoes' | 'auditoria'>('empresa');
  const [formData, setFormData] = useState<CompanySettings>(companySettings);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateCompanySettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        const url = loadEvt.target?.result as string;
        setFormData(prev => ({ ...prev, logoUrl: url }));
        updateCompanySettings({ logoUrl: url });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-sky-600" />
          Configurações da Empresa & Governança
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Dados cadastrais da Bertacini Engenharia, credenciamento no CREA, gestão de acessos e trilha de auditoria.
        </p>

        {/* Sub-tabs */}
        <div className="flex border-b border-slate-200 text-xs font-semibold gap-6 pt-4">
          <button
            onClick={() => setActiveTab('empresa')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'empresa' ? 'border-sky-600 text-sky-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" /> Dados Institucionais
          </button>
          <button
            onClick={() => setActiveTab('usuarios')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'usuarios' ? 'border-sky-600 text-sky-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" /> Usuários e Perfis ({availableUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('integracoes')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'integracoes' ? 'border-sky-600 text-sky-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" /> Google Calendar & IA
          </button>
          <button
            onClick={() => setActiveTab('auditoria')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'auditoria' ? 'border-sky-600 text-sky-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-4 h-4" /> Registro de Auditoria
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Configurações salvas e atualizadas com sucesso!</span>
        </div>
      )}

      {/* TAB 1: EMPRESA */}
      {activeTab === 'empresa' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Dados Oficiais da Bertacini Engenharia</h3>
              <p className="text-xs text-slate-500">
                Informações utilizadas no cabeçalho e rodapé oficial de propostas (.docx / .pdf), laudos e relatórios.
              </p>
            </div>

            {/* Logo space */}
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden bg-slate-50 shadow-2xs">
                {formData.logoUrl ? (
                  <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                ) : (
                  <Building2 className="w-6 h-6 text-slate-400" />
                )}
              </div>
              <label className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg cursor-pointer font-medium flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Logo</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </label>
            </div>
          </div>

          <form onSubmit={handleSaveCompany} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Razão Social</label>
                <input
                  type="text"
                  disabled={!canEditSettings}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-800"
                  value={formData.corporateName}
                  onChange={(e) => setFormData({ ...formData, corporateName: e.target.value })}
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nome Fantasia</label>
                <input
                  type="text"
                  disabled={!canEditSettings}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-800"
                  value={formData.tradeName}
                  onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">CNPJ</label>
                <input
                  type="text"
                  disabled={!canEditSettings}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-800 font-mono"
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">CREA Pessoa Jurídica (Empresa)</label>
                <input
                  type="text"
                  disabled={!canEditSettings}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-800"
                  value={formData.crea}
                  onChange={(e) => setFormData({ ...formData, crea: e.target.value })}
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Telefone Comercial</label>
                <input
                  type="text"
                  disabled={!canEditSettings}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-800"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            {/* Responsável Técnico */}
            <div className="bg-sky-50/60 p-4 rounded-xl border border-sky-100 space-y-3">
              <span className="font-bold text-sky-950 uppercase text-[11px] flex items-center gap-1.5">
                <HardHat className="w-4 h-4 text-sky-700" /> Responsável Técnico da Empresa (ART de Cargo e Função)
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Engenheiro Responsável Técnico</label>
                  <input
                    type="text"
                    disabled={!canEditSettings}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold"
                    value={formData.technicalResponsible}
                    onChange={(e) => setFormData({ ...formData, technicalResponsible: e.target.value })}
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Registro Profissional CREA-SP</label>
                  <input
                    type="text"
                    disabled={!canEditSettings}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                    value={formData.technicalResponsibleCrea}
                    onChange={(e) => setFormData({ ...formData, technicalResponsibleCrea: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="font-semibold text-slate-700 block mb-1">Endereço da Sede</label>
                <input
                  type="text"
                  disabled={!canEditSettings}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-800"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Cidade / UF / CEP</label>
                <input
                  type="text"
                  disabled={!canEditSettings}
                  className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-800"
                  value={`${formData.city} - ${formData.state} - ${formData.cep}`}
                  onChange={(e) => {
                    const parts = e.target.value.split('-');
                    setFormData({
                      ...formData,
                      city: parts[0]?.trim() || formData.city,
                      state: parts[1]?.trim() || formData.state,
                      cep: parts[2]?.trim() || formData.cep,
                    });
                  }}
                />
              </div>
            </div>

            {canEditSettings && (
              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-bold text-xs shadow-xs"
                >
                  <Save className="w-4 h-4" /> Salvar Configurações
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* TAB 2: USUÁRIOS */}
      {activeTab === 'usuarios' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Colaboradores & Níveis de Acesso</h3>
              <p className="text-xs text-slate-500">
                Equipe cadastrada na Bertacini Engenharia com permissões individuais de visualização e edição.
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {availableUsers.map((u) => (
              <div key={u.uid} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                    {u.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block">{u.name}</span>
                    <span className="text-[11px] text-slate-400">{u.email} • {u.cargo}</span>
                    {u.crea && <span className="text-[10px] text-sky-700 block font-medium">{u.crea}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] px-2.5 py-1 rounded-full border font-bold uppercase bg-slate-50 text-slate-700 border-slate-200">
                    {u.role}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                    Ativo
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: INTEGRAÇÕES */}
      {activeTab === 'integracoes' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
          <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
            Status das Conexões Externas
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Google Calendar */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-sky-600" />
                  <span className="font-bold text-slate-900 text-xs">Google Calendar API (OAuth 2.0)</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  calendarConnected ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600'
                }`}>
                  {calendarConnected ? 'Conectado' : 'Aguardando Login'}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Sincronização bidirecional de vistorias prediais, diligências periciais judiciais e reuniões com as agendas dos profissionais.
              </p>
              {!calendarConnected && (
                <button
                  onClick={loginWithGoogle}
                  className="px-3.5 py-1.5 bg-sky-600 text-white rounded-lg text-xs font-semibold hover:bg-sky-500"
                >
                  Conectar Minha Conta Google
                </button>
              )}
            </div>

            {/* Gemini API */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-amber-600" />
                  <span className="font-bold text-slate-900 text-xs">Google Gemini 3.8 Flash (Server-Side)</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Operacional
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Assistente de redação técnica para propostas de diagnóstico, laudos e checklists conforme NBR 16747 e NBR 13752.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AUDITORIA */}
      {activeTab === 'auditoria' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Trilha de Auditoria & Segurança (LGPD)</h3>
              <p className="text-xs text-slate-500">
                Registro imutável de quem criou, alterou, aprovou propostas ou executou movimentações relevantes.
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {activityLogs.map((log) => (
              <div key={log.id} className="py-3 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-100 text-slate-600 font-medium">
                      {log.entityType}
                    </span>
                  </div>
                  <p className="text-slate-600">{log.details}</p>
                  <p className="text-[10px] text-slate-400">Usuário: <strong className="text-slate-700">{log.userName}</strong></p>
                </div>

                <div className="text-right shrink-0 text-[11px] text-slate-400">
                  {new Date(log.timestamp).toLocaleString('pt-BR')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
