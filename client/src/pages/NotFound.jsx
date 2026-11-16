import { Link } from 'react-router-dom';


export default function NotFound() {
  return (
    <main>
      <section className="pg-head">
        <h1>Page not found</h1>
        <p className="lead">This page does not exist. Go back to the home page or pick a page from the menu.</p>
        <Link className="btn" to="/">Back to home</Link>
      </section>
    </main>
  );
}
