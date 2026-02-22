import { useEffect, useState, useRef } from 'react'

export default function LogViewer() {
  const [containers, setContainers] = useState<{ id: string; name: string }[]>([])
  const [selectedContainer, setSelectedContainer] = useState<string>('')
  const [logs, setLogs] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [autoScroll, setAutoScroll] = useState<boolean>(true)
  const logsEndRef = useRef<HTMLDivElement>(null)

  const fetchContainers = async () => {
    try {
      const data = await window.api.docker.getContainers()
      setContainers(data)
      if (data.length > 0 && !selectedContainer) {
        setSelectedContainer(data[0].id)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const fetchLogs = async () => {
    if (!selectedContainer) return
    try {
      const data = await window.api.docker.getLogs(selectedContainer)
      setLogs(data)
    } catch (e) {
      console.error(e)
    }
  }

  // Poll containers to populate dropdown
  useEffect(() => {
    fetchContainers()
  }, [])

  // Poll logs when a container is selected
  useEffect(() => {
    fetchLogs()
    const interval = setInterval(fetchLogs, 2000)
    return () => clearInterval(interval)
  }, [selectedContainer])

  // Auto scroll
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView()
    }
  }, [logs, autoScroll])

  return (
    <div
      className="glass-panel"
      style={{
        padding: '24px',
        flex: 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}
      >
        <h3 style={{ margin: 0 }}>Service Logs</h3>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              color: 'var(--text-muted)'
            }}
          >
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
            />
            Auto-Scroll
          </label>
          <select
            className="btn"
            style={{ width: '200px', appearance: 'auto' }}
            value={selectedContainer}
            onChange={(e) => setSelectedContainer(e.target.value)}
          >
            {containers.length === 0 && <option value="">No containers found</option>}
            {containers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          background: 'rgba(0,0,0,0.5)',
          borderRadius: '8px',
          padding: '16px',
          overflowY: 'auto',
          fontFamily: 'monospace',
          fontSize: '13px',
          color: '#a3be8c',
          whiteSpace: 'pre-wrap',
          border: '1px solid var(--glass-border)'
        }}
        onWheel={() => setAutoScroll(false)} // disable autoscroll if user scrolls manually
      >
        {loading && <p style={{ color: 'var(--text-muted)' }}>Fetching containers...</p>}
        {!loading && !selectedContainer && (
          <p style={{ color: 'var(--text-muted)' }}>Select a container to view logs.</p>
        )}
        {!loading && selectedContainer && !logs && (
          <p style={{ color: 'var(--text-muted)' }}>No logs available (or container is dead).</p>
        )}
        {logs}
        <div ref={logsEndRef} />
      </div>
    </div>
  )
}
