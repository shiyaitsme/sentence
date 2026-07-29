import { TagBadge } from './TagBadge'
import { formatDate } from '../lib/format'

export function ExcerptDetail({ excerpt, onClose, onEdit, onDelete }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <span className="corner tl" />
        <span className="corner tr" />
        <span className="corner bl" />
        <span className="corner br" />
        <button type="button" className="modal-close" onClick={onClose} aria-label="关闭">
          ×
        </button>

        <div className="detail-content">{excerpt.content}</div>

        <div className="detail-meta">
          {excerpt.source && <div>出处：{excerpt.source}</div>}
          <div>记于 {formatDate(excerpt.created_at)}</div>
        </div>

        {excerpt.note && <div className="detail-note">{excerpt.note}</div>}

        {excerpt.tags?.length > 0 && (
          <div className="detail-tags">
            {excerpt.tags.map((tag) => (
              <TagBadge key={tag} tag={tag} />
            ))}
          </div>
        )}

        <div className="modal-actions">
          <button type="button" className="btn-danger" onClick={() => onDelete(excerpt)}>
            删除
          </button>
          <button type="button" className="btn-primary" onClick={() => onEdit(excerpt)}>
            编辑
          </button>
        </div>
      </div>
    </div>
  )
}
