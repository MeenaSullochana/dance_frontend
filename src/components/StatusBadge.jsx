const LABELS = {
  pending: 'Pending',
  judged: 'In Judging',
  qualified: 'Qualified',
  rejected: 'Not Qualified',
  winner: 'Winner',
}

export default function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{status === 'winner' && '🏆 '}{LABELS[status] || status}</span>
}
