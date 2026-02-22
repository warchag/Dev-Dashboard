import { useEffect, useState } from 'react'

interface PortProcess {
  command: string
  pid: string
  user: string
  port: string
}

export default function ProcessManager() {
  const [processes, setProcesses] = useState<PortProcess[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [confirmKillPid, setConfirmKillPid] = useState<string | null>(null)

  const fetchPorts = async () => {
    try {
      setLoading(true)
      const output = await window.api.network.getPorts()
      const lines = output.trim().split('\n')
      const parsed = lines
        .filter((line) => line)
        .map((line) => {
          // split by spaces
          const parts = line.trim().split(/\s+/)
          const command = parts[0]
          const pid = parts[1]
          const user = parts[2]

          // Port usually at index 8: "*:3000" or "localhost:5173"
          let port = 'Unknown'
          const addressBlock = parts.find(
            (p) => p.includes('*:') || p.includes('localhost:') || p.match(/:\d+$/)
          )
          if (addressBlock) {
            const portMatch = addressBlock.match(/:(\d+)/)
            if (portMatch) port = portMatch[1]
          }

          return { command, pid, user, port }
        })

      // Ensure unique PIDs
      const unique = Array.from(new Map(parsed.map((item) => [item.pid, item])).values())
      setProcesses(unique)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPorts()
    // Reduced interval to 5 seconds to reduce CPU overhead of lsof
    const interval = setInterval(fetchPorts, 5000)
    return () => clearInterval(interval)
  }, [])

  const executeKill = async (pid: string) => {
    const success = await window.api.process.kill(pid)
    setConfirmKillPid(null)
    if (success) {
      fetchPorts()
    } else {
      alert('Failed to kill process ' + pid)
    }
  }

  const styles = {
    hoverEffect: `
      .table-row-hover:hover {
        background: rgba(255,255,255,0.05);
      }
    `
  }

  const filteredProcesses = processes.filter(
    (proc) =>
      proc.port.includes(searchQuery) ||
      proc.command.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div
      className="glass-panel"
      style={{
        padding: '24px',
        flex: 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}
    >
      {/* Confirmation Modal */}
      {confirmKillPid && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50
          }}
        >
          <div
            className="glass-panel"
            style={{
              padding: '32px',
              width: '320px',
              textAlign: 'center',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              boxShadow: '0 0 40px rgba(239, 68, 68, 0.2)'
            }}
          >
            <h3 style={{ color: '#fca5a5', marginBottom: '8px' }}>Kill Process?</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
              Are you sure you want to force kill PID {confirmKillPid}? This may cause data loss.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn" onClick={() => setConfirmKillPid(null)} style={{ flex: 1 }}>
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={() => executeKill(confirmKillPid)}
                style={{ flex: 1 }}
              >
                Kill It
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px',
          gap: '16px'
        }}
      >
        <h3 style={{ margin: 0 }}>Active Listen Ports</h3>
        <div style={{ display: 'flex', gap: '8px', flex: 1, maxWidth: '300px' }}>
          <input
            type="text"
            placeholder="Search port (e.g. 3000) or app..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--glass-border)',
              background: 'rgba(0,0,0,0.2)',
              color: 'var(--text-main)',
              outline: 'none',
              fontFamily: 'inherit'
            }}
          />
          <button className="btn" onClick={fetchPorts}>
            Refresh
          </button>
        </div>
      </div>

      {loading && processes.length === 0 ? (
        <p>Scanning ports...</p>
      ) : (
        <div style={{ overflowY: 'auto', maxHeight: '400px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>Port</th>
                <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>Command</th>
                <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>PID</th>
                <th style={{ padding: '12px 8px', textAlign: 'right', color: 'var(--text-muted)' }}>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProcesses.map((proc, i) => (
                <tr
                  key={i}
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    transition: 'background 0.2s',
                    cursor: 'default'
                  }}
                  className="table-row-hover"
                >
                  <td
                    style={{ padding: '12px 8px', fontWeight: 'bold', color: 'var(--accent-blue)' }}
                  >
                    {proc.port}
                  </td>
                  <td style={{ padding: '12px 8px' }}>{proc.command}</td>
                  <td
                    style={{
                      padding: '12px 8px',
                      fontFamily: 'monospace',
                      color: 'var(--text-muted)'
                    }}
                  >
                    {proc.pid}
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                    <button
                      className="btn btn-danger"
                      onClick={() => setConfirmKillPid(proc.pid)}
                      style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                    >
                      Kill
                    </button>
                  </td>
                </tr>
              ))}
              {filteredProcesses.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}
                  >
                    No match found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <style dangerouslySetInnerHTML={{ __html: styles.hoverEffect }} />
        </div>
      )}
    </div>
  )
}
