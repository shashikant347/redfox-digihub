import Breadcrumb from './Breadcrumb.jsx';

/** Title block at the top of every inner page. */
export default function PageHead({ crumb, title, lead }) {
  return (
    <section className="pg-head">
      <Breadcrumb current={crumb} />
      <h1 className="rvx">{title}</h1>
      {lead && <p className="lead rvx">{lead}</p>}
    </section>
  );
}
