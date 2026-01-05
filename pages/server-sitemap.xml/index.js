import { getServerSideSitemap } from "next-sitemap";

export const getServerSideProps = async (ctx) => {
  let posts = await fetch("https://api.ajur.app/api/active-posts");
  posts = await posts.json();
  
  const baseUrl = 'https://ajur.app';
  
  const newsSitemaps = posts.map((item) => ({
    loc: `${baseUrl}/worker/${item.id.toString()}`,
    lastmod: item.updated_at,
    changefreq: 'weekly',
    priority: 0.6,
  }));

  const fields = [...newsSitemaps];

  return getServerSideSitemap(ctx, fields);
};

export default function Site() {}