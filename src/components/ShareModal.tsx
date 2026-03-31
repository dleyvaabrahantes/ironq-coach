import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'

interface Props {
  planId: string
  url: string
  onClose: () => void
}

export function ShareModal({ planId, url, onClose }: Props) {
  const deepLink = `ironiq://coach?id=${planId}`
  const [copied, setCopied] = useState<'url' | 'deeplink' | null>(null)

  const copy = async (text: string, type: 'url' | 'deeplink') => {
    await navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" style={{ maxHeight: '80vh' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span style={{ fontWeight: 700, fontSize: 15 }}>Share Plan</span>
          <button className="modal-close" onClick={onClose}>Close</button>
        </div>

        <div style={{ overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>
          {/* Success icon */}
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'rgba(232,255,60,0.15)', border: '2px solid var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
          }}>
            🔗
          </div>

          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Plan Ready to Share!</h2>
            <p style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.5 }}>
              Send the link or QR code to your client. When they tap it on an iPhone with IronQ installed, the plan will open automatically.
            </p>
          </div>

          {/* QR code */}
          <div style={{
            background: '#fff', padding: 16, borderRadius: 'var(--radius-md)',
            display: 'inline-block',
          }}>
            <QRCodeSVG value={url} size={160} />
          </div>

          {/* Deep link */}
          <div style={{ width: '100%' }}>
            <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Deep Link (iOS)
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <input readOnly value={deepLink} style={{ flex: 1, fontSize: 12 }} onClick={e => (e.target as HTMLInputElement).select()} />
              <button
                onClick={() => copy(deepLink, 'deeplink')}
                style={{
                  background: 'var(--accent)', color: '#0A0A0F', border: 'none',
                  borderRadius: 'var(--radius-sm)', padding: '0 14px', fontSize: 13,
                  fontWeight: 700, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap',
                }}
              >
                {copied === 'deeplink' ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Web URL */}
          <div style={{ width: '100%' }}>
            <p style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Web URL (Universal Link)
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <input readOnly value={url} style={{ flex: 1, fontSize: 12 }} onClick={e => (e.target as HTMLInputElement).select()} />
              <button
                onClick={() => copy(url, 'url')}
                style={{
                  background: 'var(--card)', color: 'var(--text)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)', padding: '0 14px', fontSize: 13,
                  fontWeight: 600, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap',
                }}
              >
                {copied === 'url' ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <p style={{ fontSize: 12, color: 'var(--text-dim)', textAlign: 'center' }}>
            Plan ID: <code style={{ color: 'var(--accent)' }}>{planId}</code>
          </p>
        </div>
      </div>
    </div>
  )
}
