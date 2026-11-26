import PageHead from '../components/PageHead.jsx';
import useSeo from '../hooks/useSeo.js';

const articles = [
  { category: 'Branding', title: 'A memorable brand is more than a logo', summary: 'The small choices that help a business look consistent, feel distinct and earn trust at every touchpoint.', date: 'Ideas for growing brands' },
  { category: 'Websites', title: 'What makes a business website work hard?', summary: 'A practical look at clear messaging, useful structure and the details that help visitors take the next step.', date: 'Digital presence' },
  { category: 'Marketing', title: 'Build a content plan you can actually keep', summary: 'A simple way to turn your goals, customer questions and everyday expertise into steady content.', date: 'Marketing notes' },
  { category: 'Photography & Video ', title: 'Make your product photos feel like your brand', summary: 'How thoughtful styling and consistent visuals can make your products easier to recognise and remember.', date: 'Visual storytelling' },
  { category: 'Social media', title: 'Short-form video that tells a clear story', summary: 'Start with one useful idea, shape it into a simple story and make every second count.', date: 'Creative tips' },
  { category: 'Business growth', title: 'When is it time to refresh your brand?', summary: 'A few signs that your identity or website may no longer reflect the business you have become.', date: 'For business owners' },
];

export default function BlogPage({ content }) {
  useSeo(content, 'blog');
  return (
    <main>
      <PageHead crumb="Blog" title="Ideas for growing brands" lead="Practical thoughts on branding, websites, marketing and visual storytelling from the REDFOX team." />
      <section className="blog-grid" aria-label="Blog articles">
        {articles.map((article) => (
          <article className="blog-card" key={article.title}>
            <span className="tag">{article.category}</span>
            <h2>{article.title}</h2>
            <p>{article.summary}</p>
            <small>{article.date}</small>
          </article>
        ))}
      </section>
    </main>
  );
}
