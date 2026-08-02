"use client";

import { useState } from "react";
import { Loader2, Zap, ShoppingBag, Globe, CheckCircle, PackageSearch, CreditCard } from "lucide-react";

export default function QuestCart() {
  const [goal, setGoal] = useState("");
  const [status, setStatus] = useState<"idle" | "planning" | "discovering" | "deciding">("idle");
  const [items, setItems] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);

  const startQuest = async () => {
    setStatus("planning");
    setItems([]);
    setCart([]);
    
    try {
      // BEAT 1: PLAN
      const planRes = await fetch("/api/plan", {
        method: "POST",
        body: JSON.stringify({ message: goal }),
      });
      const planData = await planRes.json();
      const planItems = planData.procurement_plan || [];
      
      // Initialize items in UI
      setItems(planItems.map((i: any) => ({ ...i, results: null })));
      setStatus("discovering");

      // BEAT 2: DISCOVER (One by one to avoid timeout)
      for (const item of planItems) {
        const discRes = await fetch("/api/discover", {
          method: "POST",
          body: JSON.stringify({ query: item.search_query, intent: goal }),
        });
        const discData = await discRes.json();

        setItems(prev => prev.map(p => 
          p.search_query === item.search_query ? { ...p, results: discData.results } : p
        ));
      }
      setStatus("deciding");
    } catch (e) {
      console.error(e);
      setStatus("idle");
    }
  };

  const addToCart = (category: string, product: any) => {
    setCart(prev => [...prev.filter(i => i.category !== category), { category, ...product }]);
  };

  const totalSpend = cart.reduce((sum, item) => sum + (item.price || 0), 0);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-6 md:p-12 font-sans selection:bg-yellow-400 selection:text-black">
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* LEFT: THE QUEST ENGINE */}
        <div className="lg:col-span-2 space-y-8">
          <header className="flex items-center gap-2">
            <Zap size={24} className="text-yellow-400 fill-yellow-400" />
            <h1 className="text-2xl font-black tracking-tighter italic uppercase">QuestCart</h1>
          </header>

          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-2xl">
            <textarea 
              className="w-full bg-transparent text-xl outline-none resize-none placeholder:text-zinc-800 font-medium"
              placeholder="Describe your procurement goal..."
              rows={2}
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              disabled={status !== "idle"}
            />
            <button 
              onClick={startQuest}
              disabled={status !== "idle" || !goal}
              className="mt-4 w-full bg-yellow-400 text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-20"
            >
              {status === "idle" ? "INITIATE PROCUREMENT" : <Loader2 className="animate-spin" />}
            </button>
          </div>

          <div className="space-y-6">
            {items.map((item, idx) => (
              <div key={idx} className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{item.category}</h3>
                  <span className="text-xs font-mono text-zinc-600 italic">Target: ₹{item.target_budget}</span>
                </div>

                {item.results === null ? (
                  <div className="flex items-center gap-3 py-4 text-zinc-700 animate-pulse">
                    <PackageSearch size={20} />
                    <span className="text-xs font-mono uppercase">Agent Discovery in Progress...</span>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {item.results.map((prod: any, pIdx: number) => {
                      const isSelected = cart.find(c => c.product_id === prod.product_id);
                      return (
                        <div 
                          key={pIdx} 
                          onClick={() => addToCart(item.category, prod)}
                          className={`cursor-pointer p-4 rounded-2xl border transition-all flex justify-between items-center ${
                            isSelected ? 'border-yellow-400 bg-yellow-400/5' : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <ShoppingBag className={isSelected ? 'text-yellow-400' : 'text-zinc-600'} size={18} />
                            <div>
                              <p className="text-sm font-bold line-clamp-1">{prod.name}</p>
                              <div className="flex items-center gap-2">
                                <Globe size={10} className="text-zinc-700" />
                                <span className="text-[10px] text-zinc-500 font-bold uppercase">{prod.merchant}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-mono font-black text-yellow-400 whitespace-nowrap">₹{prod.price?.toLocaleString()}</p>
                            {isSelected && <CheckCircle size={12} className="text-yellow-400 ml-auto mt-1" />}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: THE AGENT CART (Decision Modality) */}
        <div className="lg:col-span-1">
          <div className="sticky top-12 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">Agentic Cart</h2>
            
            <div className="space-y-4 min-h-[200px]">
              {cart.length === 0 && (
                <p className="text-xs text-zinc-600 italic">Select items discovered by the agent to build your cart...</p>
              )}
              {cart.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-xs border-b border-zinc-800 pb-2">
                  <span className="text-zinc-500 font-bold uppercase">{item.category}</span>
                  <span className="font-mono">₹{item.price?.toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <div className="flex justify-between items-end mb-6">
                <span className="text-xs text-zinc-500 font-bold">TOTAL PROCURED</span>
                <span className="text-2xl font-black text-white font-mono">₹{totalSpend.toLocaleString()}</span>
              </div>
              
              <button 
                disabled={cart.length === 0}
                className="w-full bg-white text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-yellow-400 transition-all disabled:opacity-10"
              >
                <CreditCard size={18} />
                PROCEED TO CHECKOUT
              </button>
              <p className="text-[9px] text-zinc-600 mt-4 text-center leading-relaxed">
                Powered by Prava UCP. Secure credential firewall active. 
                Payment will be authorized via biometric passkey.
              </p>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}