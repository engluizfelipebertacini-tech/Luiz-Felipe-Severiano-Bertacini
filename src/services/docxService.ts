import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  AlignmentType, 
  BorderStyle, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType 
} from 'docx';
import { Proposal, CompanySettings } from '../types';

export async function generateProposalDocx(proposal: Proposal, company: CompanySettings): Promise<Blob> {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Header / Company Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: (company.tradeName || 'BERTACINI ENGENHARIA').toUpperCase(),
                bold: true,
                size: 32,
                color: '0F233A',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'ENGENHARIA DIAGNÓSTICA | INSPEÇÕES PREDIAIS | PERÍCIAS E LAUDOS TÉCNICOS',
                size: 18,
                color: '475569',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `CREA: ${company.crea || 'SP-1234567'} | RT: ${company.technicalResponsible || 'Eng. Luiz Felipe Bertacini'} (${company.technicalResponsibleCrea || 'CREA-SP'})`,
                size: 16,
                italics: true,
                color: '64748B',
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          // Proposal Title & Code
          new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [
              new TextRun({
                text: `PROPOSTA TÉCNICA E COMERCIAL Nº ${proposal.code}`,
                bold: true,
                size: 26,
                color: '1E3A5F',
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Data de Emissão: ${new Date(proposal.createdAt).toLocaleDateString('pt-BR')}`, size: 20 }),
            ],
          }),
          new Paragraph({ text: '' }),

          // Client Info Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Cliente Contratante:', bold: true })] })],
                    width: { size: 30, type: WidthType.PERCENTAGE },
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: proposal.clientName })],
                    width: { size: 70, type: WidthType.PERCENTAGE },
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Endereço do Imóvel:', bold: true })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: proposal.address || 'Não informado' })],
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Tipo de Serviço:', bold: true })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: `${proposal.serviceCategory} - ${proposal.serviceType}` })],
                  }),
                ],
              }),
            ],
          }),
          new Paragraph({ text: '' }),

          // Section 1: Objeto
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: '1. OBJETO DA CONTRATAÇÃO', bold: true, color: '0F233A' })],
          }),
          new Paragraph({
            children: [new TextRun({ text: proposal.object || 'Elaboração de parecer e laudo técnico de engenharia.' })],
          }),
          new Paragraph({ text: '' }),

          // Section 2: Escopo Técnico
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: '2. ESCOPO TÉCNICO DOS SERVIÇOS', bold: true, color: '0F233A' })],
          }),
          new Paragraph({
            children: [new TextRun({ text: proposal.scope || 'Conforme alinhamento preliminar e inspeção in loco.' })],
          }),
          new Paragraph({ text: '' }),

          // Section 3: Metodologia e Normas
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: '3. METODOLOGIA E NORMAS APLICÁVEIS', bold: true, color: '0F233A' })],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Metodologia: ${proposal.methodology || 'Vistoria técnica sensorial e análise de manifestações patológicas.'}\n` }),
              new TextRun({ text: `Normas Técnicas de Referência: ${proposal.applicableStandards || 'ABNT NBR 13752, NBR 16747 e IBAPE.'}` }),
            ],
          }),
          new Paragraph({ text: '' }),

          // Section 4: Entregáveis e Limitações
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: '4. ENTREGÁVEIS E LIMITAÇÕES', bold: true, color: '0F233A' })],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Entregáveis: ${proposal.deliverables || 'Laudo técnico em formato digital assinado com ART.'}\n` }),
              new TextRun({ text: `Limitações e Condições: ${proposal.limitations || 'Acesso integral aos locais a inspecionar.'}` }),
            ],
          }),
          new Paragraph({ text: '' }),

          // Section 5: Condições Comerciais e Honorários
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [new TextRun({ text: '5. CONDIÇÕES COMERCIAIS E HONORÁRIOS', bold: true, color: '0F233A' })],
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Valor Total dos Honorários: ${proposal.totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
                bold: true,
                size: 24,
                color: '0369A1',
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Condições de Pagamento: ${proposal.paymentTerms || '50% na aprovação e 50% na entrega do laudo final.'}\n` }),
              new TextRun({ text: `Prazo de Execução Estimado: ${proposal.executionPeriod || '15 dias úteis'}\n` }),
              new TextRun({ text: `Validade desta Proposta: ${proposal.validityPeriod || '15 dias'}` }),
            ],
          }),
          new Paragraph({ text: '' }),
          new Paragraph({ text: '' }),

          // Signature Block
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: '___________________________________________________', color: '94A3B8' }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: company.technicalResponsible || 'Eng. Luiz Felipe Bertacini', bold: true }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: `${company.tradeName || 'Bertacini Engenharia'} - CREA ${company.crea || 'SP'}`, size: 18, color: '64748B' }),
            ],
          }),
        ],
      },
    ],
  });

  return await Packer.toBlob(doc);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
