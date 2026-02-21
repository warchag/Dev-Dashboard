import { useState } from 'react'

export default function MiniTools() {
    const [activeTool, setActiveTool] = useState('json')
    const [inputVal, setInputVal] = useState('')
    const [outputVal, setOutputVal] = useState('')

    const tools = [
        { id: 'json', label: 'JSON Formatter' },
        { id: 'base64', label: 'Base64 Encode/Decode' },
        { id: 'url', label: 'URL Encode/Decode' },
        { id: 'jwt', label: 'JWT Decoder' }
    ]

    const handleJsonFormat = () => {
        try {
            const obj = JSON.parse(inputVal)
            setOutputVal(JSON.stringify(obj, null, 2))
        } catch (e: any) {
            setOutputVal(`Error: Invalid JSON\n${e.message}`)
        }
    }

    const handleBase64E = () => {
        try {
            setOutputVal(btoa(inputVal))
        } catch (e: any) {
            setOutputVal(`Error: ${e.message}`)
        }
    }

    const handleBase64D = () => {
        try {
            setOutputVal(atob(inputVal))
        } catch (e: any) {
            setOutputVal(`Error: ${e.message}`)
        }
    }

    const handleUrlE = () => setOutputVal(encodeURIComponent(inputVal))
    const handleUrlD = () => setOutputVal(decodeURIComponent(inputVal))

    const handleJwt = () => {
        try {
            const parts = inputVal.split('.')
            if (parts.length !== 3) throw new Error('Invalid JWT format (Need header.payload.signature)')
            const header = JSON.parse(atob(parts[0]))
            const payload = JSON.parse(atob(parts[1]))
            setOutputVal(`Header:\n${JSON.stringify(header, null, 2)}\n\nPayload:\n${JSON.stringify(payload, null, 2)}`)
        } catch (e: any) {
            setOutputVal(`Error: Invalid JWT\n${e.message}`)
        }
    }

    return (
        <div className="glass-panel" style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ marginBottom: '24px' }}>Mini Tools</h2>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
                {tools.map(t => (
                    <button
                        key={t.id}
                        className="btn"
                        style={{
                            background: activeTool === t.id ? 'var(--theme-accent)' : 'var(--glass-bg)',
                            color: activeTool === t.id ? '#fff' : 'var(--text-muted)',
                            border: activeTool === t.id ? '1px solid var(--theme-accent)' : '1px solid var(--glass-border)'
                        }}
                        onClick={() => setActiveTool(t.id)}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <div style={{ display: 'flex', gap: '16px', flex: 1, minHeight: 0 }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <label style={{ marginBottom: '8px', color: 'var(--text-muted)' }}>Input</label>
                    <textarea
                        value={inputVal}
                        onChange={e => setInputVal(e.target.value)}
                        style={{
                            flex: 1,
                            padding: '16px',
                            borderRadius: '12px',
                            backgroundColor: 'rgba(0,0,0,0.3)',
                            border: '1px solid var(--glass-border)',
                            color: 'var(--text-main)',
                            fontFamily: 'monospace',
                            resize: 'none',
                            outline: 'none'
                        }}
                        placeholder="Paste your input here..."
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '8px', width: '120px' }}>
                    {activeTool === 'json' && <button className="btn" onClick={handleJsonFormat}>Format ➜</button>}
                    {activeTool === 'base64' && (
                        <>
                            <button className="btn" onClick={handleBase64E}>Encode ➜</button>
                            <button className="btn" onClick={handleBase64D}>Decode ➜</button>
                        </>
                    )}
                    {activeTool === 'url' && (
                        <>
                            <button className="btn" onClick={handleUrlE}>Encode ➜</button>
                            <button className="btn" onClick={handleUrlD}>Decode ➜</button>
                        </>
                    )}
                    {activeTool === 'jwt' && <button className="btn" onClick={handleJwt}>Decode ➜</button>}

                    <button
                        className="btn"
                        style={{ marginTop: '24px', background: 'transparent', border: '1px dashed var(--glass-border)' }}
                        onClick={() => { setInputVal(''); setOutputVal('') }}
                    >
                        Clear
                    </button>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <label style={{ marginBottom: '8px', color: 'var(--text-muted)' }}>Output</label>
                    <textarea
                        readOnly
                        value={outputVal}
                        style={{
                            flex: 1,
                            padding: '16px',
                            borderRadius: '12px',
                            backgroundColor: 'rgba(0,0,0,0.3)',
                            border: '1px solid var(--glass-border)',
                            color: 'var(--theme-accent)',
                            fontFamily: 'monospace',
                            resize: 'none',
                            outline: 'none'
                        }}
                        placeholder="Result will appear here..."
                    />
                </div>
            </div>
        </div>
    )
}
