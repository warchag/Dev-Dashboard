import { useTheme, ThemeColor, FontFamily } from './ThemeContext'

export default function Settings() {
  const { themeColor, setThemeColor, fontFamily, setFontFamily } = useTheme()

  const colors: { id: ThemeColor; label: string; color: string }[] = [
    { id: 'blue', label: 'Default Blue', color: '#3b82f6' },
    { id: 'purple', label: 'Cyber Purple', color: '#a855f7' },
    { id: 'neon-green', label: 'Matrix Green', color: '#10b981' },
    { id: 'orange', label: 'Sunset Orange', color: '#f59e0b' },
    { id: 'pink', label: 'Synthwave Pink', color: '#ec4899' }
  ]

  const fonts: FontFamily[] = ['Inter', 'Roboto', 'Fira Code']

  return (
    <div
      className="glass-panel"
      style={{
        padding: '32px',
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px'
      }}
    >
      <div>
        <h2
          style={{
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            paddingBottom: '12px',
            marginBottom: '24px'
          }}
        >
          Appearance Settings
        </h2>

        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ marginBottom: '16px', color: 'var(--text-muted)' }}>Accent Color</h3>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {colors.map((c) => (
              <div
                key={c.id}
                className="glass-panel"
                style={{
                  padding: '16px',
                  minWidth: '160px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  border:
                    themeColor === c.id ? `2px solid ${c.color}` : '1px solid var(--glass-border)',
                  boxShadow: themeColor === c.id ? `0 0 15px ${c.color}40` : 'none',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => setThemeColor(c.id)}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: c.color,
                    boxShadow: `0 0 10px ${c.color}`
                  }}
                ></div>
                <span
                  style={{
                    fontWeight: themeColor === c.id ? '600' : '400',
                    color: themeColor === c.id ? 'var(--text-main)' : 'var(--text-muted)'
                  }}
                >
                  {c.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: '16px', color: 'var(--text-muted)' }}>Font Family</h3>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {fonts.map((f) => (
              <div
                key={f}
                className="glass-panel"
                style={{
                  padding: '16px 24px',
                  cursor: 'pointer',
                  border:
                    fontFamily === f
                      ? '2px solid var(--theme-accent)'
                      : '1px solid var(--glass-border)',
                  color: fontFamily === f ? 'var(--theme-accent)' : 'var(--text-muted)',
                  fontWeight: fontFamily === f ? '600' : '400',
                  fontFamily:
                    f === 'Fira Code'
                      ? "'Fira Code', monospace"
                      : f === 'Roboto'
                        ? "'Roboto', sans-serif"
                        : "'Inter', sans-serif",
                  transition: 'all 0.2s ease'
                }}
                onClick={() => setFontFamily(f)}
              >
                <span style={{ fontSize: '18px' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
