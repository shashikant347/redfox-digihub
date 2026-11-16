import mongoose from 'mongoose';

const { Schema, model } = mongoose;
const opts = { timestamps: true };
const pair = new Schema({ title: String, text: String }, { _id: false });
const qa = new Schema({ q: String, a: String }, { _id: false });

export const Admin = model(
  'Admin',
  new Schema(
    {
      email: { type: String, required: true, unique: true, lowercase: true, trim: true },
      name: { type: String, default: 'Admin' },
      passwordHash: { type: String, required: true },
      tokenVersion: { type: Number, default: 0 }, // bump to log out every session of this admin
    },
    opts
  )
);

export const Service = model(
  'Service',
  new Schema(
    {
      slug: { type: String, required: true, unique: true }, // used in the URL: /services/<slug>
      title: { type: String, required: true },
      text: { type: String, default: '' },
      points: { type: [String], default: [] },
      image: { type: String, default: '' },
      order: { type: Number, default: 0 },
      seoTitle: { type: String, default: '' },
      seoDescription: { type: String, default: '' },
      detail: {
        headline: { type: String, default: '' },
        intro: { type: String, default: '' },
        benefits: { type: [pair], default: [] },
        deliverables: { type: [String], default: [] },
        steps: { type: [pair], default: [] },
        forWho: { type: [String], default: [] },
        faqs: { type: [qa], default: [] },
      },
    },
    opts
  )
);

export const WorkItem = model(
  'WorkItem',
  new Schema(
    {
      title: { type: String, required: true },
      category: { type: String, required: true }, // a key from workFilters (brand, web, mkt, photo)
      kind: { type: String, default: '' },
      image: { type: String, default: '' },
      order: { type: Number, default: 0 },
    },
    opts
  )
);

// Key/value store for everything else on the site: brand, faq, stats, about, ...
export const Setting = model(
  'Setting',
  new Schema({ key: { type: String, required: true, unique: true }, value: Schema.Types.Mixed }, opts)
);

export const Quote = model(
  'Quote',
  new Schema(
    {
      name: { type: String, required: true },
      contact: { type: String, required: true },
      service: { type: String, required: true },
      details: { type: String, default: '' },
      status: { type: String, enum: ['new', 'contacted', 'won', 'closed'], default: 'new', index: true },
      notes: { type: String, default: '' }, // internal, never shown to the visitor
    },
    opts
  )
);
