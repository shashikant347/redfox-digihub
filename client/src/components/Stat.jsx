import useCountUp from '../hooks/useCountUp.js';

export default function Stat({ value, label }) {
  const [ref, text] = useCountUp(value);
  return (
    <div ref={ref}>
      <b>{text}</b>
      <span>{label}</span>
    </div>
  );
}
