import React, { useState } from 'react'

export default function ApiTester(): React.JSX.Element {
    const [method, setMethod] = useState('GET')
    const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/todos/1')

    const [headers, setHeaders] = useState([{ key: '', value: '' }])
    const [params, setParams] = useState([{ key: '', value: '' }])
    const [body, setBody] = useState('')
    const [activeTab, setActiveTab] = useState<'params' | 'headers' | 'body'>('params')

    const [response, setResponse] = useState<{
        status: number
        statusText: string
        time: number
        data: string
        error?: string
    } | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSendRequest = async (): Promise<void> => {
        if (!url) return
        setLoading(true)
        setResponse(null)
        const startTime = performance.now()

        try {
            // Build URL with params
            const urlObj = new URL(url)
            params.forEach((p) => {
                if (p.key) urlObj.searchParams.append(p.key, p.value)
            })

            // Build headers
            const reqHeaders = new Headers()
            headers.forEach((h) => {
                if (h.key) reqHeaders.append(h.key, h.value)
            })
            if (!reqHeaders.has('Content-Type') && ['POST', 'PUT', 'PATCH'].includes(method) && body) {
                reqHeaders.append('Content-Type', 'application/json')
            }

            // Build request
            const reqOptions: RequestInit = {
                method,
                headers: reqHeaders
            }
            if (['POST', 'PUT', 'PATCH'].includes(method) && body) {
                // try to parse as JSON first to catch errors early, fallback to raw string
                try {
                    JSON.parse(body)
                    reqOptions.body = body
                } catch {
                    reqOptions.body = body
                }
            }

            const res = await fetch(urlObj.toString(), reqOptions)
            const textData = await res.text()
            const endTime = performance.now()

            let formattedData = textData
            try {
                const jsonData = JSON.parse(textData)
                formattedData = JSON.stringify(jsonData, null, 2)
            } catch {
                // Not JSON, leave as text
            }

            setResponse({
                status: res.status,
                statusText: res.statusText,
                time: Math.round(endTime - startTime),
                data: formattedData
            })
        } catch (err: unknown) {
            setResponse({
                status: 0,
                statusText: 'Error',
                time: Math.round(performance.now() - startTime),
                data: '',
                error: err instanceof Error ? err.message : String(err)
            })
        } finally {
            setLoading(false)
        }
    }

    const renderKeyValueEditor = (
        items: { key: string; value: string }[],
        setItems: React.Dispatch<React.SetStateAction<{ key: string; value: string }[]>>
    ): React.JSX.Element => {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {items.map((item, index) => (
                    <div key={index} style={{ display: 'flex', gap: '8px' }}>
                        <input
                            type="text"
                            placeholder="Key"
                            value={item.key}
                            onChange={(e) => {
                                const newItems = [...items]
                                newItems[index].key = e.target.value
                                setItems(newItems)
                            }}
                            style={{ flex: 1, padding: '8px', color: '#fff' }}
                            className="glass-panel"
                        />
                        <input
                            type="text"
                            placeholder="Value"
                            value={item.value}
                            onChange={(e) => {
                                const newItems = [...items]
                                newItems[index].value = e.target.value
                                setItems(newItems)
                            }}
                            style={{ flex: 2, padding: '8px', color: '#fff' }}
                            className="glass-panel"
                        />
                        <button
                            className="btn"
                            style={{ padding: '8px 12px', background: 'rgba(255,50,50,0.2)', color: '#fff' }}
                            onClick={() => {
                                const newItems = items.filter((_, i) => i !== index)
                                if (newItems.length === 0) newItems.push({ key: '', value: '' })
                                setItems(newItems)
                            }}
                        >
                            ✕
                        </button>
                    </div>
                ))}
                <button
                    className="btn"
                    style={{ alignSelf: 'flex-start', fontSize: '0.85rem', color: '#fff' }}
                    onClick={() => setItems([...items, { key: '', value: '' }])}
                >
                    + Add
                </button>
            </div>
        )
    }

    return (
        <div
            className="glass-panel"
            style={{
                padding: '32px',
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px'
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
                    API Tester
                </h2>

                {/* URL and Method Bar */}
                <div style={{ display: 'flex', gap: '12px' }}>
                    <select
                        value={method}
                        onChange={(e) => setMethod(e.target.value)}
                        className="glass-panel"
                        style={{ padding: '12px', outline: 'none', border: 'none', fontWeight: 'bold', color: '#fff' }}
                    >
                        {['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'].map((m) => (
                            <option key={m} style={{ background: '#1a1b26', color: '#fff' }}>
                                {m}
                            </option>
                        ))}
                    </select>
                    <input
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Enter request URL"
                        className="glass-panel"
                        style={{ flex: 1, padding: '12px', fontSize: '1rem', color: '#fff' }}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendRequest()}
                    />
                    <button
                        className="btn btn-primary"
                        onClick={handleSendRequest}
                        disabled={loading}
                        style={{ padding: '0 24px', fontWeight: 'bold', color: '#fff' }}
                    >
                        {loading ? 'Sending...' : 'Send'}
                    </button>
                </div>

                {/* Request Config Tabs */}
                <div style={{ marginTop: '24px' }}>
                    <div
                        style={{
                            display: 'flex',
                            borderBottom: '1px solid var(--glass-border)',
                            marginBottom: '16px'
                        }}
                    >
                        {(['params', 'headers', 'body'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: activeTab === tab ? 'var(--theme-accent)' : 'var(--text-muted)',
                                    padding: '8px 16px',
                                    cursor: 'pointer',
                                    borderBottom:
                                        activeTab === tab ? '2px solid var(--theme-accent)' : '2px solid transparent',
                                    textTransform: 'capitalize',
                                    fontWeight: activeTab === tab ? '600' : '400'
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div style={{ minHeight: '150px' }}>
                        {activeTab === 'params' && renderKeyValueEditor(params, setParams)}
                        {activeTab === 'headers' && renderKeyValueEditor(headers, setHeaders)}
                        {activeTab === 'body' && (
                            <textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                placeholder='{\n  "key": "value"\n}'
                                className="glass-panel"
                                style={{
                                    width: '100%',
                                    height: '150px',
                                    padding: '12px',
                                    fontFamily: 'monospace',
                                    color: '#fff',
                                    resize: 'vertical',
                                    opacity: ['GET', 'HEAD'].includes(method) ? 0.5 : 1
                                }}
                                disabled={['GET', 'HEAD'].includes(method)}
                            />
                        )}
                    </div>
                </div>

                {/* Response Section */}
                {response && (
                    <div style={{ marginTop: '32px' }}>
                        <h3 style={{ marginBottom: '16px', color: 'var(--text-muted)' }}>Response</h3>
                        <div className="glass-panel" style={{ padding: '16px' }}>
                            <div
                                style={{ display: 'flex', gap: '16px', marginBottom: '16px', fontSize: '0.85rem' }}
                            >
                                <span
                                    style={{
                                        color:
                                            response.status >= 200 && response.status < 300
                                                ? '#2ed573' // Green
                                                : response.status >= 400
                                                    ? '#ff4757' // Red
                                                    : '#eccc68', // Yellow
                                        fontWeight: 'bold',
                                        padding: '4px 8px',
                                        background: 'rgba(0,0,0,0.3)',
                                        borderRadius: '4px'
                                    }}
                                >
                                    Status: {response.status} {response.statusText}
                                </span>
                                <span style={{ color: 'var(--text-muted)', padding: '4px 0' }}>
                                    Time: <span style={{ color: '#2ed573' }}>{response.time} ms</span>
                                </span>
                            </div>

                            {response.error ? (
                                <div
                                    style={{
                                        color: '#ff4757',
                                        padding: '12px',
                                        background: 'rgba(255,71,87,0.1)',
                                        borderRadius: '4px'
                                    }}
                                >
                                    {response.error}
                                </div>
                            ) : (
                                <pre
                                    style={{
                                        background: 'rgba(0,0,0,0.5)',
                                        padding: '16px',
                                        borderRadius: '8px',
                                        overflowX: 'auto',
                                        fontFamily: 'monospace',
                                        fontSize: '0.85rem',
                                        color: '#a3be8c',
                                        margin: 0,
                                        maxHeight: '400px'
                                    }}
                                >
                                    {response.data || 'Empty Response'}
                                </pre>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
