export default function MarkRounds({ label, value, max, onChange }) {
  const selected = Math.max(1, Number(value) || 1)
  const steps = Array.from({ length: Number(max) }, (_, step) => step + 1)

  return (
    <div className="mark-ratio">
      <div className="mark-ratio-head">
        <span>{label}</span>
        <strong className="ratio-box">{selected} / {max}</strong>
      </div>
      <div className="mark-rounds" role="group" aria-label={label}>
        {steps.map((step) => (
          <button
            key={step}
            type="button"
            className={step === selected ? 'on' : ''}
            aria-pressed={step === selected}
            onClick={() => onChange(step)}
          >
            {step}
          </button>
        ))}
      </div>
    </div>
  )
}
