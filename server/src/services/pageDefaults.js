// Editable page text and SEO, with the defaults the site always used.
// Empty values saved in the admin fall back to these defaults.
const f = (path, label, def, extra = {}) => ({ path, label, def, ...extra });

export const PAGE_SCHEMA = [
  {
    group: 'Home: top banner',
    fields: [
      f('home.chip', 'Small tag above the heading', 'creating next', { max: 40 }),
      f('home.title1', 'Heading, line 1', 'Design. Build.', { max: 60 }),
      f('home.titleAccent', 'Heading, line 2 (coloured word)', 'Grow.', { max: 40 }),
      f('home.text', 'Text under the heading', 'Branding, websites, marketing and photography from one team. Tell us what you need and get a quote.', { area: true, max: 300 }),
      f('home.btnPrimary', 'Main button text', 'Get quote', { max: 30 }),
      f('home.btnSecondary', 'Second button text', 'Our services', { max: 30 }),
    ],
  },
  {
    group: 'Home: section headings',
    fields: [
      f('why.tag', '"Why us" small tag', 'Why REDFOX', { max: 40 }),
      f('why.title', '"Why us" heading', 'Built to make your business easy to choose', { max: 120 }),
      f('why.lead', '"Why us" text', 'Everything you need to look good and get found, handled together.', { area: true, max: 300 }),
      f('work.tag', 'Work section small tag', 'Our work', { max: 40 }),
      f('work.title', 'Work section heading', 'What we make for you', { max: 120 }),
      f('work.lead', 'Work section text (also on Work page)', 'Browse by service. These are sample concepts that show our style.', { area: true, max: 300 }),
      f('cta.title', 'Bottom banner heading', 'Let’s build your brand', { max: 120 }),
    ],
  },
  {
    group: 'Banner at the bottom of inner pages',
    fields: [f('band.title', 'Banner heading', 'Ready to start your project?', { max: 120 })],
  },
  {
    group: 'Services page',
    fields: [
      f('services.title', 'Page title', 'Services', { max: 80 }),
      f('services.lead', 'Text under the title', 'Pick one service or combine several. We make it to the budget you set.', { area: true, max: 300 }),
    ],
  },
  { group: 'Work page', fields: [f('work.pageTitle', 'Page title', 'Our work', { max: 80 })] },
  {
    group: 'Process page',
    fields: [
      f('process.title', 'Page title', 'How we work', { max: 80 }),
      f('process.lead', 'Text under the title', 'Six steps from first message to results.', { area: true, max: 300 }),
    ],
  },
  {
    group: 'FAQ page',
    fields: [
      f('faq.title', 'Page title', 'Questions', { max: 80 }),
      f('faq.lead', 'Text under the title', 'Quick answers before you get in touch.', { area: true, max: 300 }),
      f('faq.moreTitle', 'Bottom heading', 'Still have a question?', { max: 100 }),
      f('faq.moreText', 'Bottom text', 'Send us a message and we will reply.', { max: 200 }),
    ],
  },
  {
    group: 'Contact page',
    fields: [
      f('contact.title', 'Page title', 'Contact us', { max: 80 }),
      f('contact.lead', 'Text under the title', 'Tell us what you need. We reply with a plan, timeline and quote.', { area: true, max: 300 }),
    ],
  },
  {
    group: 'About page headings',
    fields: [
      f('about.storyTag', 'Story small tag', 'Our story', { max: 40 }),
      f('about.storyTitle', 'Story heading', 'Why we work as one team', { max: 120 }),
      f('about.teamTag', 'Team small tag', 'The team', { max: 40 }),
      f('about.teamTitle', 'Team heading', 'Five skills, one studio', { max: 120 }),
      f('about.teamLead', 'Team text', 'Everyone you need for a brand sits in the same team, so work moves faster and looks consistent.', { area: true, max: 300 }),
    ],
  },
];

const nestSet = (obj, path, value) => {
  const keys = path.split('.');
  let o = obj;
  keys.slice(0, -1).forEach((k) => (o = o[k] ??= {}));
  o[keys.at(-1)] = value;
};

/** Stored flat values ({ 'home.chip': '...' }) + defaults => nested object the site uses. */
export function buildPages(stored = {}) {
  const out = {};
  for (const g of PAGE_SCHEMA) for (const fl of g.fields) nestSet(out, fl.path, stored?.[fl.path] || fl.def);
  return out;
}

export const SEO_PAGES = [
  { key: 'home', label: 'Home', title: 'REDFOX — Studio', description: 'Branding, websites, marketing and photography from one team. Tell us what you need and get a quote.' },
  { key: 'about', label: 'About', title: 'About us', description: 'REDFOX is an advertising and marketing studio. Design, development, photography and marketing in one team.' },
  { key: 'services', label: 'Services', title: 'Services', description: 'Brand design, web development, web design, digital marketing, photography and graphic design from one team.' },
  { key: 'work', label: 'Work', title: 'Our work', description: 'Browse sample concepts for branding, websites, marketing and photography.' },
  { key: 'process', label: 'Process', title: 'How we work', description: 'Six clear steps from your first message to results. See how a REDFOX project runs.' },
  { key: 'faq', label: 'FAQ', title: 'Questions', description: 'Quick answers about quotes, timelines, pricing and how we work.' },
  { key: 'contact', label: 'Contact', title: 'Contact us', description: 'Tell us what you need. We reply with a plan, timeline and quote.' },
];

export function buildSeo(stored = {}) {
  const pages = {};
  for (const p of SEO_PAGES) {
    pages[p.key] = {
      title: stored?.pages?.[p.key]?.title || p.title,
      description: stored?.pages?.[p.key]?.description || p.description,
    };
  }
  return { siteName: stored?.siteName || 'REDFOX', pages };
}
