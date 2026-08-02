import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execPromise = promisify(exec);

export async function POST(req: Request) {
  try {
    const { command } = await req.json();
    const userId = "user_default";
    const stateDir = path.resolve(process.env.PRAVA_STATE_ROOT || "./prava-state", userId);

    console.log(`[Shell] Executing: ${command}`);

    // Prefix with npx if it starts with prava
    const cmdToRun = command.startsWith("prava") ? `npx ${command}` : command;

    const { stdout, stderr } = await execPromise(cmdToRun, {
      env: { ...process.env, PRAVA_STATE_DIR: stateDir },
      shell: "/bin/bash", // Use bash on Render, or default shell
    });

    return NextResponse.json({ stdout, stderr });
  } catch (error: any) {
    return NextResponse.json({ 
      stdout: error.stdout, 
      stderr: error.stderr || error.message 
    }, { status: 500 });
  }
}