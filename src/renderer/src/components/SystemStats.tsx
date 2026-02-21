import React, { useEffect, useState } from 'react'

interface SystemData {
    cpu: any
    mem: any
    osInfo: any
    disk: any[]
    networkStats: any[]
    networkInterfaces: any[]
}

export default function SystemStats() {
    const [stats, setStats] = useState<SystemData | null>(null)
    const [extIp, setExtIp] = useState<string>('Loading...')

    useEffect(() => {
        let mounted = true
        const fetchData = async () => {
            try {
                const data = await window.api.system.getStats()
                if (mounted) setStats(data)
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

    const { cpu, mem, osInfo, disk, networkStats, networkInterfaces } = stats
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
            <div className="glass-panel" style={{ padding: '24px', position: 'relative' }}>
                <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '16px' }}>CPU Usage</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ flexShrink: 0, width: '80px', height: '80px', borderRadius: '50%', background: `conic-gradient(var(--accent-blue) ${cpuPercent}%, rgba(255,255,255,0.05) 0)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                            {cpuPercent}%
                        </div>
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-main)', fontWeight: '600', marginBottom: '4px' }}>{cpu.cpus?.[0]?.model || osInfo.distro || 'Processor'}</p>
                        <p>Cores: {cpu.cpus?.length || 'N/A'}</p>
                    </div>
                </div>
            </div>

            {/* RAM Box */}
            <div className="glass-panel" style={{ padding: '24px', position: 'relative' }}>
                <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '16px' }}>Memory (RAM)</h3>
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
            </div>

            {/* Disk Box */}
            <div className="glass-panel" style={{ padding: '24px', position: 'relative' }}>
                <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '16px' }}>Main Disk Usage</h3>
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
                <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '16px' }}>Network</h3>
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
        </div>
    )
}
