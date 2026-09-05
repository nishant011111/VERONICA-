import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useApp } from '../../context/AppContext';
import { AIRouter } from '../../services/ai/AIRouter';
import { AIErrorHandler } from '../../services/ai/AIErrorHandler';
import { retrievalService } from '../../services/kb/RetrievalService';
import { ConversationService } from '../../services/ai/conversationService';
import { ContextEngine } from '../../services/ai/ContextEngine';
import { cleanMathLatexToPlain, cleanTextForSpeech, splitTextIntoSentenceChunks } from '../../services/ai/mathCleaner';
import { ttsService } from '../../services/tts/elevenLabsTTSService';
import { SaveAiNoteModal } from '../ai/SaveAiNoteModal';
import { PracticeQuestionsModal } from '../ai/PracticeQuestionsModal';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { MemoryModal } from '../ai/MemoryModal';
import {
  Folder,
  File,
  Sparkles,
  Send,
  HelpCircle,
  BookOpen,
  BrainCircuit,
  FileText,
  CalendarCheck,
  AlertCircle,
  Trash2,
  Paperclip,
  X,
  StopCircle,
  RotateCcw,
  Plus,
  Pin,
  Archive,
  Edit2,
  Search,
  MessageSquare,
  Copy,
  Check,
  Bookmark,
  Zap,
  Globe,
  WifiOff,
  Sliders,
  Code,
  CheckCircle2,
  Volume2,
  VolumeX
} from 'lucide-react';
import {
  AcademicMode,
  ExplanationLevel,
  ResponseStyle,
  AIConversation,
  ChatMessage,
  AIContextAttachment,
  Subject,
  Note,
  VaultFile
} from '../../types';

