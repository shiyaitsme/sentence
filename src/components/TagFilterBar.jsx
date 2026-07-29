import { TagBadge } from './TagBadge'

export function TagFilterBar({ tagCounts, selectedTags, onToggle, onClear }) {
  if (tagCounts.length === 0) return null

  return (
    <div className="tag-filter-bar">
      <span className="label">标签</span>
      {tagCounts.map(([tag, count]) => (
        <TagBadge
          key={tag}
          tag={tag}
          count={count}
          active={selectedTags.includes(tag)}
          onClick={() => onToggle(tag)}
        />
      ))}
      {selectedTags.length > 0 && (
        <button
          type="button"
          className="tag-badge"
          style={{ borderStyle: 'dashed', cursor: 'pointer' }}
          onClick={onClear}
        >
          清除筛选 ×
        </button>
      )}
    </div>
  )
}
