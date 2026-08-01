import { NavBar } from './NavBar'
import { ExcerptCard } from './ExcerptCard'
import { EmptyState } from './EmptyState'

export function ExcerptListPage({
  filtered,
  total,
  hasFilters,
  countryTagCounts,
  topicTagCounts,
  selectedCountryTags,
  selectedTopicTags,
  openFilterGroup,
  onToggleFilterGroup,
  search,
  onSearchChange,
  onToggleCountryTag,
  onToggleTopicTag,
  onClearTags,
  onNavigate,
  onOpen,
  onEdit,
  onDelete,
  loading,
  error,
}) {
  const hasTagFilters = selectedCountryTags.length > 0 || selectedTopicTags.length > 0
  return (
    <section className="list-page">
      <NavBar current="list" onNavigate={onNavigate} variant="plain" />

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

      <div className="list-page-head">
        <h1 className="list-title">摘抄集</h1>
        <button type="button" className="btn-solid" onClick={() => onNavigate('record')}>
          + 新建摘抄
        </button>
      </div>

      <div className="filter-block">
        <div className="filter-row">
          <button
            type="button"
            className={`filter-pill${!hasTagFilters ? ' active' : ''}`}
            onClick={onClearTags}
          >
            全部
          </button>
          <button
            type="button"
            className={`filter-group-trigger${openFilterGroup === 'country' ? ' open' : ''}`}
            onClick={() => onToggleFilterGroup('country')}
          >
            国家 / 时期
            <span className="filter-group-caret">{openFilterGroup === 'country' ? '▴' : '▾'}</span>
          </button>
          <button
            type="button"
            className={`filter-group-trigger${openFilterGroup === 'topic' ? ' open' : ''}`}
            onClick={() => onToggleFilterGroup('topic')}
          >
            标签
            <span className="filter-group-caret">{openFilterGroup === 'topic' ? '▴' : '▾'}</span>
          </button>
          <div className="filter-search">
            <span className="search-icon">⌕</span>
            <input
              type="text"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="搜索正文、出处、标签、批注…"
            />
          </div>
        </div>

        {openFilterGroup === 'country' && (
          <div className="filter-subrow">
            {countryTagCounts.length === 0 ? (
              <span className="filter-subrow-empty">暂无国家/时期标签</span>
            ) : (
              countryTagCounts.map(([tag]) => (
                <button
                  key={tag}
                  type="button"
                  className={`filter-subchip${selectedCountryTags.includes(tag) ? ' selected' : ''}`}
                  onClick={() => onToggleCountryTag(tag)}
                >
                  {tag}
                </button>
              ))
            )}
          </div>
        )}

        {openFilterGroup === 'topic' && (
          <div className="filter-subrow">
            {topicTagCounts.length === 0 ? (
              <span className="filter-subrow-empty">暂无标签</span>
            ) : (
              topicTagCounts.map(([tag]) => (
                <button
                  key={tag}
                  type="button"
                  className={`filter-subchip${selectedTopicTags.includes(tag) ? ' selected' : ''}`}
                  onClick={() => onToggleTopicTag(tag)}
                >
                  {tag}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {loading ? (
        <p className="loading-text">正在打开摘抄本…</p>
      ) : filtered.length === 0 ? (
        <EmptyState hasFilters={hasFilters} />
      ) : (
        <>
          <p className="results-count">
            共 {filtered.length} 条{hasFilters ? ` · 全部 ${total} 条` : ''}
          </p>
          <div className="waterfall">
            {filtered.map((excerpt) => (
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
      )}
    </section>
  )
}
