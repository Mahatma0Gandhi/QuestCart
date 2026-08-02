import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execFilePromise = promisify(execFile);

export class PravaAdapter {
  private stateDir: string;

  constructor(userId: string) {
    const root = process.env.PRAVA_STATE_ROOT || './prava-state';
    this.stateDir = path.resolve(root, userId);
    
    if (!fs.existsSync(this.stateDir)) {
      fs.mkdirSync(this.stateDir, { recursive: true });
    }
  }

  private async run(args: string[]): Promise<string> {
    try {
      const { stdout } = await execFilePromise('prava', args, {
        env: {
          ...process.env,
          PRAVA_STATE_DIR: this.stateDir,
        },
      });
      return stdout;
    } catch (error: any) {
      console.error(`CLI Error [${args[0]}]:`, error.stdout || error.message);
      throw new Error(error.stdout || error.message);
    }
  }

  // --- SETUP FLOW ---

  async setup() {
    const output = await this.run(['setup', '--name', 'QuestCart', '--platform', 'custom']);
    const urlMatch = output.match(/https:\/\/pay\.prava\.space\/link-agent\?lid=[^\s]+/);
    if (!urlMatch) throw new Error("Failed to extract approval URL from CLI output");
    return { approvalUrl: urlMatch[0] };
  }

  async poll() {
    await this.run(['setup', 'poll']);
    return { linked: true };
  }

  async status() {
    const output = await this.run(['status']);
    // Simple parser for status output
    return {
      linked: output.includes('active'),
      raw: output
    };
  }

  // --- COMMERCE FLOW ---

  async search(query: string) {
    const output = await this.run(['shop', 'search', '--query', query, '--json']);
    return JSON.parse(output);
  }

  async product(productId: string, merchant: string) {
    const output = await this.run(['shop', 'product', '--product-id', productId, '--merchant', merchant, '--json']);
    return JSON.parse(output);
  }

  async quote(variantId: string, merchant: string, addressId?: string) {
    const args = ['shop', 'quote', '--variant-id', variantId, '--merchant', merchant, '--yes', '--json'];
    if (addressId) args.push('--address-id', addressId);
    const output = await this.run(args);
    return JSON.parse(output);
  }

  // --- SESSIONS ---

  async createSession(details: {
    amount: string,
    currency: string,
    merchantName: string,
    merchantUrl: string,
    merchantCountry: string,
    product: any
  }) {
    const output = await this.run([
      'sessions', 'create',
      '--total-amount', details.amount,
      '--currency', details.currency,
      '--merchant-name', details.merchantName,
      '--merchant-url', details.merchantUrl,
      '--merchant-country', details.merchantCountry,
      '--product', JSON.stringify(details.product)
    ]);
    
    const sessionId = output.match(/Session ID:\s+(sess_[^\s]+)/)?.[1];
    const paymentUrl = output.match(/Payment URL:\s+(https:\/\/[^\s]+)/)?.[1];
    
    if (!sessionId || !paymentUrl) throw new Error("Failed to parse session output");
    return { sessionId, paymentUrl };
  }

  async pollSession(sessionId: string) {
    const output = await this.run(['sessions', 'poll', '--session-id', sessionId]);
    
    const token = output.match(/Token:\s+(\d+)/)?.[1];
    const cryptogram = output.match(/Cryptogram:\s+(\d+)/)?.[1];
    const expiry = output.match(/Expiry:\s+(\d{2}\/\d{4})/)?.[1];

    if (!token || !cryptogram || !expiry) throw new Error("Credentials not yet available");
    
    return { token, cryptogram, expiry };
  }

  // --- FINAL CHECKOUT ---

  async checkout(params: {
    checkoutSessionId: string,
    token: string,
    cryptogram: string,
    expiry: string
  }) {
    const [month, year] = params.expiry.split('/');
    const output = await this.run([
      'shop', 'checkout',
      '--checkout-session-id', params.checkoutSessionId,
      '--token', params.token,
      '--cryptogram', params.cryptogram,
      '--expiry-month', month,
      '--expiry-year', year,
      '--yes',
      '--json'
    ]);
    return JSON.parse(output);
  }
}