import { useState } from 'react'
import { NavBar } from './NavBar'
import { splitTags } from '../lib/format'

export function RecordPage({ initial, onSave, onCancel, onNavigate }) {
  const isEdit = Boolean(initial)
  const [content, setContent] = useState(initial?.content ?? '')
  const [source, setSource] = useState(initial?.source ?? '')
  const [note, setNote] = useState(initial?.note ?? '')
  const [tags, setTags] = useState(initial?.tags ?? [])
  const [tagDraft, setTagDraft] = useState('')
  const [addingTag, setAddingTag] = useState(false)
  const [preview, setPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const commitTagDraft = () => {
    const next = splitTags(tagDraft)
    if (next.length > 0) {
      setTags((prev) => Array.from(new Set([...prev, ...next])))
    }
    setTagDraft('')
    setAddingTag(false)
  }

  const removeTag = (tag) => {
    setTags((prev) => prev.filter((item) => item !== tag))
  }

  const handleFile = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!content.trim()) {
      setError('正文不能为空')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSave({ content, source, tagsInput: tags.join(', '), note })
    } catch (err) {
      setError(err.message || '保存失败，请重试')
      setSaving(false)
    }
  }

  return (
    <section className="record-page">
      <NavBar current="record" onNavigate={onNavigate} variant="plain" />

      <div className="record-head">
        <h1 className="record-title">{isEdit ? '修改摘录' : '记录'}</h1>
        <p className="record-subtitle">
          {isEdit ? '调整这一段的文字与标签' : '写下此刻值得留住的句子'}
        </p>
      </div>

      <form className="record-body" onSubmit={handleSubmit}>
        <div className="record-form">
          <div className="field">
            <label htmlFor="content">原文内容 *</label>
            <textarea
              id="content"
              className="content-area"
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
              placeholder="如《渡口》· 林之遥"
            />
          </div>

          <div className="field">
            <label htmlFor="note">个人感想 / 批注</label>
            <textarea
              id="note"
              rows={3}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="当时的想法…"
            />
          </div>

          <div className="field">
            <label>标签</label>
            <div className="tag-editor">
              {tags.map((tag) => (
                <span key={tag} className="tag-chip">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} aria-label={`移除标签 ${tag}`}>
                    ×
                  </button>
                </span>
              ))}
              {addingTag ? (
                <input
                  className="tag-draft-input"
                  autoFocus
                  value={tagDraft}
                  onChange={(event) => setTagDraft(event.target.value)}
                  onBlur={commitTagDraft}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      commitTagDraft()
                    }
                  }}
                  placeholder="输入标签，回车确认"
                />
              ) : (
                <button type="button" className="tag-add-btn" onClick={() => setAddingTag(true)}>
                  + 添加标签
                </button>
              )}
            </div>
          </div>

          {error && <p className="form-error">{error}</p>}

          <div className="record-actions">
            <button type="button" className="btn-outline" onClick={onCancel}>
              取消
            </button>
            <button type="submit" className="btn-solid" disabled={saving}>
              {saving ? '保存中…' : isEdit ? '保存修改' : '保存摘抄'}
            </button>
          </div>
        </div>

        <div className="record-upload">
          <label className="upload-box">
            <input type="file" accept="image/*" onChange={handleFile} hidden />
            {preview ? (
              <img src={preview} alt="预览" className="upload-preview" />
            ) : (
              <span className="upload-hint">
                点击上传配图
                <br />
                （可选，仅本设备预览）
              </span>
            )}
          </label>
        </div>
      </form>
    </section>
  )
}
