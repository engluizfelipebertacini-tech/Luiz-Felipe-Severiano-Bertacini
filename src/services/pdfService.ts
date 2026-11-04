import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Proposal, CompanySettings, FinancialEntry, TechnicalDocument } from '../types';

export function generateProposalPdf(proposal: Proposal, company: CompanySettings) {
  const doc = new jsPDF();

  // Primary Header
  doc.setFillColor(15, 35, 58); // #0f233a
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text((company.tradeName || 'BERTACINI ENGENHARIA').toUpperCase(), 15, 14);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('ENGENHARIA DIAGNÓSTICA | INSPEÇÕES PREDIAIS | PERÍCIAS E LAUDOS TÉCNICOS', 15, 20);
  doc.text(`CREA: ${company.crea || 'SP-1234567'} | RT: ${company.technicalResponsible || 'Eng. Luiz Felipe Bertacini'}`, 15, 26);

  // Proposal Meta
  doc.setTextColor(30, 58, 95);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`PROPOSTA TÉCNICA E COMERCIAL Nº ${proposal.code}`, 15, 42);

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Data de Emissão: ${new Date(proposal.createdAt).toLocaleDateString('pt-BR')}  |  Validade: ${proposal.validityPeriod || '15 dias'}`, 15, 48);

  // Client Details Table
  autoTable(doc, {
    startY: 53,
    head: [['Dados da Contratação', 'Informações']],
    body: [
      ['Cliente Contratante', proposal.clientName],
      ['Local / Endereço', proposal.address || 'Não especificado'],
      ['Tipo de Serviço', `${proposal.serviceCategory} - ${proposal.serviceType}`],
      ['Responsável Técnico', company.technicalResponsible || 'Eng. Luiz Felipe Bertacini'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [30, 58, 95], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 8, cellPadding: 2.5 },
  });

  let currentY = (doc as any).lastAutoTable.finalY + 8;

  // Sections
  const addSection = (title: string, content: string) => {
    if (currentY > 260) {
      doc.addPage();
      currentY = 20;
    }
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 35, 58);
    doc.text(title, 15, currentY);
    currentY += 5;

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    const splitText = doc.splitTextToSize(content || 'Conforme especificado em alinhamento técnico.', 180);
    doc.text(splitText, 15, currentY);
    currentY += splitText.length * 4.5 + 5;
  };

  addSection('1. OBJETO DA CONTRATAÇÃO', proposal.object);
  addSection('2. ESCOPO TÉCNICO', proposal.scope);
  addSection('3. METODOLOGIA E NORMAS APLICÁVEIS', `${proposal.methodology}\nNormas: ${proposal.applicableStandards}`);
  addSection('4. ENTREGÁVEIS E LIMITAÇÕES', `Entregáveis: ${proposal.deliverables}\nLimitações: ${proposal.limitations}`);

  // Commercial Table
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  autoTable(doc, {
    startY: currentY,
    head: [['Condição Comercial', 'Especificação']],
    body: [
      ['Investimento Total (Honorários)', proposal.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })],
      ['Condições de Pagamento', proposal.paymentTerms || '50% na aprovação e 50% na entrega'],
      ['Prazo Estimado de Execução', proposal.executionPeriod || '15 dias úteis'],
    ],
    theme: 'striped',
    headStyles: { fillColor: [3, 105, 161], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 8.5, cellPadding: 3 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 15;

  if (currentY > 260) {
    doc.addPage();
    currentY = 30;
  }

  // Signatures
  doc.setDrawColor(203, 213, 225);
  doc.line(60, currentY, 150, currentY);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 35, 58);
  doc.text(company.technicalResponsible || 'Eng. Luiz Felipe Bertacini', 105, currentY + 5, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`${company.tradeName || 'Bertacini Engenharia'} - ${company.technicalResponsibleCrea || 'CREA-SP'}`, 105, currentY + 10, { align: 'center' });

  doc.save(`Proposta_${proposal.code}_Bertacini.pdf`);
}

export function generateFinancialReportPdf(entries: FinancialEntry[], company: CompanySettings) {
  const doc = new jsPDF();

  doc.setFillColor(15, 35, 58);
  doc.rect(0, 0, 210, 26, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`${(company.tradeName || 'BERTACINI ENGENHARIA').toUpperCase()} - RELATÓRIO FINANCEIRO`, 15, 16);

  const totalReceitas = entries.filter(e => e.type === 'receita').reduce((acc, curr) => acc + curr.value, 0);
  const totalDespesas = entries.filter(e => e.type === 'despesa').reduce((acc, curr) => acc + curr.value, 0);
  const saldo = totalReceitas - totalDespesas;

  doc.setTextColor(30, 58, 95);
  doc.setFontSize(10);
  doc.text(`Receitas: ${totalReceitas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}  |  Despesas: ${totalDespesas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}  |  Saldo: ${saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, 15, 35);

  const tableRows = entries.map(e => [
    new Date(e.dueDate).toLocaleDateString('pt-BR'),
    e.type.toUpperCase(),
    e.category,
    e.description,
    e.clientName || '-',
    e.status.toUpperCase(),
    e.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
  ]);

  autoTable(doc, {
    startY: 42,
    head: [['Data', 'Tipo', 'Categoria', 'Descrição', 'Cliente', 'Status', 'Valor']],
    body: tableRows,
    theme: 'striped',
    headStyles: { fillColor: [30, 58, 95], textColor: 255 },
    styles: { fontSize: 7.5, cellPadding: 2 },
  });

  doc.save('Relatorio_Financeiro_Bertacini.pdf');
}
