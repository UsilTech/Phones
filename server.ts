// Universal entrypoint for AI Studio (tsx server.ts / node server.ts) and cPanel (LiteSpeed lsnode.js / Phusion Passenger)
if (process.env.npm_lifecycle_event === 'dev' && process.env.CPANEL_MODE !== '1') {
  import('./src/server-main.ts');
} else {
  require('./app.cjs');
}
