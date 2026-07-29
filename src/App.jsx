import { useMemo, useState } from 'react'
import { Header } from './components/Header'
import { SearchBar } from './components/SearchBar'
import { TagFilterBar } from './components/TagFilterBar'
import { ExcerptList } from './components/ExcerptList'
import { ExcerptForm } from './components/ExcerptForm'
import { ExcerptDetail } from './components/ExcerptDetail'
import { useExcerpts } from './hooks/useExcerpts'

function matchesSearch(excerpt, query) {
  if (!query) return true
  const haystack = [excerpt.content, excerpt.source, excerpt.note, ...(excerpt.tags ?? [])]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return haystack.includes(query.toLowerCase())
}

function App() {
  const { excerpts, loading, error, addExcerpt, updateExcerpt, deleteExcerpt } = useExcerpts()
  const [search, setSearch] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [formState, setFormState] = useState(null) // null | 'new' | excerpt object (edit)
  const [detailExcerpt, setDetailExcerpt] = useState(null)

  const tagCounts = useMemo(() => {
    const counts = new Map()
    for (const excerpt of excerpts) {
      for (const tag of excerpt.tags ?? []) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1)
      }
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  }, [excerpts])

  const filtered = useMemo(() => {
    return excerpts.filter((excerpt) => {
      if (!matchesSearch(excerpt, search)) return false
      if (selectedTags.length > 0) {
        const tags = excerpt.tags ?? []
        if (!selectedTags.every((tag) => tags.includes(tag))) return false
      }
      return true
    })
  }, [excerpts, search, selectedTags])

  const hasFilters = Boolean(search) || selectedTags.length > 0

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag],
    )
  }

  const handleSave = async (data) => {
    if (formState && formState !== 'new') {
      await updateExcerpt(formState.id, data)
    } else {
      await addExcerpt(data)
    }
    setFormState(null)
  }

  const handleDelete = async (excerpt) => {
    if (!window.confirm('确定要删除这条摘录吗？此操作无法撤销。')) return
    await deleteExcerpt(excerpt.id)
    setDetailExcerpt(null)
    setFormState(null)
  }

  return (
    <div className="app-shell">
      <Header />

      {error && (
        <div className="error-banner">
          数据加载出错：{error}
          {import.meta.env.DEV && (
            <>
              。本地开发要用 <code>npx wrangler pages dev</code>（而不是 <code>npm run dev</code>）才能连上本地 D1 数据库。
            </>
          )}
        </div>
      )}

      <SearchBar value={search} onChange={setSearch} onAdd={() => setFormState('new')} />

      <TagFilterBar
        tagCounts={tagCounts}
        selectedTags={selectedTags}
        onToggle={toggleTag}
        onClear={() => setSelectedTags([])}
      />

      {loading ? (
        <p className="loading-text">正在打开摘抄本…</p>
      ) : (
        <ExcerptList
          excerpts={filtered}
          total={excerpts.length}
          hasFilters={hasFilters}
          onOpen={setDetailExcerpt}
          onEdit={(excerpt) => {
            setDetailExcerpt(null)
            setFormState(excerpt)
          }}
          onDelete={handleDelete}
        />
      )}

      {formState && (
        <ExcerptForm
          initial={formState === 'new' ? null : formState}
          onSave={handleSave}
          onClose={() => setFormState(null)}
        />
      )}

      {detailExcerpt && (
        <ExcerptDetail
          excerpt={detailExcerpt}
          onClose={() => setDetailExcerpt(null)}
          onEdit={(excerpt) => {
            setDetailExcerpt(null)
            setFormState(excerpt)
          }}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}

export default App
