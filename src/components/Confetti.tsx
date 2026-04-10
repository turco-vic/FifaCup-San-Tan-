import { useEffect, useRef } from 'react'

interface ConfettiProps {
  active: boolean
  duration?: number // ms, default 5000
}

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  size: number
  rotation: number
  rotationSpeed: number
  shape: 'rect' | 'circle' | 'star'
  alpha: number
  decay: number
}

const COLORS = [
  '#C9991A', // gold
  '#FFD700', // bright gold
  '#FFFFFF', // white
  '#4CAF50', // green
  '#FFB347', // orange
  '#87CEEB', // sky blue
  '#FF69B4', // pink
]

function createParticle(canvas: HTMLCanvasElement): Particle {
  const shapes: Particle['shape'][] = ['rect', 'circle', 'star']
  return {
    x: Math.random() * canvas.width,
    y: -10,
    vx: (Math.random() - 0.5) * 4,
    vy: Math.random() * 3 + 2,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: Math.random() * 8 + 4,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.2,
    shape: shapes[Math.floor(Math.random() * shapes.length)],
    alpha: 1,
    decay: Math.random() * 0.005 + 0.002,
  }
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath()
  for (let i = 0; i < 5; i++) {
    const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2
    const x = cx + r * Math.cos(angle)
    const y = cy + r * Math.sin(angle)
    if (i === 0) { ctx.moveTo(x, y) } else { ctx.lineTo(x, y) }
  }
  ctx.closePath()
  ctx.fill()
}

export default function Confetti({ active, duration = 5000 }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animFrameRef = useRef<number>(0)
  const spawnRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const stopSpawnRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!active) {
      particlesRef.current = []
      cancelAnimationFrame(animFrameRef.current)
      if (spawnRef.current) clearInterval(spawnRef.current)
      if (stopSpawnRef.current) clearTimeout(stopSpawnRef.current)
      return
    }

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Initial big burst
    for (let i = 0; i < 120; i++) {
      const p = createParticle(canvas)
      p.y = Math.random() * -200
      particlesRef.current.push(p)
    }

    // Continuous spawn
    spawnRef.current = setInterval(() => {
      for (let i = 0; i < 6; i++) {
        particlesRef.current.push(createParticle(canvas))
      }
    }, 150)

    // Stop spawning after duration
    stopSpawnRef.current = setTimeout(() => {
      if (spawnRef.current) clearInterval(spawnRef.current)
    }, duration)

    function animate() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height)

      particlesRef.current = particlesRef.current.filter(p => p.alpha > 0.01)

      for (const p of particlesRef.current) {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.05
        p.vx *= 0.99
        p.rotation += p.rotationSpeed

        if (p.y > canvas!.height * 0.7) {
          p.alpha -= p.decay * 3
        } else {
          p.alpha -= p.decay
        }

        ctx!.save()
        ctx!.globalAlpha = Math.max(0, p.alpha)
        ctx!.fillStyle = p.color
        ctx!.translate(p.x, p.y)
        ctx!.rotate(p.rotation)

        if (p.shape === 'rect') {
          ctx!.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
        } else if (p.shape === 'circle') {
          ctx!.beginPath()
          ctx!.arc(0, 0, p.size / 2, 0, Math.PI * 2)
          ctx!.fill()
        } else {
          drawStar(ctx!, 0, 0, p.size / 2)
        }

        ctx!.restore()
      }

      animFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      if (spawnRef.current) clearInterval(spawnRef.current)
      if (stopSpawnRef.current) clearTimeout(stopSpawnRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [active, duration])

  if (!active) return null

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  )
}
