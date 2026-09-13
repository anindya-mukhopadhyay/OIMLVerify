import { Globe, Shield, Sparkles } from 'lucide-react'
import { useState } from 'react'

export function GovTopRibbon() {
  const [lang, setLang] = useState<'EN' | 'HI'>('EN')
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'larger'>('normal')

  const changeFontSize = (size: 'normal' | 'large' | 'larger') => {
    setFontSize(size)
    const root = document.documentElement
    if (size === 'normal') {
      root.style.fontSize = '16px'
    } else if (size === 'large') {
      root.style.fontSize = '17.5px'
    } else {
      root.style.fontSize = '19px'
    }
  }

  return (
    <header className="gov-top-ribbon" role="banner" aria-label="Official Government Portal Header">
      <div className="gov-ribbon-tricolor" />
      <div className="gov-ribbon-content">
        <div className="gov-ribbon-left">
          <div className="gov-emblem-badge" aria-label="National Metrology Emblem">
            <Shield size={14} className="gov-emblem-icon" />
          </div>
          <div className="gov-titles">
            <span className="gov-authority-hi">भारत सरकार | विधिक मापविज्ञान प्रभाग</span>
            <span className="gov-authority-en">
              Government of India · Legal Metrology Division · OIML Issuing Authority
            </span>
          </div>
        </div>

        <div className="gov-ribbon-right">
          <div className="gov-portal-badge">
            <Sparkles size={12} />
            <span>e-Metrology Verified Portal</span>
          </div>

          <div className="gov-accessibility-controls" aria-label="Accessibility text size controls">
            <button
              type="button"
              className={`a11y-btn ${fontSize === 'normal' ? 'active' : ''}`}
              onClick={() => changeFontSize('normal')}
              title="Standard Font Size"
              aria-label="Standard Font Size"
            >
              A
            </button>
            <button
              type="button"
              className={`a11y-btn ${fontSize === 'large' ? 'active' : ''}`}
              onClick={() => changeFontSize('large')}
              title="Large Font Size"
              aria-label="Large Font Size"
            >
              A+
            </button>
            <button
              type="button"
              className={`a11y-btn ${fontSize === 'larger' ? 'active' : ''}`}
              onClick={() => changeFontSize('larger')}
              title="Extra Large Font Size"
              aria-label="Extra Large Font Size"
            >
              A++
            </button>
          </div>

          <button
            type="button"
            className="gov-lang-btn"
            onClick={() => setLang((prev) => (prev === 'EN' ? 'HI' : 'EN'))}
            title="Toggle Language Display"
            aria-label="Toggle Language"
          >
            <Globe size={13} />
            <span>{lang === 'EN' ? 'English' : 'हिन्दी'}</span>
          </button>
        </div>
      </div>
    </header>
  )
}
