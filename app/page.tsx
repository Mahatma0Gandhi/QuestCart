"use client";

import { useState, useEffect } from "react";
import { Loader2, Zap, ShoppingBag, Globe, LinkIcon, CheckCircle2, ShoppingCart } from "lucide-react";

export default function QuestCart() {
  const [goal, setGoal] = useState("");
  const [status, setStatus] = useState<"idle" | "planning" | "discovering" | "done">("idle");
  const [items, setItems] = useState<any[]>([]);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    // Basic check for the cookie presence
    setHasToken(document.cookie.includes("prava_agent_token"));
  }, []);

  const startQuest = async () => {
    if (!hasToken) {
      window.location.href = "/api/auth/prava";
      return;
    }
    
    setItems([]);
    setStatus("planning");
    
    try {
      const planRes = await fetch("/api/plan", { method: "POST", body: JSON.stringify({ message: goal }) });
      const planData = await planRes.json();
      const planItems = planData.procurement_plan || [];
      
      setItems(planItems.map((i: any) => ({ ...i, results: null })));
      setStatus("discovering");

      for (const item of planItems) {
        const discRes = await fetch("/api/discover", {
          method: "POST",
          body: JSON.stringify({ item }),
        });
        
        if (discRes.status === 401) {
            window.location.href = "/api/auth/prava";
            return;
        }

        const discData = await discRes.json();
        setItems(prev => prev.map(p => p.id === item.id ? { ...p, results: discData.results || [] } : p));
      }
      setStatus("done");
    } catch (e) {
      setStatus("idle");
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-10">
        
        <header className="flex justify-between items-center border-b border-zinc-800 pb-6">
          <div className="flex items-center gap-2">
            <Zap size={20} className="text-yellow-400 fill-yellow-400" />
            <h1 className="text-xl font-black italic uppercase">QuestCart</h1>
          </div>
          
          <button 
            onClick={() => window.location.href = "/api/auth/prava"}
            className={`text-[10px] font-bold px-4 py-2 rounded-full border flex items-center gap-2 transition-all ${
              hasToken ? "border-green-500 text-green-500" : "border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
            }`}
          >
            {hasToken ? <CheckCircle2 size={12}/> : <LinkIcon size={12}/>}
            {hasToken ? "AGENT LINKED" : "LINK PRAVA AGENT"}
          </button>
        </header>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl">
          <textarea 
            className="w-full bg-transparent text-xl outline-none resize-none placeholder:text-zinc-800"
            placeholder="Describe your procurement mission..."
            rows={2}
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />
          <button 
            onClick={startQuest}
            disabled={status !== "idle" || !goal}
            className="mt-4 w-full bg-yellow-400 text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-20 transition-all"
          >
            {status === "idle" ? <><ShoppingCart size={18}/> EXECUTE QUEST</> : <Loader2 className="animate-spin" />}
          </button>
        </div>

        <div className="grid gap-6">
          {items.map((item, idx) => (
            <div key={item.id || idx} className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[10px] font-bold text-zinc-500 uppercase">{item.category}</h3>
                <p className="text-sm font-mono text-white italic">₹{item.target_budget}</p>
              </div>

              <div className="space-y-2">
                {item.results === null ? (
                  <div className="flex items-center gap-3 py-4 justify-center text-zinc-700">
                    <Loader2 size={14} className="animate-spin" />
                    <span className="text-[10px] font-mono">MCP Discovery...</span>
                  </div>
                ) : item.results.length > 0 ? (
                  item.results.map((prod: any, pIdx: number) => (
                    <div key={pIdx} className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 flex justify-between items-center">
                      <div>
                        <p className="text-[11px] font-bold text-zinc-200">{prod.name}</p>
                        <p className="text-[9px] text-zinc-500 font-bold uppercase">{prod.merchant}</p>
                      </div>
                      <p className="text-xs font-mono text-yellow-400 ml-4">₹{prod.price?.toLocaleString()}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-zinc-800 italic text-center py-2">No merchant data found.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}