import React, { useState, useEffect, useRef } from 'react';
import { Droplet, Factory, Zap, Loader, Trees, MessageCircle, X, Send, Plus, Trash2, Edit2, Layers, Clipboard, FileText, CornerDownLeft, XCircle } from 'lucide-react';

// --- MOCK DATA FOR THE DASHBOARD (Kept inline to prevent file resolution errors in the environment) ---
const apiKey = "";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

const challenges = [
  {
    id: 'air_water',
    title: 'Air Quality & Water Pollution Hotspots',
    icon: Droplet,
    color: 'bg-red-500',
    hoverColor: 'hover:border-red-500',
    glowColor: 'shadow-red-500/50',
    description: "EO data, specifically from satellites monitoring aerosol optical depth (AOD) and water spectral signatures, pinpoints areas with elevated particulate matter (PM2.5) and chemical runoff. This is critical for prioritizing air filtration projects and water treatment upgrades. Data shows 3 major industrial zones contributing 70% of pollutants.",
    actionPlan: "Immediate deployment of low-cost air quality sensors in high-risk residential areas and planning for green infrastructure buffers along polluted waterways. Establishing mandatory reporting for major industrial emitters.",
    dataSources: [
      { name: "NASA Worldview", link: "https://www.earthdata.nasa.gov/data/tools/worldview" },
      { name: "Earth Observatory", link: "http://earthobservatory.nasa.gov/" },
    ],
    nodeCoords: { x: 30, y: 50 },
    mockTimeData: [
        { quarter: 'Q1 2024', value: 85, metric: 'PM2.5 Index', status: 'CRITICAL', trend: 0 },
        { quarter: 'Q2 2024', value: 82, metric: 'PM2.5 Index', status: 'CRITICAL', trend: -3 },
        { quarter: 'Q3 2024', value: 75, metric: 'PM2.5 Index', status: 'HIGH', trend: -7 },
        { quarter: 'Q4 2024', value: 78, metric: 'PM2.5 Index', status: 'HIGH', trend: 3 },
        { quarter: 'Q1 2025', value: 72, metric: 'PM2.5 Index', status: 'HIGH', trend: -6 },
    ],
    predictedData: { quarter: 'Q2 2025', value: 60, metric: 'PM2.5 Index', status: 'IMPROVED', trend: -12 }
  },
  {
    id: 'ecosystem_impact',
    title: 'Ecosystem & Habitat Vulnerability',
    icon: Factory,
    color: 'bg-yellow-500',
    hoverColor: 'hover:border-yellow-500',
    glowColor: 'shadow-yellow-500/50',
    description: "Satellite-based Land Use and Land Cover (LULC) maps track urban encroachment on vital habitats. Monitoring changes in Normalized Difference Vegetation Index (NDVI) and water body extent helps quantify habitat loss due to industrial and urban sprawl. Critical zones: The Western Forest and Coastal Marshlands are at a 40% risk of degradation.",
    actionPlan: "Establish protective green corridors, enforce buffer zones around key freshwater sources, and incentivize vertical farming to reduce agricultural land demand (referencing WorldPop/Copernicus data for population pressure).",
    dataSources: [
      { name: "CIESIN ESDIS (via Earthdata Search)", link: "https://search.earthdata.nasa.gov/search?q=CIESIN%20ESDIS" },
      { name: "WorldPop Data", link: "https://www.worldpop.org/" },
    ],
    nodeCoords: { x: 75, y: 75 },
    mockTimeData: [
        { quarter: 'Q1 2024', value: -4.2, metric: 'Forest Cover Change', status: 'ALERT', trend: 0 },
        { quarter: 'Q2 2024', value: -3.8, metric: 'Forest Cover Change', status: 'IMPROVED', trend: 0.4 },
        { quarter: 'Q3 2024', value: -4.5, metric: 'Forest Cover Change', status: 'ALERT', trend: -0.7 },
        { quarter: 'Q4 2024', value: -4.0, metric: 'Forest Cover Change', status: 'ALERT', trend: 0.5 },
        { quarter: 'Q1 2025', value: -3.5, metric: 'Forest Cover Change', status: 'IMPROVED', trend: 0.5 },
    ],
    predictedData: { quarter: 'Q2 2025', value: -1.5, metric: 'Forest Cover Change', status: 'RECOVERY', trend: 2.0 }
  },
  {
    id: 'greenspace_access',
    title: 'Greenspace Access & Health Equity',
    icon: Trees,
    color: 'bg-green-500',
    hoverColor: 'hover:border-green-500',
    glowColor: 'shadow-green-500/50',
    description: "Analyzing population density (WorldPop) overlayed with existing park and tree canopy data (Copernicus) reveals 'Greenspace Deserts'. 65% of children in the Central and Southern districts live more than 10 minutes from a public park. This directly impacts mental and physical health metrics.",
    actionPlan: "Repurposing unused municipal land for new micro-parks and initiating a city-wide urban tree planting program focused on underserved neighborhoods. Establishing new healthcare facilities in the newly identified high-growth zones.",
    dataSources: [
      { name: "Copernicus Services Catalogue", link: "https://www.copernicus.eu/en/accessing-data-where-and-how/copernicus-services-catalogue" },
    ],
    nodeCoords: { x: 60, y: 25 },
    mockTimeData: [
        { quarter: 'Q1 2024', value: 4, metric: 'Access Score (1-10)', status: 'PRIORITY', trend: 0 },
        { quarter: 'Q2 2024', value: 4.5, metric: 'Access Score (1-10)', status: 'PRIORITY', trend: 0.5 },
        { quarter: 'Q3 2024', value: 5, metric: 'Access Score (1-10)', status: 'IMPROVING', trend: 0.5 },
        { quarter: 'Q4 2024', value: 5.2, metric: 'Access Score (1-10)', status: 'IMPROVING', trend: 0.2 },
        { quarter: 'Q1 2025', value: 5.5, metric: 'Access Score (1-10)', status: 'IMPROVING', trend: 0.3 },
    ],
    predictedData: { quarter: 'Q2 2025', value: 7.0, metric: 'Access Score (1-10)', status: 'SUCCESS', trend: 1.5 }
  },
];
// --- END DATA/CONSTANTS ---


