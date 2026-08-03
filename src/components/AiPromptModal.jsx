import { useEffect, useState } from 'react'

export function AiPromptModal({ prompt, onClose, onSave }) {
  const [mode, setMode] = useState('view')
  const [draft, setDraft] = useState(prompt)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setDraft(prompt)
  }, [prompt])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  const startEdit = () => {
    setDraft(prompt)
    setMode('edit')
  }

  const cancelEdit = () => {
    setDraft(prompt)
    setMode('view')
  }

  const saveEdit = () => {
    onSave(draft)
    setMode('view')
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="关闭">
          ×
        </button>

        <h2 className="prompt-modal-title">AI 提取 Prompt</h2>

        {mode === 'view' ? (
          <>
            <pre className="prompt-text">{prompt}</pre>
            <div className="modal-actions">
              <button type="button" className="btn-outline" onClick={startEdit}>
                修改
              </button>
              <button type="button" className="btn-solid" onClick={handleCopy}>
                {copied ? '已复制' : '复制'}
              </button>
            </div>
          </>
        ) : (
          <>
            <textarea
              className="prompt-edit-area"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={16}
              autoFocus
            />
            <div className="modal-actions">
              <button type="button" className="btn-outline" onClick={cancelEdit}>
                取消
              </button>
              <button type="button" className="btn-solid" onClick={saveEdit}>
                保存
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
