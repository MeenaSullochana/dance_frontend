import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiUpload, FiFileText, FiCheckCircle, FiDownload } from 'react-icons/fi'
import { useApp } from '../../context/AppContext'

const SAMPLE_EXCEL = '/DOD-Season-14-Registrations.xlsx'

export default function ImportRegistrations() {
  const { previewGoogleForm, importGoogleForm, showToast } = useApp()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)

  const onFile = (e) => {
    const next = e.target.files?.[0] || null
    setFile(next)
    setPreview(null)
  }

  const runPreview = async () => {
    if (!file) return showToast('Choose an Excel or CSV file first', 'error')
    setLoading(true)
    const res = await previewGoogleForm(file)
    setLoading(false)
    if (!res.ok) return showToast(res.error, 'error')
    setPreview(res.data)
    showToast(`Preview ready · ${res.data.summary.ready} rows can import`)
  }

  const runImport = async () => {
    if (!file) return
    if (!window.confirm(`Import ${preview?.summary?.ready || 0} valid rows into Players?`)) return
    setLoading(true)
    const res = await importGoogleForm(file)
    setLoading(false)
    if (!res.ok) return showToast(res.error, 'error')
    showToast(`Imported ${res.importResult.imported} players`)
    setPreview(null)
    setFile(null)
  }

  return (
    <div className="stack">
      <div className="banner glass">
        <span>
          Upload Google Form response files (Excel/CSV). Map Age + Participant Type + Solo/Couple/Group to your{' '}
          <Link to="/admin/classifications" className="link-btn">dynamic classifications</Link>.
          Add an <strong>Age</strong> column in the form for automatic age-band matching.
        </span>
        <a className="btn btn-primary" href={SAMPLE_EXCEL} download="DOD-Season-14-Registrations.xlsx">
          <FiDownload /> Download sample Excel
        </a>
      </div>

      <div className="panel glass">
        <h2><FiUpload /> Upload responses</h2>
        <p className="muted">
          Expected columns: Email, Participant Name, Contact Number, Rotary Club Name, Participant Type,
          Category of Dance, Number of People Dancing, Names of Other Participants, Dance Style / Genre, Age.
          Solo uses age. Couple uses the oldest age. Group uses participant type (Rotaractor, Ann, Annette, DPL, Mixed), not age.
          Rows with a category get a Registered ID from that prefix (SK01, SY02). If age is added later in Edit, the category and ID update only when the category changes.
        </p>
        <div className="import-box">
          <a className="sample-download glass" href={SAMPLE_EXCEL} download="DOD-Season-14-Registrations.xlsx">
            <FiDownload />
            <div>
              <strong>Download sample Excel</strong>
              <span className="muted small block">Full Season 14 response sheet — Solo/Couple/Group, Age, and participant types</span>
            </div>
          </a>
          <label className="file-drop">
            <FiFileText />
            <span>{file ? file.name : 'Choose .xlsx, .xls or .csv'}</span>
            <input type="file" accept=".xlsx,.xls,.csv" onChange={onFile} />
          </label>
          <div className="row">
            <button className="btn btn-ghost" disabled={!file || loading} onClick={runPreview}>
              Preview
            </button>
            <button className="btn btn-primary" disabled={!preview?.summary?.ready || loading} onClick={runImport}>
              <FiCheckCircle /> Import {preview?.summary?.ready || 0} rows
            </button>
          </div>
        </div>
      </div>

      {preview && (
        <>
          <div className="stat-grid">
            <div className="stat-card glass stat-pink">
              <div><strong>{preview.summary.total}</strong><span className="muted">Rows found</span></div>
            </div>
            <div className="stat-card glass stat-green">
              <div><strong>{preview.summary.ready}</strong><span className="muted">Ready to import</span></div>
            </div>
            <div className="stat-card glass stat-orange">
              <div><strong>{preview.summary.withClassification}</strong><span className="muted">Auto classified</span></div>
            </div>
            <div className="stat-card glass stat-purple">
              <div><strong>{preview.summary.warnings}</strong><span className="muted">With warnings</span></div>
            </div>
          </div>

          <div className="panel glass">
            <h2>Preview</h2>
            <table className="table">
              <thead>
                <tr>
                  <th>Row</th>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Type</th>
                  <th>Format</th>
                  <th>Classification</th>
                  <th>Registered ID</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {preview.rows.map((row) => (
                  <tr key={row.row}>
                    <td>{row.row}</td>
                    <td>
                      <strong>{row.name || '-'}</strong>
                      <span className="muted small block">{row.club || row.email}</span>
                    </td>
                    <td>{row.age ?? <span className="muted">-</span>}</td>
                    <td>{row.participantType || '-'}</td>
                    <td>{row.format || '-'}</td>
                    <td>{row.classification || <span className="muted">Unmatched</span>}</td>
                    <td>{row.registeredId || <span className="muted">—</span>}</td>
                    <td>
                      {row.ok ? (
                        <span className="badge badge-qualified">Ready</span>
                      ) : (
                        <span className="badge badge-rejected">Skip</span>
                      )}
                      {row.warnings[0] && <span className="muted small block">{row.warnings[0]}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
