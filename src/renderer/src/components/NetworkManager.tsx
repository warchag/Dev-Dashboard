import { useState, useRef, useEffect } from 'react'

export default function NetworkManager() {
  const [loading, setLoading] = useState(false)
  const [output, setOutput] = useState('')
  const [metrics, setMetrics] = useState<{
    min: number
    avg: number
    max: number
    loss: number
  } | null>(null)
  const [customLocalIp, setCustomLocalIp] = useState('192.168.10.1')
  const [customExtIp, setCustomExtIp] = useState('cloudflare.com')
  const terminalRef = useRef<HTMLPreElement>(null)

  const handlePing = async (host: string) => {
    if (!host) return
    setLoading(true)
    setOutput(`Pinging ${host}...\n\n`)
    setMetrics(null)

    try {
      const res = await window.api.network.ping(host)
      setOutput((prev) => prev + res.output)
      if (res.metrics) {
        setMetrics(res.metrics)
      } else if (!res.success) {
        setOutput((prev) => prev + '\n\nPing failed or timed out.')
      }
    } catch (e: any) {
      setOutput((prev) => prev + `\n\nError: ${e.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Auto-scroll terminal to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [output])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
      {/* Top Controls */}
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {/* Local Network */}
        <div className="glass-panel" style={{ flex: 1, minWidth: '300px', padding: '20px' }}>
          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--theme-accent)' }}>🏠</span> Local Network
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn" onClick={() => handlePing('127.0.0.1')} disabled={loading}>
                Ping localhost
              </button>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={customLocalIp}
                onChange={(e) => setCustomLocalIp(e.target.value)}
                placeholder="e.g. 192.168.10.1"
                className="input-field"
                style={{
                  flex: 1,
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid var(--glass-border)',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  color: 'white',
                  outline: 'none'
                }}
              />
              <button
                className="btn"
                onClick={() => handlePing(customLocalIp)}
                disabled={loading}
                style={{ background: 'var(--theme-accent)', color: 'white' }}
              >
                Ping
              </button>
            </div>
          </div>
        </div>

        {/* External Network */}
        <div className="glass-panel" style={{ flex: 1, minWidth: '300px', padding: '20px' }}>
          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#00f2fe' }}>🌐</span> External Network
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn" onClick={() => handlePing('8.8.8.8')} disabled={loading}>
                Google (8.8.8.8)
              </button>
              <button className="btn" onClick={() => handlePing('1.1.1.1')} disabled={loading}>
                Cloudflare (1.1.1.1)
              </button>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={customExtIp}
                onChange={(e) => setCustomExtIp(e.target.value)}
                placeholder="e.g. google.com"
                className="input-field"
                style={{
                  flex: 1,
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid var(--glass-border)',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  color: 'white',
                  outline: 'none'
                }}
              />
              <button
                className="btn"
                onClick={() => handlePing(customExtIp)}
                disabled={loading}
                style={{ background: 'var(--theme-accent)', color: 'white' }}
              >
                Ping
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Summary */}
      {metrics && (
        <div style={{ display: 'flex', gap: '16px' }}>
          <div className="glass-panel" style={{ padding: '16px', flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Average Latency</div>
            <div
              style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: metrics.avg > 150 ? '#ff4757' : '#2ed573'
              }}
            >
              {metrics.avg} ms
            </div>
          </div>
          <div className="glass-panel" style={{ padding: '16px', flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Packet Loss</div>
            <div
              style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: metrics.loss > 0 ? '#ff4757' : '#2ed573'
              }}
            >
              {metrics.loss}%
            </div>
          </div>
          <div className="glass-panel" style={{ padding: '16px', flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Min / Max</div>
            <div
              style={{
                fontSize: '1.125rem',
                fontWeight: '500',
                color: 'var(--text-main)',
                marginTop: '4px'
              }}
            >
              {metrics.min} / {metrics.max} ms
            </div>
          </div>
        </div>
      )}

      {/* Terminal Output */}
      <div
        className="glass-panel"
        style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}
      >
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--glass-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span style={{ fontWeight: 500 }}>Terminal Output</span>
          {loading && (
            <span style={{ fontSize: '0.75rem', color: 'var(--theme-accent)' }}>Running...</span>
          )}
        </div>
        <pre
          ref={terminalRef}
          style={{
            flex: 1,
            margin: 0,
            padding: '16px',
            background: 'rgba(0,0,0,0.6)',
            color: '#aaddff',
            fontFamily: 'monospace',
            fontSize: '0.8125rem',
            overflowY: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all'
          }}
        >
          {output || 'Select a host to ping...'}
        </pre>
      </div>
    </div>
  )
}
