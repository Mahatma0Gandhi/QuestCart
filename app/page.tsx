"use client";

import { useState, useEffect } from "react";
import { Loader2, Zap, ShoppingBag, Globe, Link, CheckCircle2, ShoppingCart } from "lucide-react";

export default function QuestCart() {
  const [goal, setGoal] = useState("");
  const [status, setStatus] = useState<"idle" | "planning" | "discovering" | "done">("idle");
  const [items, setItems] = useState<any[]>([]);
  const [mission, setMission] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [hasToken, setHasToken] = useState(false);

  // Check if we are connected to Prava
  useEffect(() => {
    const token = document.cookie.includes("prava_token");
    setHasToken(token);
  }, []);

  const startQuest = async () => {
    if (!hasToken) {
      window.location.href = "/api/auth/prava";
      return;
    }
    
    setError(null);
    setItems([]);
    setStatus("planning");
    
    try {
      // 1. PLANNING
      const planRes = await fetch("/api/plan", {
        method: "POST",
        body: JSON.stringify({ message: goal }),
      });
      const planData = await planRes.json();
      const planItems = planData.procurement_plan || [];
      
      setMission(planData.mission || "Procurement Quest");
      setItems(planItems.map((i: any) => ({ ...i, results: null })));
      setStatus("discovering");

      // 2. INCREMENTAL MCP DISCOVERY
      for (const item of planItems) {
        const discRes = await fetch("/api/discover", {
          method: "POST",
          body: JSON.stringify({ item }),
        });
        
        if (discRes.status === 401) {
            setError("Session expired. Please reconnect your wallet.");
            setHasToken(false);
            setStatus("idle");
            return;
        }

        const discData = await discRes.json();
        setItems(prev => prev.map(p => 
          p.id === item.id ? { ...p, results: discData.results || [] } : p
        ));
      }
      setStatus("done");
    } catch (err) {
      setError("Execution failed. Ensure your API keys are set.");
      setStatus("idle");
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-12 font-sans">
      <div className="max-w-3xl mx-auto space-y-10">
        
        <header className="flex justify-between items-center border-b border-zinc-800 pb-6">
          <div className="flex items-center gap-2">
            <Zap size={20} className="text-yellow-400 fill-yellow-400" />
            <h1 className="text-xl font-black tracking-tighter italic uppercase">QuestCart</h1>
          </div>
          
          <button 
            onClick={() => window.location.href = "/api/auth/prava"}
            className={`text-[10px] font-bold px-3 py-1 rounded-full border flex items-center gap-2 transition-all ${
              hasToken ? "border-green-500/50 text-green-500" : "border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
            }`}
          >
            {hasToken ? <CheckCircle2 size={12}/> : <Link size={12}/>}
            {hasToken ? "WALLET LINKED" : "LINK PRAVA WALLET"}
          </button>
        </header>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl">
          <textarea 
            className="w-full bg-transparent text-xl outline-none resize-none placeholder:text-zinc-800 font-medium"
            placeholder="What should QuestCart procure for you?"
            rows={2}
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />
          <button 
            onClick={startQuest}
            disabled={status !== "idle" || !goal}
            className="mt-4 w-full bg-yellow-400 text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-20 transition-all"
          >
            {status === "idle" ? <><ShoppingCart size={18}/> EXECUTE MISSION</> : <Loader2 className="animate-spin" />}
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 text-xs font-mono">
            {error}
          </div>
        )}

        <div className="space-y-6 pb-20">
          {items.map((item, idx) => (
            <div key={item.id || idx} className="bg-zinc-900/30 border border-zinc-800 rounded-3xl overflow-hidden">
              <div className="p-4 bg-zinc-900/50 border-b border-zinc-800 flex justify-between items-center">
                <div>
                  <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{item.category}</h3>
                  <p className="text-sm font-bold text-zinc-200">{item.search_queries?.[0]}</p>
                </div>
                <p className="text-sm font-mono text-white">₹{item.target_budget?.toLocaleString()}</p>
              </div>

              <div className="p-4 space-y-2">
                {item.results === null ? (
                  <div className="flex items-center justify-center py-6 gap-3 text-zinc-700">
                    <Loader2 size={14} className="animate-spin" />
                    <span className="text-[10px] font-mono uppercase tracking-widest">MCP Discovery...</span>
                  </div>
                ) : item.results && item.results.length > 0 ? (
                  item.results.map((prod: any, pIdx: number) => (
                    <div key={pIdx} className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 flex justify-between items-center hover:border-yellow-400/30 transition-all">
                      <div className="flex items-center gap-3">
                        <ShoppingBag size={14} className="text-zinc-600" />
                        <div>
                          <p className="text-[11px] font-medium text-zinc-200 line-clamp-1">{prod.name}</p>
                          <div className="flex items-center gap-1">
                            <Globe size={8} className="text-zinc-700" />
                            <span className="text-[9px] text-zinc-500 font-bold uppercase">{prod.merchant}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs font-mono text-yellow-400 ml-4">₹{prod.price?.toLocaleString()}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-zinc-800 italic text-center py-4">No results found in marketplace.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}