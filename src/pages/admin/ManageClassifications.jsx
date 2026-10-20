import { useState } from 'react'
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi'
import { useApp } from '../../context/AppContext'
import Modal from '../../components/Modal'

const FORMAT_LABEL = { solo: 'Solo', couple: 'Couple', group: 'Group' }

function FormatChecks({ formats, value, onChange }) {
  const keys = value || []
  const toggle = (key) => {
    const next = keys.includes(key) ? keys.filter((item) => item !== key) : [...keys, key]
    onChange(next)
  }
  return (
    <div className="format-checks">
      {formats.map((format) => (
        <label key={format.id}>
          <input type="checkbox" checked={keys.includes(format.key)} onChange={() => toggle(format.key)} />
          {format.name}
        </label>
      ))}
    </div>
  )
}

export default function ManageClassifications() {
  const {
    ageBands,
    participantTypes,
    formats,
    classifications,
    categoryParameters,
    criteria,
    players,
    createAgeBand,
    updateAgeBand,
    deleteAgeBand,
    createParticipantType,
    updateParticipantType,
    deleteParticipantType,
    updateClassification,
    deleteClassification,
    createCategoryParameter,
    deleteCategoryParameter,
    showToast,
  } = useApp()

  const [bandForm, setBandForm] = useState({ name: '', minAge: 5, maxAge: 12, formatKeys: ['solo'] })
  const [typeForm, setTypeForm] = useState({ name: '', formatKeys: ['solo'] })
  const [fieldFor, setFieldFor] = useState(null)
  const [pickedIds, setPickedIds] = useState([])
  const [editing, setEditing] = useState(null)

  const categories = classifications.filter((item) => item.kind === 'category')
  const formatOf = (id) => formats.find((item) => item.id === id)
  const fieldsOf = (id) =>
    categoryParameters
      .filter((item) => item.classificationId === id && item.active !== false)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
  const winnerOf = (id) => players.find((player) => player.winner && player.classificationId === id)

  const addBand = async (event) => {
    event.preventDefault()
    const res = await createAgeBand({
      name: bandForm.name,
      minAge: Number(bandForm.minAge),
      maxAge: Number(bandForm.maxAge),
      formatKeys: bandForm.formatKeys,
    })
    if (!res.ok) return showToast(res.error, 'error')
    showToast('Age category added')
    setBandForm({ name: '', minAge: 5, maxAge: 12, formatKeys: ['solo'] })
  }

  const addType = async (event) => {
    event.preventDefault()
    const res = await createParticipantType(typeForm)
    if (!res.ok) return showToast(res.error, 'error')
    showToast('Participant type added')
    setTypeForm({ name: '', formatKeys: ['solo'] })
  }

  const saveFormats = async (kind, item, formatKeys) => {
    const res = kind === 'band'
      ? await updateAgeBand(item.id, { name: item.name, minAge: item.minAge, maxAge: item.maxAge, formatKeys })
      : await updateParticipantType(item.id, { name: item.name, formatKeys })
    if (!res.ok) showToast(res.error, 'error')
  }

  const saveEdit = async (event) => {
    event.preventDefault()
    const name = editing.name.trim()
    let res
    if (editing.kind === 'band') {
      res = await updateAgeBand(editing.id, {
        name,
        minAge: Number(editing.minAge),
        maxAge: Number(editing.maxAge),
        formatKeys: editing.formatKeys,
      })
    } else if (editing.kind === 'type') {
      res = await updateParticipantType(editing.id, { name, formatKeys: editing.formatKeys })
    } else {
      res = await updateClassification(editing.id, { name, price: Number(editing.price), prefix: editing.prefix || '' })
    }
    if (!res.ok) return showToast(res.error, 'error')
    showToast('Saved')
    setEditing(null)
  }

  const removeCategory = async (item) => {
    if (!window.confirm(`Remove "${item.name}"? Players in it will no longer belong to this category.`)) return
    const res = await deleteClassification(item.id)
    if (!res.ok) return showToast(res.error, 'error')
    showToast('Category removed')
  }

  const openFields = (item) => {
    const attached = new Set(fieldsOf(item.id).map((field) => field.key))
    setPickedIds(criteria.filter((criterion) => attached.has(criterion.key)).map((criterion) => criterion.id))
    setFieldFor(item)
  }

  const togglePick = (id) => {
    setPickedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
  }

  const toggleAllPicks = () => {
    setPickedIds((current) => (current.length === criteria.length ? [] : criteria.map((item) => item.id)))
  }

  const saveFields = async (event) => {
    event.preventDefault()
    const res = await createCategoryParameter({
      classificationId: fieldFor.id,
      criterionIds: pickedIds,
    })
    if (!res.ok) return showToast(res.error, 'error')
    showToast('Mark fields saved')
    setFieldFor(null)
  }

  const renderCategory = (item) => {
    const fields = fieldsOf(item.id)
    const total = fields.reduce((sum, field) => sum + Number(field.maxMarks || 0), 0)
    const winner = winnerOf(item.id)
    return (
      <article key={item.id} className="panel glass category-card">
        <div className="toolbar">
          <div className="grow">
            <h3>{item.name}</h3>
            <p className="muted small">
              Winner stays in this category only.
              {winner ? <> Current winner: <strong>{winner.name}</strong></> : ' No winner yet.'}
            </p>
          </div>
          <div className="category-actions">
            <span className="fee-pill">Entry fee Rs.{Number(item.price ?? 0)}</span>
            <span className="fee-pill">{item.prefix ? `ID ${item.prefix}` : 'No ID prefix'}</span>
            <button className="btn btn-ghost small" onClick={() => setEditing({ kind: 'category', id: item.id, name: item.name, price: item.price ?? 0, prefix: item.prefix || '' })}>
              <FiEdit2 /> Edit
            </button>
            <button className="icon-btn danger" title="Remove category" onClick={() => removeCategory(item)}>
              <FiTrash2 />
            </button>
          </div>
        </div>
        <p className="muted small">Mark fields for this category. Total {total}.</p>
        <div className="chip-row">
          {fields.map((field) => (
            <span key={field.id} className="chip">
              {field.name} · {field.maxMarks}
              <button
                type="button"
                className="icon-btn danger"
                title="Remove field"
                onClick={async () => {
                  const res = await deleteCategoryParameter(field.id)
                  if (!res.ok) showToast(res.error, 'error')
                }}
              >
                <FiTrash2 />
              </button>
            </span>
          ))}
          <button className="btn btn-primary small" onClick={() => openFields(item)}>
            <FiPlus /> Choose fields
          </button>
        </div>
      </article>
    )
  }

  return (
    <div className="stack">
      <div className="banner glass ok">
        <span>
          Solo uses age categories such as Kids, Teens and Adults. Couple uses Junior and Senior only.
          Group uses types such as Rotaractor. Each category has its own price, mark fields, and one winner.
        </span>
      </div>

      <div className="two-col">
        <div className="panel glass">
          <h2>Age categories</h2>
          <p className="muted small">Tick Solo, Couple, or Group. The oldest age in a couple or group picks the matching category.</p>
          <form className="form" onSubmit={addBand}>
            <div className="inline-form">
              <input placeholder="Name" value={bandForm.name} onChange={(event) => setBandForm({ ...bandForm, name: event.target.value })} required />
              <input type="number" min="1" max="120" value={bandForm.minAge} onChange={(event) => setBandForm({ ...bandForm, minAge: event.target.value })} required />
              <input type="number" min="1" max="120" value={bandForm.maxAge} onChange={(event) => setBandForm({ ...bandForm, maxAge: event.target.value })} required />
              <button className="btn btn-primary small"><FiPlus /> Add</button>
            </div>
            <FormatChecks formats={formats} value={bandForm.formatKeys} onChange={(formatKeys) => setBandForm({ ...bandForm, formatKeys })} />
          </form>
          <table className="table">
            <thead>
              <tr><th>Name</th><th>Ages</th><th>Used in</th><th></th></tr>
            </thead>
            <tbody>
              {ageBands.map((band) => (
                <tr key={band.id}>
                  <td><strong>{band.name}</strong></td>
                  <td>{band.minAge}-{band.maxAge}</td>
                  <td>
                    <FormatChecks
                      formats={formats}
                      value={band.formatKeys || []}
                      onChange={(formatKeys) => saveFormats('band', band, formatKeys)}
                    />
                  </td>
                  <td className="actions">
                    <button
                      className="btn btn-ghost small"
                      onClick={() => setEditing({
                        kind: 'band',
                        id: band.id,
                        name: band.name,
                        minAge: band.minAge,
                        maxAge: band.maxAge,
                        formatKeys: band.formatKeys || [],
                      })}
                    >
                      <FiEdit2 /> Edit
                    </button>
                    <button
                      className="icon-btn danger"
                      onClick={async () => {
                        if (!window.confirm(`Delete age category "${band.name}"?`)) return
                        const res = await deleteAgeBand(band.id)
                        if (!res.ok) showToast(res.error, 'error')
                      }}
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="panel glass">
          <h2>Who can enter</h2>
          <p className="muted small">Tick the formats this participant type is allowed to join.</p>
          <form className="form" onSubmit={addType}>
            <div className="inline-form">
              <input className="grow" placeholder="e.g. Rotaractor" value={typeForm.name} onChange={(event) => setTypeForm({ ...typeForm, name: event.target.value })} required />
              <button className="btn btn-primary small"><FiPlus /> Add</button>
            </div>
            <FormatChecks formats={formats} value={typeForm.formatKeys} onChange={(formatKeys) => setTypeForm({ ...typeForm, formatKeys })} />
          </form>
          <table className="table">
            <thead>
              <tr><th>Type</th><th>Can enter</th><th></th></tr>
            </thead>
            <tbody>
              {participantTypes.map((type) => (
                <tr key={type.id}>
                  <td><strong>{type.name}</strong></td>
                  <td>
                    <FormatChecks formats={formats} value={type.formatKeys || []} onChange={(formatKeys) => saveFormats('type', type, formatKeys)} />
                  </td>
                  <td className="actions">
                    <button
                      className="btn btn-ghost small"
                      onClick={() => setEditing({
                        kind: 'type',
                        id: type.id,
                        name: type.name,
                        formatKeys: type.formatKeys || [],
                      })}
                    >
                      <FiEdit2 /> Edit
                    </button>
                    <button
                      className="icon-btn danger"
                      onClick={async () => {
                        if (!window.confirm(`Delete type "${type.name}"?`)) return
                        const res = await deleteParticipantType(type.id)
                        if (!res.ok) showToast(res.error, 'error')
                      }}
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {['solo', 'couple', 'group'].map((key) => {
        const format = formats.find((item) => item.key === key)
        const list = categories.filter((item) => item.formatId === format?.id)
        return (
          <section key={key} className="stack">
            <h2>{FORMAT_LABEL[key]} categories</h2>
            <p className="muted small">These are created from the age categories and types above. Edit the name and entry fee, or remove the category.</p>
            {list.length ? list.map(renderCategory) : <div className="empty glass">No {FORMAT_LABEL[key].toLowerCase()} categories yet.</div>}
          </section>
        )
      })}

      {editing && (
        <Modal
          title={editing.kind === 'band' ? 'Edit age category' : editing.kind === 'type' ? 'Edit participant type' : `Edit · ${editing.name}`}
          onClose={() => setEditing(null)}
        >
          <form className="form" onSubmit={saveEdit}>
            <label>
              Name
              <input value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} required />
            </label>
            {editing.kind === 'band' && (
              <div className="inline-form">
                <label>
                  From age
                  <input type="number" min="1" max="120" value={editing.minAge} onChange={(event) => setEditing({ ...editing, minAge: event.target.value })} required />
                </label>
                <label>
                  To age
                  <input type="number" min="1" max="120" value={editing.maxAge} onChange={(event) => setEditing({ ...editing, maxAge: event.target.value })} required />
                </label>
              </div>
            )}
            {editing.kind === 'category' && (
              <label>
                Entry fee (Rs.)
                <input type="number" min="0" value={editing.price} onChange={(event) => setEditing({ ...editing, price: event.target.value })} required />
                <span className="muted small">This is the amount a player pays to register in this category.</span>
              </label>
            )}
            {editing.kind === 'category' && (
              <label>
                ID prefix
                <input
                  value={editing.prefix || ''}
                  maxLength={6}
                  placeholder="KS"
                  onChange={(event) => setEditing({ ...editing, prefix: event.target.value.toUpperCase() })}
                />
                <span className="muted small">Used when a player is marked arrived. Example: KS-01, KS-02.</span>
              </label>
            )}
            {editing.kind !== 'category' && (
              <div>
                <span className="label">Can be used in</span>
                <FormatChecks
                  formats={formats}
                  value={editing.formatKeys}
                  onChange={(formatKeys) => setEditing({ ...editing, formatKeys })}
                />
              </div>
            )}
            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn btn-primary">Save</button>
            </div>
          </form>
        </Modal>
      )}

      {fieldFor && (
        <Modal title={`Mark fields · ${fieldFor.name}`} onClose={() => setFieldFor(null)}>
          <form className="form mark-field-form" onSubmit={saveFields}>
            <div className="mark-pick-head">
              <p>Choose the mark categories judges score for this category.</p>
              {criteria.length > 0 && (
                <button type="button" className="link-btn" onClick={toggleAllPicks}>
                  {pickedIds.length === criteria.length ? 'Clear all' : 'Select all'}
                </button>
              )}
            </div>
            {criteria.length ? (
              <div className="mark-picks">
                {criteria.map((item) => {
                  const on = pickedIds.includes(item.id)
                  return (
                    <label key={item.id} className={`mark-pick ${on ? 'is-on' : ''}`}>
                      <input type="checkbox" checked={on} onChange={() => togglePick(item.id)} />
                      <span className="mark-pick-box" aria-hidden="true" />
                      <span className="mark-pick-name">{item.label}</span>
                      <span className="mark-pick-max">max {item.maxMarks}</span>
                    </label>
                  )
                })}
              </div>
            ) : (
              <p className="muted">No mark categories yet. Add them on the Mark Categories page first.</p>
            )}
            <div className="mark-pick-foot">
              <p>
                <strong>{pickedIds.length}</strong> selected
                <span>·</span>
                <strong>
                  {criteria
                    .filter((item) => pickedIds.includes(item.id))
                    .reduce((sum, item) => sum + Number(item.maxMarks || 0), 0)}
                </strong>{' '}
                marks
              </p>
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setFieldFor(null)}>Cancel</button>
                <button className="btn btn-primary" disabled={!criteria.length}>Save</button>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
