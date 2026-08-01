"use client";
import { useState } from "react";
import { ProcurementPlan } from "@/types/planner";

export default function PlannerTest() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<ProcurementPlan | null>(null);
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    setLoading(true);
    const res = await fetch("/api/plan", {
      method: "POST",
      body: JSON.stringify({ message: input }),
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto bg-black min-h-screen text-white font-mono">
      <h1 className="text-xl mb-4 border-b border-zinc-800 pb-2">MODALITY: PLANNER_VERIFICATION</h1>
      
      <textarea 
        className="w-full bg-zinc-900 p-4 border border-zinc-700 rounded mb-4"
        rows={4}
        placeholder="Enter mission (e.g. Build me a 1L gaming PC for FPS)"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <button 
        onClick={runTest}
        className="bg-white text-black px-6 py-2 rounded font-bold hover:bg-zinc-200"
        disabled={loading}
      >
        {loading ? "PLANNING..." : "EXECUTE_PLAN"}
      </button>

      {result && (
        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="p-4 bg-zinc-900 rounded border border-zinc-700">
            <h2 className="text-sm text-zinc-500 mb-2 font-bold">STATUS</h2>
            <div className={result.clarification_needed ? "text-yellow-500" : "text-green-500"}>
              {result.clarification_needed ? "⚠ CLARIFICATION_REQUIRED" : "✅ PLAN_COMPLETE"}
            </div>
            {result.clarification_question && (
              <p className="mt-2 text-white italic">"{result.clarification_question}"</p>
            )}
          </div>

          <pre className="p-4 bg-zinc-900 rounded border border-zinc-700 overflow-auto text-xs text-blue-400">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}