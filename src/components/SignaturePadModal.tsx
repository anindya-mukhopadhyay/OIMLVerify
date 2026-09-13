import { Check, Eraser, PenTool, RotateCcw, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface SignaturePadModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (signatureDataUrl: string) => void
  officerName?: string
  officerRole?: string
}

export function SignaturePadModal({
  isOpen,
  onClose,
  onSave,
  officerName = 'Authorized Metrological Inspector',
  officerRole = 'Senior Verification Officer',
}: SignaturePadModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const strokesRef = useRef<Array<Array<{ x: number; y: number }>>>([])
  const currentStrokeRef = useRef<Array<{ x: number; y: number }>>([])

  const redrawCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw baseline guideline
    ctx.strokeStyle = '#e2e8f0'
    ctx.lineWidth = 1
    ctx.setLineDash([6, 6])
    ctx.beginPath()
    ctx.moveTo(30, canvas.height - 40)
    ctx.lineTo(canvas.width - 30, canvas.height - 40)
    ctx.stroke()
    ctx.setLineDash([])

    // Draw all strokes
    ctx.strokeStyle = '#0c2340' // Official Metrology Navy Ink
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    strokesRef.current.forEach((stroke) => {
      if (stroke.length < 2) return
      ctx.beginPath()
      ctx.moveTo(stroke[0].x, stroke[0].y)
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i].x, stroke[i].y)
      }
      ctx.stroke()
    })
  }

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const canvas = canvasRef.current
        if (canvas) {
          canvas.width = canvas.parentElement?.clientWidth || 500
          canvas.height = 200
          strokesRef.current = []
          setHasSignature(false)
          redrawCanvas()
        }
      }, 50)
    }
  }, [isOpen])

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.setPointerCapture(e.pointerId)
    setIsDrawing(true)

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    currentStrokeRef.current = [{ x, y }]
  }

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    currentStrokeRef.current.push({ x, y })

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.strokeStyle = '#0c2340'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    const stroke = currentStrokeRef.current
    if (stroke.length > 1) {
      ctx.beginPath()
      ctx.moveTo(stroke[stroke.length - 2].x, stroke[stroke.length - 2].y)
      ctx.lineTo(x, y)
      ctx.stroke()
    }
    setHasSignature(true)
  }

  const stopDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    setIsDrawing(false)
    const canvas = canvasRef.current
    if (canvas) {
      canvas.releasePointerCapture(e.pointerId)
    }

    if (currentStrokeRef.current.length > 0) {
      strokesRef.current.push([...currentStrokeRef.current])
      currentStrokeRef.current = []
    }
  }

  const clear = () => {
    strokesRef.current = []
    currentStrokeRef.current = []
    setHasSignature(false)
    redrawCanvas()
  }

  const undo = () => {
    if (strokesRef.current.length > 0) {
      strokesRef.current.pop()
      setHasSignature(strokesRef.current.length > 0)
      redrawCanvas()
    }
  }

  const handleSave = () => {
    const canvas = canvasRef.current
    if (!canvas || !hasSignature) return
    const dataUrl = canvas.toDataURL('image/png')
    onSave(dataUrl)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="camera-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="signature-modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="camera-modal-header">
          <div className="camera-header-info">
            <PenTool size={20} className="camera-header-icon" />
            <div>
              <h3>Inspector Digital e-Signature</h3>
              <span className="signature-officer-sub">
                {officerName} ({officerRole})
              </span>
            </div>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close signature pad">
            <X size={20} />
          </button>
        </div>

        <div className="signature-canvas-container">
          <canvas
            ref={canvasRef}
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            onPointerCancel={stopDrawing}
            className="signature-canvas"
          />
          <div className="signature-sign-guide">
            <span>Sign within the boundary using stylus, touch, or mouse</span>
          </div>
        </div>

        <div className="signature-modal-actions">
          <div className="signature-tools-left">
            <button
              type="button"
              className="secondary-button"
              onClick={undo}
              disabled={!hasSignature}
              title="Undo last stroke"
            >
              <RotateCcw size={16} />
              <span>Undo</span>
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={clear}
              disabled={!hasSignature}
              title="Clear signature pad"
            >
              <Eraser size={16} />
              <span>Clear</span>
            </button>
          </div>

          <div className="signature-tools-right">
            <button type="button" className="secondary-button" onClick={onClose}>
              <span>Cancel</span>
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={handleSave}
              disabled={!hasSignature}
            >
              <Check size={18} />
              <span>Affix Signature</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
