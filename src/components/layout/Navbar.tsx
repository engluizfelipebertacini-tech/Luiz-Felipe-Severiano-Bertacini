import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Calendar, 
  UserCheck, 
  ChevronDown, 
  Shield, 
  LogOut,
  Building2,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

interface NavbarProps {
  onSelectView: (view: string) => void;
  onGlobalSearchResult?: (item: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onSelectView }) => {
  const { currentUser, availableUsers, switchUser, loginWithGoogle, logout, calendarConnected } = useAuth();
  const { clients, proposals, services, companySettings } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Global search filtering
  const filteredClients = searchQuery.trim() 
    ? clients.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.document.includes(searchQuery)).slice(0, 3)
    : [];
  const filteredProposals = searchQuery.trim()
    ? proposals.filter(p => p.code.toLowerCase().includes(searchQuery.toLowerCase()) || p.clientName.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3)
    : [];
  const filteredServices = searchQuery.trim()
    ? services.filter(s => s.code.toLowerCase().includes(searchQuery.toLowerCase()) || s.title.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 3)
    : [];

  const roleLabelMap: Record<string, { label: string; color: string }> = {
    admin: { label: 'Administrador', color: 'bg-red-50 text-red-700 border-red-200' },
    socio: { label: 'Sócio / Gestor', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    operacional: { label: 'Operacional / Adm', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    engenheiro: { label: 'Engenheiro / RT', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    financeiro: { label: 'Financeiro', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left: Global Search */}
      <div className="relative w-96 max-w-full">
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-sky-500/20 focus-within:border-sky-500 transition-all">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Pesquisar clientes, propostas, serviços ou laudos..."
            className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchDropdown(e.target.value.length > 1);
            }}
            onFocus={() => setShowSearchDropdown(searchQuery.length > 1)}
          />
        </div>

        {/* Search Results Dropdown */}
        {showSearchDropdown && (
          <div className="absolute left-0 right-0 top-11 bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-50 text-xs">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Resultados da Pesquisa
            </div>
            {filteredClients.length === 0 && filteredProposals.length === 0 && filteredServices.length === 0 ? (
              <p className="text-slate-500 py-2">Nenhum resultado encontrado para "{searchQuery}".</p>
            ) : (
              <div className="space-y-3">
                {filteredClients.length > 0 && (
                  <div>
                    <span className="font-semibold text-slate-700 flex items-center gap-1 mb-1">
                      <Building2 className="w-3.5 h-3.5 text-sky-600" /> Clientes
                    </span>
                    {filteredClients.map(c => (
                      <div
                        key={c.id}
                        onClick={() => {
                          onSelectView('clients');
                          setShowSearchDropdown(false);
                          setSearchQuery('');
                        }}
                        className="p-1.5 hover:bg-slate-50 rounded cursor-pointer flex justify-between"
                      >
                        <span className="font-medium text-slate-800">{c.name}</span>
                        <span className="text-slate-400">{c.type}</span>
                      </div>
                    ))}
                  </div>
                )}

                {filteredProposals.length > 0 && (
                  <div>
                    <span className="font-semibold text-slate-700 flex items-center gap-1 mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Propostas
                    </span>
                    {filteredProposals.map(p => (
                      <div
                        key={p.id}
                        onClick={() => {
                          onSelectView('proposals');
                          setShowSearchDropdown(false);
                          setSearchQuery('');
                        }}
                        className="p-1.5 hover:bg-slate-50 rounded cursor-pointer flex justify-between"
                      >
                        <span className="font-medium text-slate-800">{p.code} - {p.clientName}</span>
                        <span className="text-emerald-600 font-semibold">{p.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                      </div>
                    ))}
                  </div>
                )}

                {filteredServices.length > 0 && (
                  <div>
                    <span className="font-semibold text-slate-700 flex items-center gap-1 mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> Serviços
                    </span>
                    {filteredServices.map(s => (
                      <div
                        key={s.id}
                        onClick={() => {
                          onSelectView('services');
                          setShowSearchDropdown(false);
                          setSearchQuery('');
                        }}
                        className="p-1.5 hover:bg-slate-50 rounded cursor-pointer flex justify-between"
                      >
                        <span className="font-medium text-slate-800">{s.code} - {s.title}</span>
                        <span className="text-slate-400">{s.currentStage}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls: Google Calendar Status, Notifications, Role Switcher */}
      <div className="flex items-center gap-4">
        {/* Google Calendar Connection Status */}
        {calendarConnected ? (
          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <Calendar className="w-3.5 h-3.5" />
            <span>Google Calendar Sincronizado</span>
          </div>
        ) : (
          <button
            onClick={loginWithGoogle}
            className="flex items-center gap-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 px-3 py-1 rounded-full text-xs font-medium transition-colors"
            title="Conecte para sincronizar compromissos e vistorias"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Conectar Google Calendar</span>
          </button>
        )}

        {/* User Profile & Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 ring-2 ring-slate-100">
              {currentUser.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div className="hidden md:block">
              <div className="text-xs font-semibold text-slate-800 leading-tight flex items-center gap-1">
                {currentUser.name}
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[10px] px-1.5 py-0.2 rounded border font-medium ${roleLabelMap[currentUser.role]?.color}`}>
                  {roleLabelMap[currentUser.role]?.label}
                </span>
              </div>
            </div>
          </button>

          {/* User Menu Dropdown & Multi-role switch */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl py-2 z-50 text-xs">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="font-semibold text-slate-800 text-sm">{currentUser.name}</p>
                <p className="text-slate-500 text-[11px] truncate">{currentUser.email}</p>
                {currentUser.crea && (
                  <p className="text-slate-400 text-[10px] mt-0.5">{currentUser.crea}</p>
                )}
              </div>

              <div className="px-4 py-2">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Alternar Perfil de Acesso</span>
                  <Shield className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="space-y-1">
                  {availableUsers.map((u) => (
                    <button
                      key={u.uid}
                      onClick={() => {
                        switchUser(u.uid);
                        setShowUserMenu(false);
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between transition-colors ${
                        u.uid === currentUser.uid ? 'bg-sky-50 text-sky-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div>
                        <p className="text-xs">{u.name}</p>
                        <p className="text-[10px] text-slate-400">{u.cargo}</p>
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded border ${roleLabelMap[u.role]?.color}`}>
                        {roleLabelMap[u.role]?.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-2 px-2">
                <button
                  onClick={() => {
                    onSelectView('settings');
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-slate-700 hover:bg-slate-50 rounded text-xs"
                >
                  Configurações da Empresa
                </button>
                <button
                  onClick={() => {
                    logout();
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-red-600 hover:bg-red-50 rounded text-xs flex items-center gap-1.5 mt-1"
                >
                  <LogOut className="w-3.5 h-3.5" /> Desconectar Sessão
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
