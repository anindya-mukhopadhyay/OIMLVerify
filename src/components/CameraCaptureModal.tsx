import { Camera, Check, MapPin, RefreshCw, SwitchCamera, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

interface CameraCaptureModalProps {
  isOpen: boolean
  onClose: () => void
  onCapture: (file: File, metadata: { geo?: string; timestamp: string }) => void
  title?: string
}

export function CameraCaptureModal({
  isOpen,
  onClose,
  onCapture,
  title = 'Field Inspection Photo Capture',
}: CameraCaptureModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment')
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null)
  const [geoCoords, setGeoCoords] = useState<string>('Detecting GPS...')
  const [isLocating, setIsLocating] = useState<boolean>(true)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [flash, setFlash] = useState<boolean>(false)

  // Fetch GPS Coordinates for on-site verification watermarking
  useEffect(() => {
    if (!isOpen) return

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toFixed(5)
          const lon = position.coords.longitude.toFixed(5)
          const accuracy = Math.round(position.coords.accuracy)
          setGeoCoords(`${lat}° N, ${lon}° E (±${accuracy}m)`)
          setIsLocating(false)
        },
        () => {
          setGeoCoords('28.6139° N, 77.2090° E (Legal Metrology Lab)')
          setIsLocating(false)
        },
        { timeout: 8000, enableHighAccuracy: true },
      )
    } else {
      queueMicrotask(() => {
        setGeoCoords('GPS Not Supported (Lab Fixed Station)')
        setIsLocating(false)
      })
    }
  }, [isOpen])

  // Initialize camera stream
  const startCamera = useCallback(async () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      }
      const newStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(newStream)
      setCameraError(null)
      if (videoRef.current) {
        videoRef.current.srcObject = newStream
      }
    } catch (err) {
      console.warn('Camera access error:', err)
      setCameraError(
        'Unable to access camera. Please allow camera permissions in your browser or use the file upload option.',
      )
    }
  }, [facingMode, stream])

  useEffect(() => {
    if (isOpen && !capturedDataUrl) {
      const timer = setTimeout(() => {
        startCamera()
      }, 50)
      return () => clearTimeout(timer)
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [isOpen, capturedDataUrl, startCamera, stream])

  const flipCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))
  }

  const takeSnapshot = () => {
    if (!videoRef.current) return

    setFlash(true)
    setTimeout(() => setFlash(false), 200)

    const video = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 720
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Draw video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Draw Official Government Metrology Watermark Banner at bottom
    const bannerHeight = Math.max(54, canvas.height * 0.08)
    ctx.fillStyle = 'rgba(12, 35, 64, 0.88)' // Deep Government Navy
    ctx.fillRect(0, canvas.height - bannerHeight, canvas.width, bannerHeight)

    // Gold security line above watermark
    ctx.strokeStyle = '#c27803'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(0, canvas.height - bannerHeight)
    ctx.lineTo(canvas.width, canvas.height - bannerHeight)
    ctx.stroke()

    // Watermark Text: Authority & Coordinates
    const readableDate = new Date().toLocaleString()
    ctx.fillStyle = '#ffffff'
    ctx.font = `bold ${Math.max(14, Math.floor(canvas.height * 0.024))}px sans-serif`
    ctx.fillText('LEGAL METROLOGY DEPT · OIML R-76 EVIDENCE VERIFICATION', 20, canvas.height - bannerHeight + 24)

    ctx.fillStyle = '#dfeeee'
    ctx.font = `${Math.max(12, Math.floor(canvas.height * 0.019))}px monospace`
    ctx.fillText(`GPS: ${geoCoords} | ${readableDate}`, 20, canvas.height - 12)

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
    setCapturedDataUrl(dataUrl)

    // Stop live stream tracks while previewing
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
  }

  const retake = () => {
    setCapturedDataUrl(null)
    startCamera()
  }

  const confirmAndSave = () => {
    if (!capturedDataUrl) return

    // Convert data URL to File
    const arr = capturedDataUrl.split(',')
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg'
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }

    const timestamp = new Date().toISOString()
    const fileName = `OIML-PHOTO-${Date.now()}.jpg`
    const file = new File([u8arr], fileName, { type: mime })

    onCapture(file, {
      geo: geoCoords,
      timestamp,
    })

    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="camera-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="camera-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="camera-modal-header">
          <div className="camera-header-info">
            <Camera size={20} className="camera-header-icon" />
            <div>
              <h3>{title}</h3>
              <span className="camera-geo-pill">
                <MapPin size={12} />
                {isLocating ? 'Acquiring GPS...' : geoCoords}
              </span>
            </div>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close Camera">
            <X size={20} />
          </button>
        </div>

        <div className="camera-viewfinder-container">
          {flash && <div className="camera-flash" />}

          {cameraError ? (
            <div className="camera-error-panel">
              <Camera size={44} />
              <p>{cameraError}</p>
              <button type="button" className="secondary-button" onClick={startCamera}>
                <RefreshCw size={16} />
                <span>Retry Access</span>
              </button>
            </div>
          ) : capturedDataUrl ? (
            <div className="camera-preview-wrapper">
              <img src={capturedDataUrl} alt="Captured preview" className="camera-captured-image" />
              <div className="camera-watermark-notice">
                <Check size={16} />
                <span>Geotag & Time-Watermark Stamped</span>
              </div>
            </div>
          ) : (
            <div className="camera-live-wrapper">
              <video ref={videoRef} autoPlay playsInline muted className="camera-video-stream" />
              <div className="camera-guide-target" />
              <div className="camera-guide-overlay">
                <span>Align scale, serial plate, or test weight within frame</span>
              </div>
            </div>
          )}
        </div>

        <div className="camera-modal-actions">
          {capturedDataUrl ? (
            <>
              <button type="button" className="secondary-button" onClick={retake}>
                <RefreshCw size={18} />
                <span>Retake</span>
              </button>
              <button type="button" className="primary-button" onClick={confirmAndSave}>
                <Check size={18} />
                <span>Use Photo</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="secondary-button"
                onClick={flipCamera}
                title="Flip Camera (Front/Back)"
              >
                <SwitchCamera size={18} />
                <span>Flip Camera</span>
              </button>
              <button
                type="button"
                className="primary-button shutter-button"
                onClick={takeSnapshot}
                disabled={Boolean(cameraError)}
              >
                <div className="shutter-inner" />
                <span>Capture</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
