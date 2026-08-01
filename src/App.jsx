import { useMemo, useState } from 'react'
import { HomePage } from './components/HomePage'
import { ExcerptListPage } from './components/ExcerptListPage'
import { RecordPage } from './components/RecordPage'
import { ExcerptDetail } from './components/ExcerptDetail'
import { useExcerpts } from './hooks/useExcerpts'
import { splitTagGroups } from './lib/tagGroups'

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
  const [selectedCountryTags, setSelectedCountryTags] = useState([])
  const [selectedTopicTags, setSelectedTopicTags] = useState([])
  const [openFilterGroup, setOpenFilterGroup] = useState(null) // 'country' | 'topic' | null
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

  const { countryTagCounts, topicTagCounts } = useMemo(() => splitTagGroups(tagCounts), [tagCounts])

  const filtered = useMemo(() => {
    const activeTags = [...selectedCountryTags, ...selectedTopicTags]
    return excerpts.filter((excerpt) => {
      if (!matchesSearch(excerpt, search)) return false
      if (activeTags.length > 0) {
        const tags = excerpt.tags ?? []
        if (!activeTags.every((tag) => tags.includes(tag))) return false
      }
      return true
    })
  }, [excerpts, search, selectedCountryTags, selectedTopicTags])

  const hasFilters = Boolean(search) || selectedCountryTags.length > 0 || selectedTopicTags.length > 0

  const toggleCountryTag = (tag) => {
    setSelectedCountryTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag],
    )
  }

  const toggleTopicTag = (tag) => {
    setSelectedTopicTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag],
    )
  }

  const toggleFilterGroup = (group) => {
    setOpenFilterGroup((prev) => (prev === group ? null : group))
  }

  const clearTagFilters = () => {
    setSelectedCountryTags([])
    setSelectedTopicTags([])
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
          countryTagCounts={countryTagCounts}
          topicTagCounts={topicTagCounts}
          selectedCountryTags={selectedCountryTags}
          selectedTopicTags={selectedTopicTags}
          openFilterGroup={openFilterGroup}
          onToggleFilterGroup={toggleFilterGroup}
          search={search}
          onSearchChange={setSearch}
          onToggleCountryTag={toggleCountryTag}
          onToggleTopicTag={toggleTopicTag}
          onClearTags={clearTagFilters}
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
