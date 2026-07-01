import React, { useState, useRef, useEffect } from 'react'
import { useI18n } from '@/shared/i18n'

interface ImageCropperProps {
  imageUrl: string
  shape?: 'square' | 'round'
  onCrop: (croppedBase64: string) => void
  onCancel: () => void
}

export const ImageCropper: React.FC<ImageCropperProps> = ({
  imageUrl,
  shape = 'round',
  onCrop,
  onCancel,
}) => {
  const { t } = useI18n()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const imageRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      imageRef.current = img
      setScale(1)
      draw(1, { x: 0, y: 0 }, img)
    }
    img.src = imageUrl
  }, [imageUrl])

  useEffect(() => {
    if (imageRef.current) {
      draw(scale, offset, imageRef.current)
    }
  }, [scale, offset])

  const draw = (currentScale: number, currentOffset: { x: number, y: number }, img: HTMLImageElement) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const size = canvas.width
    const imgRatio = img.width / img.height
    let drawWidth = size
    let drawHeight = size

    if (imgRatio > 1) {
      drawWidth = drawHeight * imgRatio
    } else {
      drawHeight = drawWidth / imgRatio
    }

    drawWidth *= currentScale
    drawHeight *= currentScale

    const x = (size - drawWidth) / 2 + currentOffset.x
    const y = (size - drawHeight) / 2 + currentOffset.y

    ctx.drawImage(img, x, y, drawWidth, drawHeight)
  }

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true)
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY
    setDragStart({ x: clientX - offset.x, y: clientY - offset.y })
  }

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY
    setOffset({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleSave = () => {
    if (canvasRef.current) {
      onCrop(canvasRef.current.toDataURL('image/png', 0.9))
    }
  }

  const cropFrameClassName = shape === 'square' ? 'rounded-md' : 'rounded-full'

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl p-6 shadow-xl max-w-sm w-full">
        <h3 className="mb-4 text-center text-xl font-bold text-gray-800">{t('personalInfo.cropPhoto')}</h3>
        <div className="flex justify-center mb-6 overflow-hidden touch-none relative">
          <canvas
            ref={canvasRef}
            width={256}
            height={256}
            className={`border border-gray-200 cursor-move shadow-sm bg-gray-50 ${cropFrameClassName}`}
            style={{ touchAction: 'none' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
          />
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className={`w-[256px] h-[256px] border-[2px] border-dashed border-white/50 shadow-[0_0_0_9999px_rgba(0,0,0,0.2)] ${cropFrameClassName}`}></div>
          </div>
        </div>
        <div className="mb-6 px-2">
          <label className="flex justify-between text-sm font-medium text-gray-700 mb-2">
            <span>{t('personalInfo.zoom')}</span>
            <span>{Math.round(scale * 100)}%</span>
          </label>
          <input
            type="range"
            min="1"
            max="3"
            step="0.01"
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50">
            {t('common.cancel')}
          </button>
          <button onClick={handleSave} className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">
            {t('common.save')}
          </button>
        </div>
      </div>
    </div>
  )
}
