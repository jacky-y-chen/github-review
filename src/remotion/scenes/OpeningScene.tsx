import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'
import type { GitHubData } from '../../store/useStore'

interface OpeningSceneProps {
  data: GitHubData
  startFrame: number
  endFrame: number
}

export const OpeningScene: React.FC<OpeningSceneProps> = ({ data, startFrame, endFrame }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  
  const localFrame = frame - startFrame
  const duration = endFrame - startFrame  // 场景总时长
  
  // 减慢动画速度，让进场更优雅
  const titleOpacity = interpolate(localFrame, [0, 30], [0, 1], { extrapolateRight: 'clamp' })
  const titleY = interpolate(localFrame, [0, 40], [50, 0], { 
    extrapolateRight: 'clamp',
    easing: (t) => 1 - Math.pow(1 - t, 3) // 缓出
  })
  
  // 头像和用户名更慢的弹簧动画
  const avatarScale = spring({
    frame: localFrame - 20,
    fps,
    config: { damping: 20, stiffness: 80, mass: 1.5 }  // 更慢、更优雅
  })
  
  const usernameScale = spring({
    frame: localFrame - 25,
    fps,
    config: { damping: 20, stiffness: 80, mass: 1.5 }
  })

  // Logo 旋转和发光
  const logoRotate = interpolate(localFrame, [0, 100], [0, 10], { extrapolateRight: 'clamp' })
  const logoGlow = interpolate(Math.sin(localFrame * 0.1), [-1, 1], [0.5, 1])

  const timeRangeOpacity = interpolate(localFrame, [50, 80], [0, 1], { extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill style={{ 
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* GitHub Logo */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          opacity: titleOpacity,
          transform: `translateY(${titleY}px) rotate(${logoRotate}deg)`,
          filter: `drop-shadow(0 0 ${20 * logoGlow}px rgba(255, 255, 255, 0.4))`
        }}
      >
        <svg height="80" width="80" viewBox="0 0 16 16" fill="#ffffff">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
        </svg>
      </div>

      {/* 标题 */}
      <h1
        style={{
          fontSize: 80,
          fontWeight: 800,
          color: '#ffffff',
          margin: 0,
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          textAlign: 'center',
          textShadow: '0 10px 30px rgba(0,0,0,0.5)',
          letterSpacing: '-0.02em'
        }}
      >
        GitHub <span style={{ color: '#a5d6ff' }}>Year in Review</span>
      </h1>

      {/* 用户头像 */}
      <div
        style={{
          position: 'absolute',
          bottom: '32%',
          transform: `scale(${avatarScale})`,
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          borderRadius: '50%',
        }}
      >
        <img
          src={data.avatarUrl}
          alt={data.username}
          style={{
            width: 160,
            height: 160,
            borderRadius: '50%',
            border: '6px solid #2ea44f',
            boxShadow: '0 0 0 8px rgba(46, 164, 79, 0.3)'
          }}
        />
      </div>

      {/* 用户名 */}
      <div
        style={{
          position: 'absolute',
          bottom: '20%',
          transform: `scale(${usernameScale})`,
        }}
      >
        <h2
          style={{
            fontSize: 48,
            fontWeight: 800,
            color: '#ffffff',
            margin: 0,
            textShadow: '0 0 20px rgba(46, 164, 79, 0.6)',
            background: 'linear-gradient(45deg, #2ea44f, #2c974b)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          @{data.username}
        </h2>
      </div>

      {/* 时间范围 */}
      <div
        style={{
          position: 'absolute',
          bottom: '12%',
          opacity: timeRangeOpacity,
          transform: `translateY(${interpolate(localFrame, [50, 80], [20, 0], { extrapolateRight: 'clamp' })}px)`,
        }}
      >
        <div
          style={{
            padding: '8px 24px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 20,
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <p
            style={{
              fontSize: 20,
              color: '#a5d6ff',
              margin: 0,
              fontWeight: 500,
              letterSpacing: '0.05em'
            }}
          >
            {data.timeRange}
          </p>
        </div>
      </div>
    </AbsoluteFill>
  )
}
