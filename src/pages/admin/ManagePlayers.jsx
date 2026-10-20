import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiEdit2, FiPlus, FiRadio, FiSearch, FiTrash2, FiUser, FiUsers, FiX, FiUpload } from 'react-icons/fi'
import { FaUserFriends } from 'react-icons/fa'
import { useApp } from '../../context/AppContext'
import PlayerCard from '../../components/PlayerCard'
import Modal from '../../components/Modal'
import StagePopup from '../../components/StagePopup'
import { CATEGORIES } from '../../constants/scoring'
import { DANCE_STYLES, STYLE_GROUPS } from '../../constants/danceStyles'

const CategoryOptions = () =>
  STYLE_GROUPS.map((g) => (
    <optgroup key={g} label={g}>
      {DANCE_STYLES.filter((s) => s.group === g).map((s) => (
        <option key={s.name}>{s.name}</option>
      ))}
    </optgroup>
  ))

const FORMAT_TABS = [
  { key: 'single', formatKey: 'solo', label: 'Solo', icon: FiUser },
  { key: 'couple', formatKey: 'couple', label: 'Couple', icon: FaUserFriends },
  { key: 'group', formatKey: 'group', label: 'Group', icon: FiUsers },
]

const emptyForm = (type) => ({
  name: '',
  type,
  formatKey: type === 'group' ? 'group' : type === 'couple' ? 'couple' : 'solo',
  danceStyle: CATEGORIES[0],
  category: CATEGORIES[0],
  age: '',
  participantTypeId: '',
  classificationId: '',
  members: type === 'single' ? [] : [''],
  photo: null,
  email: '',
  phone: '',
  club: '',
})

const PHOTO_MAX_SIZE = 400

function shrinkPhoto(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, PHOTO_MAX_SIZE / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.8))
    }
    img.onerror = reject
    img.src = url
  })
}

function PlayerForm({ initial, onSave, onCancel, participantTypes, classifications, formats }) {
  const [form, setForm] = useState(initial)
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))
  const formatKey = form.formatKey || (form.type === 'group' ? 'group' : form.type === 'couple' ? 'couple' : 'solo')
  const formatId = formats.find((item) => item.key === formatKey)?.id
  const allowedTypes = participantTypes.filter((item) => !item.formatKeys?.length || item.formatKeys.includes(formatKey))
  const categoryOptions = classifications.filter((item) => item.kind === 'category' && item.formatId === formatId)

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    shrinkPhoto(file).then((photo) => set('photo', photo), () => {})
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      ...form,
      formatKey,
      type: formatKey === 'group' ? 'group' : formatKey === 'couple' ? 'couple' : 'single',
      category: form.danceStyle,
      age: form.age === '' ? null : Number(form.age),
      participantTypeId: form.participantTypeId || null,
      classificationId: form.classificationId || null,
      members: formatKey === 'solo' ? [] : form.members.map((m) => m.trim()).filter(Boolean),
    })
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <div className="tabs full">
        {FORMAT_TABS.map(({ formatKey: key, label }) => (
          <button
            type="button"
            key={key}
            className={`tab ${formatKey === key ? 'active' : ''}`}
            onClick={() =>
              setForm((f) => ({
                ...f,
                formatKey: key,
                type: key === 'group' ? 'group' : key === 'couple' ? 'couple' : 'single',
                members: key === 'solo' ? [] : f.members.length ? f.members : [''],
              }))
            }
          >
            {label}
          </button>
        ))}
      </div>
      <label>
        {formatKey === 'group' ? 'Group name' : 'Player name'}
        <input value={form.name} onChange={(e) => set('name', e.target.value)} required />
      </label>
      <div className="form-grid">
        <label>
          Age
          <input
            type="number"
            min="1"
            max="120"
            value={form.age}
            onChange={(e) => set('age', e.target.value)}
            placeholder="For auto classification"
          />
        </label>
        <label>
          Participant type
          <select value={form.participantTypeId || ''} onChange={(e) => set('participantTypeId', e.target.value)}>
            <option value="">Select…</option>
            {allowedTypes.map((type) => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </label>
      </div>
      <label>
        Dance style / genre
        <select value={form.danceStyle || form.category} onChange={(e) => set('danceStyle', e.target.value)}>
          <CategoryOptions />
        </select>
      </label>
      <label>
        Category
        <select value={form.classificationId || ''} onChange={(e) => set('classificationId', e.target.value)}>
          <option value="">Auto from age, type and format</option>
          {categoryOptions.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}{item.price != null ? ` · Rs.${item.price}` : ''}
            </option>
          ))}
        </select>
      </label>

      {formatKey !== 'solo' && (
        <div className="members">
          <span className="label">Other participants</span>
          {form.members.map((m, i) => (
            <div className="member-row" key={i}>
              <input
                value={m}
                placeholder={`Member ${i + 1}`}
                onChange={(e) => set('members', form.members.map((x, j) => (j === i ? e.target.value : x)))}
              />
              <button
                type="button"
                className="icon-btn"
                onClick={() => set('members', form.members.filter((_, j) => j !== i))}
                aria-label="Remove member"
              >
                <FiX />
              </button>
            </div>
          ))}
          <button type="button" className="btn btn-ghost small" onClick={() => set('members', [...form.members, ''])}>
            <FiPlus /> Add member
          </button>
        </div>
      )}

      <label>
        Photo (optional)
        <input type="file" accept="image/*" onChange={handlePhoto} />
      </label>
      {form.photo && <img src={form.photo} alt="preview" className="photo-preview" />}

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary">Save</button>
      </div>
    </form>
  )
}

