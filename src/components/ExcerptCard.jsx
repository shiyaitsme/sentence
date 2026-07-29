import { TagBadge } from './TagBadge'
import { formatDate } from '../lib/format'

export function ExcerptCard({ excerpt, onOpen, onEdit, onDelete }) {
  return (
    <article className="frame-card" onClick={() => onOpen(excerpt)}>
      <span className="corner tl" />
      <span className="corner tr" />
      <span className="corner bl" />
      <span className="corner br" />

      <div className="card-actions">
        <button
          type="button"
          className="icon-btn"
          title="编辑"
          onClick={(event) => {
            event.stopPropagation()
            onEdit(excerpt)
          }}
        >
          ✎
        </button>
        <button
          type="button"
          className="icon-btn"
          title="删除"
          onClick={(event) => {
            event.stopPropagation()
            onDelete(excerpt)
          }}
        >
          ×
        </button>
      </div>

      <div className="content">{excerpt.content}</div>

      <div className="meta-row">
        <span className="source">{excerpt.source || '出处未记'}</span>
        <span>{formatDate(excerpt.created_at)}</span>
      </div>

      {excerpt.tags?.length > 0 && (
        <div className="tag-row">
          {excerpt.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      )}
    </article>
  )
}
