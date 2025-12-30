import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, WorkoutLog } from '../types';
import { dbService } from '../db';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, Legend, CartesianGrid 
} from 'recharts';
import { Send, Sparkles, Brain, Activity, TrendingUp, AlertCircle, Cpu, Loader2, BarChart3 } from 'lucide-react';

interface IntelligenceHubProps {
  user: UserProfile;
  history: Record<string, WorkoutLog>;
}

const IntelligenceHub: React.FC<IntelligenceHubProps> = ({ user, history }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: any }[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const userQuery = query;
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', content: userQuery }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Fetch data for context
      const sessions = await dbService.getAllSessions();
      const strength = await dbService.getStrengthData();
      const cardio = await dbService.getCardioData();

      const context = {
        athleteProfile: user,
        historyCount: sessions.length,
        recentSessions: sessions.slice(-10),
        rawStrengthLogs: strength.slice(-20),
        rawCardioLogs: cardio.slice(-20),
        currentWeek: Math.max(1, Math.floor((new Date().getTime() - new Date(user.startDate).getTime()) / (1000 * 60 * 60 * 24 * 7)) + 1)
      };

      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: `Athlete Query: ${userQuery}\n\nData Context: ${JSON.stringify(context)}`,
        config: {
          systemInstruction: `You are the HPP Elite Sports Scientist. Analyze athlete performance data and provide insights. 
          Be clinical, encouraging, and data-driven. Focus on hybrid performance: how strength affects cardio and vice-versa.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              message: { type: Type.STRING, description: "Direct answer to the athlete's question" },
              chartType: { type: Type.STRING, description: "Type of chart to display: LINE, BAR, or AREA (optional)" },
              chartData: {
                type: Type.ARRAY,
                description: "Data for the chart (optional)",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING },
                    value: { type: Type.NUMBER }
                  },
                  required: ["label", "value"]
                }
              },
              recommendation: { type: Type.STRING, description: "A specific coaching advice based on the data" },
              detectedTrend: { type: Type.STRING, description: "Positive, Negative, Warning, or Neutral" }
            },
            required: ["message", "recommendation", "detectedTrend"]
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      setMessages(prev => [...prev, { role: 'ai', content: result }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'ai', content: { message: "Connectivity issue with the Cloud Relay. Please try again.", detectedTrend: "Warning" } }]);
    } finally {
      setLoading(false);
    }
  };

  const renderChart = (data: any, type: string) => {
    if (!data || !type) return null;
    return (
      <div className="h-48 w-full mt-4 bg-black/20 rounded-2xl p-2 border border-white/5">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'BAR' ? (
            <BarChart data={data}>
              <XAxis dataKey="label" stroke="#ffffff30" fontSize={8} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '12px', fontSize: '10px' }} />
              <Bar dataKey="value" fill="#FF9500" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : type === 'LINE' ? (
            <LineChart data={data}>
              <XAxis dataKey="label" stroke="#ffffff30" fontSize={8} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '12px', fontSize: '10px' }} />
              <Line type="monotone" dataKey="value" stroke="#007AFF" strokeWidth={3} dot={false} />
            </LineChart>
          ) : (
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5856D6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#5856D6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="label" stroke="#ffffff30" fontSize={8} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '12px', fontSize: '10px' }} />
              <Area type="monotone" dataKey="value" stroke="#5856D6" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-280px)] space-y-4">
      {/* Dynamic Background Glow */}
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none"></div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-6 px-1 hide-scrollbar">
        {messages.length === 0 && (
          <div className="py-12 text-center space-y-8">
            <div className="w-20 h-20 bg-indigo-500/10 rounded-[30px] flex items-center justify-center mx-auto relative group">
              <Brain size={40} className="text-indigo-400 animate-pulse" />
              <div className="absolute inset-0 bg-indigo-500/20 blur-2xl group-hover:opacity-100 transition-opacity opacity-50"></div>
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight mb-2">HPP Intelligence Hub</h2>
              <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em]">Query Your Performance Engine</p>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {[
                "Average heart rate for Thursday sessions last month?",
                "Analyze my squat volume trend over Phase 1.",
                "Am I overtraining? Check my RPE patterns.",
                "Compare my running pace to my deadlift max."
              ].map((suggestion, i) => (
                <button 
                  key={i}
                  onClick={() => setQuery(suggestion)}
                  className="glass p-4 rounded-2xl text-left text-[11px] font-medium text-white/60 hover:text-white hover:bg-white/[0.08] transition-all active:scale-[0.98]"
                >
                  "{suggestion}"
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            {msg.role === 'user' ? (
              <div className="max-w-[85%] bg-orange-500 px-5 py-3 rounded-t-[24px] rounded-bl-[24px] shadow-lg">
                <p className="text-sm font-medium text-white leading-relaxed">{msg.content}</p>
              </div>
            ) : (
              <div className="max-w-[90%] space-y-3">
                <div className="glass p-5 rounded-t-[28px] rounded-br-[28px] border-indigo-500/20 apple-shadow">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={14} className="text-indigo-400" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Head Coach Insight</span>
                  </div>
                  <p className="text-sm font-medium text-white/80 leading-relaxed mb-4">{msg.content.message}</p>
                  
                  {msg.content.chartData && renderChart(msg.content.chartData, msg.content.chartType)}

                  {msg.content.recommendation && (
                    <div className="mt-4 p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 flex gap-3">
                      <TrendingUp size={16} className="text-indigo-400 shrink-0" />
                      <p className="text-[11px] text-indigo-200/60 leading-tight italic">{msg.content.recommendation}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="glass px-6 py-4 rounded-[28px] flex items-center gap-3">
              <Loader2 size={16} className="text-indigo-400 animate-spin" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Analyzing Biometrics...</span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="relative mt-auto">
        <input 
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask your coach..."
          className="w-full bg-white/[0.06] backdrop-blur-xl border border-white/10 rounded-[30px] px-6 py-5 text-sm font-medium focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-white/20"
        />
        <button 
          type="submit"
          disabled={!query.trim() || loading}
          className={`absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            query.trim() ? 'bg-indigo-500 text-white shadow-lg' : 'bg-white/5 text-white/10'
          }`}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default IntelligenceHub;