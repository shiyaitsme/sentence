export function SearchBar({ value, onChange, onAdd }) {
  return (
    <div className="toolbar">
      <div className="search-wrap">
        <span className="search-icon">⌕</span>
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="搜索正文、出处、标签、批注…"
        />
      </div>
      <button type="button" className="btn-add" onClick={onAdd}>
        + 记一笔
      </button>
    </div>
  )
}
