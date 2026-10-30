/**
 * cPanel "Setup Node.js App" (Phusion Passenger / LiteSpeed lsnode) Startup File
 *
 * Set "Application startup file" in cPanel to: app.cjs
 */
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.TSX_LOADED = '1';

async function bootstrap() {
  try {
    // Prefer tsx programmatic ESM API (Node 18.19+ / 20+ / 22+ compatible under Phusion Passenger)
    try {
      const { tsImport } = await import('tsx/esm/api');
      await tsImport('./server.ts', __filename);
      return;
    } catch {
      // Fallback for older tsx / Node loader hooks
      await import('tsx');
      await import('./server.ts');
    }
  } catch (err) {
    console.error('Failed to start GsmScope via cPanel startup file (app.cjs):', err);
    process.exit(1);
  }
}

bootstrap();

