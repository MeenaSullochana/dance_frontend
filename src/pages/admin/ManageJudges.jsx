import { useState } from 'react'
import { FiArrowDown, FiArrowUp, FiPlus, FiTrash2, FiToggleLeft, FiToggleRight } from 'react-icons/fi'
import { useApp } from '../../context/AppContext'
import Modal from '../../components/Modal'
import { sitePhoto, bySortOrder } from '../../utils/sitePeople'

function shrinkPhoto(file, maxSize = 1400) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = reject
    img.src = url
  })
}

function emptyForm(sortOrder) {
  return {
    name: '',
    email: '',
    password: '',
    panelRole: '',
    photo: null,
    sortOrder,
    showOnPanel: true,
  }
}

export default function ManageJudges() {
  const { judges, scores, players, addAccount, updateAccount, moveAccount, toggleAccount, deleteAccount, showToast } = useApp()
  const rows = bySortOrder(judges)
  const [form, setForm] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const nextOrder = Math.max(0, ...rows.map((item) => item.sortOrder || 0)) + 1

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSaving(true)
    const body = {
      name: form.name.trim(),
      email: form.email.trim(),
      panelRole: form.panelRole.trim(),
      sortOrder: Number(form.sortOrder) || 0,
      showOnPanel: form.showOnPanel !== false,
      role: 'judge',
    }
    if (form.password) body.password = form.password
    if (Object.prototype.hasOwnProperty.call(form, 'photo')) body.photo = form.photo
    const res = form.id ? await updateAccount(form.id, body) : await addAccount(body)
    setSaving(false)
    if (!res.ok) return setError(res.error)
    showToast(form.id ? 'Judge updated' : 'Judge added')
    setForm(null)
  }

  const handleDelete = async (judge) => {
    if (!window.confirm(`Delete judge "${judge.name}" and all their marks?`)) return
    const res = await deleteAccount(judge.id)
    if (!res.ok) return showToast(res.error, 'error')
    showToast('Judge deleted', 'error')
  }

  return (
    <div className="stack">
      <div className="toolbar">
        <p className="muted grow">
          Judges created here can score performances and appear on the public <strong>Season 14 Panel</strong>.
          Only <strong>active</strong> judges are counted when deciding if a player is fully judged.
        </p>
        <button className="btn btn-primary" onClick={() => { setError(''); setForm(emptyForm(nextOrder)) }}>
          <FiPlus /> Add Judge
        </button>
      </div>

      <div className="panel glass desk-list">
        <table className="table">
          <thead>
            <tr>
              <th>Judge</th>
              <th>Contact</th>
              <th>Order</th>
              <th>Scored</th>
              <th>Panel</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((judge, index) => {
              const count = scores.filter((score) => score.judgeId === judge.id).length
              return (
                <tr key={judge.id}>
                  <td>
                    <div className="who">
                      <img src={sitePhoto(judge)} alt="" className={judge.photo || judge.imageKey ? 'site-thumb' : undefined} />
                      <span>
                        <strong>{judge.name}</strong>
                        <span className="muted small">{judge.panelRole || 'Judge'}</span>
                      </span>
                    </div>
                  </td>
                  <td className="muted small">{judge.email || '—'}</td>
                  <td>{judge.sortOrder || 0}</td>
                  <td><span className="desk-pill id">{count} / {players.length}</span></td>
                  <td>
                    <span className={`desk-pill ${judge.showOnPanel ? 'received' : 'alert'}`}>
                      {judge.showOnPanel ? 'On homepage' : 'Hidden'}
                    </span>
                  </td>
                  <td>
                    <span className={`desk-pill ${judge.active ? 'received' : 'alert'}`}>{judge.active ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td className="actions">
                    <button
                      className="btn btn-ghost small"
                      disabled={index === 0}
                      onClick={async () => {
                        const res = await moveAccount(judge.id, 'up')
                        if (!res.ok) showToast(res.error, 'error')
                      }}
                      aria-label="Move up"
                    >
                      <FiArrowUp />
                    </button>
                    <button
                      className="btn btn-ghost small"
                      disabled={index === rows.length - 1}
                      onClick={async () => {
                        const res = await moveAccount(judge.id, 'down')
                        if (!res.ok) showToast(res.error, 'error')
                      }}
                      aria-label="Move down"
                    >
                      <FiArrowDown />
                    </button>
                    <button
                      className="btn btn-ghost small"
                      onClick={() => {
                        setError('')
                        setForm({
                          ...judge,
                          password: '',
                          panelRole: judge.panelRole || '',
                          photo: judge.photo || null,
                          sortOrder: judge.sortOrder || 0,
                          showOnPanel: Boolean(judge.showOnPanel),
                        })
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-ghost small"
                      onClick={async () => {
                        const res = await toggleAccount(judge.id)
                        if (!res.ok) showToast(res.error, 'error')
                      }}
                    >
                      {judge.active ? <FiToggleRight /> : <FiToggleLeft />} {judge.active ? 'Active' : 'Off'}
                    </button>
                    <button className="btn btn-danger small" onClick={() => handleDelete(judge)}>
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              )
            })}
            {!rows.length && (
              <tr><td colSpan="7" className="muted center">No judges yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {form && (
        <Modal title={form.id ? 'Edit Judge' : 'Add Judge'} onClose={() => setForm(null)}>
          <form className="form" onSubmit={handleSubmit}>
            <label>
              Name
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            </label>
            <label>
              Email
              <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
            </label>
            <label>
              {form.id ? 'New password (optional)' : 'Password'}
              <input
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                required={!form.id}
                minLength={form.id ? undefined : 4}
              />
            </label>
            <label>
              Role / subtitle
              <input
                value={form.panelRole}
                onChange={(event) => setForm({ ...form, panelRole: event.target.value })}
                placeholder="Actor · Performer · Storyteller"
              />
            </label>
            <label>
              Sort order
              <input
                type="number"
                min="0"
                max="9999"
                value={form.sortOrder}
                onChange={(event) => setForm({ ...form, sortOrder: event.target.value })}
                required
              />
            </label>
            <label>
              Poster for Season 14 Panel
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files[0]
                  if (!file) return
                  shrinkPhoto(file).then(
                    (photo) => setForm((current) => ({ ...current, photo })),
                    () => setError('Could not read that image'),
                  )
                }}
              />
            </label>
            {sitePhoto(form) && <img src={sitePhoto(form)} alt="" className="photo-preview photo-preview-poster" />}
            <label className="check-row">
              <input
                type="checkbox"
                checked={form.showOnPanel !== false}
                onChange={(event) => setForm({ ...form, showOnPanel: event.target.checked })}
              />
              Show on Season 14 Panel
            </label>
            {error && <div className="error">{error}</div>}
            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setForm(null)}>Cancel</button>
              <button className="btn btn-primary" disabled={saving}>{form.id ? 'Save' : 'Add Judge'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
