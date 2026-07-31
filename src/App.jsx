import { useMemo, useState } from 'react'
import { HomePage } from './components/HomePage'
import { ExcerptListPage } from './components/ExcerptListPage'
import { RecordPage } from './components/RecordPage'
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
  const [view, setView] = useState('home') // 'home' | 'list' | 'record'
  const [search, setSearch] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [editingExcerpt, setEditingExcerpt] = useState(null) // null = new
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

  const handleNavigate = (nextView) => {
    if (nextView === 'record') {
      setEditingExcerpt(null)
    }
    setView(nextView)
  }

  const startEdit = (excerpt) => {
    setDetailExcerpt(null)
    setEditingExcerpt(excerpt)
    setView('record')
  }

  const handleSave = async (data) => {
    if (editingExcerpt) {
      await updateExcerpt(editingExcerpt.id, data)
    } else {
      await addExcerpt(data)
    }
    setEditingExcerpt(null)
    setView('list')
  }

  const handleDelete = async (excerpt) => {
    if (!window.confirm('确定要删除这条摘录吗？此操作无法撤销。')) return
    await deleteExcerpt(excerpt.id)
    setDetailExcerpt(null)
    if (editingExcerpt?.id === excerpt.id) {
      setEditingExcerpt(null)
      setView('list')
    }
  }

  return (
    <div className="app-shell">
      {view === 'home' && (
        <HomePage excerpts={excerpts} tagCounts={tagCounts} onNavigate={handleNavigate} />
      )}

      {view === 'list' && (
        <ExcerptListPage
          filtered={filtered}
          total={excerpts.length}
          hasFilters={hasFilters}
          tagCounts={tagCounts}
          selectedTags={selectedTags}
          search={search}
          onSearchChange={setSearch}
          onToggleTag={toggleTag}
          onClearTags={() => setSelectedTags([])}
          onNavigate={handleNavigate}
          onOpen={setDetailExcerpt}
          onEdit={startEdit}
          onDelete={handleDelete}
          loading={loading}
          error={error}
        />
      )}

      {view === 'record' && (
        <RecordPage
          initial={editingExcerpt}
          onSave={handleSave}
          onCancel={() => setView('list')}
          onNavigate={handleNavigate}
        />
      )}

      {detailExcerpt && (
        <ExcerptDetail
          excerpt={detailExcerpt}
          onClose={() => setDetailExcerpt(null)}
          onEdit={startEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}

export default App
