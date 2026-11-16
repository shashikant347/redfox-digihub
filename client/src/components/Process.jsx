import { useRef } from 'react';
import useTimelineProgress from '../hooks/useTimelineProgress.js';

export default function Process({ steps, heading = true }) {
  const ref = useRef(null);
  useTimelineProgress(ref, true);

  return (
    <section id="process">
      {heading && (
        <>
          <h2>How we work</h2>
          <p className="lead">Six steps from first message to results.</p>
        </>
      )}
      <div className="tl" ref={ref}>
        {steps.map((s) => (
          <div key={s.title}>
            <h3>{s.title}</h3>
            <p>{s.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
