// pages/sitemap.xml.js
export async function getServerSideProps({ res }) {
    const baseUrl = 'https://ajur.app';
    const currentDate = new Date().toISOString();
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
      <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <sitemap>
          <loc>${baseUrl}/sitemap-static.xml</loc>
          <lastmod>${currentDate}</lastmod>
        </sitemap>
        <sitemap>
          <loc>${baseUrl}/server-sitemap.xml</loc>
          <lastmod>${currentDate}</lastmod>
        </sitemap>
        <sitemap>
          <loc>${baseUrl}/cities-sitemap.xml</loc>
          <lastmod>${currentDate}</lastmod>
        </sitemap>
        <sitemap>
          <loc>${baseUrl}/cities-categories-sitemap.xml</loc>
          <lastmod>${currentDate}</lastmod>
        </sitemap>
      </sitemapindex>`;
  
    res.setHeader('Content-Type', 'text/xml');
    res.write(sitemap);
    res.end();
  
    return { props: {} };
  }
  
  export default function SitemapIndex() { 
    return null; 
  }