export default function ManagePlayers() {
  const {
    players,
    playerStats,
    participantTypes,
    classifications,
    formats,
    settings,
    addPlayer,
    updatePlayer,
    deletePlayer,
    setLivePlayer,
    showToast,
  } = useApp()
  const [tab, setTab] = useState('single')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [editing, setEditing] = useState(null)
  const [stageId, setStageId] = useState(null)

  const list = players.filter(
    (p) =>
      p.type === tab &&
      (category === 'All' || p.category === category || p.danceStyle === category) &&
      p.name.toLowerCase().includes(search.toLowerCase()),
  )

  const handleSave = async (form) => {
    const res = editing.id ? await updatePlayer(editing.id, form) : await addPlayer(form)
    if (!res.ok) return showToast(res.error, 'error')
    showToast(editing.id ? 'Player updated' : `${form.formatKey === 'group' ? 'Group' : 'Player'} added`)
    setTab(form.type)
    setEditing(null)
  }

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete "${p.name}" and all their marks?`)) return
    const res = await deletePlayer(p.id)
    if (!res.ok) return showToast(res.error, 'error')
    showToast('Player deleted', 'error')
  }

  const goLive = async (player) => {
    if (settings.livePlayerId === player.id) {
      setStageId(player.id)
      return
    }
    const res = await setLivePlayer(player.id, true)
    if (!res.ok) return showToast(res.error, 'error')
    setStageId(player.id)
    showToast(`${player.name} is live`)
  }

  const stagePlayer = players.find((player) => player.id === stageId)

  return (
    <div className="stack">
      <div className="toolbar">
        <div className="tabs">
          {FORMAT_TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} className={`tab ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
              <Icon /> {label} ({players.filter((p) => p.type === key).length})
            </button>
          ))}
        </div>
        <label className="input-icon search">
          <FiSearch />
          <input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="select">
          <option>All</option>
          <CategoryOptions />
        </select>
        <Link to="/admin/import" className="btn btn-ghost">
          <FiUpload /> Import
        </Link>
        <button className="btn btn-primary" onClick={() => setEditing(emptyForm(tab))}>
          <FiPlus /> Add {tab === 'group' ? 'Group' : tab === 'couple' ? 'Couple' : 'Player'}
        </button>
      </div>

      <p className="muted small">
        Import Google Form Excel under Import, or add players manually. Age + type + Solo/Couple/Group auto-map to{' '}
        <Link to="/admin/classifications" className="link-btn">classifications</Link>.
      </p>

      {list.length ? (
        <div className="card-grid">
          {list.map((p) => (
            <PlayerCard key={p.id} player={p} stats={playerStats[p.id]} participantTypes={participantTypes} live={settings.livePlayerId === p.id}>
              <button className={`btn small ${settings.livePlayerId === p.id ? 'btn-live' : 'btn-ghost'}`} onClick={() => goLive(p)}>
                <FiRadio /> {settings.livePlayerId === p.id ? 'On stage' : 'Go live'}
              </button>
              <button
                className="btn btn-ghost small"
                onClick={() =>
                  setEditing({
                    ...p,
                    danceStyle: p.danceStyle || p.category,
                    age: p.age ?? '',
                    participantTypeId: p.participantTypeId || '',
                    classificationId: p.classificationId || '',
                    members: p.members?.length ? p.members : p.type === 'single' ? [] : [''],
                  })
                }
              >
                <FiEdit2 /> Edit
              </button>
              <button className="btn btn-danger small" onClick={() => handleDelete(p)}>
                <FiTrash2 /> Delete
              </button>
            </PlayerCard>
          ))}
        </div>
      ) : (
        <div className="empty glass">No {tab === 'group' ? 'groups' : tab === 'couple' ? 'couples' : 'players'} found.</div>
      )}

      {editing && (
        <Modal
          title={editing.id ? 'Edit Player' : `Add ${editing.type === 'group' ? 'Group' : editing.type === 'couple' ? 'Couple' : 'Player'}`}
          onClose={() => setEditing(null)}
        >
          <PlayerForm
            initial={{
              name: editing.name,
              type: editing.type,
              formatKey: editing.formatKey || (editing.type === 'group' ? 'group' : editing.type === 'couple' ? 'couple' : 'solo'),
              danceStyle: editing.danceStyle || editing.category || CATEGORIES[0],
              category: editing.category,
              age: editing.age ?? '',
              participantTypeId: editing.participantTypeId || '',
              classificationId: editing.classificationId || '',
              members: editing.members || [],
              photo: editing.photo,
              email: editing.email || '',
              phone: editing.phone || '',
              club: editing.club || '',
            }}
            participantTypes={participantTypes}
            classifications={classifications}
            formats={formats}
            onSave={handleSave}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}

      {stagePlayer && <StagePopup player={stagePlayer} mode="admin" onClose={() => setStageId(null)} />}
    </div>
  )
}
