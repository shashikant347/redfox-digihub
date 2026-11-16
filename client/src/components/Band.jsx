import { Link } from 'react-router-dom';

export default function Band({ title = 'Ready to start your project?' }) {
  return (
    <div className="band">
      <h2>{title}</h2>
      <Link className="btn glow" to="/contact">Get quote</Link>
    </div>
  );
}
