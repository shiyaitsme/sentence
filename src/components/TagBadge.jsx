export function TagBadge({ tag, count, active, onClick }) {
  const Tag = onClick ? 'button' : 'span'
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      className={`tag-badge${active ? ' active' : ''}`}
      onClick={onClick}
    >
      {tag}
      {typeof count === 'number' && <span className="count">· {count}</span>}
    </Tag>
  )
}
