import { useEffect, useRef, useState } from 'react'
import { NavBar } from './NavBar'
import { AiPromptModal } from './AiPromptModal'
import { splitTags } from '../lib/format'

const AI_PROMPT_STORAGE_KEY = 'sentence:ai-prompt'

const DEFAULT_AI_PROMPT = `按我的「sentence」摘抄本格式提取这张图里的内容，直接给我可粘贴的字段：

【原文内容】
- 若为外文，先给原文，再给中文译文（两行并列）
- 图里的译文若有偏差或丢失了原意，指出来并给你的版本，不要沿用错译
- 只保留正文，去掉图片的标题、水印、营销语

【出处】
格式：《作品名》。若图中未标或标错，你来补全或纠正；确实查不到就写"待考"，不要编

【作者】
若图中未标或标错，你来补全或纠正；确实查不到就写"待考"，不要编

【个人感想 / 批注】
不要替我写感受。给我两三句写作/阅读背景：创作时间、处境、关键词的语感或典故——能让我自己想出批注的那种材料

【标签】
3-5 个，中文，从体裁 / 母题 / 作者 / 语言文化圈里选

最后附一句：这段值不值得收，或者有没有更好的同源版本。
不要客套，不要总结我的需求，直接出字段。`

function loadStoredPrompt() {
  try {
    return localStorage.getItem(AI_PROMPT_STORAGE_KEY) ?? DEFAULT_AI_PROMPT
  } catch {
    return DEFAULT_AI_PROMPT
  }
}

export function RecordPage({ initial, onSave, onCancel, onNavigate }) {
  const isEdit = Boolean(initial)
  const [content, setContent] = useState(initial?.content ?? '')
  const [source, setSource] = useState(initial?.source ?? '')
  const [author, setAuthor] = useState(initial?.author ?? '')
  const [note, setNote] = useState(initial?.note ?? '')
  const noteRef = useRef(null)
  const [tags, setTags] = useState(initial?.tags ?? [])
  const [tagDraft, setTagDraft] = useState('')
  const [addingTag, setAddingTag] = useState(false)
  const [preview, setPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [aiPrompt, setAiPrompt] = useState(loadStoredPrompt)
  const [promptModalOpen, setPromptModalOpen] = useState(false)

  const saveAiPrompt = (next) => {
    setAiPrompt(next)
    try {
      localStorage.setItem(AI_PROMPT_STORAGE_KEY, next)
    } catch {
      /* localStorage unavailable (e.g. private mode) — keep the in-memory value only */
    }
  }

  useEffect(() => {
    const el = noteRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [note])

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
      await onSave({ content, source, author, tagsInput: tags.join(', '), note })
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
        <div className="record-fields-top">
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
            <label htmlFor="author">作者</label>
            <input
              id="author"
              type="text"
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
              placeholder="如 林之遥"
            />
          </div>

          <div className="field">
            <label htmlFor="note">个人感想 / 批注</label>
            <textarea
              id="note"
              ref={noteRef}
              className="autosize"
              rows={3}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="当时的想法…"
            />
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

        <div className="field record-tags-field">
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

        <div className="record-prompt-row">
          <button type="button" className="ai-prompt-pill" onClick={() => setPromptModalOpen(true)}>
            AI 提取 Prompt
          </button>
        </div>

        <div className="record-bottom-actions">
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
      </form>

      {promptModalOpen && (
        <AiPromptModal
          prompt={aiPrompt}
          onClose={() => setPromptModalOpen(false)}
          onSave={saveAiPrompt}
        />
      )}
    </section>
  )
}
