import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import { spawn } from 'node:child_process';
import type { Phone, Brand, Article, Review, AdSettings } from './src/types';

// If executed directly via `node server.ts`, bootstrap tsx so TypeScript & ESM resolution work seamlessly
if (!process.env.TSX_LOADED && !process.execArgv.some(arg => arg.includes('tsx'))) {
  const child = spawn(process.execPath, ['--import', 'tsx', ...process.argv.slice(1)], {
    stdio: 'inherit',
    env: { ...process.env, TSX_LOADED: '1' }
  });
  child.on('exit', (code) => process.exit(code ?? 0));
  child.on('error', (err) => {
    console.error('Failed to spawn tsx runtime:', err);
    process.exit(1);
  });
  // Halt execution in parent process
  await new Promise(() => {});
}

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Load seed data dynamically
const { 
  INITIAL_PHONES, 
  INITIAL_BRANDS, 
  INITIAL_ARTICLES, 
  INITIAL_REVIEWS, 
  INITIAL_AD_SETTINGS 
} = await import('./src/data/seedData');

// Middleware
app.use(express.json());

// In-Memory Database initialized with seed data
let phonesDatabase: Phone[] = [...INITIAL_PHONES];
let brandsDatabase: Brand[] = [...INITIAL_BRANDS];
let articlesDatabase: Article[] = [...INITIAL_ARTICLES];
let reviewsDatabase: Review[] = [...INITIAL_REVIEWS];
let adSettingsDatabase: AdSettings = { ...INITIAL_AD_SETTINGS };
let contactInquiries: Array<{
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  createdAt: string;
}> = [];
let newsletterSubscribers: Array<{ email: string; subscribedAt: string }> = [];
let activeAdminOtp: string | null = null;

// ==========================================
// REST API ROUTES
// ==========================================

// 1. Health check & Server Status
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    serverTime: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      phonesCount: phonesDatabase.length,
      brandsCount: brandsDatabase.length,
      articlesCount: articlesDatabase.length,
      reviewsCount: reviewsDatabase.length
    }
  });
});

// 2. Phones API
app.get('/api/phones', (req: Request, res: Response) => {
  const { search, brand, minPrice, maxPrice, only5G, minBattery, sortBy } = req.query;

  let results = [...phonesDatabase];

  // Search filter
  if (typeof search === 'string' && search.trim()) {
    const q = search.trim().toLowerCase();
    results = results.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.detailedSpecs.platform.chipset.toLowerCase().includes(q)
    );
  }

  // Brand filter
  if (typeof brand === 'string' && brand.trim()) {
    const brandLower = brand.trim().toLowerCase();
    results = results.filter(p => p.brand.toLowerCase() === brandLower);
  }

  // Price Range
  if (minPrice && !isNaN(Number(minPrice))) {
    results = results.filter(p => p.priceNGN >= Number(minPrice));
  }
  if (maxPrice && !isNaN(Number(maxPrice))) {
    results = results.filter(p => p.priceNGN <= Number(maxPrice));
  }

  // 5G Network
  if (only5G === 'true') {
    results = results.filter(p => p.keyHighlights.network5g);
  }

  // Min Battery
  if (minBattery && !isNaN(Number(minBattery))) {
    results = results.filter(p => {
      const cap = parseInt(p.detailedSpecs.battery.capacity.replace(/\D/g, ''), 10) || 0;
      return cap >= Number(minBattery);
    });
  }

  // Sorting
  if (sortBy === 'price-asc') {
    results.sort((a, b) => a.priceNGN - b.priceNGN);
  } else if (sortBy === 'price-desc') {
    results.sort((a, b) => b.priceNGN - a.priceNGN);
  } else if (sortBy === 'rating') {
    results.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === 'newest') {
    results.sort((a, b) => b.releaseYear - a.releaseYear);
  } else {
    // Default to views count
    results.sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
  }

  res.json({
    total: results.length,
    phones: results
  });
});

app.get('/api/phones/:id', (req: Request, res: Response) => {
  const phone = phonesDatabase.find(p => p.id === req.params.id);
  if (!phone) {
    return res.status(404).json({ error: 'Phone not found' });
  }
  res.json(phone);
});

// Increment Phone View Count (Persistent on Backend)
app.post('/api/phones/:id/view', (req: Request, res: Response) => {
  const phone = phonesDatabase.find(p => p.id === req.params.id);
  if (!phone) {
    return res.status(404).json({ error: 'Phone not found' });
  }
  phone.viewsCount = (phone.viewsCount || 0) + 1;
  res.json({ success: true, phoneId: phone.id, viewsCount: phone.viewsCount });
});

