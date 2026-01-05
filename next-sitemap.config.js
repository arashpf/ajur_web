const siteUrl = 'https://ajur.app';

module.exports = {
  siteUrl,
  
  // Disable auto-generated sitemap.xml (we'll create it manually)
  generateIndexSitemap: false,
  
  // Exclude dynamic sitemaps from auto-scan
  exclude: [
    "/404",
    "/sitemap.xml",                 // Your manual sitemap index
    "/sitemap-static.xml",          // Your manual static sitemap
    "/server-sitemap.xml",          // Dynamic sitemap
    "/cities-sitemap.xml",          // Dynamic sitemap
    "/cities-categories-sitemap.xml", // Dynamic sitemap
  ],
  
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        disallow: ["/404"],
      },
      { userAgent: "*", allow: "/" },
    ],
    additionalSitemaps: [
      `${siteUrl}/sitemap.xml`,               // Add this - your main sitemap index
      `${siteUrl}/sitemap-static.xml`,        // Add this - your static pages sitemap
      `${siteUrl}/server-sitemap.xml`,
      `${siteUrl}/cities-sitemap.xml`,
      `${siteUrl}/cities-categories-sitemap.xml`,
    ],
  },
};