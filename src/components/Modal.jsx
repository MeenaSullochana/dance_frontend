import { FiX } from 'react-icons/fi'

export default function Modal({ title, onClose, children, wide = false }) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className={`modal glass ${wide ? 'wide' : ''}`} onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            <span className="modal-close-ring" aria-hidden="true" />
            <FiX />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
