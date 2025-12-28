import { useMemo } from 'react'
import { AbsoluteFill, random, useCurrentFrame, interpolate } from 'remotion'

export const StarBackground: React.FC = () => {
  const frame = useCurrentFrame()

  const stars = useMemo(() => {
    return new Array(200).fill(true).map((_, i) => {
      const x = random(`x-${i}`) * 1920
      const y = random(`y-${i}`) * 1080
      const size = random(`size-${i}`) * 3 + 0.5
      const speed = random(`speed-${i}`) * 0.2 + 0.05
      const offset = random(`offset-${i}`) * Math.PI * 2
      const twinkleSpeed = random(`twinkle-${i}`) * 0.05 + 0.02
      const color = random(`color-${i}`) > 0.8 ? '#a5d6ff' : '#ffffff' // 20% 蓝色星星
      return { x, y, size, speed, offset, twinkleSpeed, color }
    })
  }, [])

  // 流星
  const meteors = useMemo(() => {
    return new Array(5).fill(true).map((_, i) => {
      const startFrame = random(`m-start-${i}`) * 1000
      const x = random(`m-x-${i}`) * 1920
      const y = random(`m-y-${i}`) * 500
      const length = random(`m-len-${i}`) * 200 + 100
      const speed = random(`m-speed-${i}`) * 15 + 10
      return { startFrame, x, y, length, speed }
    })
  }, [])

  return (
    <AbsoluteFill style={{ 
      background: 'radial-gradient(circle at 50% 0%, #1f2937 0%, #0d1117 100%)',
      overflow: 'hidden' 
    }}>
      {/* 远景星云装饰 */}
      <div style={{
        position: 'absolute',
        top: '-20%',
        left: '-10%',
        width: '50%',
        height: '50%',
        background: 'radial-gradient(circle, rgba(56, 139, 253, 0.1) 0%, transparent 70%)',
        filter: 'blur(60px)',
        opacity: 0.5,
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-20%',
        right: '-10%',
        width: '60%',
        height: '60%',
        background: 'radial-gradient(circle, rgba(163, 113, 247, 0.1) 0%, transparent 70%)',
        filter: 'blur(60px)',
        opacity: 0.5,
      }} />

      {stars.map((star, i) => {
        // 闪烁动画
        const opacity = interpolate(
          Math.sin(frame * star.twinkleSpeed + star.offset),
          [-1, 1],
          [0.2, 1]
        )
        
        // 缓慢移动 (视差效果)
        const x = (star.x + frame * star.speed) % 1920
        const y = (star.y + frame * star.speed * 0.5) % 1080

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: star.size,
              height: star.size,
              backgroundColor: star.color,
              borderRadius: '50%',
              opacity,
              boxShadow: `0 0 ${star.size * 2}px ${star.color}`,
            }}
          />
        )
      })}

      {/* 流星效果 */}
      {meteors.map((meteor, i) => {
        const activeFrame = frame - meteor.startFrame
        if (activeFrame < 0 || activeFrame > 60) return null // 流星只持续 1 秒

        const progress = activeFrame / 60
        const currentX = meteor.x - progress * meteor.speed * 20
        const currentY = meteor.y + progress * meteor.speed * 20
        const opacity = Math.sin(progress * Math.PI) // 淡入淡出

        return (
          <div
            key={`meteor-${i}`}
            style={{
              position: 'absolute',
              left: currentX,
              top: currentY,
              width: meteor.length,
              height: 2,
              background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)',
              transform: 'rotate(-45deg)',
              opacity,
              boxShadow: '0 0 10px rgba(255,255,255,0.5)',
            }}
          />
        )
      })}
    </AbsoluteFill>
  )
}