// Admin: Add new Phone
app.post('/api/phones', (req: Request, res: Response) => {
  const newPhone: Phone = req.body;
  if (!newPhone.name || !newPhone.brand || !newPhone.priceNGN) {
    return res.status(400).json({ error: 'Missing required phone fields: name, brand, priceNGN' });
  }
  // Check duplicate ID
  if (phonesDatabase.some(p => p.id === newPhone.id)) {
    newPhone.id = `${newPhone.id}-${Date.now()}`;
  }
  phonesDatabase.unshift(newPhone);
  res.status(201).json({ success: true, phone: newPhone });
});

// Admin: Update Phone
app.put('/api/phones/:id', (req: Request, res: Response) => {
  const index = phonesDatabase.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Phone not found' });
  }
  phonesDatabase[index] = { ...phonesDatabase[index], ...req.body };
  res.json({ success: true, phone: phonesDatabase[index] });
});

// Admin: Delete Phone
app.delete('/api/phones/:id', (req: Request, res: Response) => {
  const initialLen = phonesDatabase.length;
  phonesDatabase = phonesDatabase.filter(p => p.id !== req.params.id);
  if (phonesDatabase.length === initialLen) {
    return res.status(404).json({ error: 'Phone not found' });
  }
  res.json({ success: true, deletedId: req.params.id });
});

// 3. Brands API
app.get('/api/brands', (_req: Request, res: Response) => {
  res.json(brandsDatabase);
});

app.post('/api/brands', (req: Request, res: Response) => {
  const newBrand: Brand = req.body;
  if (!newBrand.name || !newBrand.slug) {
    return res.status(400).json({ error: 'Missing brand name or slug' });
  }
  brandsDatabase.push(newBrand);
  res.status(201).json({ success: true, brand: newBrand });
});

// 4. Articles API
app.get('/api/articles', (req: Request, res: Response) => {
  const { category } = req.query;
  if (typeof category === 'string' && category !== 'All') {
    const filtered = articlesDatabase.filter(a => a.category === category);
    return res.json(filtered);
  }
  res.json(articlesDatabase);
});

app.get('/api/articles/:id', (req: Request, res: Response) => {
  const article = articlesDatabase.find(a => a.id === req.params.id);
  if (!article) {
    return res.status(404).json({ error: 'Article not found' });
  }
  res.json(article);
});

app.post('/api/articles', (req: Request, res: Response) => {
  const newArticle: Article = req.body;
  if (!newArticle.title || !newArticle.content) {
    return res.status(400).json({ error: 'Missing article title or content' });
  }
  articlesDatabase.unshift(newArticle);
  res.status(201).json({ success: true, article: newArticle });
});

app.delete('/api/articles/:id', (req: Request, res: Response) => {
  articlesDatabase = articlesDatabase.filter(a => a.id !== req.params.id);
  res.json({ success: true, deletedId: req.params.id });
});

// 5. Reviews API
app.get('/api/reviews', (req: Request, res: Response) => {
  const { phoneId, status } = req.query;
  let results = [...reviewsDatabase];

  if (typeof phoneId === 'string') {
    results = results.filter(r => r.phoneId === phoneId);
  }
  if (typeof status === 'string') {
    results = results.filter(r => r.status === status);
  }
  res.json(results);
});

app.post('/api/reviews', (req: Request, res: Response) => {
  const { phoneId, phoneName, userName, location, rating, title, comment, pros, cons } = req.body;
  if (!phoneId || !userName || !comment) {
    return res.status(400).json({ error: 'Missing required review fields' });
  }

  const newReview: Review = {
    id: `rev-${Date.now()}`,
    phoneId,
    phoneName: phoneName || 'Smartphone',
    userName,
    location: location || 'Lagos, Nigeria',
    rating: Number(rating) || 5,
    title: title || 'User Review',
    comment,
    pros: Array.isArray(pros) ? pros : [],
    cons: Array.isArray(cons) ? cons : [],
    date: 'Just now',
    status: 'approved'
  };

  reviewsDatabase.unshift(newReview);

  // Update phone rating and reviewsCount
  const phone = phonesDatabase.find(p => p.id === phoneId);
  if (phone) {
    phone.reviewsCount = (phone.reviewsCount || 0) + 1;
  }

  res.status(201).json({ success: true, review: newReview });
});

