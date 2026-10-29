import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FiCamera, FiEdit2, FiEye, FiPlus, FiRadio, FiSearch, FiTrash2, FiUser, FiUsers, FiX, FiUpload } from 'react-icons/fi'
import { FaUserFriends } from 'react-icons/fa'
import { useApp } from '../../context/AppContext'
import Modal from '../../components/Modal'
import StagePopup from '../../components/StagePopup'
import { CATEGORIES } from '../../constants/scoring'
import { DANCE_STYLES, STYLE_GROUPS } from '../../constants/danceStyles'
import { asPeople, memberLabel } from '../../utils/member'
import { playerPhoto } from '../../utils/playerPhoto'
import { canGoLive, goLiveBlockedReason, isVotingOpen, registeredId } from '../../utils/playerIds'
import { readParticipantType } from '../../utils/participantType'
import { bandCoversAge, bandSpan, ageFloor } from '../../utils/ageRange'

const FEE_OPTIONS = [
  { value: 'received', label: 'Received' },
  { value: 'not_received', label: 'Not received' },
  { value: 'doubt', label: 'Doubt' },
]

function knownFee(value) {
  return FEE_OPTIONS.some((option) => option.value === value) ? value : ''
}

function needsAttention(value) {
  return value === 'not_received' || value === 'doubt'
}

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
  members: type === 'single' ? [] : [{ name: '', age: '' }, { name: '', age: '' }],
  photo: null,
  email: '',
  phone: '',
  club: '',
  feeStatus: '',
  pendriveStatus: '',
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

function narrowestBand(bands) {
  return [...bands].sort(
    (a, b) => bandSpan(a) - bandSpan(b) || ageFloor(a) - ageFloor(b),
  )[0]
}

function placedCategory(form, { classifications, ageBands, formats }) {
  const formatKey = form.formatKey || 'solo'
  const listed = (form.members || []).map((member) => Number(member.age)).filter((value) => Number.isInteger(value) && value > 0)
  const own = Number(form.age)
  const ages = formatKey === 'solo' ? (Number.isInteger(own) && own > 0 ? [own] : []) : (listed.length ? listed : (Number.isInteger(own) && own > 0 ? [own] : []))
  const oldest = ages.length ? Math.max(...ages) : null
  const formatId = formats.find((item) => item.key === formatKey)?.id
  const options = classifications.filter((item) => item.kind === 'category' && item.formatId === formatId)
  if (formatKey === 'group') {
    const match = options.find((item) => item.participantTypeId === form.participantTypeId)
    if (match) {
      const parent = match.parentId && options.find((item) => item.id === match.parentId)
      return { name: parent ? `${parent.name} / ${match.name}` : match.name, oldest }
    }
    const mixed = options.find((item) => /mixed/i.test(item.name))
    if (mixed) {
      const parent = mixed.parentId && options.find((item) => item.id === mixed.parentId)
      return { name: parent ? `${parent.name} / ${mixed.name}` : mixed.name, oldest }
    }
    return { name: '', oldest }
  }
  if (oldest != null) {
    const covering = ageBands.filter(
      (item) => item.active !== false && bandCoversAge(item, oldest),
    )
    const scoped = covering.filter((item) => (item.formatKeys || []).includes(formatKey))
    const band = narrowestBand(scoped.length ? scoped : [])
    const match = band && options.find((item) => item.ageBandId === band.id)
    if (match) return { name: match.name, oldest }
  }
  return { name: '', oldest }
}

