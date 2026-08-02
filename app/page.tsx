"use client";

import { useState } from "react";
import { Loader2, Zap, ShoppingBag, Globe, Target, CheckCircle2, ArrowRight } from "lucide-react";

export default function QuestCart() {
  const [goal, setGoal] = useState("");
  const [status, setStatus] = useState<"idle" | "planning" | "discovering" | "done">("idle");
  const [items, setItems] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);

  const startQuest = async () => {
    if (!goal) return;
    setItems([]);
    setCart([]);
    setStatus("planning");
    
    try {
      // 1. PLANNING MODALITY
      const planRes = await fetch("/api/plan", {
        method: "POST",
        body: JSON.stringify({ message: goal }),
      });
      const planData = await planRes.json();
      const planItems = planData.procurement_plan || [];
      
      setItems(planItems.map((i: any) => ({ ...i, results: null })));
      setStatus("discovering");

      // 2. COMMERCE DISCOVERY MODALITY (MCP BRIDGE)
      for (const item of planItems) {
        const discRes = await fetch("/api/discover", {
          method: "POST",
          body: JSON.stringify({ item }),
        });
        const discData = await discRes.json();

        setItems(prev => prev.map(p => 
          p.id === item.id ? { ...p, results: discData.results } : p
        ));
      }
      setStatus("done");
    } catch (e) {
      setStatus("idle");
    }
  };

  const addToCart = (category: string, product: any) => {
    setCart(prev => [...prev.filter(i => i.category !== category), { category, ...product }]);
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-6 font-sans">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* LEFT: Quest Engine */}
        <div className="lg:col-span-3 space-y-8">
          <header className="flex items-center gap-2">
            <Zap size={24} className="text-yellow-400 fill-yellow-400" />
            <h1 className="text-2xl font-black tracking-tighter italic uppercase underline decoration-yellow-400">QuestCart</h1>
          </header>

          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-2xl">
            <textarea 
              className="w-full bg-transparent text-xl outline-none resize-none placeholder:text-zinc-800 font-medium"
              placeholder="What should I procure for you today?"
              rows={2}
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              disabled={status !== "idle"}
            />
            <button 
              onClick={startQuest}
              disabled={status !== "idle" || !goal}
              className="mt-4 w-full bg-yellow-400 text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-white transition-all disabled:opacity-20"
            >
              {status === "idle" ? "START PROCUREMENT MISSION" : <Loader2 className="animate-spin" />}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item, idx) => (
              <div key={idx} className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-5 space-y-4 flex flex-col">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">{item.category}</h3>
                    <p className="text-sm font-bold text-zinc-300">{item.search_queries?.[0]}</p>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-600">₹{item.target_budget}</span>
                </div>

                <div className="flex-1 space-y-2">
                  {item.results === null ? (
                    <div className="flex items-center gap-3 py-6 justify-center text-zinc-700">
                      <Loader2 size={16} className="animate-spin" />
                      <span className="text-[10px] font-mono uppercase tracking-widest">MCP Discovery...</span>
                    </div>
                  ) : item.results?.length > 0 ? (
                    item.results.map((prod: any, pIdx: number) => {
                      const isSelected = cart.find(c => c.product_id === prod.product_id);
                      return (
                        <div 
                          key={pIdx} 
                          onClick={() => addToCart(item.category, prod)}
                          className={`cursor-pointer p-3 rounded-xl border transition-all flex justify-between items-center ${
                            isSelected ? 'border-yellow-400 bg-yellow-400/5' : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <ShoppingBag className={isSelected ? 'text-yellow-400' : 'text-zinc-600'} size={14} />
                            <div>
                              <p className="text-[11px] font-bold text-zinc-200 line-clamp-1">{prod.name}</p>
                              <span className="text-[9px] text-zinc-500 uppercase font-bold">{prod.merchant}</span>
                            </div>
                          </div>
                          <p className="text-[11px] font-mono font-black text-yellow-400 ml-2">₹{prod.price?.toLocaleString()}</p>
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-[10px] text-zinc-700 italic text-center py-4">No MCP results found.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Agent Decisions */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 bg-zinc-900 border-2 border-zinc-800 rounded-3xl p-6 space-y-6 shadow-2xl">
            <div className="flex items-center gap-2 text-zinc-400">
              <CheckCircle2 size={16} className="text-yellow-400" />
              <h2 className="text-xs font-black uppercase tracking-widest">Procured Cart</h2>
            </div>
            
            <div className="space-y-3 min-h-[150px]">
              {cart.map((item, i) => (
                <div key={i} className="flex flex-col border-b border-zinc-800 pb-2">
                   <div className="flex justify-between items-center">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase">{item.category}</span>
                    <span className="text-[11px] font-mono text-white">₹{item.price?.toLocaleString()}</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 line-clamp-1">{item.name}</span>
                </div>
              ))}
              {cart.length === 0 && <p className="text-[10px] text-zinc-700 italic">Select discovered items to build your procurement plan...</p>}
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <div className="flex justify-between items-end mb-6">
                <span className="text-[10px] text-zinc-500 font-black">TOTAL</span>
                <span className="text-2xl font-black text-yellow-400 font-mono italic">₹{cart.reduce((s, i) => s + (i.price || 0), 0).toLocaleString()}</span>
              </div>
              
              <button 
                disabled={cart.length === 0}
                className="w-full bg-white text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-yellow-400 transition-all disabled:opacity-10"
              >
                PROCEED TO CHECKOUT <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}