import { useState } from 'react'
import md5 from 'md5'

type UtilityTab = 'uuid' | 'dummy' | 'cron' | 'hash'

export default function UtilityTools(): JSX.Element {
  const [activeTab, setActiveTab] = useState<UtilityTab>('uuid')

  return (
    <div
      className="utility-tools"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        height: '100%',
        padding: '24px' // Added padding here!
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2>🧰 Utility & Mock Data</h2>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid var(--glass-border)',
          paddingBottom: '12px'
        }}
      >
        <button
          className={`btn ${activeTab === 'uuid' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('uuid')}
        >
          🔑 UUID & Password
        </button>
        <button
          className={`btn ${activeTab === 'dummy' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('dummy')}
        >
          🎭 Dummy Data
        </button>
        <button
          className={`btn ${activeTab === 'cron' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('cron')}
        >
          ⏱️ Cron Builder
        </button>
        <button
          className={`btn ${activeTab === 'hash' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('hash')}
        >
          #️⃣ File Hash
        </button>
      </div>

      {/* Content Area */}
      <div className="glass-panel" style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        {activeTab === 'uuid' && <UuidPasswordGen />}
        {activeTab === 'dummy' && <DummyDataGen />}
        {activeTab === 'cron' && <CronBuilder />}
        {activeTab === 'hash' && <FileHashCalc />}
      </div>
    </div>
  )
}

