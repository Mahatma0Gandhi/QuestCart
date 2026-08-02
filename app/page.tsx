"use client";
import { useState, useEffect } from "react";
import { LinkIcon, CheckCircle2, ExternalLink, Loader2 } from "lucide-react";

export default function QuestCart() {
  const [step, setStep] = useState<"connect" | "approving" | "ready">("connect");
  const [approvalUrl, setApprovalUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const initPrava = async () => {
    setLoading(true);
    const res = await fetch("/api/prava/setup", { method: "POST" });
    const data = await res.json();
    
    if (data.linked) {
      setStep("ready");
    } else if (data.approvalUrl) {
      setApprovalUrl(data.approvalUrl);
      setStep("approving");
    }
    setLoading(false);
  };

  const confirmLink = async () => {
    setLoading(true);
    const res = await fetch("/api/prava/poll", { method: "POST" });
    const data = await res.json();
    if (data.linked) setStep("ready");
    else alert("Approval not found yet. Please approve in the other tab first.");
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-black text-white p-12 font-sans">
      <div className="max-w-xl mx-auto">
        <h1 className="text-4xl font-black italic mb-12">QUESTCART</h1>

        {step === "connect" && (
          <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 text-center">
            <LinkIcon className="mx-auto mb-4 text-yellow-400" size={48} />
            <h2 className="text-xl font-bold mb-2">Connect Commerce Agent</h2>
            <p className="text-zinc-500 text-sm mb-6">Link your Prava account to enable AI checkouts.</p>
            <button 
              onClick={initPrava}
              disabled={loading}
              className="w-full bg-yellow-400 text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : "INITIALIZE AGENT"}
            </button>
          </div>
        )}

        {step === "approving" && (
          <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800">
            <h2 className="text-xl font-bold mb-4">Approval Required</h2>
            <p className="text-zinc-400 text-sm mb-6">Open the URL below and click "Approve" in your Prava Dashboard.</p>
            
            <a 
              href={approvalUrl} 
              target="_blank" 
              className="block bg-zinc-950 p-4 rounded-xl border border-zinc-700 text-blue-400 text-xs break-all mb-6 hover:bg-zinc-800"
            >
              {approvalUrl}
              <ExternalLink size={12} className="inline ml-2" />
            </a>

            <button 
              onClick={confirmLink}
              disabled={loading}
              className="w-full bg-white text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : "I'VE APPROVED THE LINK"}
            </button>
          </div>
        )}

        {step === "ready" && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-green-500 font-bold bg-green-500/10 w-fit px-4 py-2 rounded-full border border-green-500/20">
              <CheckCircle2 size={16} /> AGENT ACTIVE
            </div>
            <textarea 
              className="w-full bg-zinc-900 p-6 rounded-3xl border border-zinc-800 text-xl h-40 focus:border-yellow-400 transition-colors outline-none"
              placeholder="What are we buying today?"
            />
          </div>
        )}
      </div>
    </main>
  );
}