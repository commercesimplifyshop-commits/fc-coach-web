// Frame extraction happens entirely in the browser: the video file never
// leaves the user's machine, only small JPEG frames are uploaded.

export interface VideoHandle {
  video: HTMLVideoElement
  duration: number
  width: number
  height: number
  dispose: () => void
}

export interface Crop {
  /** All values are fractions of the frame (0..1). */
  x: number
  y: number
  w: number
  h: number
}

export function openVideo(file: File): Promise<VideoHandle> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const video = document.createElement('video')
    video.muted = true
    video.playsInline = true
    video.preload = 'auto'
    const dispose = () => {
      video.removeAttribute('src')
      video.load()
      URL.revokeObjectURL(url)
    }
    video.onloadedmetadata = () => {
      if (!Number.isFinite(video.duration) || video.duration <= 0) {
        dispose()
        reject(new Error('Não consegui ler a duração deste vídeo.'))
        return
      }
      resolve({ video, duration: video.duration, width: video.videoWidth, height: video.videoHeight, dispose })
    }
    video.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Não consegui abrir este vídeo. Use um arquivo MP4 (H.264).'))
    }
    video.src = url
  })
}

function seekTo(video: HTMLVideoElement, t: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const target = Math.min(Math.max(0, t), Math.max(0, video.duration - 0.05))
    if (Math.abs(video.currentTime - target) < 0.001 && video.readyState >= 2) {
      resolve()
      return
    }
    const timer = window.setTimeout(() => {
      video.removeEventListener('seeked', onSeeked)
      reject(new Error('O navegador demorou demais para posicionar o vídeo.'))
    }, 20000)
    const onSeeked = () => {
      window.clearTimeout(timer)
      video.removeEventListener('seeked', onSeeked)
      resolve()
    }
    video.addEventListener('seeked', onSeeked)
    video.currentTime = target
  })
}

const MAX_BYTES = 340 * 1024

function toBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Falha ao gerar imagem.'))), 'image/jpeg', quality))
}

/** Grabs one JPEG frame at time t (seconds), optionally cropped and downscaled. */
export async function grabFrame(h: VideoHandle, t: number, opts: { maxWidth: number; crop?: Crop }): Promise<Blob> {
  await seekTo(h.video, t)
  const c = opts.crop ?? { x: 0, y: 0, w: 1, h: 1 }
  const sx = Math.round(c.x * h.width)
  const sy = Math.round(c.y * h.height)
  const sw = Math.max(1, Math.round(c.w * h.width))
  const sh = Math.max(1, Math.round(c.h * h.height))
  const scale = Math.min(1, opts.maxWidth / sw)
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(sw * scale))
  canvas.height = Math.max(1, Math.round(sh * scale))
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Seu navegador não permite processar imagens.')
  ctx.drawImage(h.video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height)

  let blob = await toBlob(canvas, 0.78)
  for (const q of [0.65, 0.5, 0.4]) {
    if (blob.size <= MAX_BYTES) break
    blob = await toBlob(canvas, q)
  }
  return blob
}

export function formatTime(seconds: number): string {
  const s = Math.max(0, Math.round(seconds))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/** "3:57", "03:57" or "237" -> seconds; null when it cannot be parsed. */
export function parseTime(text: string): number | null {
  const t = text.trim()
  const m = /^(\d{1,3}):([0-5]?\d)$/.exec(t)
  if (m) return Number(m[1]) * 60 + Number(m[2])
  return /^\d+$/.test(t) ? Number(t) : null
}
