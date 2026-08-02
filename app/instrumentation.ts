export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { execFile } = await import('child_process');
    execFile('prava', ['--version'], (error, stdout) => {
      if (error) {
        console.error('CRITICAL: Prava CLI not found in PATH.');
        console.error('Build command must include: npm install -g @prava-sdk/cli');
        process.exit(1);
      }
      console.log(`QuestCart Ready: Prava CLI ${stdout.trim()} detected.`);
    });
  }
}