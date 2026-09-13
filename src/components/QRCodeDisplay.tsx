import QRCode from 'qrcode'
import { Download, QrCode as QrIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

interface QRCodeDisplayProps {
  value: string
  size?: number
  label?: string
  showDownload?: boolean
  className?: string
}

export function QRCodeDisplay({
  value,
  size = 180,
  label,
  showDownload = false,
  className = '',
}: QRCodeDisplayProps) {
  const [dataUrl, setDataUrl] = useState<string>('')

  useEffect(() => {
    QRCode.toDataURL(value, {
      width: size,
      margin: 1,
      color: {
        dark: '#0c2340',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => setDataUrl(url))
      .catch((err) => console.error('QR generation error:', err))
  }, [value, size])

  const downloadQR = () => {
    if (!dataUrl) return
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `OIML-QR-${Date.now()}.png`
    a.click()
  }

  return (
    <div className={`qr-display-container ${className}`}>
      {dataUrl ? (
        <div className="qr-image-wrapper">
          <img
            src={dataUrl}
            alt={label || 'Verification QR Code'}
            width={size}
            height={size}
            className="qr-image"
          />
          <div className="qr-corner top-left" />
          <div className="qr-corner top-right" />
          <div className="qr-corner bottom-left" />
          <div className="qr-corner bottom-right" />
        </div>
      ) : (
        <div
          className="qr-placeholder"
          style={{ width: size, height: size }}
          aria-label="Loading QR code"
        >
          <QrIcon size={32} className="qr-loading-icon" />
        </div>
      )}
      {label && <span className="qr-caption">{label}</span>}
      {showDownload && dataUrl && (
        <button
          type="button"
          className="secondary-button qr-download-btn"
          onClick={downloadQR}
          title="Download QR Code PNG"
        >
          <Download size={14} />
          <span>Save QR</span>
        </button>
      )}
    </div>
  )
}
