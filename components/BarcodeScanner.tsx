'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  onDetected: (code: string) => void
}

export default function BarcodeScanner({ onDetected }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const firedRef = useRef(false)
  const cbRef = useRef(onDetected)
  cbRef.current = onDetected
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    firedRef.current = false
    let stream: MediaStream | null = null
    let animId: number | null = null
    let stopped = false

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
        })
      } catch {
        setError('Camera access denied. Please allow camera permission and try again.')
        return
      }

      const video = videoRef.current
      if (!video || stopped) {
        stream.getTracks().forEach((t) => t.stop())
        return
      }

      video.srcObject = stream
      try {
        await video.play()
      } catch {
        // autoplay might be blocked; playsInline + muted should handle it
      }

      // Wait for video dimensions to be available
      if (video.videoWidth === 0) {
        await new Promise<void>((resolve) => {
          video.onloadedmetadata = () => resolve()
        })
      }

      if (stopped) return

      // Prefer native BarcodeDetector (Chrome 88+, Edge, Android WebView)
      if ('BarcodeDetector' in window) {
        const detector = new (window as unknown as { BarcodeDetector: new () => { detect: (src: HTMLVideoElement) => Promise<{ rawValue: string }[]> } }).BarcodeDetector()
        const detect = async () => {
          if (stopped || firedRef.current) return
          try {
            const codes = await detector.detect(video)
            if (codes.length > 0 && !firedRef.current) {
              firedRef.current = true
              cbRef.current(codes[0].rawValue)
              return
            }
          } catch { /* no barcode in frame */ }
          animId = requestAnimationFrame(detect)
        }
        detect()
        return
      }

      // Fallback: @zxing/library canvas decode loop
      try {
        const { MultiFormatReader, BinaryBitmap, HybridBinarizer, RGBLuminanceSource } =
          await import('@zxing/library')
        const reader = new MultiFormatReader()
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')!

        const tick = () => {
          if (stopped || firedRef.current || !videoRef.current) return
          const vid = videoRef.current
          if (vid.readyState >= vid.HAVE_ENOUGH_DATA && vid.videoWidth > 0) {
            canvas.width = vid.videoWidth
            canvas.height = vid.videoHeight
            ctx.drawImage(vid, 0, 0)
            try {
              const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
              const src = new RGBLuminanceSource(
                imgData.data as unknown as Uint8ClampedArray,
                canvas.width,
                canvas.height
              )
              const result = reader.decode(new BinaryBitmap(new HybridBinarizer(src)))
              if (result && !firedRef.current) {
                firedRef.current = true
                cbRef.current(result.getText())
                return
              }
            } catch { /* NotFoundException is normal */ }
          }
          animId = requestAnimationFrame(tick)
        }
        animId = requestAnimationFrame(tick)
      } catch (e) {
        console.error('Barcode library failed to load:', e)
      }
    }

    start()

    return () => {
      stopped = true
      if (animId !== null) cancelAnimationFrame(animId)
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  return (
    <div className="space-y-3">
      {error ? (
        <div className="w-full rounded-xl bg-gray-900 flex items-center justify-center p-6 text-center" style={{ height: '240px' }}>
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      ) : (
        <div className="relative w-full rounded-xl overflow-hidden bg-black" style={{ height: '240px' }}>
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            muted
            playsInline
            autoPlay
          />
          {/* Aim guide */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="border-2 border-white/70 rounded" style={{ width: '260px', height: '100px' }} />
          </div>
        </div>
      )}
      <p className="text-center text-xs text-gray-400">
        Point the camera at the barcode on the pill bottle
      </p>
    </div>
  )
}
