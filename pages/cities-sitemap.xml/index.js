import { getServerSideSitemap } from "next-sitemap";

export const getServerSideProps = async (ctx) => {
  let cities = await fetch("https://api.ajur.app/api/search-cities");
  cities = await cities.json();
  
  const baseUrl = 'https://ajur.app'; // Hardcoded domain
  
  const newsSitemaps = cities.items.map((item) => ({
    loc: `${baseUrl}/${item.slug.toString()}`, // Added slash between domain and slug
    lastmod: item.updated_at,
    changefreq: 'weekly',
    priority: 0.9,
  }));

  return getServerSideSitemap(ctx, newsSitemaps);
};

export default function Site() {}