// --- 1. UUID & Password Generator ---
function UuidPasswordGen(): JSX.Element {
  const [uuidList, setUuidList] = useState<string[]>([])
  const [password, setPassword] = useState('')
  const [pwdLength, setPwdLength] = useState(16)
  const [incUppercase, setIncUppercase] = useState(true)
  const [incNumbers, setIncNumbers] = useState(true)
  const [incSymbols, setIncSymbols] = useState(true)

  const generateUuid = (): void => {
    const newUuid = crypto.randomUUID()
    setUuidList((prev) => [newUuid, ...prev].slice(0, 5))
  }

  const generatePassword = (): void => {
    const lower = 'abcdefghijklmnopqrstuvwxyz'
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const numbers = '0123456789'
    const symbols = '!@#$%^&*()_+~`|}{[]:;?><,./-='

    let chars = lower
    if (incUppercase) chars += upper
    if (incNumbers) chars += numbers
    if (incSymbols) chars += symbols

    let newPwd = ''
    for (let i = 0; i < pwdLength; i++) {
      newPwd += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setPassword(newPwd)
  }

  const copyToClipboard = (text: string): void => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h3 style={{ marginBottom: '12px' }}>UUID v4 Generator</h3>
        <button className="btn btn-primary" onClick={generateUuid} style={{ marginBottom: '16px' }}>
          Generate UUID
        </button>
        {uuidList.map((id, index) => (
          <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <input
              type="text"
              className="input-field"
              value={id}
              readOnly
              style={{ flex: 1, fontFamily: 'monospace', color: 'black' }}
            />
            <button className="btn btn-secondary" onClick={() => copyToClipboard(id)} title="Copy">
              📋
            </button>
          </div>
        ))}
      </div>

      <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '24px' }}>
        <h3 style={{ marginBottom: '12px' }}>Secure Password Generator</h3>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label>Length: {pwdLength}</label>
            <input
              type="range"
              min="8"
              max="64"
              value={pwdLength}
              onChange={(e) => setPwdLength(parseInt(e.target.value))}
            />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <input
              type="checkbox"
              checked={incUppercase}
              onChange={(e) => setIncUppercase(e.target.checked)}
            />{' '}
            A-Z
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <input
              type="checkbox"
              checked={incNumbers}
              onChange={(e) => setIncNumbers(e.target.checked)}
            />{' '}
            0-9
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <input
              type="checkbox"
              checked={incSymbols}
              onChange={(e) => setIncSymbols(e.target.checked)}
            />{' '}
            !@#
          </label>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button className="btn btn-primary" onClick={generatePassword}>
            Generate Password
          </button>
        </div>

        {password && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              className="input-field"
              value={password}
              readOnly
              style={{
                flex: 1,
                fontFamily: 'monospace',
                fontSize: '1.2em',
                color: 'black'
              }}
            />
            <button
              className="btn btn-secondary"
              onClick={() => copyToClipboard(password)}
              title="Copy"
            >
              📋 Copy
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// --- 2. Dummy Data Generator ---
function DummyDataGen(): JSX.Element {
  const [dataType, setDataType] = useState('user')
  const [count, setCount] = useState(5)
  const [output, setOutput] = useState('')

  const firstNames = [
    'John',
    'Jane',
    'Alice',
    'Bob',
    'Charlie',
    'Diana',
    'Eve',
    'Frank',
    'Grace',
    'Heidi'
  ]
  const lastNames = [
    'Smith',
    'Doe',
    'Johnson',
    'Brown',
    'Davis',
    'Wilson',
    'Clark',
    'Lewis',
    'Walker',
    'Hall'
  ]
  const domains = ['example.com', 'test.org', 'demo.net', 'company.io']

  const r = (arr: string[]): string => arr[Math.floor(Math.random() * arr.length)]
  const ri = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min

  const generate = (): void => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any[] = []
    for (let i = 0; i < count; i++) {
      if (dataType === 'user') {
        const fn = r(firstNames)
        const ln = r(lastNames)
        data.push({
          id: i + 1,
          uuid: crypto.randomUUID(),
          firstName: fn,
          lastName: ln,
          email: `${fn.toLowerCase()}.${ln.toLowerCase()}@${r(domains)}`,
          phone: `+1-555-${ri(100, 999)}-${ri(1000, 9999)}`,
          isActive: Math.random() > 0.2,
          createdAt: new Date(Date.now() - ri(0, 10000000000)).toISOString()
        })
      } else if (dataType === 'product') {
        const adjectives = ['Awesome', 'Sleek', 'Ergonomic', 'Rustic', 'Intelligent']
        const materials = ['Steel', 'Wooden', 'Concrete', 'Plastic', 'Cotton']
        const items = ['Chair', 'Car', 'Computer', 'Keyboard', 'Mouse']
        data.push({
          id: i + 1,
          sku: `PRD-${ri(1000, 9999)}`,
          name: `${r(adjectives)} ${r(materials)} ${r(items)}`,
          price: parseFloat((Math.random() * 1000).toFixed(2)),
          stock: ri(0, 500),
          category: r(['Electronics', 'Furniture', 'Clothing', 'Toys'])
        })
      }
    }
    setOutput(JSON.stringify(data, null, 2))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <select
          className="input-field"
          value={dataType}
          onChange={(e) => setDataType(e.target.value)}
          style={{ width: '150px' }}
        >
          <option value="user">Users</option>
          <option value="product">Products</option>
        </select>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label>Count:</label>
          <input
            type="number"
            className="input-field"
            value={count}
            onChange={(e) => setCount(parseInt(e.target.value) || 1)}
            min="1"
            max="100"
            style={{ width: '80px' }}
          />
        </div>
        <button className="btn btn-primary" onClick={generate}>
          Generate JSON
        </button>
        {output && (
          <button
            className="btn btn-secondary"
            onClick={() => navigator.clipboard.writeText(output)}
          >
            Copy
          </button>
        )}
      </div>
      <textarea
        className="input-field"
        readOnly
        value={output}
        style={{
          flex: 1,
          minHeight: '300px',
          fontFamily: 'monospace',
          resize: 'none',
          whiteSpace: 'pre',
          color: 'black'
        }}
        placeholder="JSON will appear here..."
      />
    </div>
  )
}

