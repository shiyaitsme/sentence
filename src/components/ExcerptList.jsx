import { ExcerptCard } from './ExcerptCard'
import { EmptyState } from './EmptyState'

export function ExcerptList({ excerpts, total, hasFilters, onOpen, onEdit, onDelete }) {
  if (excerpts.length === 0) {
    return <EmptyState hasFilters={hasFilters} />
  }

  return (
    <>
      <p className="results-count">
        共 {excerpts.length} 条{hasFilters ? ` · 全部 ${total} 条` : ''}
      </p>
      <div className="gallery">
        {excerpts.map((excerpt) => (
          <ExcerptCard
            key={excerpt.id}
            excerpt={excerpt}
            onOpen={onOpen}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </>
  )
}