export const AskVeronicaScreen: React.FC = () => {
  const { profile, settings, kbDocuments, updateSettings, subjects, notes, vaultFiles, assignments, showToast, tasks, exams, goals } = useApp();

  // Active AI Parameters
  const [academicMode, setAcademicMode] = useState<AcademicMode>('general');
  const [explanationLevel, setExplanationLevel] = useState<ExplanationLevel>(settings.ai.explanationLevel || 'university');
  const [responseStyle, setResponseStyle] = useState<ResponseStyle>(settings.ai.responseStyle || 'balanced');

  // Conversations State
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [chatSearch, setChatSearch] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [titleInput, setTitleInput] = useState('');

  // Active Message History for Selected Conversation
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Attached Context Pills
  const [attachedContext, setAttachedContext] = useState<AIContextAttachment>({});
  const [useKnowledgeBaseMode, setUseKnowledgeBaseMode] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showMemoryModal, setShowMemoryModal] = useState(false);

  // Modals
  const [saveNoteModalContent, setSaveNoteModalContent] = useState<string | null>(null);
  const [showPracticeModal, setShowPracticeModal] = useState(false);
  const [showVaultPickerModal, setShowVaultPickerModal] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const userId = profile.id || 'local_user';

  // Text-To-Speech (TTS) Engine State & Handlers
  const [autoSpeech, setAutoSpeech] = useState<boolean>(() => {
    return localStorage.getItem('veronica_auto_tts') === 'true';
  });
  
  // We use state to trigger re-renders when TTS state changes
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  // Sync TTS state to UI
  useEffect(() => {
    ttsService.setOnStateChange((isPlaying, msgId) => {
      if (isPlaying && msgId) {
        setSpeakingMsgId(msgId);
      } else {
        setSpeakingMsgId(null);
      }
    });
    return () => {
      ttsService.setOnStateChange(() => {});
    };
  }, []);

  const stopSpeaking = () => {
    ttsService.stop();
    setSpeakingMsgId(null);
  };

  const toggleAutoSpeech = () => {
    const next = !autoSpeech;
    setAutoSpeech(next);
    localStorage.setItem('veronica_auto_tts', String(next));
    if (!next) {
      stopSpeaking();
    }
    showToast(`Auto Text-to-Speech ${next ? 'enabled' : 'disabled'}`, 'info');
  };

  const speakText = (text: string, msgId?: string) => {
    // Toggle off if currently speaking the exact same message
    if (msgId && speakingMsgId === msgId && ttsService.isPlaying(msgId)) {
      stopSpeaking();
      return;
    }
    
    setSpeakingMsgId(msgId || null);
    ttsService.speak(text, msgId);
  };

  // Stop TTS on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  // Load User Conversations on mount or user change
  useEffect(() => {
    const loaded = ConversationService.getConversations(userId);
    setConversations(loaded);
    if (loaded.length > 0 && !activeConvId) {
      setActiveConvId(loaded[0].id);
      setMessages(loaded[0].messages || []);
    } else if (loaded.length === 0) {
      handleNewConversation();
    }
  }, [userId]);

  // Sync active conversation messages
  useEffect(() => {
    if (activeConvId) {
      const active = conversations.find(c => c.id === activeConvId);
      if (active) {
        setMessages(active.messages || []);
        setAcademicMode(active.academicMode || 'general');
      }
    }
  }, [activeConvId]);

  // Auto scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText, isGenerating]);

  // Handle New Chat creation
  const handleNewConversation = () => {
    const newConv = ConversationService.createConversation(
      userId,
      'New Academic Chat',
      academicMode,
      explanationLevel,
      attachedContext.subjectId
    );
    const updated = ConversationService.getConversations(userId);
    setConversations(updated);
    setActiveConvId(newConv.id);
    setMessages([]);
  };

  // Save active messages to current conversation
  const updateActiveMessages = (newMsgs: ChatMessage[], autoTitleText?: string) => {
    setMessages(newMsgs);
    if (activeConvId) {
      const updatedConv = ConversationService.saveMessageToConversation(userId, activeConvId, newMsgs, autoTitleText);
      if (updatedConv) {
        setConversations(ConversationService.getConversations(userId));
      }
    }
  };

  // Context Object Resolution
  const resolveContextData = () => {
    const selectedSubject = subjects.find(s => s.id === attachedContext.subjectId);
    const selectedNote = notes.find(n => n.id === attachedContext.noteId);
    const selectedPdf = vaultFiles.find(v => v.id === attachedContext.vaultFileId);
    const selectedAssign = assignments.find(a => a.id === attachedContext.assignmentId);

    // Context Engine 10.1 & 10.2: Provide general state
    const systemContext = ContextEngine.buildContext({
      userId: profile.id,
      exams,
      tasks,
      studySessions: [],
      subjects,
      settings
    }, vaultFiles, goals);

    return {
      subjectName: selectedSubject?.name,
      subjectCode: selectedSubject?.code,
      noteTitle: selectedNote?.title,
      noteContent: selectedNote?.content,
      pdfName: selectedPdf?.name,
      pdfContent: selectedPdf ? (selectedPdf.fileData || `Attached Vault File: ${selectedPdf.name} (${selectedPdf.type || 'document'})`) : undefined,
      assignmentTitle: selectedAssign?.title,
      assignmentDescription: selectedAssign?.description,
      systemContext: ContextEngine.formatContextForPrompt(systemContext)
    };
  };

  // Send Prompt Handler (Main Streaming & Router Entry)
  
  const handleSendPrompt = async (overridePrompt?: string, actionPreset?: string) => {
    const text = overridePrompt || inputPrompt;
    if (!text.trim() || isGenerating) return;

    stopSpeaking();

    let fullPrompt = text.trim();
    if (actionPreset === 'shorter') fullPrompt = `Please make your previous answer more concise:n${text}`;
    if (actionPreset === 'detailed') fullPrompt = `Please provide a more detailed, in-depth breakdown of:n${text}`;
    if (actionPreset === 'simply') fullPrompt = `Please explain this in simpler terms (Beginner level):n${text}`;
    if (actionPreset === 'example') fullPrompt = `Please provide step-by-step practical examples for:n${text}`;

    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      sender: 'user',
      content: fullPrompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    const nextMessages = [...messages, userMsg];
    updateActiveMessages(nextMessages, fullPrompt);

    setInputPrompt('');
    setIsGenerating(true);
    setStreamingText('');

    abortControllerRef.current = new AbortController();

    try {
      let accumulated = '';
      
      // Resolve Context Data & Perform RAG Retrieval if needed
      const baseContext = resolveContextData();
      
      let ragChunks = undefined;
      let sources: string[] = [];
      if (kbDocuments.length > 0) {
        setStreamingText('Searching your Knowledge Base...');
        try {
          const scope = useKnowledgeBaseMode ? 'all' : 'all'; // Can be scoped to subject if needed
          const results = await retrievalService.retrieve(
            fullPrompt,
            profile.id,
            scope,
            [],
            settings.ai.geminiApiKey
          );
          
          if (results && results.length > 0) {
            ragChunks = results.map(r => {
              const doc = vaultFiles.find(v => v.id === r.documentId.replace('kb_', ''));
              sources.push(doc ? doc.name : r.documentId);
              return {
                content: r.content,
                source: doc ? doc.name : r.documentId,
                pageNumber: r.pageNumber
              };
            });
            // deduplicate sources
            sources = [...new Set(sources)];
          }
        } catch (e) {
          console.error("RAG Retrieval Failed:", e);
        }
        setStreamingText('');
      }

      const response = await AIRouter.streamResponse(
        fullPrompt,
        settings.ai,
        {
          academicMode,
          explanationLevel,
          responseStyle,
          context: {
            ...baseContext,
            ragChunks
          },
          systemPromptOverride: useKnowledgeBaseMode ? "You are in STRICT KNOWLEDGE BASE MODE. You MUST answer the user's question ONLY using the attached KNOWLEDGE BASE SOURCES. Do NOT use outside knowledge. If the answer is not contained in the sources, say 'I cannot find the answer to this in your notes.'" : undefined,
          signal: abortControllerRef.current.signal
        },
        (chunk) => {
          accumulated += chunk;
          setStreamingText(cleanMathLatexToPlain(accumulated));
        }
      );

      const cleanedContent = cleanMathLatexToPlain(response.text || accumulated);

      const veronicaMsg: ChatMessage = {
        id: `msg_v_${Date.now()}`,
        sender: 'veronica',
        content: cleanedContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        providerUsed: response.provider,
        modeUsed: useKnowledgeBaseMode ? 'My Notes Only' : (response.isOffline ? 'Offline / Local AI' : 'Online Cloud AI'),
        academicMode,
        explanationLevel,
        sources: sources.length > 0 ? sources : undefined
      };

      updateActiveMessages([...nextMessages, veronicaMsg]);

      if (autoSpeech) {
        speakText(veronicaMsg.content, veronicaMsg.id);
      }
    } catch (err: any) {

      if (err.name === 'AbortError') {
        showToast('Generation cancelled.', 'info');
      } else {
        const noticeText = AIErrorHandler.formatChatNotice(err);
        const errorMsg: ChatMessage = {
          id: `msg_err_${Date.now()}`,
          sender: 'veronica',
          content: noticeText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSystemNotice: true
        };
        updateActiveMessages([...nextMessages, errorMsg]);
      }
    } finally {
      setIsGenerating(false);
      setStreamingText('');
      abortControllerRef.current = null;
    }
  };

  // Stop Generation
  const handleStopGeneration = () => {
    stopSpeaking();
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  // Regenerate Response
  const handleRegenerate = () => {
    const lastUserMsg = [...messages].reverse().find(m => m.sender === 'user');
    if (lastUserMsg) {
      handleSendPrompt(lastUserMsg.content);
    }
  };

  // Copy Message Text
  const handleCopyText = (content: string, idx: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
    showToast('Copied to clipboard!', 'success');
  };

  // Conversation Actions
  const handleRenameChat = (convId: string) => {
    if (titleInput.trim()) {
      const updated = ConversationService.renameConversation(userId, convId, titleInput.trim());
      setConversations(updated);
      setEditingTitleId(null);
    }
  };

  const handleDeleteChat = (convId: string) => {
    const updated = ConversationService.deleteConversation(userId, convId);
    setConversations(updated);
    if (activeConvId === convId) {
      if (updated.length > 0) {
        setActiveConvId(updated[0].id);
      } else {
        handleNewConversation();
      }
    }
    showToast('Conversation deleted.', 'info');
  };

  const handleClearCurrentChat = () => {
    if (messages.length === 0) return;
    if (window.confirm('Are you sure you want to clear all messages in this chat conversation?')) {
      stopSpeaking();
      updateActiveMessages([]);
      showToast('Chat messages cleared.', 'info');
    }
  };

  const handleClearAllHistory = () => {
    if (window.confirm('Are you sure you want to delete ALL AI conversation history? This cannot be undone.')) {
      ConversationService.deleteAllHistory(userId);
      handleNewConversation();
      showToast('All AI history cleared.', 'info');
    }
  };

  const filteredConversations = conversations.filter(c =>
    (c.title || '').toLowerCase().includes((chatSearch || '').toLowerCase())
  );

  const pinnedConversations = filteredConversations.filter(c => c.isPinned && !c.isArchived);
  const unpinnedConversations = filteredConversations.filter(c => !c.isPinned && !c.isArchived);

  const currentAiMode = settings.ai?.aiMode || 'automatic';

  return (
    <>
      <MemoryModal isOpen={showMemoryModal} onClose={() => setShowMemoryModal(false)} />
    <div className="max-w-7xl mx-auto space-y-4 pb-20 md:pb-6">
      {/* Header Bar */}
      <div className="glass-panel rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-500 transition-colors md:hidden"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Ask Veronica
              <Badge variant={currentAiMode === 'offline' ? 'amber' : 'purple'}>
                {currentAiMode.toUpperCase()} AI ROUTER
              </Badge>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personal Academic AI OS • Physics, Math, CS & Exam Practice
            </p>
          </div>
        </div>

        {/* Mode Selectors */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Provider/Model Selector */}
          <div className="relative">
             <select
                value={settings.ai.activeProvider}
                onChange={(e) => updateSettings({ ai: { ...settings.ai, activeProvider: e.target.value as any } })}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
             >
                <option value="gemini">Gemini</option>
                <option value="groq">Groq</option>
                <option value="ollama">Ollama</option>
             </select>
          </div>

          {/* Academic Subject Mode */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            {(['general', 'physics', 'mathematics', 'programming'] as AcademicMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setAcademicMode(m)}
                className={`px-2.5 py-1 rounded-lg capitalize font-semibold transition-all ${
                  academicMode === m
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Level Switcher */}
          <select
            value={explanationLevel}
            onChange={(e) => setExplanationLevel(e.target.value as ExplanationLevel)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="beginner">Beginner Level</option>
            <option value="university">University Level</option>
            <option value="advanced">Advanced Rigor</option>
          </select>

          {/* Practice Questions Generator Button */}
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowPracticeModal(true)}
            icon={<BookOpen className="w-3.5 h-3.5 text-emerald-500" />}
          >
            Practice Set
          </Button>
        </div>
      </div>

      {/* Main Grid: Sidebar + Chat Window */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
        {/* Conversation Sidebar */}
        <div className={`md:col-span-1 space-y-3 ${showSidebar ? 'block' : 'hidden md:block'}`}>
          <Card glass className="p-4 border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-500" /> My Chats
              </span>
              <Button size="sm" variant="primary" onClick={handleNewConversation} icon={<Plus className="w-3.5 h-3.5" />}>
                New
              </Button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={chatSearch}
                onChange={(e) => setChatSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>

            {/* Chat List */}
            <div className="max-h-[480px] overflow-y-auto space-y-1.5 pr-1">
              {/* Pinned */}
              {pinnedConversations.length > 0 && (
                <div className="space-y-1 mb-2">
                  <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block px-2">
                    📌 Pinned Chats
                  </span>
                  {pinnedConversations.map(conv => (
                    <ConversationItem
                      key={conv.id}
                      conv={conv}
                      isActive={conv.id === activeConvId}
                      editingId={editingTitleId}
                      titleInput={titleInput}
                      setTitleInput={setTitleInput}
                      onSelect={() => setActiveConvId(conv.id)}
                      onPin={() => setConversations(ConversationService.togglePin(userId, conv.id))}
                      onArchive={() => setConversations(ConversationService.toggleArchive(userId, conv.id))}
                      onDelete={() => handleDeleteChat(conv.id)}
                      onStartRename={() => { setEditingTitleId(conv.id); setTitleInput(conv.title); }}
                      onSaveRename={() => handleRenameChat(conv.id)}
                    />
                  ))}
                </div>
              )}

              {/* Unpinned */}
              {unpinnedConversations.map(conv => (
                <ConversationItem
                  key={conv.id}
                  conv={conv}
                  isActive={conv.id === activeConvId}
                  editingId={editingTitleId}
                  titleInput={titleInput}
                  setTitleInput={setTitleInput}
                  onSelect={() => setActiveConvId(conv.id)}
                  onPin={() => setConversations(ConversationService.togglePin(userId, conv.id))}
                  onArchive={() => setConversations(ConversationService.toggleArchive(userId, conv.id))}
                  onDelete={() => handleDeleteChat(conv.id)}
                  onStartRename={() => { setEditingTitleId(conv.id); setTitleInput(conv.title); }}
                  onSaveRename={() => handleRenameChat(conv.id)}
                />
              ))}

              {filteredConversations.length === 0 && (
                <p className="text-center py-6 text-xs text-slate-400">
                  No conversations found.
                </p>
              )}
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>{conversations.length} Saved Chats</span>
              <button
                onClick={handleClearAllHistory}
                className="hover:text-red-500 transition-colors flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Clear History
              </button>
            </div>
          </Card>
        </div>

        {/* Main Chat Workspace */}
        <div className="md:col-span-3 space-y-4">
          {/* Preset Suggestion Chips */}
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Explain Concept', icon: <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" /> },
              { label: 'Solve Physics Problem', icon: <HelpCircle className="w-3.5 h-3.5 text-blue-400" /> },
              { label: 'Solve Math Step-by-Step', icon: <BookOpen className="w-3.5 h-3.5 text-emerald-400" /> },
              { label: 'Debug Code', icon: <Code className="w-3.5 h-3.5 text-amber-400" /> },
              { label: 'Summarize Topic', icon: <FileText className="w-3.5 h-3.5 text-purple-400" /> }
            ].map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSendPrompt(s.label)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass-panel border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-500 transition-all active:scale-95"
              >
                {s.icon}
                <span>{s.label}</span>
              </button>
            ))}
          </div>

          {/* Context Attachment Bar */}
          {(attachedContext.subjectId || attachedContext.noteId || attachedContext.vaultFileId || attachedContext.assignmentId) && (
            <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-indigo-700 dark:text-indigo-300">Attached Context:</span>
              {attachedContext.subjectId && (
                <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-medium flex items-center gap-1">
                  📚 {subjects.find(s => s.id === attachedContext.subjectId)?.name}
                  <button onClick={() => setAttachedContext(p => ({ ...p, subjectId: undefined }))}><X className="w-3 h-3" /></button>
                </span>
              )}
              {attachedContext.noteId && (
                <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-medium flex items-center gap-1">
                  📄 {notes.find(n => n.id === attachedContext.noteId)?.title}
                  <button onClick={() => setAttachedContext(p => ({ ...p, noteId: undefined }))}><X className="w-3 h-3" /></button>
                </span>
              )}
              {attachedContext.vaultFileId && (
                <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-medium flex items-center gap-1">
                  📁 {vaultFiles.find(v => v.id === attachedContext.vaultFileId)?.name}
                  <button onClick={() => setAttachedContext(p => ({ ...p, vaultFileId: undefined }))}><X className="w-3 h-3" /></button>
                </span>
              )}
            </div>
          )}

          {/* Messages Window */}
          <Card glass className="min-h-[420px] max-h-[580px] overflow-y-auto flex flex-col justify-between p-4 border-slate-200 dark:border-slate-800">
            {/* Active Chat Header Toolbar */}
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200/80 dark:border-slate-800/80 text-xs">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-500" />
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[180px] sm:max-w-xs">
                  {conversations.find(c => c.id === activeConvId)?.title || 'Academic Chat'}
                </span>
                {messages.length > 0 && (
                  <Badge variant="blue">{messages.length} msg</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowMemoryModal(true)}
                  className="px-2.5 py-1 rounded-xl transition-colors flex items-center gap-1.5 font-medium text-xs bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-indigo-500 border border-slate-200 dark:border-slate-800"
                  title="Manage AI Memory"
                >
                  <BrainCircuit className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Memory</span>
                </button>
                <button
                  onClick={toggleAutoSpeech}
                  className={`px-2.5 py-1 rounded-xl transition-colors flex items-center gap-1.5 font-medium text-xs active:scale-95 ${
                    autoSpeech
                      ? 'bg-indigo-500 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                  title={autoSpeech ? 'Auto Text-to-Speech is enabled for new AI responses' : 'Enable Auto Text-to-Speech'}
                >
                  {autoSpeech ? <Volume2 className="w-3.5 h-3.5 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5" />}
                  <span>Auto-Read {autoSpeech ? 'ON' : 'OFF'}</span>
                </button>

                {messages.length > 0 && (
                  <button
                    onClick={handleClearCurrentChat}
                    className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 text-slate-600 dark:text-slate-400 transition-colors flex items-center gap-1.5 font-medium text-xs active:scale-95"
                    title="Clear all messages in this conversation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Chat</span>
                  </button>
                )}
                <button
                  onClick={handleNewConversation}
                  className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 transition-colors flex items-center gap-1.5 font-medium text-xs active:scale-95"
                  title="Start a new chat conversation"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Chat</span>
                </button>
              </div>
            </div>

            {messages.length === 0 && !isGenerating ? (
              <div className="my-auto text-center py-16 space-y-3">
                <div className="w-14 h-14 mx-auto rounded-3xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shadow-inner">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Good evening, {profile.name || 'Student'}. What would you like to learn?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  Select a topic or ask any academic question. Veronica will route your query through the best available AI provider ({currentAiMode.toUpperCase()} mode).
                </p>
              </div>
            ) : (
              <div className="space-y-4 mb-4">
                {messages.map((msg, idx) => (
                  <div key={msg.id || idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-1 text-[10px] text-slate-400 px-1">
                      <span>{msg.sender === 'user' ? (profile.name || 'You') : 'Veronica AI'}</span>
                      {msg.providerUsed && <Badge variant="blue">{msg.providerUsed}</Badge>}
                      {msg.modeUsed && <span className="opacity-75">• {msg.modeUsed}</span>}
                    </div>

                    <div
                      className={`max-w-2xl p-4 rounded-2xl text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-indigo-600 text-white rounded-br-xs shadow-md shadow-indigo-600/20'
                          : msg.isSystemNotice
                          ? 'bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 rounded-bl-xs font-medium'
                          : 'bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-800/60 text-slate-900 dark:text-slate-100 rounded-bl-xs space-y-2'
                      }`}
                    >
                      {msg.sender === 'user' ? (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      ) : (
                        <div className="markdown-body text-xs space-y-2">
                          
                      <ReactMarkdown>{cleanMathLatexToPlain(msg.content)}</ReactMarkdown>
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-indigo-500/20 text-[10px] text-indigo-400">
                          <span className="font-bold flex items-center gap-1"><BookOpen className="w-3 h-3" /> Sources:</span>
                          <ul className="list-disc pl-4 mt-1 space-y-0.5">
                            {msg.sources.map((src, i) => (
                              <li key={i}>{src}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                        </div>
                      )}

                      {/* AI Response Actions */}
                      {msg.sender === 'veronica' && !msg.isSystemNotice && (
                        <div className="pt-2.5 mt-2 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-wrap items-center gap-1.5 text-[11px]">
                          <button
                            onClick={() => {
                              if (speakingMsgId === msg.id) {
                                stopSpeaking();
                              } else {
                                speakText(msg.content, msg.id);
                              }
                            }}
                            className={`p-1 rounded flex items-center gap-1 px-2 transition-colors ${
                              speakingMsgId === msg.id
                                ? 'bg-indigo-500 text-white font-medium animate-pulse'
                                : 'bg-slate-200/50 dark:bg-slate-800/50 hover:bg-indigo-500 hover:text-white text-slate-600 dark:text-slate-300'
                            }`}
                            title={speakingMsgId === msg.id ? 'Stop reading' : 'Read response aloud'}
                          >
                            {speakingMsgId === msg.id ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                            <span>{speakingMsgId === msg.id ? 'Stop' : 'Read Aloud'}</span>
                          </button>

                          <button
                            onClick={() => handleCopyText(msg.content, idx)}
                            className="p-1 rounded bg-slate-200/50 dark:bg-slate-800/50 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center gap-1 px-2"
                          >
                            {copiedIndex === idx ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                            <span>Copy</span>
                          </button>

                          <button
                            onClick={() => setSaveNoteModalContent(msg.content)}
                            className="p-1 rounded bg-slate-200/50 dark:bg-slate-800/50 hover:bg-indigo-500 hover:text-white text-slate-600 dark:text-slate-300 flex items-center gap-1 px-2 transition-colors"
                          >
                            <Bookmark className="w-3 h-3" />
                            <span>Save to Notes</span>
                          </button>

                          <button
                            onClick={() => handleSendPrompt(msg.content, 'shorter')}
                            className="p-1 rounded bg-slate-200/50 dark:bg-slate-800/50 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-2"
                          >
                            Make Shorter
                          </button>

                          <button
                            onClick={() => handleSendPrompt(msg.content, 'detailed')}
                            className="p-1 rounded bg-slate-200/50 dark:bg-slate-800/50 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-2"
                          >
                            More Detailed
                          </button>

                          <button
                            onClick={() => handleSendPrompt(msg.content, 'simply')}
                            className="p-1 rounded bg-slate-200/50 dark:bg-slate-800/50 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-2"
                          >
                            Explain Simply
                          </button>

                          <button
                            onClick={handleRegenerate}
                            className="p-1 rounded bg-slate-200/50 dark:bg-slate-800/50 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center gap-1 px-2"
                          >
                            <RotateCcw className="w-3 h-3" /> Regenerate
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Active Streaming Text */}
                {isGenerating && streamingText && (
                  <div className="flex flex-col items-start">
                    <span className="text-[10px] text-indigo-400 mb-1">Veronica is streaming...</span>
                    <div className="max-w-2xl p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-indigo-500/30 text-xs text-slate-900 dark:text-slate-100 rounded-bl-xs">
                      <ReactMarkdown>{streamingText}</ReactMarkdown>
                    </div>
                  </div>
                )}

                {/* Thinking Spinner */}
                {isGenerating && !streamingText && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs text-indigo-500 font-medium animate-pulse">
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Veronica is thinking and formulating explanation...</span>
                  </div>
                )}

                <div ref={chatBottomRef} />
              </div>
            )}

            {/* Input Bar */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
              {/* Active Attached Context Badges */}
              {(attachedContext.vaultFileId || attachedContext.noteId || attachedContext.subjectId) && (
                <div className="flex flex-wrap items-center gap-1.5 px-1 py-1 rounded-xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Attached:</span>
                  
                  {attachedContext.vaultFileId && (() => {
                    const vFile = vaultFiles.find(v => v.id === attachedContext.vaultFileId);
                    return (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-semibold">
                        <Folder className="w-3.5 h-3.5 shrink-0 text-indigo-500" />
                        <span className="truncate max-w-[160px]">{vFile?.name || 'Vault File'}</span>
                        <button
                          type="button"
                          onClick={() => setAttachedContext(p => ({ ...p, vaultFileId: undefined }))}
                          className="hover:text-rose-500 transition-colors p-0.5 rounded ml-0.5"
                          title="Detach file"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })()}

                  {attachedContext.noteId && (() => {
                    const nFile = notes.find(n => n.id === attachedContext.noteId);
                    return (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-semibold">
                        <FileText className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                        <span className="truncate max-w-[160px]">{nFile?.title || 'Note'}</span>
                        <button
                          type="button"
                          onClick={() => setAttachedContext(p => ({ ...p, noteId: undefined }))}
                          className="hover:text-rose-500 transition-colors p-0.5 rounded ml-0.5"
                          title="Detach note"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })()}

                  {attachedContext.subjectId && (() => {
                    const sSubj = subjects.find(s => s.id === attachedContext.subjectId);
                    return (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                        <BookOpen className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                        <span className="truncate max-w-[160px]">{sSubj?.name || 'Subject'}</span>
                        <button
                          type="button"
                          onClick={() => setAttachedContext(p => ({ ...p, subjectId: undefined }))}
                          className="hover:text-rose-500 transition-colors p-0.5 rounded ml-0.5"
                          title="Detach subject"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })()}

                  <button
                    type="button"
                    onClick={() => setAttachedContext({})}
                    className="text-[11px] text-slate-400 hover:text-rose-500 underline ml-auto px-1 transition-colors font-medium"
                  >
                    Clear Context
                  </button>
                </div>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendPrompt();
                }}
                className="flex items-center gap-2"
              >
                
              <button
                type="button"
                onClick={() => setUseKnowledgeBaseMode(!useKnowledgeBaseMode)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${useKnowledgeBaseMode ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-indigo-500 border border-slate-200 dark:border-slate-800'}`}
                title="Answer only from my Knowledge Base notes"
              >
                <BrainCircuit className="w-4 h-4" />
                <span className="hidden sm:inline">{useKnowledgeBaseMode ? 'My Notes Only' : 'Search Web & Notes'}</span>
              </button>

                {/* Context Attachment Menu Trigger */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowAttachMenu(!showAttachMenu)}
                    className={`p-2.5 rounded-xl border transition-colors relative ${
                      attachedContext.vaultFileId || attachedContext.noteId || attachedContext.subjectId
                        ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-600 dark:text-indigo-400'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-indigo-500 border-slate-200 dark:border-slate-800'
                    }`}
                    title="Attach files or notes from Vault as context"
                  >
                    <Paperclip className="w-4 h-4" />
                    {(attachedContext.vaultFileId || attachedContext.noteId || attachedContext.subjectId) && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-indigo-500 ring-2 ring-white dark:ring-slate-900" />
                    )}
                  </button>

                  {showAttachMenu && (
                    <div className="absolute left-0 bottom-12 z-30 w-64 p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-2.5 text-xs">
                      <div className="flex items-center justify-between px-1 border-b border-slate-100 dark:border-slate-800 pb-1.5">
                        <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider">
                          Attach Context
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowAttachMenu(false)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Vault Files Section */}
                      <div>
                        <div className="flex items-center justify-between px-1 mb-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <Folder className="w-3 h-3 text-indigo-500" /> Vault Files
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setShowAttachMenu(false);
                              setShowVaultPickerModal(true);
                            }}
                            className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
                          >
                            Browse Vault ({vaultFiles.length})
                          </button>
                        </div>

                        {vaultFiles.length > 0 ? (
                          <div className="space-y-0.5 max-h-36 overflow-y-auto pr-0.5">
                            {vaultFiles.slice(0, 4).map(v => (
                              <button
                                key={v.id}
                                type="button"
                                onClick={() => {
                                  setAttachedContext(p => ({ ...p, vaultFileId: v.id }));
                                  setShowAttachMenu(false);
                                  showToast(`Attached file "${v.name}"`, 'info');
                                }}
                                className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                                  attachedContext.vaultFileId === v.id
                                    ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold'
                                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                <span className="truncate text-xs flex items-center gap-1.5 min-w-0">
                                  <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span className="truncate">{v.name}</span>
                                </span>
                                {attachedContext.vaultFileId === v.id && (
                                  <Check className="w-3.5 h-3.5 text-indigo-500 shrink-0 ml-1" />
                                )}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 text-center text-[11px] text-slate-400 space-y-1">
                            <span>No files in Vault yet</span>
                          </div>
                        )}
                      </div>

                      {/* Subjects Section */}
                      {subjects.length > 0 && (
                        <div className="border-t border-slate-100 dark:border-slate-800/80 pt-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-1 block">Subjects</span>
                          <div className="space-y-0.5 max-h-28 overflow-y-auto">
                            {subjects.map(s => (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() => {
                                  setAttachedContext(p => ({ ...p, subjectId: s.id }));
                                  setShowAttachMenu(false);
                                }}
                                className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                                  attachedContext.subjectId === s.id
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                <span className="truncate">📚 {s.name}</span>
                                {attachedContext.subjectId === s.id && (
                                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 ml-1" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notes Section */}
                      {notes.length > 0 && (
                        <div className="border-t border-slate-100 dark:border-slate-800/80 pt-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 mb-1 block">Notes</span>
                          <div className="space-y-0.5 max-h-28 overflow-y-auto">
                            {notes.slice(0, 4).map(n => (
                              <button
                                key={n.id}
                                type="button"
                                onClick={() => {
                                  setAttachedContext(p => ({ ...p, noteId: n.id }));
                                  setShowAttachMenu(false);
                                }}
                                className={`w-full text-left px-2 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                                  attachedContext.noteId === n.id
                                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold'
                                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                <span className="truncate">📄 {n.title}</span>
                                {attachedContext.noteId === n.id && (
                                  <Check className="w-3.5 h-3.5 text-amber-500 shrink-0 ml-1" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <input
                  type="text"
                  placeholder={`Ask Veronica about ${academicMode} (level: ${explanationLevel})...`}
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  disabled={isGenerating}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />

                {isGenerating ? (
                  <Button
                    type="button"
                    variant="danger"
                    onClick={handleStopGeneration}
                    icon={<StopCircle className="w-4 h-4" />}
                  >
                    Stop
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={!inputPrompt.trim()}
                    icon={<Send className="w-4 h-4" />}
                  >
                    Send
                  </Button>
                )}
              </form>
            </div>
          </Card>
        </div>
      </div>

      {/* Save Note Modal */}
      {saveNoteModalContent && (
        <SaveAiNoteModal
          isOpen={Boolean(saveNoteModalContent)}
          onClose={() => setSaveNoteModalContent(null)}
          aiContent={saveNoteModalContent}
          defaultSubjectId={attachedContext.subjectId}
        />
      )}

      {/* Practice Questions Modal */}
      {showPracticeModal && (
        <PracticeQuestionsModal
          isOpen={showPracticeModal}
          onClose={() => setShowPracticeModal(false)}
          defaultSubjectId={attachedContext.subjectId}
        />
      )}

      {/* Vault File Picker Modal */}
      {showVaultPickerModal && (
        <VaultPickerModal
          isOpen={showVaultPickerModal}
          onClose={() => setShowVaultPickerModal(false)}
          vaultFiles={vaultFiles}
          subjects={subjects}
          attachedFileId={attachedContext.vaultFileId}
          onSelectFile={(fileId) => {
            setAttachedContext(p => ({ ...p, vaultFileId: fileId }));
            const selFile = vaultFiles.find(v => v.id === fileId);
            if (selFile) showToast(`Attached file "${selFile.name}" as context`, 'success');
          }}
          onDetachFile={() => {
            setAttachedContext(p => ({ ...p, vaultFileId: undefined }));
            showToast('Detached vault file', 'info');
          }}
        />
      )}
    </div>
    </>
  );
};

// Helper Item Component for Conversation Sidebar
interface ConversationItemProps {
  conv: AIConversation;
  isActive: boolean;
  editingId: string | null;
  titleInput: string;
  setTitleInput: (s: string) => void;
  onSelect: () => void;
  onPin: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onStartRename: () => void;
  onSaveRename: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conv,
  isActive,
  editingId,
  titleInput,
  setTitleInput,
  onSelect,
  onPin,
  onArchive,
  onDelete,
  onStartRename,
  onSaveRename
}) => {
  if (editingId === conv.id) {
    return (
      <div className="flex items-center gap-1 p-1 bg-slate-200 dark:bg-slate-800 rounded-xl">
        <input
          type="text"
          value={titleInput}
          onChange={(e) => setTitleInput(e.target.value)}
          className="flex-1 px-2 py-1 bg-white dark:bg-slate-900 rounded text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
        />
        <button onClick={onSaveRename} className="p-1 text-emerald-500"><Check className="w-3.5 h-3.5" /></button>
      </div>
    );
  }

  return (
    <div
      onClick={onSelect}
      className={`group flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-all ${
        isActive
          ? 'bg-indigo-600 text-white font-semibold shadow-xs'
          : 'bg-slate-100/60 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
      }`}
    >
      <div className="flex items-center gap-2 truncate pr-2">
        <span className="truncate">{conv.title}</span>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={(e) => { e.stopPropagation(); onPin(); }} className="p-1 hover:text-amber-400">
          <Pin className="w-3 h-3" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onStartRename(); }} className="p-1 hover:text-blue-400">
          <Edit2 className="w-3 h-3" />
        </button>
        <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 hover:text-red-400">
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

// Vault File Picker Modal Component
interface VaultPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  vaultFiles: VaultFile[];
  subjects: Subject[];
  attachedFileId?: string;
  onSelectFile: (fileId: string) => void;
  onDetachFile: () => void;
}

const VaultPickerModal: React.FC<VaultPickerModalProps> = ({
  isOpen,
  onClose,
  vaultFiles,
  subjects,
  attachedFileId,
  onSelectFile,
  onDetachFile,
}) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'pdf' | 'document' | 'text' | 'image'>('all');

  if (!isOpen) return null;

  const filteredFiles = vaultFiles.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      (f.tags && f.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())));
    const matchesType = typeFilter === 'all' ? true : f.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const formatSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-indigo-500/10 text-indigo-500">
              <Folder className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Attach Vault File</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Select a document or note from your Academic Vault as AI context</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Filters */}
        <div className="p-4 space-y-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search vault files by name or tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {(['all', 'pdf', 'document', 'text', 'image'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-2.5 py-1 rounded-lg font-medium capitalize transition-colors text-[11px] ${
                  typeFilter === t
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* File List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2">
          {filteredFiles.length > 0 ? (
            filteredFiles.map((f) => {
              const isAttached = attachedFileId === f.id;
              const subj = subjects.find((s) => s.id === f.subjectId);
              return (
                <div
                  key={f.id}
                  onClick={() => {
                    if (isAttached) {
                      onDetachFile();
                    } else {
                      onSelectFile(f.id);
                      onClose();
                    }
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isAttached
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500/50 shadow-xs'
                      : 'bg-white dark:bg-slate-950/50 border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-500/30 hover:bg-slate-50 dark:hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2.5 rounded-xl text-indigo-500 shrink-0 ${isAttached ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{f.name}</h4>
                      <div className="flex flex-wrap items-center gap-2 mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                        <span className="uppercase font-semibold text-indigo-500">{f.type || 'file'}</span>
                        <span>•</span>
                        <span>{formatSize(f.size)}</span>
                        {subj && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">📚 {subj.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {isAttached && (
                    <div className="shrink-0 p-1 bg-indigo-100 dark:bg-indigo-900/50 rounded-full text-indigo-600">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-slate-500">
              <p>No files found.</p>
            </div>
          )}
          </div>
        </div>
      </div>
  );

};

