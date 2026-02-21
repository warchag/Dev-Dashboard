import { useEffect, useState } from 'react'

interface DockerContainer {
    id: string
    name: string
    image: string
    state: string
    status: string
    ports: string
}

export default function DockerManager() {
    const [containers, setContainers] = useState<DockerContainer[]>([])
    const [loading, setLoading] = useState(true)

    const fetchDocker = async () => {
        try {
            setLoading(true)
            const data = await window.api.docker.getContainers()
            setContainers(data)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDocker()
        const interval = setInterval(fetchDocker, 5000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="glass-panel" style={{ padding: '24px', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0 }}>Docker Containers</h3>
                <button className="btn" onClick={fetchDocker}>Refresh</button>
            </div>

            {loading && containers.length === 0 ? (
                <p>Loading containers...</p>
            ) : (
                <div style={{ overflowY: 'auto', maxHeight: '400px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>Status</th>
                                <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>Name</th>
                                <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>Image</th>
                                <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>State</th>
                                <th style={{ padding: '12px 8px', color: 'var(--text-muted)' }}>Ports</th>
                            </tr>
                        </thead>
                        <tbody>
                            {containers.map((container, i) => {
                                const isRunning = container.state === 'running'
                                return (
                                    <tr key={container.id || i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }} className="table-row-hover">
                                        <td style={{ padding: '12px 8px' }}>
                                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: isRunning ? 'var(--accent-green)' : 'var(--accent-red)', boxShadow: isRunning ? '0 0 8px var(--accent-green)' : 'none' }} />
                                        </td>
                                        <td style={{ padding: '12px 8px', fontWeight: 'bold' }}>{container.name}</td>
                                        <td style={{ padding: '12px 8px', fontFamily: 'monospace', fontSize: '13px', color: 'var(--text-muted)' }}>{container.image}</td>
                                        <td style={{ padding: '12px 8px' }}>{container.state}</td>
                                        <td style={{ padding: '12px 8px', fontSize: '13px' }}>{container.ports || '-'}</td>
                                    </tr>
                                )
                            })}
                            {containers.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>No containers found (Make sure Docker is running)</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <style dangerouslySetInnerHTML={{
                        __html: `
                        .table-row-hover:hover {
                            background: rgba(255,255,255,0.05);
                        }
                    `}} />
                </div>
            )}
        </div>
    )
}