// --- AI CHATBOX COMPONENT ---

const AIChatbox = ({ activeChallenge }) => {
  // Use localStorage to initialize state
  const getInitialChatSessions = () => {
    try {
      const savedSessions = localStorage.getItem('chatSessions');
      const sessions = savedSessions ? JSON.parse(savedSessions) : [];
      if (sessions.length === 0) {
        return [{
            id: 'chat-default-1',
            title: 'Air Chat',
            history: [{ role: 'ai', text: `Ask me any questions you have about the findings or recommended action plan for the current focus: "${challenges[0].title}"!` }],
            challengeId: challenges[0].id
        }];
      }
      return sessions;
    } catch (e) {
      console.error("Could not load chat sessions from localStorage:", e);
      return [];
    }
  };

  const getInitialChatOpen = () => {
    try {
      const savedState = localStorage.getItem('isChatOpen');
      return savedState ? JSON.parse(savedState) : true; 
    } catch (e) {
      return true;
    }
  }


  const [isChatOpen, setIsChatOpen] = useState(getInitialChatOpen);
  const [chatSessions, setChatSessions] = useState(getInitialChatSessions); 
  const [currentChatId, setCurrentChatId] = useState(getInitialChatSessions()[0]?.id || null);
  const [chatInput, setChatInput] = useState('');
  const [isAILoading, setIsAILoading] = useState(false);
  const [renamingId, setRenamingId] = useState(null);
  const messagesEndRef = useRef(null);

  // Persistence effects
  useEffect(() => {
    try {
      localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
    } catch (e) {
      console.error("Could not save chat sessions to localStorage:", e);
    }
  }, [chatSessions]);

  useEffect(() => {
    try {
      localStorage.setItem('isChatOpen', JSON.stringify(isChatOpen));
    } catch (e) {
      console.error("Could not save chat open state to localStorage:", e);
    }
  }, [isChatOpen]);

  // Helper to generate simple ID
  const generateId = () => `chat-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // Finds the current session object
  const currentSession = chatSessions.find(s => s.id === currentChatId);
  const chatHistory = currentSession?.history || [];
  
  // Function to start a new chat session
  const startNewChat = (challenge, isManual = false) => {
    const newChatId = generateId();
    const initialMessage = { 
        role: 'ai', 
        text: `Ask me any questions you have about the findings or recommended action plan for the current focus: "${challenge.title}"!` 
    };
    
    // Determine the base title (e.g., 'Air Chat', 'Ecosystem Chat')
    const baseTitle = challenge.title.split(' ')[0] + ' Chat';
    
    const existingSessionsForChallenge = chatSessions.filter(s => s.challengeId === challenge.id);
    
    let finalTitle = baseTitle;
    
    if (isManual || existingSessionsForChallenge.length > 0) {
        const counter = existingSessionsForChallenge.length + 1;
        finalTitle = `${baseTitle} ${counter}`;
    }
    
    if (existingSessionsForChallenge.length === 0 && !isManual) {
        finalTitle = baseTitle;
    }

    const newSession = {
        id: newChatId,
        title: finalTitle, 
        history: [initialMessage],
        challengeId: challenge.id
    };
    
    setChatSessions(prev => [newSession, ...prev]);
    setCurrentChatId(newChatId);
    return newSession;
  };
  
  // Initialize and Reset on Challenge Change
  useEffect(() => {
    const baseTitle = activeChallenge.title.split(' ')[0] + ' Chat';
    const primarySession = chatSessions.find(s => s.challengeId === activeChallenge.id && s.title === baseTitle);
    
    if (primarySession) {
        setCurrentChatId(primarySession.id);
    } else {
      startNewChat(activeChallenge);
    }
  }, [activeChallenge.id, activeChallenge.title, chatSessions.length]);

  // Scroll to bottom when history updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);


  // --- CHAT MANAGEMENT FUNCTIONS ---

  const handleDeleteChat = (idToDelete) => {
    if (chatSessions.length === 1) return;
    
    const updatedSessions = chatSessions.filter(s => s.id !== idToDelete);
    setChatSessions(updatedSessions);
    
    if (idToDelete === currentChatId) {
      setCurrentChatId(updatedSessions.length > 0 ? updatedSessions[0].id : null);
    }
  };
  
  const handleRenameChat = (id, newTitle) => {
    if (!newTitle.trim()) {
        setRenamingId(null);
        return;
    }
    setChatSessions(prevSessions => prevSessions.map(session => 
      session.id === id ? { ...session, title: newTitle.trim() } : session
    ));
    setRenamingId(null);
  };
  
  const handleRenameInputKeyDown = (e, id, newTitle) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRenameChat(id, newTitle);
    } else if (e.key === 'Escape') {
      setRenamingId(null);
    }
  };

  // --- SEND MESSAGE LOGIC ---
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isAILoading || !currentSession) return;

    const userMessage = chatInput.trim();
    const userMessageLower = userMessage.toLowerCase();
    const sessionChallenge = challenges.find(c => c.id === currentSession.challengeId) || activeChallenge;

    // 1. Update history with user message locally
    const userMsgObject = { role: 'user', text: userMessage };
    
    setChatSessions(prevSessions => prevSessions.map(session => 
      session.id === currentChatId 
        ? { ...session, history: [...session.history, userMsgObject] } 
        : session
    ));
    setChatInput('');
    setIsAILoading(true);
    
    let aiResponseText = "";
    let isContextQuestion = false;

    // --- LOCAL AI RESPONSE LOGIC (Prioritized for dashboard context) ---
    const isEcosystem = sessionChallenge.id === 'ecosystem_impact';
    const isGreenspace = sessionChallenge.id === 'greenspace_access';
    const currentData = sessionChallenge.mockTimeData[sessionChallenge.mockTimeData.length - 1];
    const predictedData = sessionChallenge.predictedData;
    const metricUnit = isEcosystem ? '%' : isGreenspace ? '/10' : '';
    
    if (userMessageLower.includes("action plan")) {
        aiResponseText = `The **Action Plan** for the current focus (${sessionChallenge.title}) is: *${sessionChallenge.actionPlan}* This is based on the urgent need to address the high current metric of ${currentData.value}${metricUnit}.`;
        isContextQuestion = true;
    } else if (userMessageLower.includes("findings") || userMessageLower.includes("problem")) {
        aiResponseText = `The **Key Findings** show that ${sessionChallenge.description}. Our current metric stands at **${currentData.value}${metricUnit}** (${currentData.status}) as of ${currentData.quarter}.`;
        isContextQuestion = true;
    } else if (userMessageLower.includes("predicted") || userMessageLower.includes("future") || userMessageLower.includes("simulate")) {
        aiResponseText = `Based on the simulation model and successful action plan implementation, the **predicted ${predictedData.metric} for ${predictedData.quarter}** is **${predictedData.value}${metricUnit}** (${predictedData.status}). This represents a significant improvement of ${predictedData.trend > 0 ? `+${predictedData.trend}` : predictedData.trend}${metricUnit}.`;
        isContextQuestion = true;
    } else if (userMessageLower.includes("data sources") || userMessageLower.includes("data used")) {
        const sources = sessionChallenge.dataSources.map(s => s.name).join(', ');
        aiResponseText = `We are utilizing key Earth Observation data sources to inform this analysis, including: **${sources}**. These sources provide the necessary satellite imagery and spectral analysis.`;
        isContextQuestion = true;
    } else if (userMessageLower.includes("trend")) {
        const initial = sessionChallenge.mockTimeData[0];
        aiResponseText = `The general trend for the **${currentData.metric}** since ${initial.quarter} has moved from **${initial.value}${metricUnit}** to its current value of **${currentData.value}${metricUnit}** in ${currentData.quarter}. We are seeing a gradual ${currentData.trend > 0 ? 'increase' : 'decrease'} in urgency.`;
        isContextQuestion = true;
    } 

    if (isContextQuestion) {
        // Use local response immediately
        await new Promise(resolve => setTimeout(resolve, 500));
    } else {
        // --- EXTERNAL API CALL (for general questions) ---
        
        const systemPrompt = "You are a friendly and knowledgeable general-purpose AI assistant. Your goal is to answer the user's question clearly and concisely. Since the environment is limiting your connection, if the user asks about the dashboard's data (Action Plan, Findings, etc.), gently suggest they ask you about the specific dashboard features instead.";
        
        const payload = {
            contents: [{ parts: [{ text: userMessage }] }],
            systemInstruction: { parts: [{ text: systemPrompt }] },
            tools: [{ "google_search": {} }],
        };

        const MAX_RETRIES = 3;
        let success = false;
        
        for (let i = 0; i < MAX_RETRIES; i++) {
            try {
                const response = await fetch(GEMINI_API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const result = await response.json();
                const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

                if (text) {
                    aiResponseText = text;
                    success = true;
                    break;
                }
            } catch (error) {
                // Exponential backoff
                await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
            }
        }

        if (!success) {
            // --- FAILOVER RESPONSE (if general search failed) ---
            const fallbackMessage = "I am unable to connect to the general knowledge servers right now. I am best at analyzing the data in this dashboard! Please ask me about the **Action Plan**, **Key Findings**, **Predicted Future** values, or **Data Sources** for the current challenge.";
            aiResponseText = fallbackMessage;
        }
    }


    // 2. Update history with AI response
    setChatSessions(prevSessions => prevSessions.map(session => 
      session.id === currentChatId 
        ? { ...session, history: [...session.history, { role: 'ai', text: aiResponseText }] } 
        : session
    ));
    setIsAILoading(false);
  };

  // --- UI COMPONENTS ---

  const ChatMessage = ({ message }) => {
    const isAI = message.role === 'ai';
    return (
      <div className={`flex ${isAI ? 'justify-start' : 'justify-end'} mb-4`}>
        <div className={`max-w-[95%] p-3 rounded-xl shadow-md ${
          isAI ? 'bg-indigo-700 text-white rounded-bl-none' : 'bg-gray-200 text-gray-900 rounded-br-none'
        }`}>
          {/* Using dangerouslySetInnerHTML to allow bold text from the AI response */}
          <p className="text-sm leading-snug" dangerouslySetInnerHTML={{ __html: message.text }} />
        </div>
      </div>
    );
  };
  
  const SidebarChatButton = ({ session }) => {
    const [titleInput, setTitleInput] = useState(session.title);

    if (renamingId === session.id) {
        return (
            <div className="w-full h-12 flex flex-col justify-center p-1">
                <input
                    type="text"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    onBlur={() => handleRenameChat(session.id, titleInput)}
                    onKeyDown={(e) => handleRenameInputKeyDown(e, session.id, titleInput)}
                    className="w-full text-[10px] leading-tight text-center bg-indigo-200 text-gray-900 rounded-sm px-1 py-0.5"
                    autoFocus
                />
            </div>
        );
    }

    return (
        <div 
          className={`w-full h-12 flex flex-col items-center justify-center p-1 rounded-lg transition duration-150 text-center group relative ${
            session.id === currentChatId 
                ? 'bg-indigo-600 text-white border border-indigo-400 shadow-inner' 
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
          }`}
        >
            <button
              onClick={() => setCurrentChatId(session.id)}
              className="w-full h-full absolute top-0 left-0 flex flex-col items-center justify-center"
              title={session.title}
            >
              <Layers className="w-4 h-4" />
              <span className="text-[10px] leading-tight mt-1 truncate w-full px-1">{session.title.split(' ')[0]}</span>
            </button>

            {/* Rename/Delete Overlay */}
            <div className="absolute top-0 right-0 left-0 h-full bg-gray-900/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex justify-center items-center space-x-1">
                <button
                    onClick={() => setRenamingId(session.id)}
                    className="p-1 rounded-full text-gray-300 hover:text-white hover:bg-indigo-600 transition"
                    title="Rename"
                >
                    <Edit2 className="w-3 h-3" />
                </button>
                <button
                    onClick={() => handleDeleteChat(session.id)}
                    className="p-1 rounded-full text-gray-300 hover:text-white hover:bg-red-600 transition"
                    title="Delete"
                    disabled={chatSessions.length === 1}
                >
                    <Trash2 className="w-3 h-3" />
                </button>
            </div>
        </div>
    );
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Bubble Button */}
      {!isChatOpen && (
        <button 
          onClick={() => setIsChatOpen(true)}
          className="bg-indigo-600 p-4 rounded-full text-white shadow-2xl shadow-indigo-500/50 hover:bg-indigo-700 transition duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-70"
          aria-label="Open Chatbot"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isChatOpen && (
        <div className="w-[480px] h-96 bg-gray-900 rounded-xl shadow-2xl flex border border-indigo-600/50">
          
          {/* LEFT: Recent Chats Sidebar */}
          <div className="w-24 bg-gray-800 p-2 rounded-l-xl flex flex-col items-center border-r border-gray-700">
            
            {/* New Chat Button */}
            <button
                onClick={() => startNewChat(activeChallenge, true)}
                className="w-full h-16 flex flex-col items-center justify-center bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white mb-4 shadow-md transition duration-150"
                aria-label="Start New Chat"
            >
                <Plus className="w-5 h-5" />
                <span className="text-xs font-medium mt-1">New Chat</span>
            </button>
            
            <h5 className="text-xs font-semibold text-gray-400 mb-2">RECENT</h5>
            
            {/* Recent Sessions List */}
            <div className="w-full flex-1 overflow-y-auto space-y-2 custom-scrollbar-sidebar">
              {chatSessions.map((session) => (
                <SidebarChatButton key={session.id} session={session} />
              ))}
            </div>
          </div>
          
          {/* RIGHT: Chat Content */}
          <div className="flex-1 flex flex-col">
            
            {/* Header */}
            <div className="p-3 bg-gray-800 flex justify-between items-center border-b border-indigo-600">
              <h4 className="text-lg font-bold text-indigo-400 truncate pr-2">{currentSession?.title || 'DataPath AI'}</h4>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="text-gray-400 hover:text-white transition p-1 rounded-full hover:bg-gray-700"
                aria-label="Close Chatbot"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {chatHistory.map((message, index) => (
                <ChatMessage key={index} message={message} />
              ))}
              {isAILoading && (
                <div className="flex justify-start mb-4">
                  <div className="p-3 bg-indigo-700 text-white rounded-xl rounded-bl-none">
                    <Loader className="w-4 h-4 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-700 flex flex-col bg-gray-800 rounded-br-xl">
              <div className="flex w-full">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={`Ask about ${activeChallenge.title}...`}
                  className="flex-1 p-2 bg-gray-700 text-white rounded-l-lg border-none focus:ring-indigo-500 focus:border-indigo-500 text-sm placeholder-gray-400"
                  disabled={isAILoading}
                />
                <button
                  type="submit"
                  className="bg-indigo-600 text-white p-2 rounded-r-lg hover:bg-indigo-700 disabled:bg-indigo-900 transition duration-150"
                  disabled={isAILoading || !chatInput.trim()}
                  aria-label="Send Message"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              {/* AI Disclaimer */}
              <p className="text-xs text-red-400 mt-1 text-center">
                AI can make mistakes. Check important information.
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- SUMMARY REPORT MODAL COMPONENT ---

const SummaryReportModal = ({ activeChallenge, dataToDisplay, isSimulating, onClose }) => {
    const [reportType, setReportType] = useState('executive');
    const [copySuccess, setCopySuccess] = useState('');
    const textAreaRef = useRef(null);

    const isEcosystem = activeChallenge.id === 'ecosystem_impact';
    const isGreenspace = activeChallenge.id === 'greenspace_access';
    const metricUnit = isEcosystem ? '%' : isGreenspace ? '/10' : '';
    const currentData = dataToDisplay;
    const predictedData = activeChallenge.predictedData;

    const generateReportContent = () => {
        let title = '';
        let body = '';
        
        const statusPhrase = currentData.status.toLowerCase();
        const baseStatus = `The current **${currentData.metric}** for ${currentData.quarter} is at **${currentData.value}${metricUnit}** (${currentData.status}). This indicates a ${currentData.trend > 0 ? 'positive trend' : 'critical need for action'}.`;
        
        const predictedStatus = isSimulating 
            ? `The predicted metric for Q2 2025, assuming immediate action, shows a recovery to **${predictedData.value}${metricUnit}** (${predictedData.status}).`
            : '';

        switch (reportType) {
            case 'executive':
                title = `Executive Summary: Urgent Action for ${activeChallenge.title}`;
                body = `**Key Findings:** Our analysis reveals a ${statusPhrase} situation in **${activeChallenge.title}**. ${activeChallenge.description.split('.')[0]}. Immediate attention is required to mitigate risks and secure community well-being.\n\n` +
                       `**Current Status:** ${baseStatus}\n\n` +
                       `**Recommendation:** We propose immediate approval and funding for the **${activeChallenge.actionPlan.split('.')[0]}** plan. This focused investment will directly impact the current {currentData.metric}.\n\n` +
                       `${predictedStatus.length > 0 ? predictedStatus + '\n\n' : ''}` +
                       `**Next Steps:** Authorize the start of the action plan and appoint a cross-departmental task force.`;
                break;
            case 'technical':
                title = `Technical Analysis: EO Data Pathway for ${activeChallenge.title}`;
                body = `**Challenge Overview:** This report details the data-driven findings for ${activeChallenge.title}. EO data sources include ${activeChallenge.dataSources.map(s => s.name).join(', ')}. Data is tracked quarterly to monitor performance metrics.\n\n` +
                       `**Metric Analysis (${currentData.quarter}):** The primary metric, ${currentData.metric}, registers at ${currentData.value}${metricUnit}. This measurement confirms the presence of ${statusPhrase} factors, showing a quarter-over-quarter trend of ${currentData.trend > 0 ? `+${currentData.trend}` : currentData.trend}${metricUnit}. The confidence level remains high due to satellite spectral analysis accuracy.\n\n` +
                       `**Proposed Intervention Model:** The action plan involves ${activeChallenge.actionPlan.split('.')[0]}. The simulation model forecasts a metric improvement to ${predictedData.value}${metricUnit} by ${predictedData.quarter} if intervention protocols are initiated immediately.\n\n` +
                       `**Data Pipeline Status:** All data streams are operational and ready for continuous monitoring post-implementation.`;
                break;
            case 'community':
                title = `Community Briefing: Making Our City Healthier - Focus on ${activeChallenge.title}`;
                body = `Hello neighbors! We've used satellite data (from NASA and Copernicus) to check the health of our city. Our focus is currently on **${activeChallenge.title}**.\n\n` +
                       `**What the Data Shows:** The current reading for our community's ${currentData.metric} is **${currentData.value}${metricUnit}**, which is rated as ${currentData.status}.\n\n` +
                       `**Why This Matters:** ${activeChallenge.description}\n\n` +
                       `**Our Plan:** The city is proposing to launch an action plan, which includes **${activeChallenge.actionPlan.split('.')[0]}**. We believe this will make a big difference!\n\n` +
                       `${predictedStatus.length > 0 ? `**Great News!** Our plan is projected to improve the metric to ${predictedData.value}${metricUnit} in the next few months. We need your support to make this happen!` : ''}\n\n` +
                       `**Get Involved:** Please visit your local park department website to learn how you can help with the new initiatives!`;
                break;
            default:
                return { title: 'Report Error', content: 'Select a report type.' };
        }

        return `## ${title}\n\n${body}`;
    };

    const reportContent = generateReportContent();

    // Process the report content for display/copy: remove H2 markdown, condense newlines, and replace ** with "
    const processedReportContent = reportContent
        .replace(/## /g, '') 
        .replace(/\n\n/g, '\n') 
        .replace(/\*\*/g, '"'); 

    const copyToClipboard = (textToCopy) => {
        if (textAreaRef.current) {
            const originalValue = textAreaRef.current.value;
            textAreaRef.current.value = textToCopy; 
            
            textAreaRef.current.select();
            document.execCommand('copy');
            
            textAreaRef.current.value = originalValue;

            setCopySuccess('Copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div 
                className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-indigo-600"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-4 flex justify-between items-center border-b border-gray-700 bg-gray-900 rounded-t-xl">
                    <h2 className="text-xl font-bold text-white flex items-center">
                        <FileText className="w-6 h-6 mr-2 text-indigo-400" />
                        Generate Stakeholder Report
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition p-1 rounded-full">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                    
                    <h3 className="text-lg font-semibold text-indigo-300 mb-3">Select Audience Focus:</h3>
                    <div className="flex space-x-4 mb-6">
                        {['executive', 'technical', 'community'].map(type => (
                            <button
                                key={type}
                                onClick={() => setReportType(type)}
                                // ADDED interactive-button class
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition duration-200 uppercase tracking-wider interactive-button ${
                                    reportType === type 
                                        ? 'bg-indigo-600 text-white shadow-md' 
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                    <h3 className="text-lg font-semibold text-indigo-300 mb-2 flex items-center">
                        Generated Summary
                        {isSimulating && <span className="text-green-400 text-sm ml-3">(Includes Predicted Q2 2025 Data)</span>}
                    </h3>
                    
                    <div className="relative">
                        <textarea
                            ref={textAreaRef}
                            value={processedReportContent}
                            readOnly
                            className="w-full h-80 p-4 bg-gray-900 text-gray-200 border border-gray-700 rounded-lg text-sm resize-none"
                        />
                        <button
                            onClick={() => copyToClipboard(processedReportContent)}
                            // ADDED interactive-button class
                            className="absolute top-2 right-2 bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition duration-150 flex items-center text-xs interactive-button"
                        >
                            <Clipboard className="w-4 h-4 mr-1" />
                            {copySuccess || 'Copy to Clipboard'}
                        </button>
                    </div>

                    <p className="mt-4 text-xs text-gray-400 flex items-center">
                        <CornerDownLeft className="w-3 h-3 mr-1 text-gray-500"/> Tip: Use this text for presentation slides or official memos.
                    </p>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-700 flex justify-end">
                    <button onClick={onClose} 
                        // ADDED interactive-button class
                        className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition duration-150 flex items-center interactive-button"
                    >
                        <XCircle className="w-5 h-5 mr-1" /> Close
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- MAIN APP COMPONENT ---

const App = () => {
  const [activeChallenge, setActiveChallenge] = useState(challenges[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [timeIndex, setTimeIndex] = useState(challenges[0].mockTimeData.length - 1);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle challenge selection with a simulated loading state
  const handleChallengeClick = (challenge) => {
    if (challenge.id === activeChallenge.id) return;

    setIsLoading(true);
    setIsSimulating(false);
    setTimeout(() => {
      setActiveChallenge(challenge);
      setTimeIndex(challenge.mockTimeData.length - 1); 
      setIsLoading(false);
    }, 1000); 
  };
  
  // Logic to determine which data to display (current or predicted)
  const dataToDisplay = isSimulating && timeIndex === challenges[0].mockTimeData.length - 1
    ? activeChallenge.predictedData
    : activeChallenge.mockTimeData[timeIndex];

  // Get the current time data based on the active challenge and time index
  const currentTimeData = dataToDisplay;
  
  // Define isEcosystem and isGreenspace
  const isEcosystem = activeChallenge.id === 'ecosystem_impact';
  const isGreenspace = activeChallenge.id === 'greenspace_access';


  // Component for a data card
  const ChallengeCard = ({ challenge }) => {
    const Icon = challenge.icon;
    const isActive = challenge.id === activeChallenge.id && !isLoading;

    const activeClasses = `bg-gray-700 shadow-xl scale-[1.03] border-4 ${challenge.hoverColor.replace('hover:border-', 'border-')} shadow-lg ${challenge.glowColor}`;
    const inactiveClasses = 'bg-gray-800 border-2 border-gray-700 hover:bg-gray-700/50 hover:shadow-lg hover:scale-[1.01]';

    return (
      <div
        className={`p-6 rounded-xl cursor-pointer transition-all duration-300 transform ${isActive ? activeClasses : inactiveClasses} ${isLoading && challenge.id === activeChallenge.id ? 'opacity-50' : ''}`}
        onClick={() => handleChallengeClick(challenge)}
      >
        <div className="flex items-center space-x-4 mb-3">
          <div className={`p-3 rounded-full ${challenge.color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-white">{challenge.title}</h2>
        </div>
        <p className={`text-sm ${isActive ? 'text-gray-100' : 'text-gray-400'}`}>
          {challenge.description.split('.')[0]}.
        </p>
      </div>
    );
  };

  // Component for a clickable node on the SVG map
  const DataNode = ({ challenge }) => {
    const isActive = challenge.id === activeChallenge.id && !isLoading;
    
    // We use a CSS variable trick for SVG color binding with Tailwind
    const twColor = challenge.color.replace('bg-', ''); 
    const colorValue = `var(--tw-color-${twColor})`;

    return (
        <g
            className={`cursor-pointer transition-transform duration-300 hover:scale-125`}
            onClick={() => handleChallengeClick(challenge)}
        >
            {/* The pulsing glow circle */}
            <circle
                cx={challenge.nodeCoords.x}
                cy={challenge.nodeCoords.y}
                r={isActive ? 1.5 : 0}
                fill={colorValue}
                className={`opacity-50 transition-all duration-500 ${isActive ? 'animate-ping-slow' : ''}`}
                style={{ '--tw-color-red-500': '#ef4444', '--tw-color-yellow-500': '#f59e0b', '--tw-color-green-500': '#10b981' }}
            />
             {/* The solid, interactive circle */}
            <circle
                cx={challenge.nodeCoords.x}
                cy={challenge.nodeCoords.y}
                r={isActive ? 2 : 1.5} 
                fill={colorValue}
                stroke="#1f2937"
                strokeWidth={0.5}
                style={{ '--tw-color-red-500': '#ef4444', '--tw-color-yellow-500': '#f59e0b', '--tw-color-green-500': '#10b981' }}
            />
        </g>
    );
  };
  
  // Logic to determine the dynamic border class for the Data Visualization (Map)
  const getVisualizationBorderClass = () => {
    if (currentTimeData.status === 'CRITICAL' || currentTimeData.status === 'ALERT') {
        return `border-${currentTimeData.status === 'CRITICAL' ? 'red' : 'yellow'}-500`;
    }
    if (isSimulating) {
        return 'border-green-500';
    }
    return 'border-gray-700';
  };
  
  const visualizationBorderClass = getVisualizationBorderClass();
  
  // Logic to determine the dynamic border class for the detail panel
  const getDetailPanelBorderClass = () => {
    let color = 'indigo';
    
    if (currentTimeData.status === 'CRITICAL') {
        color = 'red';
    } else if (currentTimeData.status === 'ALERT') {
        color = 'yellow';
    } else if (currentTimeData.status === 'IMPROVED' || currentTimeData.status === 'SUCCESS' || currentTimeData.status === 'RECOVERY') {
        color = 'green';
    }
    
    // Use dynamic shadow color based on status color
    const shadowColorMap = {
        'red': 'red-500/50',
        'yellow': 'yellow-500/50',
        'green': 'green-500/50',
        'indigo': 'indigo-500/50'
    };
    
    return `border-${color}-500 shadow-${shadowColorMap[color]}`;
  };

  const detailPanelBorderClass = getDetailPanelBorderClass();


  // Component to display the simulated map/data visualization
  const DataVisualization = () => {
    // Determine the color for the data point display based on the current status
    let dataPointColor = 'text-gray-300';
    if (currentTimeData.status === 'CRITICAL' || currentTimeData.status === 'ALERT') {
        dataPointColor = 'text-red-500';
    } else if (currentTimeData.status === 'IMPROVING' || currentTimeData.status === 'IMPROVED' || currentTimeData.status === 'SUCCESS' || currentTimeData.status === 'RECOVERY') {
        dataPointColor = 'text-green-400';
    } else if (currentTimeData.status === 'HIGH' || currentTimeData.status === 'PRIORITY') {
        dataPointColor = 'text-yellow-500';
    }

    const hotspotColorClass = activeChallenge.color.replace('bg-', 'text-');
    
    // Logic to set a prominent shadow when critical/alert OR simulating
    const isSpecialState = currentTimeData.status === 'CRITICAL' || currentTimeData.status === 'ALERT' || isSimulating;
    const shadowStyle = {};

    if (isSpecialState) {
        let shadowColor = 'rgba(99, 102, 241, 0.7)'; // Default indigo
        if (isSimulating) {
             shadowColor = 'rgba(16, 185, 129, 0.7)'; // Green for simulation success
        } else if (currentTimeData.status === 'CRITICAL') {
             shadowColor = 'rgba(239, 68, 68, 0.7)'; // Red
        } else if (currentTimeData.status === 'ALERT') {
             shadowColor = 'rgba(245, 158, 11, 0.7)'; // Yellow
        }
        shadowStyle.boxShadow = `0 0 40px -10px ${shadowColor}`;
    }


    return (
      <div 
        className={`p-6 rounded-xl shadow-2xl h-96 flex flex-col justify-center items-center relative overflow-hidden border-4 transition-all duration-300 ${visualizationBorderClass}`}
        style={{...shadowStyle, backgroundColor: '#1f2937'}}
      >
        
        {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full w-full">
                <Loader className="w-10 h-10 text-indigo-400 animate-spin" />
                <p className="mt-4 text-xl text-indigo-300">Fetching latest EO data...</p>
            </div>
        ) : (
            <>
                {/* SVG Network Map */}
                <svg className="w-full h-full flex-grow" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
                    {/* Simulated Earth/City Base Shape (a glowing circle for depth) */}
                    <circle cx="50" cy="50" r="45" fill="#111827" stroke="#374151" strokeWidth="0.3" filter="url(#glow)" />
                    
                    {/* Network Lines connecting all nodes - STATIC BASE */}
                    <path 
                        d="M30 50 L75 75 M75 75 L60 25 M60 25 L30 50" 
                        stroke="rgba(99, 102, 241, 0.4)" 
                        strokeWidth="0.2" 
                        fill="none"
                    />

                    {/* Nodes - Clickable data points */}
                    {challenges.map(c => (
                        <DataNode
                            key={c.id}
                            challenge={c}
                        />
                    ))}

                    {/* Active Link Line - DYNAMIC, connecting active node to center (data source) */}
                    <path 
                        d={`M50 50 L${activeChallenge.nodeCoords.x} ${activeChallenge.nodeCoords.y}`} 
                        strokeWidth="0.8" 
                        fill="none" 
                        strokeLinecap="round"
                        className={`animate-draw-line ${hotspotColorClass}`}
                    />
                    
                    {/* Center Point - Data Source / Satellite */}
                    <circle cx="50" cy="50" r="2" fill="#6366f1" className="shadow-lg shadow-indigo-400/50" />
                    <text x="50" y="55" textAnchor="middle" fill="#6366f1" fontSize="2" fontWeight="bold">EO DATA SOURCE</text>

                    
                    {/* Defs for glow filter */}
                    <defs>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="0.2" result="coloredBlur"/>
                            <feMerge>
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>
                    </defs>
                </svg>

                {/* Text Overlay for Current Data - Positioned higher to avoid covering the EO DATA SOURCE */}
                <div className="absolute top-[32%] left-1/2 transform -translate-x-1/2 z-10 text-center bg-gray-900/80 p-4 rounded-xl border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-2 transition-opacity duration-500">
                        {activeChallenge.title}
                        {isSimulating && <span className="text-green-400 ml-2">(PREDICTED)</span>}
                    </h3>
                    <p className="text-gray-300 text-sm transition-opacity duration-500">
                        {currentTimeData.quarter} Data Point
                    </p>
                    <p className={`mt-2 px-4 py-2 rounded-full text-xs font-mono text-white inline-block border-2 border-current transition-colors duration-500 ${dataPointColor.replace('text-', 'border-')}`}>
                        {currentTimeData.metric}: {currentTimeData.value}{isEcosystem ? '%' : isGreenspace ? '/10' : ''} ({currentTimeData.status})
                    </p>
                </div>
            </>
        )}
        
        {/* Time Series Slider */}
        <div className="absolute bottom-4 w-full px-6 flex flex-col items-center">
            <label htmlFor="time-slider" className="text-sm font-medium text-gray-300 mb-2">
                Time Series: {currentTimeData.quarter}
            </label>
            <input
                id="time-slider"
                type="range"
                min="0"
                max={activeChallenge.mockTimeData.length - 1}
                step="1"
                value={timeIndex}
                onChange={(e) => { setTimeIndex(parseInt(e.target.value)); setIsSimulating(false); }}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer range-lg"
                disabled={isSimulating}
                style={{
                    '--tw-ring-color': '#6366f1',
                    '--tw-shadow-color': '#6366f1',
                }}
            />
            <div className="flex justify-between w-full mt-1 text-xs text-gray-400">
                {activeChallenge.mockTimeData.map((data, index) => (
                    <span key={index} className={index === timeIndex ? 'text-indigo-400 font-bold' : ''}>
                        {data.quarter}
                    </span>
                ))}
            </div>
        </div>

      </div>
    );
  };

  // Footer Component with required NASA links
  const Footer = () => (
    <footer className="bg-gray-900 py-8 border-t border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center text-gray-400 mb-6">
          <p>&copy; 2025 Urban Health & Ecosystem Dashboard | NASA Space Apps Challenge</p>
          <p className="mt-2">Demonstrating the power of Earth Observation data for sustainable urban planning.</p>
        </div>

        <div className="mt-8">
            <h4 className="text-lg font-semibold text-white mb-4 text-center">Data Resources (Required Citations)</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
                <a href="https://www.earthdata.nasa.gov/data/tools/worldview" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-400 transition duration-150 text-center">NASA Worldview</a>
                <a href="http://earthobservatory.nasa.gov/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-400 transition duration-150 text-center">Earth Observatory</a>
                <a href="https://search.earthdata.nasa.gov/search?q=CIESIN%20ESDIS" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-400 transition duration-150 text-center">Earthdata Search (CIESIN)</a>
                <a href="https://www.copernicus.eu/en/accessing-data-where-and-how/copernicus-services-catalogue" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-400 transition duration-150 text-center">Copernicus Catalogue</a>
                <a href="https://www.worldpop.org/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-400 transition duration-150 text-center">WorldPop</a>
                <a href="https://datasets.wri.org/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-400 transition duration-150 text-center">WRI Datasets</a>
                <a href="https://human-settlement.emergency.copernicus.eu/index.php" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-400 transition duration-150 text-center">Copernicus EMS</a>
                <a href="http://eotoolkit.unhabitat.org/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-400 transition duration-150 text-center">UN-Habitat EOToolkit</a>
                <a href="https://donnees-data.asc-csa.gc.ca/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-400 transition duration-150 text-center">ASC-CSA Data</a>
                <a href="https://visualizador.inde.gov.br/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-400 transition duration-150 text-center">INDE Visualizador</a>
                <a href="https://www.dgi.inpe.br/catalogo/explore" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-400 transition duration-150 text-center">INPE Catalogo</a>

            </div>
        </div>
      </div>
    </footer>
  );
  
  return (
    <div className="min-h-screen bg-gray-900 font-sans text-white">
      {/* Tailwind Setup & Font */}
      <script src="https://cdn.tailwindcss.com"></script>
      {/* Note: All custom styles (animations, custom-scrollbar) are now assumed to be handled by the external styles.css file */}

      {/* Header */}
      <header className="py-6 bg-gray-800 border-b-4 border-indigo-600 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center">
            <Zap className="w-6 h-6 mr-2 text-indigo-400" />
            Urban Data Pathways: Action Center
          </h1>
          <p className="text-sm font-medium text-indigo-300 mt-2 md:mt-0 p-1 px-3 border border-indigo-500 rounded-full">
            NASA Space Apps Challenge 2025
          </p>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-black text-white leading-tight">
            Data-Driven Urban Resilience
          </h2>
          <p className="mt-4 text-xl text-indigo-300 max-w-4xl mx-auto">
            Prioritizing community and ecosystem health using real-time insights from Earth Observation satellites.
          </p>
        </div>

        {/* Challenge Card Layout (Horizontal) */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {challenges.map((challenge) => (
            <ChallengeCard key={challenge.id} challenge={challenge} />
          ))}
        </div>

        {/* Data Visualization & Detail Panel - 2/3 and 1/3 split */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Data Visualization (Map) - 2/3 column */}
          <div className="lg:col-span-2">
            <DataVisualization />
          </div>

          {/* Active Challenge Details - 1/3 column */}
          <div 
            className={`lg:col-span-1 p-8 bg-gray-800 rounded-xl shadow-2xl border-4 transition-all duration-300 ${detailPanelBorderClass} h-full flex flex-col justify-between`}
            style={{ 
                // Add a dynamic glow/shadow effect based on status or simulation
                boxShadow: isSimulating
                    ? `0 0 30px -10px rgba(16, 185, 129, 0.7)` // Green glow for simulation
                    : (currentTimeData.status === 'CRITICAL' || currentTimeData.status === 'ALERT') 
                        ? `0 0 30px -10px ${currentTimeData.status === 'CRITICAL' ? 'rgba(239, 68, 68, 0.7)' : 'rgba(245, 158, 11, 0.7)'}` 
                        : 'none'
            }}
          >
            <div>
              <div className="flex items-center space-x-3 pb-4 mb-4 border-b border-gray-700">
                <activeChallenge.icon className={`w-8 h-8 ${activeChallenge.color.replace('bg-', 'text-')}`} />
                <h3 className="text-2xl font-bold text-white">Focus: {activeChallenge.title}</h3>
              </div>
              
              <h4 className="text-lg font-semibold text-gray-200 mt-4 mb-2">Detailed Findings ({currentTimeData.quarter} Status):</h4>
              
              {/* Conditional Alert/Success Message */}
              {isSimulating && (
                  <div className="p-3 mb-4 rounded-lg bg-green-900/50 border border-green-500 text-green-300 text-sm font-medium flex items-center">
                      <Zap className="w-5 h-5 mr-2" />
                      Predicted Success! Action plan results show **{activeChallenge.predictedData.metric}** at **{activeChallenge.predictedData.value}{isEcosystem ? '%' : isGreenspace ? '/10' : ''}** by Q2 2025.
                  </div>
              )}

              <p className="text-gray-400 text-sm">
                  The current {currentTimeData.metric} for **{currentTimeData.quarter}** is **{currentTimeData.value}{isEcosystem ? '%' : isGreenspace ? '/10' : ''}**. This represents a change of **{currentTimeData.trend > 0 ? `+${currentTimeData.trend}` : currentTimeData.trend}{isEcosystem ? '%' : isGreenspace ? ' pts' : ''}** from the previous quarter.
                  <br/><br/>
                  {activeChallenge.description}
              </p>
              
              <h4 className="text-lg font-semibold text-gray-200 mt-6 mb-2">Recommended Action Plan:</h4>
              <div className="p-4 bg-gray-900 rounded-lg border border-indigo-600/50">
                  <p className="text-sm text-indigo-300 font-medium">{activeChallenge.actionPlan}</p>
              </div>

              {/* Simulate Action Button */}
              {timeIndex === activeChallenge.mockTimeData.length - 1 && (
                  <button
                      onClick={() => setIsSimulating(!isSimulating)}
                      // ADDED interactive-button class
                      className={`w-full mt-6 py-3 font-bold rounded-lg transition duration-200 interactive-button ${
                          isSimulating 
                              ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/50'
                              : 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/50'
                      }`}
                  >
                      {isSimulating ? 'Stop Simulation (View Actual Q1 2025)' : 'Simulate Action (Predict Q2 2025)'}
                  </button>
              )}


              <h4 className="text-lg font-semibold text-gray-200 mt-6 mb-2">Key Data Sources:</h4>
              <ul className="space-y-2">
                  {activeChallenge.dataSources.map(source => (
                      <li key={source.name}>
                          <a href={source.link} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-400 hover:text-white transition duration-150 flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4 text-indigo-400"><path d="M15 3h6v6"/><path d="M10 14L21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
                              {source.name}
                          </a>
                      </li>
                  ))}
              </ul>
            </div>
             
             {/* Report Generator Button (Now triggers modal) */}
            <button 
                onClick={() => setIsModalOpen(true)}
                // ADDED interactive-button class
                className="w-full mt-8 py-3 bg-indigo-600 text-white font-black text-lg rounded-lg shadow-xl shadow-indigo-500/50 hover:bg-indigo-700 transition duration-300 transform hover:scale-[1.01] flex items-center justify-center interactive-button"
            >
                <FileText className="w-6 h-6 mr-2" />
                Generate Summary Report
            </button>
          </div>
          
        </div>
      </main>

      {/* AI Chatbox */}
      <AIChatbox activeChallenge={activeChallenge} />
      
      {/* Report Modal */}
      {isModalOpen && (
        <SummaryReportModal 
          activeChallenge={activeChallenge} 
          dataToDisplay={dataToDisplay}
          isSimulating={isSimulating}
          onClose={() => setIsModalOpen(false)} 
        />
      )}
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;
