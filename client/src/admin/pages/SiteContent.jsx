import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { Field, Input, ImageField, ListEditor, StringList, PairList, Notice } from '../ui.jsx';

/** Loads one content section, keeps a local copy, saves it. */
function useSection(section, empty) {
  const [v, setV] = useState(null);
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.getContent(section).then((r) => setV(r.value ?? empty)).catch((e) => setNotice({ type: 'error', text: e.message }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  async function save(e) {
    e?.preventDefault();
    setBusy(true);
    try {
      const r = await api.saveContent(section, v);
      setV(r.value);
      setNotice({ type: 'ok', text: 'Saved. The site shows the change within about 30 seconds.' });
    } catch (err) {
      setNotice({ type: 'error', text: err.message });
    } finally {
      setBusy(false);
    }
  }
  return { v, setV, notice, busy, save };
}

function Card({ title, hint, s, children }) {
  return (
    <form className="ad-card ad-form" onSubmit={s.save}>
      <h2>{title}</h2>
      {hint && <p className="ad-hint" style={{ margin: 0 }}>{hint}</p>}
      <Notice notice={s.notice} />
      {s.v && children}
      <div className="ad-bar"><button className="ad-btn" disabled={!s.v || s.busy}>{s.busy ? 'Saving…' : 'Save'}</button></div>
    </form>
  );
}

/* ---------- simple lists ---------- */
function Stats() {
  const s = useSection('stats', []);
  return (
    <Card title="Numbers" hint="The big numbers on the Home and About pages, e.g. 120+ Projects." s={s}>
      <ListEditor
        items={s.v}
        onChange={s.setV}
        blank={() => ({ value: '', label: '' })}
        addLabel="Add number"
        render={(x, set) => (
          <>
            <Input value={x.value} onChange={(t) => set({ ...x, value: t })} placeholder="Number, e.g. 120+" maxLength={20} />
            <Input value={x.label} onChange={(t) => set({ ...x, label: t })} placeholder="Label, e.g. Projects delivered" maxLength={80} />
          </>
        )}
      />
    </Card>
  );
}
const Why = () => {
  const s = useSection('why', []);
  return <Card title="Why us" hint="The numbered reasons on the Home page. Numbers 01, 02… are added automatically." s={s}><PairList items={s.v} onChange={s.setV} addLabel="Add reason" /></Card>;
};
const Process = () => {
  const s = useSection('process', []);
  return <Card title="Process steps" hint="Steps shown on the Process page and the About page." s={s}><PairList items={s.v} onChange={s.setV} addLabel="Add step" /></Card>;
};
const Checklist = () => {
  const s = useSection('checklist', []);
  return <Card title="Checklist" hint="The short checklist shown beside the quote form." s={s}><StringList items={s.v} onChange={s.setV} addLabel="Add item" /></Card>;
};

/* ---------- about ---------- */
function About() {
  const s = useSection('about', {});
  const a = s.v ? { title: '', lead: '', story: [], quote: '', team: [], ...s.v } : null;
  const set = (k) => (val) => s.setV({ ...a, [k]: val });
  return (
    <Card title="About page" s={s}>
      {a && (
        <>
          <Field label="Title"><Input value={a.title} onChange={set('title')} maxLength={150} /></Field>
          <Field label="Intro text"><Input area rows={3} value={a.lead} onChange={set('lead')} maxLength={600} /></Field>
          <Field label="Story paragraphs">
            <ListEditor
              items={a.story}
              onChange={set('story')}
              blank={() => ''}
              addLabel="Add paragraph"
              render={(v, setV) => <Input area rows={3} value={v} onChange={setV} maxLength={1500} />}
            />
          </Field>
          <Field label="Quote"><Input value={a.quote} onChange={set('quote')} maxLength={300} /></Field>
          <Field label="Team">
            <ListEditor
              items={a.team}
              onChange={set('team')}
              blank={() => ({ role: '', text: '', image: '' })}
              addLabel="Add team member"
              render={(m, setM) => (
                <>
                  <Input value={m.role} onChange={(t) => setM({ ...m, role: t })} placeholder="Role, e.g. Design" maxLength={60} />
                  <Input area rows={2} value={m.text} onChange={(t) => setM({ ...m, text: t })} placeholder="Short text" maxLength={400} />
                  <ImageField value={m.image} onChange={(t) => setM({ ...m, image: t })} />
                </>
              )}
            />
          </Field>
        </>
      )}
    </Card>
  );
}

/* ---------- info sections ---------- */
const EXTRA = [
  ['mission', 'Mission', 'pairs', 'About page'],
  ['values', 'Values', 'pairs', 'About page (dark block)'],
  ['industries', 'Industries we serve', 'strings', 'Home, About and Services pages'],
  ['included', 'What is included', 'pairs', 'Services and Process pages (dark block)'],
  ['approach', 'Our approach', 'pairs', 'Home and Work pages'],
  ['needFromYou', 'What we need from you', 'strings', 'FAQ and Process pages'],
  ['afterSend', 'After you send the form', 'pairs', 'Contact page'],
];
function Extra() {
  const s = useSection('extra', {});
  const setBlock = (key, patch) => s.setV({ ...s.v, [key]: { ...s.v[key], ...patch } });
  return (
    <Card title="Info sections" hint="Small blocks with a tag, a heading and a list. The page each one appears on is shown below its name." s={s}>
      {s.v && EXTRA.map(([key, name, kind, where]) => {
        const b = { tag: '', title: '', items: [], ...(s.v[key] || {}) };
        return (
          <fieldset className="ad-sub" key={key}>
            <legend>{name}</legend>
            <small className="ad-hint">Shown on: {where}</small>
            <Field label="Small tag"><Input value={b.tag} onChange={(t) => setBlock(key, { tag: t })} maxLength={60} /></Field>
            <Field label="Heading"><Input value={b.title} onChange={(t) => setBlock(key, { title: t })} maxLength={150} /></Field>
            {'lead' in b && <Field label="Text under heading"><Input area rows={2} value={b.lead} onChange={(t) => setBlock(key, { lead: t })} maxLength={400} /></Field>}
            <Field label="Items">
              {kind === 'pairs'
                ? <PairList items={b.items} onChange={(it) => setBlock(key, { items: it })} addLabel="Add item" />
                : <StringList items={b.items} onChange={(it) => setBlock(key, { items: it })} addLabel="Add item" />}
            </Field>
          </fieldset>
        );
      })}
    </Card>
  );
}

/* ---------- page images ---------- */
const IMAGES = [['aboutHero', 'About page: top picture'], ['aboutStory', 'About page: story picture'], ['process', 'Process page picture'], ['contact', 'Contact page picture']];
function Images() {
  const s = useSection('images', {});
  const setImg = (key, patch) => s.setV({ ...s.v, [key]: { src: '', alt: '', ...s.v[key], ...patch } });
  return (
    <Card title="Page pictures" hint="If you remove a picture, the current one stays (a page never ends up without a picture). Describe each picture in the alt text, for Google and screen readers." s={s}>
      {s.v && IMAGES.map(([key, label]) => (
        <fieldset className="ad-sub" key={key}>
          <legend>{label}</legend>
          <ImageField label="Picture" value={s.v[key]?.src || ''} onChange={(u) => setImg(key, { src: u })} />
          <Field label="Alt text (what the picture shows)"><Input value={s.v[key]?.alt || ''} onChange={(t) => setImg(key, { alt: t })} maxLength={200} /></Field>
        </fieldset>
      ))}
    </Card>
  );
}

const TABS = [
  ['stats', 'Numbers', Stats],
  ['why', 'Why us', Why],
  ['process', 'Process', Process],
  ['checklist', 'Checklist', Checklist],
  ['about', 'About', About],
  ['extra', 'Info sections', Extra],
  ['images', 'Pictures', Images],
];

export default function SiteContent() {
  const [tab, setTab] = useState('stats');
  const Current = TABS.find((t) => t[0] === tab)[2];
  return (
    <>
      <h1>Site content</h1>
      <div className="ad-tabs" role="tablist">
        {TABS.map(([k, label]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{label}</button>
        ))}
      </div>
      <Current key={tab} />
    </>
  );
}