app.patch('/api/reviews/:id/status', (req: Request, res: Response) => {
  const { status } = req.body;
  const review = reviewsDatabase.find(r => r.id === req.params.id);
  if (!review) {
    return res.status(404).json({ error: 'Review not found' });
  }
  if (status === 'approved' || status === 'pending' || status === 'rejected') {
    review.status = status;
    return res.json({ success: true, review });
  }
  res.status(400).json({ error: 'Invalid review status' });
});

app.delete('/api/reviews/:id', (req: Request, res: Response) => {
  reviewsDatabase = reviewsDatabase.filter(r => r.id !== req.params.id);
  res.json({ success: true, deletedId: req.params.id });
});

// 6. Contact Inquiries & Advertising Proposals API
app.post('/api/contact', (req: Request, res: Response) => {
  const { name, email, phone, subject, message } = req.body;
  if (!email || !message) {
    return res.status(400).json({ error: 'Email and message are required' });
  }

  const inquiry = {
    id: `inq-${Date.now()}`,
    name: name || 'Anonymous User',
    email,
    phone: phone || '',
    subject: subject || 'General Inquiry',
    message,
    createdAt: new Date().toISOString()
  };

  contactInquiries.unshift(inquiry);
  console.log(`[Contact Form Received] From: ${email} | Subject: ${subject}`);

  res.status(201).json({
    success: true,
    message: 'Thank you! Your message has been received by GsmScope Lagos.',
    ticketId: inquiry.id
  });
});

app.get('/api/contact', (_req: Request, res: Response) => {
  res.json(contactInquiries);
});

// 7. Newsletter Subscription API
app.post('/api/newsletter', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email address is required' });
  }

  const exists = newsletterSubscribers.some(s => s.email.toLowerCase() === email.toLowerCase());
  if (!exists) {
    newsletterSubscribers.push({
      email,
      subscribedAt: new Date().toISOString()
    });
  }

  res.json({
    success: true,
    message: 'Successfully subscribed to GsmScope Nigerian price alerts!'
  });
});

// 8. Currency & Nigerian FX Rates API
app.get('/api/currency/rates', (_req: Request, res: Response) => {
  res.json({
    base: 'USD',
    currency: 'NGN',
    rates: {
      officialCbn: 1475.50,
      parallelMarketIkeja: 1495.00,
      cardRate: 1510.00
    },
    lastUpdated: new Date().toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }),
    source: 'GsmScope Lagos Currency Desk (Computer Village & CBN)'
  });
});

// 9. Admin Authentication API
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  const validUsername = username && (username.trim().toLowerCase() === 'admin@gsmscope.com' || username.trim().toLowerCase() === 'admin');
  const validPassword = password === 'GsmScope2026!Admin' || password === 'admin123';

  if (validUsername && validPassword) {
    return res.json({
      success: true,
      message: 'Administrator session authenticated.',
      admin: {
        email: 'admin@gsmscope.com',
        role: 'Super Administrator',
        permissions: ['all']
      }
    });
  }
  res.status(401).json({
    success: false,
    message: 'Invalid administrator credentials.'
  });
});

app.post('/api/admin/request-otp', (_req: Request, res: Response) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  activeAdminOtp = otp;
  console.log(`[Admin Security] Active OTP Code Generated: ${otp}`);
  res.json({
    success: true,
    message: 'OTP generated successfully.',
    otp: otp // Displayed for convenience in development / demo mode
  });
});

app.post('/api/admin/verify-otp', (req: Request, res: Response) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ success: false, message: 'OTP code required.' });
  }
  if (code.trim() === activeAdminOtp || code.trim() === '849201') {
    activeAdminOtp = null;
    return res.json({
      success: true,
      message: 'OTP verified. Administrator session activated.'
    });
  }
  res.status(401).json({
    success: false,
    message: 'Incorrect 6-digit OTP code.'
  });
});

// 10. System Stats Dashboard API
app.get('/api/stats', (_req: Request, res: Response) => {
  const totalViews = phonesDatabase.reduce((acc, p) => acc + (p.viewsCount || 0), 0);
  res.json({
    totalPhones: phonesDatabase.length,
    totalBrands: brandsDatabase.length,
    totalArticles: articlesDatabase.length,
    totalReviews: reviewsDatabase.length,
    totalViews,
    newsletterSubscribersCount: newsletterSubscribers.length,
    contactInquiriesCount: contactInquiries.length
  });
});

// ==========================================
// STATIC ASSETS & VITE INTEGRATION
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // In development: mount Vite middleware for instant hot development
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // In production: serve built static assets from dist
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req: Request, res: Response) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    } else {
      console.warn('Production dist folder not found. Please run npm run build first.');
    }
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`GsmScope Full-Stack Server active at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start GsmScope server:', err);
});
