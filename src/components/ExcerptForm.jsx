import { useState } from 'react'

export function ExcerptForm({ initial, onSave, onClose }) {
  const isEdit = Boolean(initial)
  const [content, setContent] = useState(initial?.content ?? '')
  const [source, setSource] = useState(initial?.source ?? '')
  const [tagsInput, setTagsInput] = useState(initial?.tags?.join(', ') ?? '')
  const [note, setNote] = useState(initial?.note ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!content.trim()) {
      setError('正文不能为空')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSave({ content, source, tagsInput, note })
    } catch (err) {
      setError(err.message || '保存失败，请重试')
      setSaving(false)
    }
  }

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
        <h2>{isEdit ? '修改摘录' : '记一笔'}</h2>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="content">正文 *</label>
            <textarea
              id="content"
              rows={5}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="摘录的文字…"
              autoFocus
            />
          </div>

          <div className="field">
            <label htmlFor="source">出处</label>
            <input
              id="source"
              type="text"
              value={source}
              onChange={(event) => setSource(event.target.value)}
              placeholder="书名 / 作者 / 链接"
            />
          </div>

          <div className="field">
            <label htmlFor="tags">标签</label>
            <input
              id="tags"
              type="text"
              value={tagsInput}
              onChange={(event) => setTagsInput(event.target.value)}
              placeholder="韩国, 19世纪, 诗"
            />
            <span className="hint">用逗号或空格分隔，任意维度都行</span>
          </div>

          <div className="field">
            <label htmlFor="note">批注</label>
            <textarea
              id="note"
              rows={3}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="当时的想法…"
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              取消
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? '保存中…' : isEdit ? '保存修改' : '收入摘抄本'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
