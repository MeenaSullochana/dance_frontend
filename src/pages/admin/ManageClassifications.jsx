import { useState } from 'react'
import { FiPlus, FiTrash2 } from 'react-icons/fi'
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
    players,
    createAgeBand,
    updateAgeBand,
    deleteAgeBand,
    createParticipantType,
    updateParticipantType,
    deleteParticipantType,
    updateClassification,
    createCategoryParameter,
    deleteCategoryParameter,
    showToast,
  } = useApp()

  const [bandForm, setBandForm] = useState({ name: '', minAge: 5, maxAge: 12, formatKeys: ['solo'] })
  const [typeForm, setTypeForm] = useState({ name: '', formatKeys: ['solo'] })
  const [fieldFor, setFieldFor] = useState(null)
  const [fieldForm, setFieldForm] = useState({ name: '', maxMarks: 10 })
  const [prices, setPrices] = useState({})

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

  const savePrice = async (item) => {
    const price = Number(prices[item.id] ?? item.price ?? 0)
    const res = await updateClassification(item.id, { price, name: item.name })
    if (!res.ok) return showToast(res.error, 'error')
    showToast('Price saved')
  }

  const addField = async (event) => {
    event.preventDefault()
    const res = await createCategoryParameter({
      classificationId: fieldFor.id,
      name: fieldForm.name,
      maxMarks: Number(fieldForm.maxMarks),
    })
    if (!res.ok) return showToast(res.error, 'error')
    showToast('Mark field added')
    setFieldFor(null)
    setFieldForm({ name: '', maxMarks: 10 })
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
          <label className="price-field">
            Price
            <input
              type="number"
              min="0"
              value={prices[item.id] ?? item.price ?? 0}
              onChange={(event) => setPrices({ ...prices, [item.id]: event.target.value })}
            />
          </label>
          <button className="btn btn-ghost small" onClick={() => savePrice(item)}>Save price</button>
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
          <button className="btn btn-primary small" onClick={() => { setFieldFor(item); setFieldForm({ name: '', maxMarks: 10 }) }}>
            <FiPlus /> Add field
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
          <p className="muted small">Tick Solo or Couple. A couple category is not used for solo.</p>
          <form className="form" onSubmit={addBand}>
            <div className="inline-form">
              <input placeholder="Name" value={bandForm.name} onChange={(event) => setBandForm({ ...bandForm, name: event.target.value })} required />
              <input type="number" min="1" max="120" value={bandForm.minAge} onChange={(event) => setBandForm({ ...bandForm, minAge: event.target.value })} required />
              <input type="number" min="1" max="120" value={bandForm.maxAge} onChange={(event) => setBandForm({ ...bandForm, maxAge: event.target.value })} required />
              <button className="btn btn-primary small"><FiPlus /> Add</button>
            </div>
            <FormatChecks formats={formats.filter((item) => item.key !== 'group')} value={bandForm.formatKeys} onChange={(formatKeys) => setBandForm({ ...bandForm, formatKeys })} />
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
                      formats={formats.filter((item) => item.key !== 'group')}
                      value={band.formatKeys || []}
                      onChange={(formatKeys) => saveFormats('band', band, formatKeys)}
                    />
                  </td>
                  <td className="actions">
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
            {list.length ? list.map(renderCategory) : <div className="empty glass">No {FORMAT_LABEL[key].toLowerCase()} categories yet.</div>}
          </section>
        )
      })}

      {fieldFor && (
        <Modal title={`Add mark field · ${fieldFor.name}`} onClose={() => setFieldFor(null)}>
          <form className="form" onSubmit={addField}>
            <label>
              Field name
              <input value={fieldForm.name} onChange={(event) => setFieldForm({ ...fieldForm, name: event.target.value })} placeholder="Choreography" required />
            </label>
            <label>
              Maximum marks
              <input type="number" min="1" max="100" value={fieldForm.maxMarks} onChange={(event) => setFieldForm({ ...fieldForm, maxMarks: event.target.value })} required />
            </label>
            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setFieldFor(null)}>Cancel</button>
              <button className="btn btn-primary">Add</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
