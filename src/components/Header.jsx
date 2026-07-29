export function Header() {
  return (
    <header className="app-header">
      <div className="hero-frame">
        <div className="hero-img" aria-hidden="true" />
        <div className="hero-overlay" aria-hidden="true" />
        <span className="corner tl" />
        <span className="corner tr" />
        <span className="corner bl" />
        <span className="corner br" />
        <div className="hero-text">
          <div className="eyebrow">
            <span className="teardrop" /> collected fragments <span className="teardrop" />
          </div>
          <h1>Sentence · 摘抄本</h1>
          <p className="tagline">收集途经眼前、值得留下的文字</p>
        </div>
      </div>
      <hr className="gilded-rule" />
    </header>
  )
}
