import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="not-found">
      <h1 className="gradient-text">404</h1>
      <p className="muted">This page danced away.</p>
      <Link to="/" className="btn btn-primary">Go home</Link>
    </div>
  )
}
