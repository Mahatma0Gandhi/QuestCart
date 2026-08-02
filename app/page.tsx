"use client";

import { useState } from "react";
import { 
  Loader2, 
  Search, 
  ShoppingBag, 
  Zap, 
  Target, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Globe
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
      // 1. CALL THE PLANNER (OpenAI Modality)
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

      // 2. CALL THE DISCOVERY ENGINE (Prava Modality)
      const discRes = await fetch("/api/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          plan: planData.procurement_plan, 
          mission: planData.mission 
        }),
      });
      
      const discoveryData = await discRes.json();
      setItems(discoveryData);
      setStatus("done");

    } catch (err) {
      console.error(err);
      setError("The agent encountered a network error. Check your API keys.");
      setStatus("idle");
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-12 font-sans selection:bg-yellow-400 selection:text-black">
      <div className="max-w-3xl mx-auto space-y-10">
        
        {/* HEADER */}
        <header className="flex justify-between items-center border-b border-zinc-800 pb-6">
          <div className="flex items-center gap-2">
            <div className="bg-yellow-400 p-1 rounded">
              <Zap size={20} className="text-black fill-black" />
            </div>
            <h1 className="text-xl font-black tracking-tighter italic">QUESTCART <span className="text-zinc-500 font-normal not-italic ml-1">v1.0</span></h1>
          </div>
          <div className="flex items-center gap-4">
            <div className={`h-2 w-2 rounded-full animate-pulse ${status === 'idle' ? 'bg-zinc-700' : 'bg-yellow-400'}`} />
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              Modality: {status}
            </span>
          </div>
        </header>

        {/* INPUT BOX */}
        <section className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <div className="relative bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-2xl">
            <textarea 
              className="w-full bg-transparent text-xl md:text-2xl outline-none resize-none placeholder:text-zinc-800 font-medium"
              placeholder="What is your procurement goal?"
              rows={2}
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              disabled={status !== "idle"}
            />
            
            <div className="mt-4 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-xs text-zinc-500 flex items-center gap-2">
                <Target size={14} /> 
                Goal-oriented procurement. Agent will plan and discover.
              </p>
              <button 
                onClick={startQuest}
                disabled={status !== "idle" || !goal}
                className="w-full md:w-auto bg-yellow-400 text-black font-bold px-8 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-white transition-all disabled:opacity-20 disabled:grayscale cursor-pointer"
              >
                {status === "idle" ? <><Search size={18}/> EXECUTE QUEST</> : <Loader2 className="animate-spin" />}
              </button>
            </div>
          </div>
        </section>

        {/* ERROR HANDLING */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3 text-red-400"
            >
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* RESULTS SECTION */}
        <div className="space-y-8">
          {mission && (
            <div className="flex items-center gap-3 text-zinc-400">
              <div className="h-px flex-1 bg-zinc-800" />
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Mission: {mission}</span>
              <div className="h-px flex-1 bg-zinc-800" />
            </div>
          )}

          <div className="grid gap-6">
            {items.map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl overflow-hidden"
              >
                {/* Category Header */}
                <div className="p-5 border-b border-zinc-800/50 flex justify-between items-center bg-zinc-900/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-yellow-400 font-mono text-xs">
                      0{idx + 1}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-tighter">{item.category}</h3>
                      <p className="text-sm font-semibold">{item.search_queries?.[0] || 'Specification'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-500">BUDGET</p>
                    <p className="text-sm font-mono font-bold text-white">₹{item.target_budget.toLocaleString()}</p>
                  </div>
                </div>

                {/* Product List */}
                <div className="p-4 space-y-3">
                  {item.products && item.products.length > 0 ? (
                    item.products.map((prod: any, pIdx: number) => (
                      <div key={pIdx} className="group bg-zinc-900/80 border border-zinc-800 p-4 rounded-xl flex justify-between items-center hover:border-yellow-400/30 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="bg-zinc-800 p-2 rounded-lg group-hover:bg-yellow-400/10 transition-colors">
                            <ShoppingBag size={18} className="text-zinc-400 group-hover:text-yellow-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-zinc-200 line-clamp-1">{prod.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Globe size={10} className="text-zinc-600" />
                              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{prod.merchant}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                          <p className="text-sm font-mono font-black text-white">₹{prod.price.toLocaleString()}</p>
                          <button className="text-[10px] font-bold text-yellow-400 flex items-center gap-1 hover:text-white transition-colors mt-1">
                            SELECT <ArrowRight size={10} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-4 text-center">
                      <p className="text-xs text-zinc-600 font-mono italic">
                        {status === "discovering" ? "Scraping marketplace..." : "No products found for this spec."}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {status === "done" && items.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="flex justify-center pt-8"
            >
              <div className="flex items-center gap-2 text-yellow-400 bg-yellow-400/10 px-6 py-3 rounded-full border border-yellow-400/20">
                <CheckCircle2 size={18} />
                <span className="text-sm font-bold tracking-tight">PROCUREMENT PLAN READY FOR OPTIMIZATION</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      
      {/* FOOTER */}
      <footer className="mt-20 text-center text-zinc-700">
        <p className="text-[10px] font-mono tracking-[0.3em] uppercase">Built with Prava SDK • OpenAI o1 • Next.js</p>
      </footer>
    </main>
  );
}