import { useState } from 'react'
import { FiArrowDown, FiArrowUp, FiPlus, FiTrash2 } from 'react-icons/fi'
import { useApp } from '../../context/AppContext'
import Modal from '../../components/Modal'
import { sitePhoto, bySortOrder } from '../../utils/sitePeople'

const LEADER_ICONS = [
  { value: 'crown', label: 'Crown' },
  { value: 'edit', label: 'Edit' },
  { value: 'users', label: 'People' },
  { value: 'award', label: 'Award' },
]

function shrinkPhoto(file, maxSize) {
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

function emptyLeader(sortOrder) {
  return { name: '', title: '', role: '', lines: '', photo: null, icon: 'users', sortOrder, active: true }
}

function nextOrder(list) {
  return Math.max(0, ...(list || []).map((item) => item.sortOrder || 0)) + 1
}

export default function ManageWebsite() {
  const { clubLeaders, createClubLeader, updateClubLeader, deleteClubLeader, moveClubLeader, showToast } = useApp()
  const leaders = bySortOrder(clubLeaders)
  const [leaderForm, setLeaderForm] = useState(null)
  const [saving, setSaving] = useState(false)

  const saveLeader = async (event) => {
    event.preventDefault()
    setSaving(true)
    const body = {
      name: leaderForm.name.trim(),
      title: leaderForm.title.trim(),
      role: leaderForm.role.trim(),
      lines: leaderForm.lines,
      icon: leaderForm.icon,
      sortOrder: Number(leaderForm.sortOrder) || 0,
      active: leaderForm.active !== false,
    }
    if (Object.prototype.hasOwnProperty.call(leaderForm, 'photo')) body.photo = leaderForm.photo
    const res = leaderForm.id
      ? await updateClubLeader(leaderForm.id, body)
      : await createClubLeader(body)
    setSaving(false)
    if (!res.ok) return showToast(res.error, 'error')
    showToast(leaderForm.id ? 'Leader updated' : 'Leader added')
    setLeaderForm(null)
  }

  const removeLeader = async (item) => {
    if (!window.confirm(`Remove "${item.name}" from club leadership?`)) return
    const res = await deleteClubLeader(item.id)
    if (!res.ok) return showToast(res.error, 'error')
    showToast('Leader removed')
  }

  return (
    <div className="stack">
      <div className="toolbar">
        <p className="muted grow">
          Leaders added here appear on the public <strong>Rotary Club of Madras North</strong> section.
          Lower sort order appears first.
        </p>
        <button className="btn btn-primary" onClick={() => setLeaderForm(emptyLeader(nextOrder(leaders)))}>
          <FiPlus /> Add leader
        </button>
      </div>

      <div className="panel glass">
        <table className="table">
          <thead>
            <tr>
              <th>Leader</th>
              <th>Title</th>
              <th>Order</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {leaders.map((item, index) => (
              <tr key={item.id}>
                <td>
                  <div className="who">
                    <img src={sitePhoto(item)} alt="" />
                    <span>
                      <strong>{item.name}</strong>
                      <span className="muted small">{item.role || '—'}</span>
                    </span>
                  </div>
                </td>
                <td className="muted small">{item.title || '—'}</td>
                <td>{item.sortOrder || 0}</td>
                <td>
                  <span className={`desk-pill ${item.active !== false ? 'received' : 'alert'}`}>
                    {item.active !== false ? 'Visible' : 'Hidden'}
                  </span>
                </td>
                <td className="actions">
                  <button
                    className="btn btn-ghost small"
                    disabled={index === 0}
                    onClick={async () => {
                      const res = await moveClubLeader(item.id, 'up')
                      if (!res.ok) showToast(res.error, 'error')
                    }}
                    aria-label="Move up"
                  >
                    <FiArrowUp />
                  </button>
                  <button
                    className="btn btn-ghost small"
                    disabled={index === leaders.length - 1}
                    onClick={async () => {
                      const res = await moveClubLeader(item.id, 'down')
                      if (!res.ok) showToast(res.error, 'error')
                    }}
                    aria-label="Move down"
                  >
                    <FiArrowDown />
                  </button>
                  <button
                    className="btn btn-ghost small"
                    onClick={() =>
                      setLeaderForm({
                        ...item,
                        lines: (item.lines || []).join('\n'),
                        photo: item.photo || null,
                      })
                    }
                  >
                    Edit
                  </button>
                  <button className="btn btn-danger small" onClick={() => removeLeader(item)}>
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
            {!leaders.length && (
              <tr>
                <td colSpan="5" className="muted center">No club leaders yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {leaderForm && (
        <Modal title={leaderForm.id ? 'Edit leader' : 'Add leader'} onClose={() => setLeaderForm(null)}>
          <form className="form" onSubmit={saveLeader}>
            <label>
              Name
              <input
                value={leaderForm.name}
                onChange={(event) => setLeaderForm({ ...leaderForm, name: event.target.value })}
                required
              />
            </label>
            <label>
              Title badge
              <input
                value={leaderForm.title}
                onChange={(event) => setLeaderForm({ ...leaderForm, title: event.target.value })}
                placeholder="Chairman"
                required
              />
            </label>
            <label>
              Role
              <input
                value={leaderForm.role}
                onChange={(event) => setLeaderForm({ ...leaderForm, role: event.target.value })}
                placeholder="Chairman - Dance of District"
              />
            </label>
            <label>
              Details
              <textarea
                rows="3"
                value={leaderForm.lines}
                onChange={(event) => setLeaderForm({ ...leaderForm, lines: event.target.value })}
                placeholder={'Rotary Year 2026-27\nRotary Club of Madras North'}
              />
            </label>
            <label>
              Badge icon
              <select
                value={leaderForm.icon}
                onChange={(event) => setLeaderForm({ ...leaderForm, icon: event.target.value })}
              >
                {LEADER_ICONS.map((icon) => (
                  <option key={icon.value} value={icon.value}>{icon.label}</option>
                ))}
              </select>
            </label>
            <label>
              Sort order
              <input
                type="number"
                min="0"
                max="9999"
                value={leaderForm.sortOrder}
                onChange={(event) => setLeaderForm({ ...leaderForm, sortOrder: event.target.value })}
                required
              />
            </label>
            <label>
              Photo
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files[0]
                  if (!file) return
                  shrinkPhoto(file, 800).then(
                    (photo) => setLeaderForm((current) => ({ ...current, photo })),
                    () => showToast('Could not read that image', 'error'),
                  )
                }}
              />
            </label>
            {sitePhoto(leaderForm) && <img src={sitePhoto(leaderForm)} alt="" className="photo-preview" />}
            <label className="check-row">
              <input
                type="checkbox"
                checked={leaderForm.active !== false}
                onChange={(event) => setLeaderForm({ ...leaderForm, active: event.target.checked })}
              />
              Visible on homepage
            </label>
            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setLeaderForm(null)}>Cancel</button>
              <button className="btn btn-primary" disabled={saving}>{leaderForm.id ? 'Save' : 'Add leader'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
