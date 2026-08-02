/**
 * Prava MCP Bridge
 * This calls the hosted MCP server tools directly using your Secret Key.
 */
export async function callPravaTool(toolName: string, args: any) {
  const apiKey = process.env.PRAVA_API_KEY; // Your sk_... key
  
  const response = await fetch("https://mcp.pay.prava.space/mcp", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "tools/call",
      params: {
        name: toolName,
        arguments: args
      },
      id: Date.now()
    }),
  });

  const data = await response.json();
  
  if (data.error) {
    console.error(`MCP Tool Error [${toolName}]:`, data.error);
    return { content: [] };
  }

  // MCP returns content in a specific array format
  return data.result || { content: [] };
}