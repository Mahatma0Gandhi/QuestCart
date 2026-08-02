const [debugLog, setDebugLog] = useState("");

const initPrava = async () => {
  setLoading(true);
  setDebugLog(""); // Clear old logs
  
  try {
    const res = await fetch("/api/prava/setup", { method: "POST" });
    const data = await res.json();
    
    // Save the raw log for transparency
    if (data.rawOutput) setDebugLog(data.rawOutput);

    if (data.linked) {
      setStep("ready");
    } else if (data.approvalUrl) {
      setApprovalUrl(data.approvalUrl);
      setStep("approving");
    } else {
      // If no URL and not linked, the log will show why
      console.error("No link found in output");
    }
  } catch (e: any) {
    setDebugLog("FETCH_FAILED: " + e.message);
  } finally {
    setLoading(false);
  }
};

// ... inside the return, add this at the bottom of the page ...
{debugLog && (
  <div className="mt-12 p-4 bg-zinc-900 border border-red-500/30 rounded-xl">
    <h3 className="text-[10px] font-bold text-red-500 mb-2 uppercase">Raw CLI transparency Log</h3>
    <pre className="text-[10px] font-mono text-zinc-500 overflow-x-auto">
      {debugLog}
    </pre>
  </div>
)}