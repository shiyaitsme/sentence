function tagVariant(tag) {
  let hash = 0
  for (let i = 0; i < tag.length; i += 1) {
    hash = (hash + tag.charCodeAt(i)) % 2
  }
  return hash === 0 ? 'accent' : 'neutral'
}

export function ExcerptCard({ excerpt, onOpen, onEdit, onDelete }) {
  const category = excerpt.tags?.[0]

  return (
    <article className="wf-card" onClick={() => onOpen(excerpt)}>
      <div className="wf-card-actions">
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

      <div className="wf-content">{excerpt.content}</div>

      {excerpt.note && <div className="wf-note">{excerpt.note}</div>}

      <div className="wf-footer">
        <span className="wf-source">
          {[excerpt.source, excerpt.author].filter(Boolean).join(' · ') || '出处未记'}
        </span>
        {category && <span className={`card-tag card-tag--${tagVariant(category)}`}>{category}</span>}
      </div>
    </article>
  )
}
