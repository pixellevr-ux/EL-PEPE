const { chromium } = require('playwright');
const fs = require('fs');

// ----- CONFIGURATION -----
const FAUCETPAY_EMAIL = process.env.FAUCETPAY_EMAIL || 'pixellevr@gmail.com';
const FAUCETPAY_PASSWORD = process.env.FAUCETPAY_PASSWORD || 'TonMotDePasseIci'; // 🔴 remplace par ton vrai mot de passe

// ----- POLYFILLS -----
const gmPolyfill = `
window.GM_getValue = (key, def) => localStorage.getItem(key) || def;
window.GM_setValue = (key, val) => localStorage.setItem(key, val);
window.GM_deleteValue = (key) => localStorage.removeItem(key);
window.GM_listValues = () => Object.keys(localStorage);
window.GM_addStyle = (css) => { const s=document.createElement('style');s.textContent=css;document.head.append(s); };
window.GM_xmlhttpRequest = (opts) => {
    const xhr = new XMLHttpRequest();
    xhr.open(opts.method || 'GET', opts.url, true);
    xhr.onload = () => opts.onload && opts.onload(xhr);
    xhr.onerror = () => opts.onerror && opts.onerror(xhr);
    xhr.send(opts.data || null);
};
window.GM_notification = () => {};
window.GM_openInTab = () => {};
window.GM_setClipboard = () => {};
window.GM_registerMenuCommand = () => {};
`;

console.log('🚀 Lancement des robots permanents...');

(async () => {
  try {
    const browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--single-process']
    });
    const context = await browser.newContext();
    await context.addInitScript(gmPolyfill);

    // --- Rotateur ---
    console.log('Injection Rotateur...');
    const pageR = await context.newPage();
    await pageR.goto('https://claimfreecoins.io/bitcoin-faucet/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await pageR.addScriptTag({ path: 'userscripts/rotator.user.js' });
    pageR.on('pageerror', err => console.error('🔴 Rotateur:', err.message));
    console.log('✅ Rotateur OK');

    // --- Satology ---
    console.log('Injection Satology...');
    const pageS = await context.newPage();
    await pageS.goto('https://claimfreecoins.io/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await pageS.evaluate((creds) => {
      localStorage.setItem('cf.credentials.email', creds.email);
      localStorage.setItem('cf.credentials.password', creds.password);
      localStorage.setItem('satology_cf.credentials.email', creds.email);
      localStorage.setItem('satology_cf.credentials.password', creds.password);
    }, { email: FAUCETPAY_EMAIL, password: FAUCETPAY_PASSWORD });
    await pageS.addScriptTag({ path: 'userscripts/satology.user.js' });
    pageS.on('pageerror', err => console.error('🔴 Satology:', err.message));
    console.log('✅ Satology OK');

    // --- OurCoinCash ---
    console.log('Injection OurCoinCash...');
    const pageO = await context.newPage();
    await pageO.goto('https://claim.ourcoincash.xyz/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await pageO.evaluate((email) => {
      const monkeyKey = 'monkeyconfig_Pengaturan Claimourcoincashxyz';
      const current = JSON.parse(localStorage.getItem(monkeyKey) || '{}');
      current.Email = email;
      localStorage.setItem(monkeyKey, JSON.stringify(current));
    }, FAUCETPAY_EMAIL);
    await pageO.addScriptTag({ url: 'https://cdn.jsdelivr.net/npm/sweetalert2@11' });
    await pageO.addScriptTag({ url: 'https://update.greasyfork.org/scripts/439099/1203718/MonkeyConfig%20Modern%20Reloaded.js' });
    await pageO.addScriptTag({ path: 'userscripts/ourcoincash.user.js' });
    pageO.on('pageerror', err => console.error('🔴 OurCoinCash:', err.message));
    console.log('✅ OurCoinCash OK');

    console.log('🏁 Les 3 robots tournent en continu...');
    // Le processus ne se termine JAMAIS, il reste en vie
    setInterval(() => {}, 60000);
  } catch (err) {
    console.error('❌ Erreur fatale :', err.message);
    // Redémarre après 10 secondes en cas d'erreur
    setTimeout(() => process.exit(1), 10000);
  }
})();

// Capture des exceptions non gérées pour éviter un crash silencieux
process.on('uncaughtException', (err) => {
  console.error('‼️ Exception non capturée :', err.message);
  setTimeout(() => process.exit(1), 5000);
});
process.on('unhandledRejection', (reason) => {
  console.error('‼️ Promesse rejetée :', reason);
});
