"use client";

import { useState } from "react";
import { 
  Loader2, Search, ShoppingBag, Zap, Target, ArrowRight, CheckCircle2, AlertCircle, Globe
} from "lucide-react";

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
      const planRes = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: goal }),
      });
      const planData = await planRes.json();

      if (planData.clarification_needed) {
        setError(planData.clarification_question);
        setStatus("idle");
        return;
      }

      setMission(planData.mission);
      setStatus("discovering");

      const discRes = await fetch("/api/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planData.procurement_plan, mission: planData.mission }),
      });
      const discoveryData = await discRes.json();
      setItems(discoveryData);
      setStatus("done");
    } catch (err) {
      setError("Execution failed. Check your API keys.");
      setStatus("idle");
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-12 font-sans">
      <div className="max-w-3xl mx-auto space-y-10">
        
        {/* HEADER */}
        <header className="flex justify-between items-center border-b border-zinc-800 pb-6">
          <div className="flex items-center gap-2">
            <Zap size={20} className="text-yellow-400 fill-yellow-400" />
            <h1 className="text-xl font-black tracking-tighter italic uppercase">QuestCart</h1>
          </div>
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            {status}
          </span>
        </header>

        {/* INPUT BOX */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <textarea 
            className="w-full bg-transparent text-xl outline-none resize-none placeholder:text-zinc-800"
            placeholder="What should I find for you?"
            rows={2}
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            disabled={status !== "idle"}
          />
          <button 
            onClick={startQuest}
            disabled={status !== "idle" || !goal}
            className="mt-4 w-full bg-yellow-400 text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-20 transition-all"
          >
            {status === "idle" ? "EXECUTE QUEST" : <Loader2 className="animate-spin" />}
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* RESULTS */}
        <div className="space-y-6">
          {items.map((item, idx) => (
            <div key={idx} className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden transition-all duration-500">
              <div className="p-4 bg-zinc-900/50 border-b border-zinc-800 flex justify-between">
                <div>
                  <h3 className="text-[10px] font-bold text-zinc-500 uppercase">{item.category}</h3>
                  <p className="text-sm font-semibold">{item.search_queries?.[0]}</p>
                </div>
                <p className="text-sm font-mono text-white">₹{item.target_budget}</p>
              </div>

              <div className="p-4 space-y-2">
                {item.products?.map((prod: any, pIdx: number) => (
                  <div key={pIdx} className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-medium text-zinc-200 line-clamp-1">{prod.name}</p>
                      <span className="text-[9px] text-zinc-500 uppercase tracking-tighter">{prod.merchant}</span>
                    </div>
                    <p className="text-xs font-mono text-yellow-400 whitespace-nowrap">₹{prod.price}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}