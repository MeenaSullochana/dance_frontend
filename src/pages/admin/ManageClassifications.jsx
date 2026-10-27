import { useState } from 'react'
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi'
import { useApp } from '../../context/AppContext'
import Modal from '../../components/Modal'
import { agePayload, formatAgeRange, openAgeValue } from '../../utils/ageRange'

const FORMAT_LABEL = { solo: 'Solo', couple: 'Couple', group: 'Group' }

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
    createClassification,
    updateClassification,
    deleteClassification,
    createCategoryParameter,
    deleteCategoryParameter,
    showToast,
  } = useApp()

  const [soloForm, setSoloForm] = useState({ name: '', minAge: '', maxAge: '' })
  const [coupleForm, setCoupleForm] = useState({ name: '', minAge: '', maxAge: '' })
  const [typeForm, setTypeForm] = useState({ name: '' })
  const [groupForm, setGroupForm] = useState({ name: '', price: '' })
  const bandForms = { solo: soloForm, couple: coupleForm }
  const setBandForms = { solo: setSoloForm, couple: setCoupleForm }
  const [fieldFor, setFieldFor] = useState(null)
  const [pickedIds, setPickedIds] = useState([])
  const [editing, setEditing] = useState(null)
  const [underParent, setUnderParent] = useState(null)

  const categories = classifications.filter((item) => item.kind === 'category')
  const formatByKey = (key) => formats.find((item) => item.key === key)
  const fieldsOf = (id) =>
    categoryParameters
      .filter((item) => item.classificationId === id && item.active !== false)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
  const winnerOf = (id) => players.find((player) => player.winner && player.classificationId === id)
  const parentOf = (item) => categories.find((entry) => entry.id === item.parentId)
  const childrenOf = (id) => categories.filter((item) => item.parentId === id)
  const feeOf = (item) => {
    if (!item) return 0
    if (item.parentId) return Number(parentOf(item)?.price ?? 0)
    return Number(item.price ?? 0)
  }

  const bandsFor = (key) => ageBands.filter((band) => (band.formatKeys || []).includes(key))
  const groupParents = categories.filter((item) => item.formatId === formatByKey('group')?.id && !item.parentId)

  const addBand = async (event, formatKey) => {
    event.preventDefault()
    const form = bandForms[formatKey]
    const res = await createAgeBand({
      name: form.name,
      ...agePayload(form.minAge, form.maxAge),
      formatKeys: [formatKey],
    })
    if (!res.ok) return showToast(res.error, 'error')
    showToast(`${FORMAT_LABEL[formatKey]} category added`)
    setBandForms[formatKey]({ name: '', minAge: '', maxAge: '' })
  }

  const addType = async (event) => {
    event.preventDefault()
    const res = await createParticipantType({ name: typeForm.name })
    if (!res.ok) return showToast(res.error, 'error')
    showToast('Type added')
    setTypeForm({ name: '' })
  }

  const addGroup = async (event, parentId = '') => {
    event.preventDefault()
    const format = formatByKey('group')
    if (!format) return showToast('Group format is missing', 'error')
    const payload = {
      formatId: format.id,
      name: groupForm.name.trim(),
      parentId: parentId || undefined,
    }
    if (!parentId) payload.price = Number(groupForm.price || 0)
    const res = await createClassification(payload)
    if (!res.ok) return showToast(res.error, 'error')
    showToast(parentId ? 'Added under this group' : 'Group category added')
    setGroupForm({ name: '', price: '' })
    setUnderParent(null)
  }

  const saveEdit = async (event) => {
    event.preventDefault()
    const name = editing.name.trim()
    let res
    if (editing.kind === 'band') {
      res = await updateAgeBand(editing.id, {
        name,
        ...agePayload(editing.minAge, editing.maxAge),
        formatKeys: editing.formatKeys,
      })
      if (res.ok && editing.categoryId) {
        res = await updateClassification(editing.categoryId, { name, prefix: editing.prefix || '' })
      }
    } else if (editing.kind === 'type') {
      res = await updateParticipantType(editing.id, { name, formatKeys: editing.formatKeys })
    } else {
      const body = { name, prefix: editing.prefix || '' }
      if (editing.showPrice) body.price = Number(editing.price)
      res = await updateClassification(editing.id, body)
    }
    if (!res.ok) return showToast(res.error, 'error')
    showToast('Saved')
    setEditing(null)
  }

  const removeCategory = async (item) => {
    const extra = childrenOf(item.id).length ? ' Sub-categories under it will also be removed.' : ''
    if (!window.confirm(`Remove "${item.name}"?${extra}`)) return
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

  const categoryForBand = (band, formatKey) => {
    const formatId = formatByKey(formatKey)?.id
    return categories.find((item) => item.ageBandId === band.id && item.formatId === formatId)
  }

  const renderMarks = (item) => {
    const fields = fieldsOf(item.id)
    const total = fields.reduce((sum, field) => sum + Number(field.maxMarks || 0), 0)
    const winner = winnerOf(item.id)
    return (
      <div className="category-marks">
        <p className="muted small">
          Marks {total || 0}.
          {winner ? <> Winner: <strong>{winner.name}</strong></> : ' No winner yet.'}
        </p>
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
            <FiPlus /> Fields
          </button>
        </div>
      </div>
    )
  }

  const renderBandColumn = (formatKey) => (
    <div className="panel glass">
      <h2>{FORMAT_LABEL[formatKey]}</h2>
      <p className="muted small">
        {formatKey === 'solo'
          ? 'Age categories such as Tiny Tots, Kids, Young Adults, Adults.'
          : 'Junior and Senior only.'}
      </p>
      <form className="form" onSubmit={(event) => addBand(event, formatKey)}>
        <div className="inline-form">
          <input
            placeholder="Name"
            value={bandForms[formatKey].name}
            onChange={(event) => setBandForms[formatKey]({ ...bandForms[formatKey], name: event.target.value })}
            required
          />
          <input
            type="number"
            min="1"
            max="120"
            placeholder="From"
            value={bandForms[formatKey].minAge}
            onChange={(event) => setBandForms[formatKey]({ ...bandForms[formatKey], minAge: event.target.value })}
          />
          <input
            type="number"
            min="1"
            max="120"
            placeholder="To"
            value={bandForms[formatKey].maxAge}
            onChange={(event) => setBandForms[formatKey]({ ...bandForms[formatKey], maxAge: event.target.value })}
          />
          <button className="btn btn-primary small"><FiPlus /> Add</button>
        </div>
      </form>
      <table className="table">
        <thead>
          <tr><th>Name</th><th>Ages</th><th></th></tr>
        </thead>
        <tbody>
          {bandsFor(formatKey).map((band) => {
            const category = categoryForBand(band, formatKey)
            return (
              <tr key={band.id}>
                <td>
                  <strong>{band.name}</strong>
                  {category?.prefix ? <div className="muted small">ID {category.prefix}</div> : null}
                  {category ? renderMarks(category) : <p className="muted small">Category will appear after save.</p>}
                </td>
                <td>{formatAgeRange(band)}</td>
                <td className="actions">
                  <button
                    className="btn btn-ghost small"
                    onClick={() => setEditing({
                      kind: 'band',
                      id: band.id,
                      name: band.name,
                      minAge: openAgeValue(band.minAge),
                      maxAge: openAgeValue(band.maxAge),
                      formatKeys: band.formatKeys || [formatKey],
                      categoryId: category?.id,
                      prefix: category?.prefix || '',
                    })}
                  >
                    <FiEdit2 /> Edit
                  </button>
                  <button
                    className="icon-btn danger"
                    onClick={async () => {
                      if (!window.confirm(`Delete "${band.name}"?`)) return
                      const res = category
                        ? await deleteClassification(category.id)
                        : await deleteAgeBand(band.id)
                      if (!res.ok) showToast(res.error, 'error')
                    }}
                  >
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )

  const renderGroupRow = (item, nested) => (
    <article key={item.id} className={`group-cat ${nested ? 'is-child' : ''}`}>
      <div className="toolbar">
        <div className="grow">
          <h3>{item.name}</h3>
          {nested
            ? <p className="muted small">Fee from {parentOf(item)?.name || 'Adults'} · Rs.{feeOf(item)}</p>
            : <p className="muted small">Entry fee Rs.{feeOf(item)}</p>}
        </div>
        <div className="category-actions">
          {!nested && <span className="fee-pill">Rs.{feeOf(item)}</span>}
          <span className="fee-pill">{item.prefix ? `ID ${item.prefix}` : 'No ID prefix'}</span>
          {!nested && (
            <button className="btn btn-ghost small" onClick={() => { setUnderParent(item.id); setGroupForm({ name: '', price: '' }) }}>
              <FiPlus /> Add under
            </button>
          )}
          <button
            className="btn btn-ghost small"
            onClick={() => setEditing({
              kind: 'category',
              id: item.id,
              name: item.name,
              price: nested ? feeOf(item) : item.price ?? 0,
              prefix: item.prefix || '',
              showPrice: !nested,
            })}
          >
            <FiEdit2 /> Edit
          </button>
          <button className="icon-btn danger" title="Remove category" onClick={() => removeCategory(item)}>
            <FiTrash2 />
          </button>
        </div>
      </div>
      {renderMarks(item)}
      {underParent === item.id && (
        <form className="form nest-form" onSubmit={(event) => addGroup(event, item.id)}>
          <div className="inline-form">
            <input
              placeholder="e.g. Mixed, Ann, Annette"
              value={groupForm.name}
              onChange={(event) => setGroupForm({ ...groupForm, name: event.target.value })}
              required
            />
            <button className="btn btn-primary small"><FiPlus /> Add</button>
            <button type="button" className="btn btn-ghost small" onClick={() => setUnderParent(null)}>Cancel</button>
          </div>
        </form>
      )}
      {childrenOf(item.id).map((child) => renderGroupRow(child, true))}
    </article>
  )

  return (
    <div className="stack">
      <div className="banner glass ok">
        <span>
          Solo uses age categories (Tiny Tots, Kids, Young Adults, Adults). Couple uses Junior and Senior.
          Group has three priced categories only: Rotaractor, DPL, and Adults. Under Adults add Mixed, Ann, Annette.
        </span>
      </div>

      <div className="panel glass">
        <h2>Who they are</h2>
        <p className="muted small">Rotarian, Ann, Annette, Rotaractor, DPL — used when adding a participant. This is not the competition category.</p>
        <form className="form" onSubmit={addType}>
          <div className="inline-form">
            <input className="grow" placeholder="e.g. Rotaractor" value={typeForm.name} onChange={(event) => setTypeForm({ name: event.target.value })} required />
            <button className="btn btn-primary small"><FiPlus /> Add</button>
          </div>
        </form>
        <div className="chip-row type-chips">
          {participantTypes.map((type) => (
            <span key={type.id} className="chip">
              {type.name}
              <button className="btn btn-ghost small" onClick={() => setEditing({ kind: 'type', id: type.id, name: type.name, formatKeys: type.formatKeys || [] })}>
                <FiEdit2 />
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
            </span>
          ))}
        </div>
      </div>

      <div className="classify-grid">
        {renderBandColumn('solo')}
        {renderBandColumn('couple')}
        <div className="panel glass">
          <h2>Group</h2>
          <p className="muted small">Only three fees: Rotaractor, DPL, and Adults. Add Mixed, Ann, Annette under Adults.</p>
          <form className="form" onSubmit={(event) => addGroup(event)}>
            <div className="inline-form">
              <input
                placeholder="Rotaractor, DPL, Adults"
                value={underParent ? '' : groupForm.name}
                onChange={(event) => { setUnderParent(null); setGroupForm({ ...groupForm, name: event.target.value }) }}
                required={!underParent}
              />
              <input
                type="number"
                min="0"
                placeholder="Fee Rs."
                value={underParent ? '' : groupForm.price}
                onChange={(event) => { setUnderParent(null); setGroupForm({ ...groupForm, price: event.target.value }) }}
                required={!underParent}
              />
              <button className="btn btn-primary small"><FiPlus /> Add</button>
            </div>
          </form>
          {groupParents.length
            ? groupParents.map((item) => renderGroupRow(item, false))
            : <div className="empty glass">No group categories yet. Add Rotaractor, DPL, and Adults.</div>}
        </div>
      </div>

      {editing && (
        <Modal
          title={editing.kind === 'band' ? 'Edit age category' : editing.kind === 'type' ? 'Edit type' : `Edit · ${editing.name}`}
          onClose={() => setEditing(null)}
        >
          <form className="form" onSubmit={saveEdit}>
            <label>
              Name
              <input value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} required />
            </label>
            {editing.kind === 'band' && (
              <>
                <div className="inline-form">
                  <label>
                    From age
                    <input type="number" min="1" max="120" placeholder="Blank = under to-age" value={editing.minAge} onChange={(event) => setEditing({ ...editing, minAge: event.target.value })} />
                  </label>
                  <label>
                    To age
                    <input type="number" min="1" max="120" placeholder="Blank = from-age+" value={editing.maxAge} onChange={(event) => setEditing({ ...editing, maxAge: event.target.value })} />
                  </label>
                </div>
                {editing.categoryId && (
                  <label>
                    ID prefix
                    <input
                      value={editing.prefix || ''}
                      maxLength={6}
                      placeholder="KS"
                      onChange={(event) => setEditing({ ...editing, prefix: event.target.value.toUpperCase() })}
                    />
                  </label>
                )}
              </>
            )}
            {editing.kind === 'category' && editing.showPrice && (
              <label>
                Entry fee (Rs.)
                <input type="number" min="0" value={editing.price} onChange={(event) => setEditing({ ...editing, price: event.target.value })} required />
                <span className="muted small">Group fee for Rotaractor, DPL, or Adults. Sub-categories use the Adults fee.</span>
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
                <span className="muted small">Used when a player is marked arrived. Example: KS-01.</span>
              </label>
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
