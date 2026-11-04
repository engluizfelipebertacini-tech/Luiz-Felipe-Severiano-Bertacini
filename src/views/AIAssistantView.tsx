import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  RotateCcw, 
  User, 
  HelpCircle, 
  FileText, 
  Scale, 
  ClipboardCheck, 
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AIAssistantView: React.FC = () => {
  const { currentUser } = useAuth();
  const { clients, proposals, services } = useData();

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-1',
      sender: 'assistant',
      text: `Olá, ${currentUser.name.split(' ')[0]}! Sou o **Assistente Bertacini**, sua IA de suporte técnico e operacional em engenharia diagnóstica, vistorias prediais, perícias judiciais e propostas.\n\nComo posso auxiliá-lo hoje? Posso sugerir escopos de serviços, redigir textos técnicos, estruturar quesitos para perícias ou gerar checklists conforme as normas NBR 16747, NBR 13752 e NBR 5674.`,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.slice(-6).map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

      const context = {
        activeUser: currentUser.name,
        role: currentUser.role,
        clientsCount: clients.length,
        proposalsCount: proposals.length,
        servicesCount: services.length,
      };

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history,
          context,
        }),
      });

      if (!res.ok) {
        throw new Error('Falha na resposta do Assistente Bertacini.');
      }

      const data = await res.json();
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'Não foi possível gerar uma resposta técnica no momento.',
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `Desculpe, ocorreu uma instabilidade temporária na consulta: ${err?.message || 'Verifique sua conexão.'}`,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    { label: 'NBR 16747 - Itens Obrigatórios de Inspeção Predial', prompt: 'Quais são os sistemas construtivos mínimos e a metodologia exigida pela ABNT NBR 16747 para elaboração de um Laudo de Inspeção Predial?' },
    { label: 'Quesitos Periciais de Infiltração', prompt: 'Sugira 5 quesitos técnicos fundamentados na NBR 13752 para perícia judicial de infiltração crônica em subsolo de condomínio.' },
    { label: 'Metodologia para Vistoria Cautelar', prompt: 'Redija um parágrafo sobre a metodologia técnica de vistoria cautelar de vizinhança para construtoras, destacando o registro fotográfico e mapeamento de fissuras.' },
    { label: 'Classificação de Anomalias (IBAPE)', prompt: 'Como funciona a classificação de prioridade de manutenção e anomalias segundo o IBAPE (Grau Crítico, Regular e Mínimo)?' },
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">Assistente Bertacini</h2>
              <span className="text-[9px] bg-sky-600/40 text-sky-200 px-1.5 py-0.2 rounded border border-sky-400/30 font-semibold uppercase">
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Inteligência Artificial especializada em Engenharia Diagnóstica e Perícias
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setMessages([
              {
                id: `reset-${Date.now()}`,
                sender: 'assistant',
                text: 'Conversa reiniciada. Como posso ajudá-lo com as rotinas técnicas e administrativas da Bertacini Engenharia?',
                timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
              },
            ]);
          }}
          className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          title="Limpar histórico da conversa"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-2xl rounded-2xl px-4 py-3 leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-sky-600 text-white shadow-xs rounded-tr-none'
                  : 'bg-slate-50 border border-slate-200 text-slate-800 shadow-2xs rounded-tl-none'
              }`}
            >
              <div className="whitespace-pre-line">{m.text}</div>
              <span
                className={`text-[9px] block text-right mt-1.5 font-medium ${
                  m.sender === 'user' ? 'text-sky-200' : 'text-slate-400'
                }`}
              >
                {m.timestamp}
              </span>
            </div>

            {m.sender === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                {currentUser.name[0]}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-slate-500 text-xs py-2">
            <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
            <span>Assistente Bertacini analisando normas e redigindo resposta...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-6 py-2 bg-slate-50 border-t border-slate-100 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" /> Sugestões:
        </span>
        {quickPrompts.map((qp, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(qp.prompt)}
            className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-full text-[11px] font-medium whitespace-nowrap shrink-0 transition-colors"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Input box */}
      <div className="p-4 bg-white border-t border-slate-200 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Digite uma dúvida técnica, solicitação de escopo ou revisão..."
            className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-xl shadow-xs transition-all"
            title="Enviar mensagem"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
