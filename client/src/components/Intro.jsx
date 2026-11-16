export default function Intro({ name }) {
  return (
    <div className="intro" aria-hidden="true">
      <img src="/logo-full-light.png" alt={name} />
    </div>
  );
}
