import { useState } from 'react'
import { LayoutDashboard } from 'lucide-react'
import './assets/main.css'
import SystemStats from './components/SystemStats'
import ProcessManager from './components/ProcessManager'
import DockerManager from './components/DockerManager'
import LogViewer from './components/LogViewer'
import Settings from './components/Settings'
import MiniTools from './components/MiniTools'
import NetworkManager from './components/NetworkManager'
import ApiTester from './components/ApiTester'
import UtilityTools from './components/UtilityTools'

function App(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar glass-panel">
        <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <LayoutDashboard size={28} className="text-accent" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ fontSize: '1.2rem', marginBottom: 0 }}>Dev Dashboard</h1>
            <p style={{ fontSize: '0.8rem', margin: 0 }}>Command Center</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <a
            className={activeTab === 'overview' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </a>
          <a
            className={activeTab === 'process' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveTab('process')}
          >
            🔌 Ports & Processes
          </a>
          <a
            className={activeTab === 'docker' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveTab('docker')}
          >
            🐳 Docker
          </a>
          <a
            className={activeTab === 'logs' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveTab('logs')}
          >
            📄 Container Logs
          </a>
          <a
            className={activeTab === 'minitools' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveTab('minitools')}
          >
            🛠️ Mini Tools
          </a>
          <a
            className={activeTab === 'utility' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveTab('utility')}
          >
            🧰 Utility & Mock
          </a>
          <a
            className={activeTab === 'network' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveTab('network')}
          >
            🌐 Network
          </a>
          <a
            className={activeTab === 'api' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveTab('api')}
          >
            🔌 API
          </a>
          <div style={{ flex: 1 }} />
          <a
            className={activeTab === 'settings' ? 'nav-item active' : 'nav-item'}
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ Settings
          </a>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 'auto',
            paddingTop: '16px',
            borderTop: '1px solid var(--glass-border)',
            textAlign: 'center',
            fontSize: '0.95rem',
            color: 'var(--text-muted)'
          }}
        >
          พัฒนาโดย{' '}
          <a
            href="https://www.facebook.com/learntodeveloper"
            target="_blank"
            rel="noreferrer"
            style={{ color: 'var(--theme-accent)', textDecoration: 'none', fontWeight: 'bold' }}
          >
            เขียนโค้ดยามว่าง
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {activeTab === 'overview' && (
          <div
            className="animate-fade-in"
            style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
          >
            <SystemStats />
          </div>
        )}

        {activeTab === 'process' && (
          <div
            className="animate-fade-in"
            style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}
          >
            <h2>Active Ports</h2>
            <ProcessManager />
          </div>
        )}

        {activeTab === 'docker' && (
          <div
            className="animate-fade-in"
            style={{ display: 'flex', height: '100%', flexDirection: 'column', gap: '24px' }}
          >
            <DockerManager />
          </div>
        )}

        {activeTab === 'logs' && (
          <div
            className="animate-fade-in"
            style={{ display: 'flex', height: '100%', flexDirection: 'column', gap: '24px' }}
          >
            <LogViewer />
          </div>
        )}
        {activeTab === 'minitools' && (
          <div
            className="animate-fade-in"
            style={{ display: 'flex', height: '100%', flexDirection: 'column', gap: '24px' }}
          >
            <MiniTools />
          </div>
        )}
        {activeTab === 'utility' && (
          <div
            className="animate-fade-in"
            style={{ display: 'flex', height: '100%', flexDirection: 'column', gap: '24px' }}
          >
            <UtilityTools />
          </div>
        )}
        {activeTab === 'network' && (
          <div
            className="animate-fade-in"
            style={{ display: 'flex', height: '100%', flexDirection: 'column', gap: '24px' }}
          >
            <NetworkManager />
          </div>
        )}
        {activeTab === 'api' && (
          <div
            className="animate-fade-in"
            style={{ display: 'flex', height: '100%', flexDirection: 'column', gap: '24px' }}
          >
            <ApiTester />
          </div>
        )}
        {activeTab === 'settings' && (
          <div
            className="animate-fade-in"
            style={{ display: 'flex', height: '100%', flexDirection: 'column', gap: '24px' }}
          >
            <Settings />
          </div>
        )}
      </main>
    </div>
  )
}

export default App
