/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './views/DashboardView';
import { AgendaView } from './views/AgendaView';
import { ClientsView } from './views/ClientsView';
import { CRMView } from './views/CRMView';
import { ProposalsView } from './views/ProposalsView';
import { ProposalWizardModal } from './views/ProposalWizardModal';
import { ServicesView } from './views/ServicesView';
import { InspectionsView } from './views/InspectionsView';
import { ExpertCasesView } from './views/ExpertCasesView';
import { DocumentsView } from './views/DocumentsView';
import { TasksView } from './views/TasksView';
import { FinancialView } from './views/FinancialView';
import { ReportsView } from './views/ReportsView';
import { AIAssistantView } from './views/AIAssistantView';
import { SettingsView } from './views/SettingsView';
import { testConnection } from './firebase';
import { Opportunity, Client } from './types';

function MainApp() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Proposal Wizard State
  const [isProposalWizardOpen, setIsProposalWizardOpen] = useState(false);
  const [wizardOpportunity, setWizardOpportunity] = useState<Opportunity | null>(null);
  const [wizardClient, setWizardClient] = useState<Client | null>(null);

  useEffect(() => {
    testConnection();
  }, []);

  const handleOpenProposalWizard = (opp?: Opportunity, client?: Client) => {
    setWizardOpportunity(opp || null);
    setWizardClient(client || null);
    setIsProposalWizardOpen(true);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-800">
      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onSelectView={setCurrentView}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main App Content Area */}
      <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden">
        <Navbar
          onSelectView={setCurrentView}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {currentView === 'dashboard' && (
              <DashboardView
                onNavigate={setCurrentView}
                onOpenNewProposal={() => handleOpenProposalWizard()}
                onOpenNewInspection={() => setCurrentView('inspections')}
                onOpenNewClient={() => setCurrentView('clients')}
              />
            )}

            {currentView === 'agenda' && <AgendaView />}

            {currentView === 'clients' && (
              <ClientsView
                onOpenNewProposalWithClient={(client) => handleOpenProposalWizard(undefined, client)}
                onOpenNewInspectionWithClient={() => setCurrentView('inspections')}
              />
            )}

            {currentView === 'crm' && (
              <CRMView
                onOpenProposalWizardForOpp={(opp) => handleOpenProposalWizard(opp)}
              />
            )}

            {currentView === 'proposals' && (
              <ProposalsView
                onOpenCreateWizard={() => handleOpenProposalWizard()}
                onNavigateToService={() => setCurrentView('services')}
              />
            )}

            {currentView === 'services' && <ServicesView />}

            {currentView === 'inspections' && <InspectionsView />}

            {currentView === 'expert_cases' && <ExpertCasesView />}

            {currentView === 'documents' && <DocumentsView />}

            {currentView === 'tasks' && <TasksView />}

            {currentView === 'financial' && <FinancialView />}

            {currentView === 'reports' && <ReportsView />}

            {currentView === 'assistant' && <AIAssistantView />}

            {currentView === 'settings' && <SettingsView />}
          </div>
        </main>
      </div>

      {/* 5-Step Proposal Wizard Modal */}
      <ProposalWizardModal
        isOpen={isProposalWizardOpen}
        onClose={() => {
          setIsProposalWizardOpen(false);
          setWizardOpportunity(null);
          setWizardClient(null);
        }}
        preSelectedOpportunity={wizardOpportunity}
        preSelectedClient={wizardClient}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <MainApp />
      </DataProvider>
    </AuthProvider>
  );
}
