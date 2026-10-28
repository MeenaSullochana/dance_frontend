import { useState } from 'react'
import { FiEdit2, FiHash, FiPlus, FiTrash2, FiUser, FiUsers } from 'react-icons/fi'
import { FaUserFriends } from 'react-icons/fa'
import { GiBallerinaShoes, GiLaurelCrown } from 'react-icons/gi'
import { useApp } from '../../context/AppContext'
import Modal from '../../components/Modal'
import { agePayload, formatAgeRange, openAgeValue } from '../../utils/ageRange'

const FORMAT_META = {
  solo: {
    label: 'Solo',
    index: '01',
    copy: 'Age categories such as Tiny Tots, Kids, Young Adults, Adults.',
    Icon: GiBallerinaShoes,
  },
  couple: {
    label: 'Couple',
    index: '02',
    copy: 'Junior and Senior only.',
    Icon: FaUserFriends,
  },
  group: {
    label: 'Group',
    index: '03',
    copy: 'Only three fees: Rotaractor, DPL, and Adults. Add Mixed, Ann, Annette under Adults.',
    Icon: FiUsers,
  },
}

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
      <div className="classify-marks">
        <div className="classify-marks-meta">
          <span><strong>{total || 0}</strong> marks</span>
          {winner
            ? <span className="classify-winner"><GiLaurelCrown /> {winner.name}</span>
            : <span>No winner yet</span>}
        </div>
        <div className="classify-fields">
          {fields.map((field) => (
            <span key={field.id} className="classify-field">
              {field.name}
              <em>{field.maxMarks}</em>
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

  const renderBandColumn = (formatKey) => {
    const meta = FORMAT_META[formatKey]
    const Icon = meta.Icon
    const bands = bandsFor(formatKey)
    return (
      <section className={`classify-lane lane-${formatKey}`}>
        <header className="lane-head">
          <span className="lane-index">{meta.index}</span>
          <div className="lane-titles">
            <span className="lane-kicker">Competition</span>
            <h2>{meta.label}</h2>
          </div>
          <span className="lane-icon"><Icon /></span>
        </header>
        <p className="lane-copy">{meta.copy}</p>
        <form className="lane-composer" onSubmit={(event) => addBand(event, formatKey)}>
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
        </form>
        <div className="lane-list">
          {bands.map((band) => {
            const category = categoryForBand(band, formatKey)
            return (
              <article key={band.id} className="lane-card">
                <div className="lane-card-top">
                  <div>
                    <strong>{band.name}</strong>
                    {category?.prefix ? <span className="id-stamp"><FiHash /> {category.prefix}</span> : null}
                  </div>
                  <span className="age-gem">{formatAgeRange(band)}</span>
                </div>
                {category ? renderMarks(category) : <p className="muted small">Category will appear after save.</p>}
                <div className="lane-card-actions">
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
                </div>
              </article>
            )
          })}
          {!bands.length && <div className="lane-empty">No {meta.label.toLowerCase()} categories yet.</div>}
        </div>
      </section>
    )
  }

  const renderGroupRow = (item, nested) => (
    <article key={item.id} className={`lane-card group-card ${nested ? 'is-child' : ''}`}>
      <div className="lane-card-top">
        <div>
          <strong>{item.name}</strong>
          <p className="muted small">
            {nested
              ? `Fee from ${parentOf(item)?.name || 'Adults'} · Rs.${feeOf(item)}`
              : `Entry fee Rs.${feeOf(item)}`}
          </p>
        </div>
        <div className="group-stamps">
          {!nested && <span className="fee-gem">Rs.{feeOf(item)}</span>}
          <span className="id-stamp"><FiHash /> {item.prefix || 'No prefix'}</span>
        </div>
      </div>
      {renderMarks(item)}
      <div className="lane-card-actions">
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
      {underParent === item.id && (
        <form className="lane-composer nest-form" onSubmit={(event) => addGroup(event, item.id)}>
          <input
            placeholder="e.g. Mixed, Ann, Annette"
            value={groupForm.name}
            onChange={(event) => setGroupForm({ ...groupForm, name: event.target.value })}
            required
          />
          <button className="btn btn-primary small"><FiPlus /> Add</button>
          <button type="button" className="btn btn-ghost small" onClick={() => setUnderParent(null)}>Cancel</button>
        </form>
      )}
      {childrenOf(item.id).map((child) => renderGroupRow(child, true))}
    </article>
  )

  return (
    <div className="stack classify-stage">
      <section className="classify-hero">
        <div>
          <span className="lane-kicker"><GiLaurelCrown /> Rule book</span>
          <h2>Stage categories</h2>
          <p>
            Solo is by age, Couple is Junior or Senior, and Group has three priced houses — Rotaractor, DPL and Adults.
            Mixed, Ann and Annette sit under Adults.
          </p>
        </div>
        <div className="classify-hero-stats">
          <span><b>{bandsFor('solo').length}</b> Solo</span>
          <span><b>{bandsFor('couple').length}</b> Couple</span>
          <span><b>{groupParents.length}</b> Group</span>
        </div>
      </section>

      <section className="classify-roster">
        <div className="roster-head">
          <div>
            <span className="lane-kicker"><FiUser /> Roster</span>
            <h2>Who they are</h2>
            <p className="muted small">Rotarian, Ann, Annette, Rotaractor, DPL — used when adding a participant, not the stage category.</p>
          </div>
          <form className="lane-composer roster-composer" onSubmit={addType}>
            <input placeholder="e.g. Rotaractor" value={typeForm.name} onChange={(event) => setTypeForm({ name: event.target.value })} required />
            <button className="btn btn-primary small"><FiPlus /> Add</button>
          </form>
        </div>
        <div className="roster-row">
          {participantTypes.map((type) => (
            <article key={type.id} className="roster-tile">
              <strong>{type.name}</strong>
              <div className="lane-card-actions">
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
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="classify-grid">
        {renderBandColumn('solo')}
        {renderBandColumn('couple')}
        <section className="classify-lane lane-group">
          <header className="lane-head">
            <span className="lane-index">{FORMAT_META.group.index}</span>
            <div className="lane-titles">
              <span className="lane-kicker">Competition</span>
              <h2>{FORMAT_META.group.label}</h2>
            </div>
            <span className="lane-icon"><FiUsers /></span>
          </header>
          <p className="lane-copy">{FORMAT_META.group.copy}</p>
          <form className="lane-composer" onSubmit={(event) => addGroup(event)}>
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
          </form>
          <div className="lane-list">
            {groupParents.length
              ? groupParents.map((item) => renderGroupRow(item, false))
              : <div className="lane-empty">No group categories yet. Add Rotaractor, DPL, and Adults.</div>}
          </div>
        </section>
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
                      placeholder="SK"
                      onChange={(event) => setEditing({ ...editing, prefix: event.target.value.toUpperCase() })}
                    />
                    <span className="muted small">Registered ID / Chest ID. Example: SK1, SY1, SA1.</span>
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
                  placeholder="SK"
                  onChange={(event) => setEditing({ ...editing, prefix: event.target.value.toUpperCase() })}
                />
                <span className="muted small">Registered ID / Chest ID prefix. Example: SK, SY, SA, CJ. Players get SK1, SK2.</span>
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