function PlayerForm({ initial, spot, onSave, onCancel, participantTypes, classifications, formats, ageBands }) {
  const [form, setForm] = useState(initial)
  const [cameraOn, setCameraOn] = useState(false)
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))
  const formatKey = form.formatKey || (form.type === 'group' ? 'group' : form.type === 'couple' ? 'couple' : 'solo')
  const allowedTypes = participantTypes.filter((item) => !item.formatKeys?.length || item.formatKeys.includes(formatKey))

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setCameraOn(false)
  }

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
  }, [])

  useEffect(() => {
    if (cameraOn && videoRef.current && streamRef.current) videoRef.current.srcObject = streamRef.current
  }, [cameraOn])

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      streamRef.current = stream
      setCameraOn(true)
    } catch {
      setCameraOn(false)
    }
  }

  const capturePhoto = () => {
    const video = videoRef.current
    if (!video?.videoWidth) return
    const scale = Math.min(1, PHOTO_MAX_SIZE / Math.max(video.videoWidth, video.videoHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(video.videoWidth * scale)
    canvas.height = Math.round(video.videoHeight * scale)
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
    set('photo', canvas.toDataURL('image/jpeg', 0.8))
    stopCamera()
  }

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
      classificationId: '',
      feeStatus: form.feeStatus || 'pending',
      members: formatKey === 'solo'
        ? []
        : form.members
            .map((member) => ({ name: String(member.name || '').trim(), age: member.age === '' ? null : Number(member.age) }))
            .filter((member) => member.name),
    })
    stopCamera()
  }

  const placement = placedCategory(form, { classifications, ageBands, formats })

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
                members: key === 'solo' ? [] : f.members.length ? f.members : [{ name: '', age: '' }, ...(key === 'group' ? [] : [{ name: '', age: '' }])],
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
        {formatKey === 'solo' && (
          <label>
            Age
            <input
              type="number"
              min="1"
              max="120"
              value={form.age}
              onChange={(e) => set('age', e.target.value)}
              placeholder="Required to place the category"
              required
            />
          </label>
        )}
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
      <div className={`place-note ${placement.name ? 'ok' : ''}`}>
        {placement.oldest ? `Oldest listed age ${placement.oldest}. ` : 'Add each person’s age. '}
        {placement.name ? `Category: ${placement.name}` : 'Category is chosen after the age and type are set.'}
      </div>

      {formatKey !== 'solo' && (
        <div className="members">
          <span className="label">{formatKey === 'couple' ? 'Couple' : 'Group'} — name and age of each person</span>
          {form.members.map((member, i) => (
            <div className="member-row" key={i}>
              <input
                value={member.name}
                placeholder={`Person ${i + 1}`}
                onChange={(e) => set('members', form.members.map((item, j) => (j === i ? { ...item, name: e.target.value } : item)))}
              />
              <input
                type="number"
                min="1"
                max="120"
                value={member.age}
                placeholder="Age"
                onChange={(e) => set('members', form.members.map((item, j) => (j === i ? { ...item, age: e.target.value } : item)))}
              />
              <button
                type="button"
                className="icon-btn"
                onClick={() => set('members', form.members.filter((_, j) => j !== i))}
                aria-label="Remove person"
              >
                <FiX />
              </button>
            </div>
          ))}
          <button type="button" className="btn btn-ghost small" onClick={() => set('members', [...form.members, { name: '', age: '' }])}>
            <FiPlus /> Add person
          </button>
        </div>
      )}

      <label>
        Fee
        {spot && <span className="muted small">Spot registration — record whether the fee was received.</span>}
        <select className={needsAttention(form.feeStatus) ? 'alert' : ''} value={knownFee(form.feeStatus)} onChange={(e) => set('feeStatus', e.target.value)} required>
          <option value="" disabled>Choose fee</option>
          {FEE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        {needsAttention(form.feeStatus) && (
          <span className="fee-alert">{form.feeStatus === 'doubt' ? 'Doubt is flagged until it is checked.' : 'Not received is flagged until the fee is collected.'}</span>
        )}
      </label>
      <label>
        Audio track(Pendrive)
        <span className="muted small">Track whether the audio track (pendrive) was received.</span>
        <select className={needsAttention(form.pendriveStatus) ? 'alert' : ''} value={knownFee(form.pendriveStatus)} onChange={(e) => set('pendriveStatus', e.target.value)} required>
          <option value="" disabled>Choose audio track</option>
          {FEE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        {needsAttention(form.pendriveStatus) && (
          <span className="fee-alert">{form.pendriveStatus === 'doubt' ? 'Audio track doubt is flagged until it is checked.' : 'Audio track not received is flagged until it is collected.'}</span>
        )}
      </label>

      <div className="photo-tools">
        <label>
          Upload photo
          <input type="file" accept="image/*" onChange={handlePhoto} />
        </label>
        <button type="button" className="btn btn-ghost" onClick={cameraOn ? stopCamera : openCamera}>
          <FiCamera /> {cameraOn ? 'Close camera' : 'Take photo'}
        </button>
      </div>
      {cameraOn && (
        <div className="camera-box">
          <video ref={videoRef} autoPlay playsInline muted />
          <button type="button" className="btn btn-primary" onClick={capturePhoto}>Capture</button>
        </div>
      )}
      {form.photo && <img src={form.photo} alt="preview" className="photo-preview" />}

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={() => { stopCamera(); onCancel() }}>Cancel</button>
        <button className="btn btn-primary">Save</button>
      </div>
    </form>
  )
}

