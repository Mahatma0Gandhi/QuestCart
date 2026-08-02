"use client";
import { useState } from "react";

export default function DebugShell() {
  const [command, setCommand] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const runCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setOutput(prev => prev + `\n$ ${command}\n`);

    try {
      const res = await fetch("/api/debug/shell", {
        method: "POST",
        body: JSON.stringify({ command }),
      });
      const data = await res.json();
      
      if (data.stdout) setOutput(prev => prev + data.stdout);
      if (data.stderr) setOutput(prev => prev + `ERROR: ${data.stderr}`);
    } catch (e: any) {
      setOutput(prev => prev + `FETCH ERROR: ${e.message}`);
    } finally {
      setLoading(false);
      setCommand("");
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-500 p-8 font-mono">
      <h1 className="text-white mb-4 border-b border-zinc-800 pb-2">QUESTCART_DEBUG_SHELL v1.0</h1>
      
      <div className="bg-zinc-950 border border-zinc-800 p-4 h-[70vh] overflow-y-auto mb-4 whitespace-pre-wrap text-sm">
        {output || "Waiting for command..."}
      </div>

      <form onSubmit={runCommand} className="flex gap-4">
        <span className="text-white">$</span>
        <input 
          autoFocus
          className="bg-transparent outline-none flex-1 text-white"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="e.g. prava status"
          disabled={loading}
        />
      </form>

      <div className="mt-8 text-xs text-zinc-500 space-x-4">
        <span>SUGGESTED:</span>
        <button onClick={() => setCommand("prava --version")} className="underline">version</button>
        <button onClick={() => setCommand("prava status")} className="underline">status</button>
        <button onClick={() => setCommand("prava setup --name DebugAgent --platform custom")} className="underline">setup</button>
        <button onClick={() => setCommand("ls -R ./prava-state")} className="underline">check_state</button>
      </div>
    </div>
  );
}