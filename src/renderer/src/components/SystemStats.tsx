import { useEffect, useState } from 'react'

interface SystemData {
    cpu: any
    mem: any
    osInfo: any
    disk: any[]
    networkStats: any[]
    networkInterfaces: any[]
    time: any
    cpuTemperature: any
}

interface ProcessData {
    pid: number
    name: string
    cpu: number
    mem: number
}

export default function SystemStats() {
    const [stats, setStats] = useState<SystemData | null>(null)
    const [topProcesses, setTopProcesses] = useState<ProcessData[]>([])
    const [cpuHistory, setCpuHistory] = useState<number[]>(Array(20).fill(0))
    const [memHistory, setMemHistory] = useState<number[]>(Array(20).fill(0))
    const [extIp, setExtIp] = useState<string>('Loading...')

    useEffect(() => {
        let mounted = true
        const fetchData = async () => {
            try {
                const data = await window.api.system.getStats()
                const topProcs = await window.api.system.getTopProcesses()
                if (mounted) {
                    setStats(data)
                    setTopProcesses(topProcs)

                    // Update History Arrays
                    if (data) {
                        const newCpu = data.cpu.currentLoad
                        const newMem = (data.mem.active / data.mem.total) * 100

                        setCpuHistory(prev => {
                            const newHist = [...prev.slice(1), newCpu]
                            return newHist
                        })
                        setMemHistory(prev => {
                            const newHist = [...prev.slice(1), newMem]
                            return newHist
                        })
                    }
                }
            } catch (err) {
                console.error(err)
            }
        }

        const fetchExtIp = async () => {
            try {
                const ip = await window.api.network.getExtIp()
                if (mounted) setExtIp(ip)
            } catch (e) {
                if (mounted) setExtIp('Unavailable')
            }
        }

        fetchData()
        fetchExtIp()
        const interval = setInterval(fetchData, 2000)

        return () => {
            mounted = false
            clearInterval(interval)
        }
    }, [])

    if (!stats) {
        return (
            <div className="glass-panel" style={{ padding: '24px' }}>
                <h3>System Overview</h3>
                <p>Loading stats...</p>
            </div>
        )
    }

    // --- Uptime Formatter ---
    const formatUptime = (seconds: number) => {
        const d = Math.floor(seconds / (3600 * 24))
        const h = Math.floor(seconds % (3600 * 24) / 3600)
        const m = Math.floor(seconds % 3600 / 60)
        if (d > 0) return `${d}d ${h}h`
        if (h > 0) return `${h}h ${m}m`
        return `${m}m`
    }

    // --- Sparkline Generator ---
    const createSparkline = (data: number[], color: string) => {
        const width = 120
        const height = 40
        const max = 100
        const points = data.map((val, i) => {
            const x = (i / (data.length - 1)) * width
            const y = height - ((val / max) * height)
            return `${x},${y}`
        }).join(' ')

        return (
            <svg width={width} height={height} style={{ overflow: 'visible' }}>
                <polyline
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    points={points}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />
            </svg>
        )
    }

    const { cpu, mem, osInfo, disk, networkStats, networkInterfaces, time, cpuTemperature } = stats
    const usedMemGB = (mem.active / 1024 / 1024 / 1024).toFixed(2)
    const totalMemGB = (mem.total / 1024 / 1024 / 1024).toFixed(2)
    const memPercent = ((mem.active / mem.total) * 100).toFixed(1)
    const cpuPercent = cpu.currentLoad.toFixed(1)

    // Disks computations (find main disk, usually the first one or the one with the most space)
    const mainDisk = disk && disk.length > 0 ? disk.reduce((prev, current) => (prev.size > current.size) ? prev : current) : null
    const diskPercent = mainDisk ? mainDisk.use.toFixed(1) : 0
    const usedDiskGB = mainDisk ? (mainDisk.used / 1024 / 1024 / 1024).toFixed(2) : '0'
    const totalDiskGB = mainDisk ? (mainDisk.size / 1024 / 1024 / 1024).toFixed(2) : '0'

    // Network computations
    // Find the primary active interface
    const defaultInterface = networkInterfaces?.find(net => !net.internal && net.ip4 && net.operstate === 'up') || networkInterfaces?.[0]
    const localIp = defaultInterface?.ip4 || '127.0.0.1'

    // Aggregate network traffic across active interfaces
    const rxSec = networkStats?.reduce((acc, curr) => acc + (curr.rx_sec || 0), 0) || 0
    const txSec = networkStats?.reduce((acc, curr) => acc + (curr.tx_sec || 0), 0) || 0
    const dlSpeed = (rxSec / 1024 / 1024).toFixed(2) // MB/s
    const ulSpeed = (txSec / 1024 / 1024).toFixed(2) // MB/s

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* CPU Box */}
            <div className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0 }}>CPU Usage</h3>
                    {cpuTemperature?.main && cpuTemperature.main > 0 && (
                        <div style={{ background: cpuTemperature.main > 75 ? 'var(--accent-orange)' : 'rgba(255,255,255,0.1)', color: cpuTemperature.main > 75 ? '#000' : 'var(--text-main)', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                            🌡️ {cpuTemperature.main.toFixed(1)}°C
                        </div>
                    )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <div style={{ flexShrink: 0, width: '80px', height: '80px', borderRadius: '50%', background: `conic-gradient(var(--accent-blue) ${cpuPercent}%, rgba(255,255,255,0.05) 0)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                {cpuPercent}%
                            </div>
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-main)', fontWeight: '600', marginBottom: '4px' }}>{cpu.cpus?.[0]?.model?.split(' @')[0] || osInfo.distro || 'Processor'}</p>
                            <p>Cores: {cpu.cpus?.length || 'N/A'}</p>
                        </div>
                    </div>
                    {/* CPU Sparkline Container */}
                    <div style={{ opacity: 0.7, paddingLeft: '12px' }}>
                        {createSparkline(cpuHistory, 'var(--accent-blue)')}
                    </div>
                </div>
            </div>

            {/* RAM Box */}
            <div className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
                <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '16px', margin: 0 }}>Memory (RAM)</h3>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                        <div style={{ flexShrink: 0, width: '80px', height: '80px', borderRadius: '50%', background: `conic-gradient(var(--accent-green) ${memPercent}%, rgba(255,255,255,0.05) 0)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                {memPercent}%
                            </div>
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-main)', fontWeight: '600', marginBottom: '4px' }}>{usedMemGB} GB / {totalMemGB} GB</p>
                            <p>Platform: {osInfo.platform}</p>
                        </div>
                    </div>
                    {/* RAM Sparkline Container */}
                    <div style={{ opacity: 0.7, paddingLeft: '12px' }}>
                        {createSparkline(memHistory, 'var(--accent-green)')}
                    </div>
                </div>
            </div>

            {/* Disk Box */}
            <div className="glass-panel" style={{ padding: '24px', position: 'relative' }}>
                <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '16px', margin: 0 }}>Main Disk Usage</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ flexShrink: 0, width: '80px', height: '80px', borderRadius: '50%', background: `conic-gradient(var(--accent-orange) ${diskPercent}%, rgba(255,255,255,0.05) 0)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                            {diskPercent}%
                        </div>
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-main)', fontWeight: '600', marginBottom: '4px' }}>{usedDiskGB} GB / {totalDiskGB} GB</p>
                        <p>Mount: {mainDisk?.mount || '/'}</p>
                    </div>
                </div>
            </div>

            {/* Network Box */}
            <div className="glass-panel" style={{ padding: '24px', position: 'relative' }}>
                <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '16px', margin: 0 }}>Network</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Local IP:</span>
                        <span style={{ fontWeight: '500', color: 'var(--accent-blue)' }}>{localIp}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>External IP:</span>
                        <span style={{ fontWeight: '500', color: 'var(--accent-green)' }}>{extIp}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ color: 'var(--accent-green)', fontSize: '18px' }}>↓</span>
                            <span>{dlSpeed} MB/s</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ color: 'var(--accent-blue)', fontSize: '18px' }}>↑</span>
                            <span>{ulSpeed} MB/s</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* NEW: Top Processes and Uptime Span Row */}
            <div className="glass-panel" style={{ gridColumn: '1 / -1', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0 }}>Top Resource Hogs 💻</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                        <span>⏱️ Uptime:</span>
                        <span style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>{time?.uptime ? formatUptime(time.uptime) : 'N/A'}</span>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 100px 100px', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '8px', padding: '0 8px' }}>
                    <span>PID</span>
                    <span>Process Name</span>
                    <span style={{ textAlign: 'right' }}>CPU %</span>
                    <span style={{ textAlign: 'right' }}>RAM %</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {topProcesses.length > 0 ? topProcesses.map((p, idx) => (
                        <div key={p.pid || idx} style={{
                            display: 'grid', gridTemplateColumns: '80px 1fr 100px 100px',
                            padding: '12px 8px', background: 'rgba(255,255,255,0.02)',
                            borderRadius: '8px', transition: 'background 0.2s',
                            borderLeft: `3px solid ${idx === 0 ? 'var(--accent-orange)' : idx === 1 ? 'var(--accent-blue)' : 'rgba(255,255,255,0.1)'}`
                        }}>
                            <span style={{ fontFamily: 'var(--font-mono)' }}>{p.pid}</span>
                            <span style={{ color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</span>
                            <span style={{ textAlign: 'right', color: p.cpu > 50 ? 'var(--accent-orange)' : 'var(--text-main)' }}>{p.cpu.toFixed(1)}%</span>
                            <span style={{ textAlign: 'right' }}>{p.mem.toFixed(1)}%</span>
                        </div>
                    )) : (
                        <div style={{ textAlign: 'center', padding: '24px', opacity: 0.5 }}>Loading processes...</div>
                    )}
                </div>
            </div>

        </div>
    )
}