// --- 3. Cron Job Expression Builder ---
function CronBuilder(): JSX.Element {
  const [minute, setMinute] = useState('*')
  const [hour, setHour] = useState('*')
  const [dayOfMonth, setDayOfMonth] = useState('*')
  const [month, setMonth] = useState('*')
  const [dayOfWeek, setDayOfWeek] = useState('*')

  const cronString = `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div
        className="glass-panel"
        style={{
          background: 'rgba(0,0,0,0.2)',
          padding: '24px',
          textAlign: 'center',
          borderRadius: '12px'
        }}
      >
        <div
          style={{
            fontSize: '3rem',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            color: 'var(--theme-accent)',
            letterSpacing: '4px'
          }}
        >
          {cronString}
        </div>
        <button
          className="btn btn-secondary"
          style={{ marginTop: '16px' }}
          onClick={() => navigator.clipboard.writeText(cronString)}
        >
          Copy Cron String
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}
      >
        <CronField
          label="Minute (0-59)"
          value={minute}
          onChange={setMinute}
          options={['*', '*/5', '*/10', '*/15', '*/30', '0']}
        />
        <CronField
          label="Hour (0-23)"
          value={hour}
          onChange={setHour}
          options={['*', '*/2', '*/3', '*/4', '*/6', '*/12', '0', '12']}
        />
        <CronField
          label="Day of Month (1-31)"
          value={dayOfMonth}
          onChange={setDayOfMonth}
          options={['*', '1', '15', 'L']}
        />
        <CronField
          label="Month (1-12)"
          value={month}
          onChange={setMonth}
          options={['*', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']}
        />
        <CronField
          label="Day of Week (0-6)"
          value={dayOfWeek}
          onChange={setDayOfWeek}
          options={['*', '0', '1-5', '6,0']}
        />
      </div>

      <div style={{ marginTop: '16px', color: 'var(--text-muted)', fontSize: '0.9em' }}>
        <p>
          <strong>*</strong> : Any value | <strong>,</strong> : Value list separator |{' '}
          <strong>-</strong> : Range of values | <strong>/</strong> : Step values
        </p>
        <p>
          <em>Example: `*/5 * * * *` means Every 5 minutes</em>
        </p>
      </div>
    </div>
  )
}

function CronField({
  label,
  value,
  onChange,
  options
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: string[]
}): JSX.Element {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label style={{ fontWeight: '500' }}>{label}</label>
      <input
        type="text"
        className="input-field"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ color: 'black' }}
      />
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        {options.map((opt) => (
          <span
            key={opt}
            onClick={() => onChange(opt)}
            style={{
              cursor: 'pointer',
              padding: '2px 8px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '4px',
              fontSize: '0.8em'
            }}
          >
            {opt}
          </span>
        ))}
      </div>
    </div>
  )
}

// --- 4. File Hash Calculator ---
function FileHashCalc(): JSX.Element {
  const [fileDetails, setFileDetails] = useState<{ name: string; size: number } | null>(null)
  const [hashes, setHashes] = useState<{ md5?: string; sha1?: string; sha256?: string }>({})
  const [calculating, setCalculating] = useState(false)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileDetails({ name: file.name, size: file.size })
    setCalculating(true)
    setHashes({})

    try {
      const buffer = await file.arrayBuffer()

      // Calculate MD5 using md5 package
      const md5Hash = md5(new Uint8Array(buffer))

      // Calculate SHA-1 and SHA-256 using Web Crypto API
      const calcHash = async (algo: string): Promise<string> => {
        const hashBuffer = await crypto.subtle.digest(algo, buffer)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
      }

      const [sha1Hash, sha256Hash] = await Promise.all([calcHash('SHA-1'), calcHash('SHA-256')])

      setHashes({ md5: md5Hash, sha1: sha1Hash, sha256: sha256Hash })
    } catch (err) {
      console.error('Hash calculation failed', err)
    } finally {
      setCalculating(false)
    }
  }

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    const mb = bytes / (1024 * 1024)
    return mb.toFixed(2) + ' MB'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div
        style={{
          border: '2px dashed var(--glass-border)',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          position: 'relative',
          cursor: 'pointer',
          background: 'rgba(255,255,255,0.02)'
        }}
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <span style={{ fontSize: '3rem' }}>📁</span>
        <h3>Click or Drop file here</h3>
        <p style={{ color: 'var(--text-muted)' }}>
          Calculation is performed locally in your browser.
        </p>
        <input id="file-upload" type="file" style={{ display: 'none' }} onChange={handleFile} />
      </div>

      {fileDetails && (
        <div style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
          <h4>
            {fileDetails.name} ({formatSize(fileDetails.size)})
          </h4>

          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <HashResult label="MD5" value={hashes.md5} loading={calculating} />
            <HashResult label="SHA-1" value={hashes.sha1} loading={calculating} />
            <HashResult label="SHA-256" value={hashes.sha256} loading={calculating} />
          </div>
        </div>
      )}
    </div>
  )
}

function HashResult({
  label,
  value,
  loading
}: {
  label: string
  value?: string
  loading: boolean
}): JSX.Element {
  return (
    <div>
      <div style={{ fontWeight: '500', marginBottom: '4px' }}>{label}</div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          className="input-field"
          value={loading ? 'Calculating...' : value || ''}
          readOnly
          style={{
            flex: 1,
            fontFamily: 'monospace',
            color: loading ? 'var(--text-muted)' : 'black'
          }}
        />
        {value && (
          <button
            className="btn btn-secondary"
            onClick={() => navigator.clipboard.writeText(value)}
            title="Copy"
          >
            📋
          </button>
        )}
      </div>
    </div>
  )
}
