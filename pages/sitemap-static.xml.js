// pages/sitemap-static.xml.js
export async function getServerSideProps({ res }) {
    const baseUrl = 'https://ajur.app';
    
    // List ALL your important static pages from sitemap-0.xml
    const staticPages = [
      // Homepage - highest priority
      { path: '', priority: '1.0', changefreq: 'daily' },
      
      // Counseling pages
    //   { path: 'Counseling', priority: '0.8', changefreq: 'monthly' },
    //   { path: 'Counseling/home/sell', priority: '0.7', changefreq: 'monthly' },
    //   { path: 'Counseling/land/sell', priority: '0.7', changefreq: 'monthly' },
      
      // Main static pages
      { path: 'about', priority: '0.8', changefreq: 'monthly' },
      { path: 'privacy-policy', priority: '0.5', changefreq: 'yearly' },
      { path: 'support', priority: '0.7', changefreq: 'monthly' },
      { path: 'contact', priority: '0.8', changefreq: 'monthly' },
      { path: 'download', priority: '0.7', changefreq: 'monthly' },
      
      // Assistant pages
      { path: 'assistant', priority: '0.6', changefreq: 'weekly' },
    //   { path: 'assistant/G-ads/landing-page', priority: '0.5', changefreq: 'monthly' },
    //   { path: 'assistant/G-ads/new-ad-page', priority: '0.5', changefreq: 'monthly' },
      { path: 'assistant/G-ads/user-dashboard', priority: '0.5', changefreq: 'monthly' },
      { path: 'assistant/comissioncalc', priority: '0.5', changefreq: 'monthly' },
      { path: 'assistant/filebank', priority: '0.5', changefreq: 'monthly' },
      { path: 'assistant/notebook', priority: '0.6', changefreq: 'weekly' },
      
      // Notebook parts
    //   { path: 'assistant/notebook/parts/AboutModal', priority: '0.3', changefreq: 'yearly' },
    //   { path: 'assistant/notebook/parts/CategoryTabs', priority: '0.3', changefreq: 'yearly' },
    //   { path: 'assistant/notebook/parts/ContactCard', priority: '0.3', changefreq: 'yearly' },
    //   { path: 'assistant/notebook/parts/ContactFormModal', priority: '0.3', changefreq: 'yearly' },
    //   { path: 'assistant/notebook/parts/DynamicContactForm', priority: '0.3', changefreq: 'yearly' },
    //   { path: 'assistant/notebook/parts/EmptyState', priority: '0.3', changefreq: 'yearly' },
    //   { path: 'assistant/notebook/parts/FloatingActionButton', priority: '0.3', changefreq: 'yearly' },
    //   { path: 'assistant/notebook/parts/IntroSlider', priority: '0.3', changefreq: 'yearly' },
    //   { path: 'assistant/notebook/parts/SaveToPhoneModal', priority: '0.3', changefreq: 'yearly' },
    //   { path: 'assistant/notebook/parts/SearchModal', priority: '0.3', changefreq: 'yearly' },
    //   { path: 'assistant/notebook/parts/SingleContactModal', priority: '0.3', changefreq: 'yearly' },
    //   { path: 'assistant/notebook/services/apiService', priority: '0.3', changefreq: 'yearly' },
      
      // City pages
      { path: 'city-selection', priority: '0.7', changefreq: 'monthly' },
      
      // Department pages
      { path: 'department/join', priority: '0.5', changefreq: 'monthly' },
    //   { path: 'join-department/_id', priority: '0.4', changefreq: 'monthly' },
      
      // Feature pages
      { path: 'favorites', priority: '0.6', changefreq: 'weekly' },
      { path: 'file-request', priority: '0.5', changefreq: 'monthly' },
      { path: 'map', priority: '0.7', changefreq: 'weekly' },
      { path: 'marketing', priority: '0.6', changefreq: 'monthly' },
      { path: 'r-marketing', priority: '0.6', changefreq: 'monthly' },
      
      // Panel pages
      { path: 'panel', priority: '0.6', changefreq: 'weekly' },
      { path: 'panel/_index', priority: '0.5', changefreq: 'monthly' },
    //   { path: 'panel/_new', priority: '0.5', changefreq: 'monthly' },
      { path: 'panel/agent_agreement', priority: '0.4', changefreq: 'yearly' },
    //   { path: 'panel/auth/__verify', priority: '0.3', changefreq: 'yearly' },
    //   { path: 'panel/auth/_login', priority: '0.3', changefreq: 'yearly' },
      { path: 'panel/auth/_verify', priority: '0.3', changefreq: 'yearly' },
      { path: 'panel/auth/login', priority: '0.4', changefreq: 'monthly' },
      { path: 'panel/auth/verify', priority: '0.4', changefreq: 'monthly' },
      { path: 'panel/department-entro', priority: '0.4', changefreq: 'yearly' },
      { path: 'panel/new', priority: '0.5', changefreq: 'monthly' },
      { path: 'panel/new-base', priority: '0.4', changefreq: 'yearly' },
      { path: 'panel/new_department', priority: '0.4', changefreq: 'yearly' },
      { path: 'panel/profile', priority: '0.5', changefreq: 'weekly' },
      { path: 'panel/support', priority: '0.5', changefreq: 'monthly' },
      { path: 'panel/workers', priority: '0.5', changefreq: 'monthly' },
      
      // Real estate pages
      { path: 'realestates', priority: '0.8', changefreq: 'daily' },
    //   { path: 'realestates/_id', priority: '0.7', changefreq: 'daily' },
      
      // Search
      { path: 'search', priority: '0.8', changefreq: 'daily' },
      
      // Virtual tour
    //   { path: 'virtual-tour/_id', priority: '0.6', changefreq: 'weekly' },
      
      // Worker pages
      { path: 'worker', priority: '0.7', changefreq: 'weekly' },
    //   { path: 'worker/__id', priority: '0.6', changefreq: 'weekly' },
      
      // Note: I'm NOT including the sitemap files themselves:
      // - cities-categories-sitemap.xml
      // - cities-sitemap.xml  
      // - server-sitemap.xml
      // These should NOT be in your static sitemap!
    ];
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${staticPages.map(page => {
          const fullUrl = page.path ? `${baseUrl}/${page.path}` : baseUrl;
          return `
          <url>
            <loc>${fullUrl}</loc>
            <lastmod>${new Date().toISOString()}</lastmod>
            <changefreq>${page.changefreq}</changefreq>
            <priority>${page.priority}</priority>
          </url>`;
        }).join('')}
      </urlset>`;
  
    res.setHeader('Content-Type', 'text/xml');
    res.write(sitemap);
    res.end();
  
    return { props: {} };
  }
  
  export default function SitemapStatic() { 
    return null; 
  }