export default function ManagePlayers() {
  const {
    players,
    participantTypes,
    classifications,
    formats,
    ageBands,
    settings,
    addPlayer,
    updatePlayer,
    deletePlayer,
    setLivePlayer,
    setPlayerVoting,
    setPlayerArrived,
    showToast,
  } = useApp()
  const [searchParams, setSearchParams] = useSearchParams()
  const [tab, setTab] = useState(() => readParticipantType(searchParams.get('type')))
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [editing, setEditing] = useState(null)
  const [profile, setProfile] = useState(null)
  const [idNotice, setIdNotice] = useState(null)
  const [stageId, setStageId] = useState(null)

  useEffect(() => {
    setTab(readParticipantType(searchParams.get('type')))
  }, [searchParams])

  const changeTab = (key) => {
    setTab(key)
    setSearchParams(key === 'single' ? {} : { type: key })
  }

  const query = search.trim().toLowerCase()
  const list = players.filter((player) => {
    const inCategory = category === 'All' || player.category === category || player.danceStyle === category
    if (!inCategory) return false
    if (!query) return player.type === tab
    return [player.name, player.phone, player.email].some((value) => String(value || '').toLowerCase().includes(query))
  })

  const handleSave = async (form) => {
    if (!knownFee(form.feeStatus)) return showToast('Choose the fee: received, not received, or doubt', 'error')
    if (!knownFee(form.pendriveStatus)) return showToast('Choose the audio track (pendrive): received, not received, or doubt', 'error')
    const previousArrival = editing.arrivalNo || null
    const previousRegistered = editing.registeredId || null
    const previousId = editing.id
    const res = editing.id ? await updatePlayer(editing.id, form) : await addPlayer(form)
    if (!res.ok) return showToast(res.error, 'error')
    const saved = previousId ? res.players?.find((player) => player.id === previousId) : null
    showToast(editing.id ? 'Player updated' : `${form.formatKey === 'group' ? 'Group' : 'Player'} added`)
    setTab(form.type)
    setEditing(null)
    if (saved && previousRegistered && saved.registeredId && saved.registeredId !== previousRegistered) {
      setIdNotice({ kind: 'Registered ID', name: saved.name, from: previousRegistered, to: saved.registeredId, category: saved.category })
    } else if (saved && previousArrival && saved.arrivalNo && saved.arrivalNo !== previousArrival) {
      setIdNotice({ kind: 'Arrival ID', name: saved.name, from: previousArrival, to: saved.arrivalNo, category: saved.category })
    }
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
    if (!canGoLive(player)) {
      showToast(goLiveBlockedReason(player), 'error')
      return
    }
    const res = await setLivePlayer(player.id, true)
    if (!res.ok) return showToast(res.error, 'error')
    setStageId(player.id)
    showToast(`${player.name} is performing`)
  }

  const startVoting = async (player) => {
    if (settings.livePlayerId !== player.id) {
      return showToast('Go live before starting voting', 'error')
    }
    const res = await setPlayerVoting(player.id, true)
    if (!res.ok) return showToast(res.error, 'error')
    setStageId(player.id)
    showToast('Voting started')
  }

  const markArrived = async (player) => {
    const res = await setPlayerArrived(player.id, !player.arrived)
    if (!res.ok) return showToast(res.error, 'error')
    showToast(player.arrived ? `${player.name} marked not arrived. Arrival ID removed.` : `${player.name} arrived`)
  }

  const changeFee = async (player, feeStatus) => {
    if (!knownFee(feeStatus) || feeStatus === player.feeStatus) return
    const res = await updatePlayer(player.id, {
      ...player,
      feeStatus,
      members: asPeople(player.members),
    })
    if (!res.ok) return showToast(res.error, 'error')
    showToast(feeStatus === 'received' ? 'Fee received' : feeStatus === 'doubt' ? 'Fee marked as doubt' : 'Fee marked as not received')
  }

  const changePendrive = async (player, pendriveStatus) => {
    if (!knownFee(pendriveStatus) || pendriveStatus === player.pendriveStatus) return
    const res = await updatePlayer(player.id, {
      ...player,
      pendriveStatus,
      members: asPeople(player.members),
    })
    if (!res.ok) return showToast(res.error, 'error')
    showToast(pendriveStatus === 'received' ? 'Audio track received' : pendriveStatus === 'doubt' ? 'Audio track marked as doubt' : 'Audio track marked as not received')
  }

  const openEdit = (player) => {
    const formatKey = player.formatKey || (player.type === 'group' ? 'group' : player.type === 'couple' ? 'couple' : 'solo')
    const people = asPeople(player.members)
    setEditing({
      ...player,
      formatKey,
      danceStyle: player.danceStyle || player.category,
      age: player.age ?? '',
      participantTypeId: player.participantTypeId || '',
      classificationId: player.classificationId || '',
      feeStatus: knownFee(player.feeStatus),
      pendriveStatus: knownFee(player.pendriveStatus),
      members: formatKey === 'solo' ? [] : people.length ? people : [{ name: '', age: '' }, { name: '', age: '' }],
    })
  }

  const stagePlayer = players.find((player) => player.id === stageId)
  const openProfile = profile ? players.find((player) => player.id === profile.id) || profile : null

  return (
    <div className="stack">
      <div className="toolbar">
        <div className="tabs">
          {FORMAT_TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} className={`tab ${tab === key ? 'active' : ''}`} onClick={() => changeTab(key)}>
              <Icon /> {label} ({players.filter((p) => p.type === key).length})
            </button>
          ))}
        </div>
        <label className="input-icon search">
          <FiSearch />
          <input placeholder="Name, mobile, or email" value={search} onChange={(e) => setSearch(e.target.value)} />
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
        Excel imports are marked Fee received. Spot registration asks for the fee and the audio track (pendrive). Not received and Doubt stay highlighted in red. Registered ID uses the category prefix (SK01, SY01, SA01). Arrived issues Arrival ID (S1, C1, G1). Go live needs Arrived and track received. After Go live the performer is on stage. Click Voting started before judges and audience can put marks.
        {query ? ' Showing matches from every format.' : ''}
      </p>

      {list.length ? (
        <div className="panel glass desk-list">
          <table className="table">
            <thead>
              <tr>
                <th>Participant</th>
                <th>Category</th>
                <th>Contact</th>
                <th>Fee</th>
                <th>Audio track(Pendrive)</th>
                <th>Registered ID</th>
                <th>Arrival ID</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.map((player) => {
                const fee = knownFee(player.feeStatus)
                const pendrive = knownFee(player.pendriveStatus)
                const alert = needsAttention(player.feeStatus) || needsAttention(player.pendriveStatus) || !pendrive
                const typeName = participantTypes.find((item) => item.id === player.participantTypeId)?.name
                return (
                  <tr key={player.id} className={`${settings.livePlayerId === player.id ? 'is-live-row' : ''} ${alert ? 'is-alert-row' : ''}`}>
                    <td>
                      <button type="button" className="who" onClick={() => setProfile(player)}>
                        <img src={playerPhoto(player)} alt="" />
                        <span>
                          <strong>{player.name}</strong>
                          <span className="muted small">{registeredId(player)}{typeName ? ` · ${typeName}` : ''}{player.age != null ? ` · Age ${player.age}` : ''}</span>
                        </span>
                      </button>
                    </td>
                    <td>{player.category}</td>
                    <td className="muted small">{[player.phone, player.email].filter(Boolean).join(' · ') || '—'}</td>
                    <td>
                      <select
                        className={`fee-select ${needsAttention(fee) ? 'alert' : fee || 'pending'}`}
                        value={fee}
                        onChange={(e) => changeFee(player, e.target.value)}
                        aria-label={`Fee for ${player.name}`}
                      >
                        {!fee && <option value="">Update fee</option>}
                        {FEE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        className={`fee-select ${needsAttention(pendrive) || !pendrive ? 'alert' : pendrive}`}
                        value={pendrive}
                        onChange={(e) => changePendrive(player, e.target.value)}
                        aria-label={`Audio track for ${player.name}`}
                      >
                        {!pendrive && <option value="">Update audio track</option>}
                        {FEE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </td>
                    <td>{player.registeredId ? <span className="desk-pill id">{player.registeredId}</span> : '—'}</td>
                    <td>{player.arrivalNo ? <span className="desk-pill id">{player.arrivalNo}</span> : '—'}</td>
                    <td className="actions">
                      <button className={`btn small ${player.arrived ? 'btn-arrived' : 'btn-ghost'}`} onClick={() => markArrived(player)}>
                        Arrived
                      </button>
                      <button className="btn btn-ghost small" onClick={() => setProfile(player)}><FiEye /> View</button>
                      <button
                        className={`btn small ${settings.livePlayerId === player.id ? 'btn-live' : 'btn-ghost'}${settings.livePlayerId !== player.id && !canGoLive(player) ? ' is-locked' : ''}`}
                        disabled={settings.livePlayerId !== player.id && !canGoLive(player)}
                        title={settings.livePlayerId === player.id || canGoLive(player) ? undefined : goLiveBlockedReason(player)}
                        onClick={() => goLive(player)}
                      >
                        <FiRadio /> {settings.livePlayerId === player.id ? 'On stage' : 'Go live'}
                      </button>
                      {settings.livePlayerId === player.id && !isVotingOpen(settings, player) && (
                        <button className="btn btn-primary small" onClick={() => startVoting(player)}>
                          Voting started
                        </button>
                      )}
                      {isVotingOpen(settings, player) && <span className="desk-pill received">Voting</span>}
                      <button className="btn btn-ghost small" onClick={() => openEdit(player)}><FiEdit2 /> Edit</button>
                      <button className="btn btn-danger small" onClick={() => handleDelete(player)}><FiTrash2 /></button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty glass">No {tab === 'group' ? 'groups' : tab === 'couple' ? 'couples' : 'players'} found.</div>
      )}

      {editing && (
        <Modal
          wide
          title={editing.id ? 'Edit entry' : `Add ${editing.type === 'group' ? 'Group' : editing.type === 'couple' ? 'Couple' : 'Player'}`}
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
              members: asPeople(editing.members),
              photo: editing.photo,
              email: editing.email || '',
              phone: editing.phone || '',
              club: editing.club || '',
              feeStatus: knownFee(editing.feeStatus),
              pendriveStatus: knownFee(editing.pendriveStatus),
            }}
            participantTypes={participantTypes}
            classifications={classifications}
            formats={formats}
            ageBands={ageBands}
            spot={!editing.id}
            onSave={handleSave}
            onCancel={() => setEditing(null)}
          />
        </Modal>
      )}

      {openProfile && (
        <Modal title={openProfile.name} onClose={() => setProfile(null)} wide>
          <div className="profile-layout">
            <img src={playerPhoto(openProfile)} alt={openProfile.name} />
            <div className="stack">
              <div className="desk-pills">
                <span className="desk-pill ok">Registered</span>
                <span className={`desk-pill ${needsAttention(openProfile.feeStatus) ? 'alert' : (knownFee(openProfile.feeStatus) || 'pending')}`}>
                  Fee {FEE_OPTIONS.find((item) => item.value === openProfile.feeStatus)?.label || 'Update'}
                </span>
                <span className={`desk-pill ${needsAttention(openProfile.pendriveStatus) || !knownFee(openProfile.pendriveStatus) ? 'alert' : 'received'}`}>
                  Audio track {FEE_OPTIONS.find((item) => item.value === openProfile.pendriveStatus)?.label || 'Update'}
                </span>
                <span className={`desk-pill ${openProfile.arrived ? 'received' : 'pending'}`}>{openProfile.arrived ? 'Arrived' : 'Not arrived'}</span>
                {openProfile.registeredId && <span className="desk-pill id">Reg {openProfile.registeredId}</span>}
                {openProfile.arrivalNo && <span className="desk-pill id">Arr {openProfile.arrivalNo}</span>}
                {settings.livePlayerId === openProfile.id && <span className="desk-pill alert">{isVotingOpen(settings, openProfile) ? 'Voting' : 'Performing'}</span>}
              </div>
              <p><strong>Category.</strong> {openProfile.category}{openProfile.age != null ? ` · Age ${openProfile.age}` : ''}</p>
              <p><strong>Type.</strong> {participantTypes.find((item) => item.id === openProfile.participantTypeId)?.name || '—'}</p>
              <p><strong>Dance.</strong> {openProfile.danceStyle || '—'}</p>
              <p><strong>Phone.</strong> {openProfile.phone || '—'}</p>
              <p><strong>Email.</strong> {openProfile.email || '—'}</p>
              <p><strong>Club.</strong> {openProfile.club || '—'}</p>
              {openProfile.members?.length > 0 && (
                <p><strong>People.</strong> {openProfile.members.map(memberLabel).join(', ')}</p>
              )}
              <label>
                Fee
                <select
                  className={`fee-select ${openProfile.feeStatus === 'not_received' || openProfile.feeStatus === 'doubt' ? 'alert' : knownFee(openProfile.feeStatus)}`}
                  value={knownFee(openProfile.feeStatus)}
                  onChange={(e) => changeFee(openProfile, e.target.value)}
                >
                  {!knownFee(openProfile.feeStatus) && <option value="">Update fee</option>}
                  {FEE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                {needsAttention(openProfile.feeStatus) && (
                  <span className="fee-alert">This fee needs attention.</span>
                )}
              </label>
              <label>
                Audio track(Pendrive)
                <select
                  className={`fee-select ${needsAttention(openProfile.pendriveStatus) || !knownFee(openProfile.pendriveStatus) ? 'alert' : knownFee(openProfile.pendriveStatus)}`}
                  value={knownFee(openProfile.pendriveStatus)}
                  onChange={(e) => changePendrive(openProfile, e.target.value)}
                >
                  {!knownFee(openProfile.pendriveStatus) && <option value="">Update audio track</option>}
                  {FEE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                {(needsAttention(openProfile.pendriveStatus) || !knownFee(openProfile.pendriveStatus)) && (
                  <span className="fee-alert">This audio track needs attention.</span>
                )}
              </label>
              <div className="form-actions">
                <button type="button" className={`btn ${openProfile.arrived ? 'btn-arrived' : 'btn-ghost'}`} onClick={() => markArrived(openProfile)}>
                  Arrived
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => { setProfile(null); openEdit(openProfile) }}>Edit</button>
                <button
                  type="button"
                  className={`btn btn-primary${settings.livePlayerId !== openProfile.id && !canGoLive(openProfile) ? ' is-locked' : ''}`}
                  disabled={settings.livePlayerId !== openProfile.id && !canGoLive(openProfile)}
                  title={settings.livePlayerId === openProfile.id || canGoLive(openProfile) ? undefined : goLiveBlockedReason(openProfile)}
                  onClick={() => { setProfile(null); goLive(openProfile) }}
                >
                  {settings.livePlayerId === openProfile.id ? 'On stage' : 'Go live'}
                </button>
                {settings.livePlayerId === openProfile.id && !isVotingOpen(settings, openProfile) && (
                  <button type="button" className="btn btn-primary" onClick={() => { setProfile(null); startVoting(openProfile) }}>
                    Voting started
                  </button>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {idNotice && (
        <Modal title={`${idNotice.kind || 'ID'} updated`} onClose={() => setIdNotice(null)}>
          <div className="stack">
            <p>{idNotice.name} is now in <strong>{idNotice.category}</strong>.</p>
            <p className="muted">The previous ID {idNotice.from} is replaced because this entry moved category or format.</p>
            <p className="id-hero">{idNotice.to}</p>
            <div className="form-actions">
              <button type="button" className="btn btn-primary" onClick={() => setIdNotice(null)}>Done</button>
            </div>
          </div>
        </Modal>
      )}

      {stagePlayer && settings.livePlayerId === stagePlayer.id && (
        <StagePopup player={stagePlayer} mode="admin" onClose={() => setStageId(null)} />
      )}
    </div>
  )
}
