import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// AI Assistant endpoint for Bertacini Engenharia
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { message, context, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Mensagem obrigatória' });
    }

    const systemInstruction = `
Você é o "Assistente Bertacini", a inteligência artificial corporativa da Bertacini Engenharia (empresa especializada em engenharia diagnóstica, inspeções prediais, vistorias cautelares e locatícias, perícias judiciais e extrajudiciais, manifestações patológicas, laudos técnicos e consultoria de alto padrão).
Fuso horário: America/Sao_Paulo. Moeda: BRL (R$). Normas de referência brasileiras válidas: NBR 13752 (Perícias de Engenharia), NBR 16747 (Inspeção Predial), NBR 5674 (Manutenção de Edificações), NBR 15575 (Desempenho), normas IBAPE.

Diretrizes estritas:
1. Responda em português brasileiro de forma técnica, executiva, precisa e polida.
2. NUNCA invente artigos de lei, normas fictícias, números de processos, fatos ou patologias não descritos.
3. Se faltar informação para um diagnóstico conclusivo, aponte exatamente quais dados técnicos adicionais são necessários (e.g. ensaios não destrutivos, histórico de manutenção, projetos estruturais, mapeamento de fissuras).
4. Forneça sugestões de escopos de serviço, itens de checklist de vistoria, propostas de honorários, resumos de quesitos periciais e orientações de redação técnica.
5. Sempre ressalve que conclusões periciais e diagnósticas finais dependem da vistoria in loco e responsabilidade técnica (ART) do Engenheiro Responsável.
${context ? `Contexto atual da operação/cliente/serviço:\n${JSON.stringify(context, null, 2)}` : ''}
`;

    const contents = [];
    if (Array.isArray(history)) {
      for (const turn of history.slice(-6)) {
        contents.push({
          role: turn.role === 'user' ? 'user' : 'model',
          parts: [{ text: turn.text || turn.content || '' }],
        });
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
      },
    });

    const reply = response.text || 'Não foi possível gerar uma resposta no momento.';
    return res.json({ reply });
  } catch (error: any) {
    console.error('Error in /api/ai/chat:', error);
    return res.status(500).json({
      error: 'Falha ao processar solicitação no Assistente Bertacini.',
      details: error?.message || String(error),
    });
  }
});

// AI Proposal & Technical Scope Generator endpoint
app.post('/api/ai/generate-scope', async (req: Request, res: Response) => {
  try {
    const { serviceType, serviceCategory, clientName, propertyType, propertyAddress, notes } = req.body;

    const prompt = `
Gere uma proposta técnica estruturada para a Bertacini Engenharia com os seguintes parâmetros:
- Categoria: ${serviceCategory || 'Engenharia Diagnóstica'}
- Tipo de Serviço: ${serviceType || 'Inspeção Predial'}
- Cliente: ${clientName || 'Cliente'}
- Tipo de Edificação: ${propertyType || 'Edifício Residencial'}
- Local: ${propertyAddress || 'Não especificado'}
- Observações adicionais do usuário: ${notes || 'Nenhuma'}

Gere um JSON com as seguintes chaves estritas:
1. "object": Descrição clara e formal do objeto da contratação (1 a 2 parágrafos).
2. "scope": Descrição detalhada dos itens inclusos no escopo técnico (tópicos com etapas claras).
3. "methodology": Metodologia diagnóstica (vistoria sensorial, ensaios se aplicáveis, registro fotográfico, análise documental conforme NBRs aplicáveis).
4. "applicableStandards": Lista das principais normas técnicas ABNT e IBAPE pertinentes a este serviço.
5. "deliverables": Lista clara dos entregáveis (Laudo técnico digital assinado, via física se contratada, anotação de responsabilidade técnica ART, relatório fotográfico).
6. "limitations": Limitações e condições técnicas do serviço (acesso a áreas restritas, ensaios destrutivos não inclusos sem prévio alinhamento, etc.).
7. "recommendedDuration": Prazo de execução estimado sugerido em dias úteis.
8. "paymentSuggestion": Sugestão de condições de pagamento comercial padrão (e.g. 50% no aceite e 50% na entrega da minuta/laudo final).

Retorne APENAS o JSON válido.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/ai/generate-scope:', error);
    return res.status(500).json({
      error: 'Falha ao gerar proposta com IA',
      details: error?.message || String(error),
    });
  }
});

// AI Inspection Checklist Generator
app.post('/api/ai/generate-checklist', async (req: Request, res: Response) => {
  try {
    const { serviceType, propertyCharacteristics } = req.body;
    const prompt = `
Como especialista em engenharia diagnóstica da Bertacini Engenharia, crie um checklist de campo para o serviço: "${serviceType}".
Características do imóvel/estrutura: "${propertyCharacteristics || 'Padrão'}".
Retorne um JSON com uma lista "items", onde cada item tem:
- "system": Sistema construtivo (ex: Estrutura, Vedações e Fachada, Impermeabilização, Instalações Elétricas/SPDA, Instalações Hidráulicas, Cobertura, Áreas Comuns).
- "checkItem": Item específico a verificar e manifestações patológicas típicas a observar.
- "priority": Prioridade técnica ("Baixa", "Média", "Alta", "Crítica").

Retorne APENAS o JSON válido.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/ai/generate-checklist:', error);
    return res.status(500).json({
      error: 'Falha ao gerar checklist com IA',
      details: error?.message || String(error),
    });
  }
});

// Setup Vite or static serving
async function setupServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Bertacini Engenharia server running on http://localhost:${PORT}`);
  });
}

setupServer();
