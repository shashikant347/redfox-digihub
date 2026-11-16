/** Top progress bar (#pg) and the back-to-top button (#up). */
export default function ScrollUi({ progress, showUp }) {
  return (
    <>
      <div id="pg" style={{ width: `${progress}%` }} />
      <button
        id="up"
        type="button"
        className={showUp ? 'on' : undefined}
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        ↑
      </button>
    </>
  );
}
