import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion'

interface Props {
  children: React.ReactNode
  startFrame: number
  endFrame: number
  transitionDuration?: number
}

export const TransitionWrapper: React.FC<Props> = ({ 
  children, 
  startFrame, 
  endFrame, 
  transitionDuration = 30  // 增加到30帧，让转场更慢更柔和
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  
  if (frame < startFrame || frame >= endFrame) return null

  const duration = endFrame - startFrame
  const relativeFrame = frame - startFrame

  // 进场动画 - 更慢更优雅的弹簧
  const enterProgress = spring({
    frame: relativeFrame,
    fps,
    config: { damping: 40, stiffness: 50, mass: 1 }  // 更慢、更柔和
  })
  
  // 改进的透明度曲线 - 使用更平滑的缓动
  const opacity = interpolate(
    relativeFrame,
    [0, transitionDuration, duration - transitionDuration, duration],
    [0, 1, 1, 0],
    { 
      extrapolateLeft: 'clamp', 
      extrapolateRight: 'clamp',
      easing: (t) => {
        // Ease in-out cubic - 更平滑的缓动曲线
        return t < 0.5 
          ? 4 * t * t * t 
          : 1 - Math.pow(-2 * t + 2, 3) / 2
      }
    }
  )

  // 多方向渐入效果 - 根据场景索引变化方向
  const sceneIndex = Math.floor(startFrame / 280) % 4
  const translateX = interpolate(
    enterProgress,
    [0, 1],
    [sceneIndex % 2 === 0 ? 40 : -40, 0]  // 左右交替
  )
  
  const translateY = interpolate(
    enterProgress,
    [0, 1],
    [sceneIndex < 2 ? 30 : -30, 0]  // 上下交替
  )

  // 更精细的缩放效果
  const scale = interpolate(
    enterProgress,
    [0, 1],
    [0.95, 1]
  )

  // 退场缩放
  const exitScale = interpolate(
    relativeFrame,
    [duration - transitionDuration, duration],
    [1, 0.98],
    { 
      extrapolateLeft: 'clamp',
      easing: (t) => 1 - Math.pow(1 - t, 4) // 四次缓出
    }
  )

  // 轻微旋转效果增加动感
  const rotate = interpolate(
    enterProgress,
    [0, 1],
    [sceneIndex % 2 === 0 ? -1 : 1, 0]  // 左右微旋转
  )

  // 动态模糊 - 转场时更明显
  const blur = interpolate(
    relativeFrame,
    [0, transitionDuration * 0.3, transitionDuration * 0.7, duration - transitionDuration * 0.7, duration - transitionDuration * 0.3, duration],
    [5, 2, 0, 0, 2, 5],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  )

  // 光晕效果
  const glow = interpolate(
    relativeFrame,
    [0, transitionDuration * 0.5, transitionDuration, duration - transitionDuration, duration - transitionDuration * 0.5, duration],
    [0, 0.3, 0, 0, 0.3, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  )

  return (
    <AbsoluteFill 
      style={{ 
        opacity,
        transform: `
          translateX(${translateX}px) 
          translateY(${translateY}px) 
          scale(${scale * exitScale})
          rotate(${rotate}deg)
        `,
        filter: `blur(${blur}px) brightness(${1 + glow})`,
        transition: 'filter 0.1s ease-out',
      }}
    >
      {children}
    </AbsoluteFill>
  )
}
