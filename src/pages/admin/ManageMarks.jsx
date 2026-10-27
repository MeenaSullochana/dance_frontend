import { useState } from 'react'
import { FiPlus, FiTrash2 } from 'react-icons/fi'
import { useApp } from '../../context/AppContext'
import Modal from '../../components/Modal'

export default function ManageMarks() {
  const { criteria, maxTotal, settings, createMarkCriterion, updateMarkCriterion, deleteMarkCriterion, setPublicMaxMarks, showToast } = useApp()
  const [editing, setEditing] = useState(null)
  const [publicMax, setPublicMax] = useState(settings.publicMaxMarks || 10)

  const save = async (event) => {
    event.preventDefault()
    const body = {
      name: editing.name.trim(),
      maxMarks: Number(editing.maxMarks),
      active: editing.active !== false,
    }
    const res = editing.id
      ? await updateMarkCriterion(editing.id, body)
      : await createMarkCriterion(body)
    if (!res.ok) return showToast(res.error, 'error')
    showToast(editing.id ? 'Category updated' : 'Category added')
    setEditing(null)
  }

  const remove = async (item) => {
    if (!window.confirm(`Remove "${item.label}"? Old marks for this category stay stored.`)) return
    const res = await deleteMarkCriterion(item.id)
    if (!res.ok) return showToast(res.error, 'error')
    showToast('Category removed')
  }

  const savePublicMax = async (event) => {
    event.preventDefault()
    const res = await setPublicMaxMarks(Number(publicMax))
    if (!res.ok) return showToast(res.error, 'error')
    showToast('Audience overall mark updated')
  }

  return (
    <div className="stack">
      <form className="panel glass inline-form" onSubmit={savePublicMax}>
        <div>
          <strong>Audience overall mark</strong>
          <p className="muted small">Audience members give one mark, not the judge categories. The public average is those marks added together and divided by how many audience members marked.</p>
        </div>
        <input
          type="number"
          min="1"
          max="100"
          value={publicMax}
          onChange={(event) => setPublicMax(event.target.value)}
          aria-label="Maximum overall mark"
          required
        />
        <button className="btn btn-primary">Save maximum</button>
      </form>

      <div className="toolbar">
        <p className="muted">
          Judges score these categories. Current maximum total is <strong>{maxTotal}</strong>.
        </p>
        <button className="btn btn-primary" onClick={() => setEditing({ name: '', maxMarks: 10, active: true })}>
          <FiPlus /> Add category
        </button>
      </div>

      <div className="panel glass">
        <table className="table">
          <thead>
            <tr><th>Category</th><th>Max marks</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {criteria.map((item) => (
              <tr key={item.id}>
                <td><strong>{item.label}</strong></td>
                <td>{item.maxMarks}</td>
                <td>{item.active === false ? 'Hidden' : 'Active'}</td>
                <td className="actions">
                  <button className="btn btn-ghost small" onClick={() => setEditing({ ...item, name: item.label })}>
                    Edit
                  </button>
                  <button className="btn btn-danger small" onClick={() => remove(item)}>
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <Modal title={editing.id ? 'Edit category' : 'Add category'} onClose={() => setEditing(null)}>
          <form className="form" onSubmit={save}>
            <label>
              Name
              <input value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} required />
            </label>
            <label>
              Maximum marks
              <input
                type="number"
                min="1"
                max="100"
                value={editing.maxMarks}
                onChange={(event) => setEditing({ ...editing, maxMarks: event.target.value })}
                required
              />
            </label>
            <label className="check-row">
              <input
                type="checkbox"
                checked={editing.active !== false}
                onChange={(event) => setEditing({ ...editing, active: event.target.checked })}
              />
              Active for judges
            </label>
            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn btn-primary">Save</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
