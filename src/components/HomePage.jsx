import { useMemo } from 'react'
import { NavBar } from './NavBar'

export function HomePage({ excerpts, tagCounts, onNavigate }) {
  const featured = excerpts[0]

  const stats = useMemo(
    () => ({
      excerpts: excerpts.length,
      sources: new Set(excerpts.map((excerpt) => excerpt.source).filter(Boolean)).size,
      tags: tagCounts.length,
    }),
    [excerpts, tagCounts],
  )

  return (
    <section className="hero-page">
      <img className="hero-bg" src="/landing_page.png" alt="" />
      <div className="hero-overlay" />
      <div className="hero-inner">
        <NavBar current="home" onNavigate={onNavigate} variant="overlay" />

        <div className="hero-main">
          <p className="hero-eyebrow">NO EDITS · NO NOISE · JUST LINES</p>
          <h1 className="hero-title">把读到的句子留在时间里</h1>
          <p className="hero-script">Every line, a small light</p>
          <div className="hero-actions">
            <button type="button" className="btn-solid" onClick={() => onNavigate('record')}>
              开始记录
            </button>
            <button type="button" className="btn-outline-hero" onClick={() => onNavigate('list')}>
              浏览摘抄集
            </button>
          </div>
        </div>

        <div className="hero-footer">
          <p className="hero-footer-label">今日一句</p>
          {featured ? (
            <>
              <p className="hero-quote">{featured.content}</p>
              <div className="hero-footer-row">
                <span className="hero-footer-source">{featured.source || '出处未记'}</span>
                <div className="hero-stats">
                  <div className="hero-stat">
                    <span className="hero-stat-num">{stats.excerpts}</span>
                    <span className="hero-stat-label">摘抄</span>
                  </div>
                  <div className="hero-stat">
                    <span className="hero-stat-num">{stats.sources}</span>
                    <span className="hero-stat-label">书目</span>
                  </div>
                  <div className="hero-stat">
                    <span className="hero-stat-num">{stats.tags}</span>
                    <span className="hero-stat-label">标签</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <p className="hero-quote hero-quote--empty">还没有摘抄，点击「开始记录」写下第一句。</p>
          )}
        </div>
      </div>
    </section>
  )
}
