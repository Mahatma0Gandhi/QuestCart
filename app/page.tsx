"use client";
import { useState } from "react";

export default function QuestCart() {
  const [step, setStep] = useState<"connect" | "polling" | "ready">("connect");
  const [approvalUrl, setApprovalUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const startSetup = async () => {
    setLoading(true);
    const res = await fetch("/api/prava/setup", { method: "POST" });
    const data = await res.json();
    setApprovalUrl(data.approvalUrl);
    setStep("polling");
    setLoading(false);
    window.open(data.approvalUrl, "_blank");
  };

  const checkLink = async () => {
    setLoading(true);
    const res = await fetch("/api/prava/poll", { method: "POST" });
    const data = await res.json();
    if (data.linked) setStep("ready");
    setLoading(false);
  };

  return (
    <div className="p-12 bg-zinc-950 min-h-screen text-white">
      <h1 className="text-3xl font-black mb-8">QUESTCART</h1>
      
      {step === "connect" && (
        <button 
          onClick={startSetup} 
          disabled={loading}
          className="bg-yellow-400 text-black px-8 py-4 font-bold rounded-xl"
        >
          {loading ? "INITIALIZING..." : "CONNECT PRAVA CLI"}
        </button>
      )}

      {step === "polling" && (
        <div className="space-y-4">
          <p className="text-zinc-400">Please approve the request in your browser.</p>
          <button 
            onClick={checkLink} 
            className="border border-white px-8 py-4 font-bold rounded-xl"
          >
            I'VE APPROVED THE AGENT
          </button>
        </div>
      )}

      {step === "ready" && (
        <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800">
          <h2 className="text-green-500 font-bold mb-4 uppercase">System Linked & Ready</h2>
          <textarea 
            className="w-full bg-transparent text-xl border-none outline-none"
            placeholder="Enter procurement mission..."
          />
        </div>
      )}
    </div>
  );
}