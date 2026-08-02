"use client";

import { useState } from "react";
import { Loader2, Zap, ShoppingBag, Globe, Target, AlertCircle, CheckCircle2 } from "lucide-react";

export default function QuestCart() {
  const [goal, setGoal] = useState("");
  const [status, setStatus] = useState<"idle" | "planning" | "discovering" | "done">("idle");
  const [mission, setMission] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const startQuest = async () => {
    if (!goal) return;
    
    setError(null);
    setItems([]);
    setStatus("planning");
    
    try {
      // 1. BEAT 1: GENERATE THE PLAN (OpenAI)
      const planRes = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: goal }),
      });
      
      const planData = await planRes.json();

      if (planData.clarification_needed) {
        setError(planData.clarification_question || "Please provide more details about your budget or specific needs.");
        setStatus("idle");
        return;
      }

      const planItems = planData.procurement_plan || [];
      setMission(planData.mission || "Procurement Quest");
      
      // Initialize the UI with "Loading" states for every item
      setItems(planItems.map((i: any) => ({ ...i, results: null })));
      setStatus("discovering");

      // 2. BEAT 2: DISCOVER PRODUCTS ONE-BY-ONE (Prava)
      // We loop so that each request is small and doesn't time out on Vercel
      for (const item of planItems) {
        try {
          const discRes = await fetch("/api/discover", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ item, mission: planData.mission }),
          });
          
          const discData = await discRes.json();

          // Update the specific item in the list using its ID
          setItems(prev => prev.map(p => 
            p.id === item.id ? { ...p, results: discData.results || [] } : p
          ));
        } catch (e) {
          console.error(`Discovery failed for ${item.category}`, e);
          // Set results to empty array so the loader stops
          setItems(prev => prev.map(p => p.id === item.id ? { ...p, results: [] } : p));
        }
      }

      setStatus("done");
    } catch (err) {
      console.error(err);
      setError("The agent encountered a connection error. Please verify your API keys in Vercel.");
      setStatus("idle");
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-12 font-sans selection:bg-yellow-400 selection:text-black">
      <div className="max-w-3xl mx-auto space-y-10">
        
        {/* HEADER */}
        <header className="flex justify-between items-center border-b border-zinc-800 pb-6">
          <div className="flex items-center gap-2">
            <Zap size={20} className="text-yellow-400 fill-yellow-400" />
            <h1 className="text-xl font-black tracking-tighter italic uppercase">QuestCart</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest bg-zinc-900 px-2 py-1 rounded border border-zinc-800">
              {status}
            </span>
          </div>
        </header>

        {/* INPUT BOX */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-2xl">
          <textarea 
            className="w-full bg-transparent text-xl md:text-2xl outline-none resize-none placeholder:text-zinc-800 font-medium"
            placeholder="Describe your procurement goal..."
            rows={2}
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            disabled={status !== "idle"}
          />
          <div className="mt-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[10px] text-zinc-600 uppercase font-bold tracking-widest flex items-center gap-2">
              <Target size={12} /> Autonomous Agent Discovery
            </p>
            <button 
              onClick={startQuest}
              disabled={status !== "idle" || !goal}
              className="w-full md:w-auto bg-yellow-400 text-black font-black px-10 py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-white transition-all disabled:opacity-20"
            >
              {status === "idle" ? "EXECUTE QUEST" : <Loader2 className="animate-spin" size={20} />}
            </button>
          </div>
        </div>

        {/* ERROR / CLARIFICATION BOX */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-2xl flex items-start gap-3 text-red-400 animate-in fade-in zoom-in duration-300">
            <AlertCircle size={18} className="mt-0.5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* MISSION HEADER */}
        {mission && (
            <div className="text-center">
                <span className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em]">Mission: {mission}</span>
            </div>
        )}

        {/* DYNAMIC ITEM LIST */}
        <div className="space-y-6">
          {items.map((item, idx) => (
            <div key={item.id || idx} className="bg-zinc-900/30 border border-zinc-800 rounded-3xl overflow-hidden transition-all duration-700">
              {/* Category Header */}
              <div className="p-5 border-b border-zinc-800/50 flex justify-between items-center bg-zinc-900/50">
                <div>
                  <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{item.category}</h3>
                  <p className="text-sm font-bold text-zinc-200">{item.search_queries?.[0] || 'Technical Specification'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mb-1">Target</p>
                  <p className="text-sm font-mono font-bold text-white">₹{item.target_budget?.toLocaleString()}</p>
                </div>
              </div>

              {/* Product Discoveries */}
              <div className="p-4 space-y-3">
                {item.results === null ? (
                  <div className="flex items-center justify-center py-8 gap-3 text-zinc-700">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-xs font-mono uppercase tracking-[0.2em]">Agent Browsing...</span>
                  </div>
                ) : item.results && item.results.length > 0 ? (
                  item.results.map((prod: any, pIdx: number) => (
                    <div key={pIdx} className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 flex justify-between items-center hover:border-yellow-400/30 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="bg-zinc-900 p-2 rounded-xl group-hover:bg-yellow-400/10 transition-colors">
                          <ShoppingBag size={18} className="text-zinc-600 group-hover:text-yellow-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-zinc-200 line-clamp-1">{prod.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Globe size={10} className="text-zinc-700" />
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{prod.merchant}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm font-mono font-black text-yellow-400">₹{prod.price?.toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center">
                    <p className="text-xs text-zinc-700 italic font-medium">No specialized merchant results found for this specification.</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* FINAL SUCCESS INDICATOR */}
        {status === "done" && (
            <div className="flex justify-center pt-10">
                <div className="flex items-center gap-2 bg-yellow-400 text-black px-6 py-2 rounded-full font-black text-xs tracking-widest uppercase animate-bounce">
                    <CheckCircle2 size={14} /> Quest Complete
                </div>
            </div>
        )}
      </div>
      
      <footer className="mt-20 text-center py-10 border-t border-zinc-900">
        <p className="text-[9px] font-mono tracking-[0.4em] uppercase text-zinc-800 italic">
          QuestCart Engine v1.0 • Prava Agentic Commerce • OpenAI Structured Reasoning
        </p>
      </footer>
    </main>
  );
}