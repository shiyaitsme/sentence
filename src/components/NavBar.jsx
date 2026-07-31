const NAV_ITEMS = [
  { key: 'home', label: '首页' },
  { key: 'list', label: '摘抄集' },
  { key: 'record', label: '记录' },
]

export function NavBar({ current, onNavigate, variant = 'plain' }) {
  return (
    <nav className={`nav-row nav-row--${variant}`}>
      <span className="nav-logo">Sentence</span>
      <div className="nav-links">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`nav-link${current === item.key ? ' active' : ''}`}
            onClick={() => onNavigate(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
