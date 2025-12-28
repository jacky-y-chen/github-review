import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'
import type { GitHubData } from '../../store/useStore'

interface EndingSceneProps {
  data: GitHubData
  startFrame: number
  endFrame: number
}

export const EndingScene: React.FC<EndingSceneProps> = ({ data, startFrame, endFrame }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  
  const localFrame = frame - startFrame
  
  // 减慢动画速度，让结尾更从容
  const opacity = interpolate(localFrame, [0, 25], [0, 1], { 
    extrapolateRight: 'clamp',
    easing: (t) => 1 - Math.pow(1 - t, 3)
  })
  
  const scale = spring({
    frame: localFrame - 10,
    fps,
    config: { damping: 25, stiffness: 80, mass: 1 }  // 更慢、更优雅
  })

  const totalContributions = data.totalCommits + data.totalPRs + data.totalIssues

  return (
    <AbsoluteFill style={{ 
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 40,
      opacity,
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* 感谢文字 */}
      <div
        style={{
          textAlign: 'center',
          transform: `scale(${scale})`,
        }}
      >
        <h1
          style={{
            fontSize: 80,
            fontWeight: 800,
            color: '#ffffff',
            margin: 0,
            marginBottom: 20,
            textShadow: '0 10px 30px rgba(0,0,0,0.5)',
            letterSpacing: '-0.02em'
          }}
        >
          感谢你的贡献！
        </h1>
        <p
          style={{
            fontSize: 42,
            color: '#2ea44f',
            margin: 0,
            fontWeight: 600,
            textShadow: '0 0 20px rgba(46, 164, 79, 0.4)'
          }}
        >
          {data.timeRange} · 共 {totalContributions.toLocaleString()} 次贡献
        </p>
      </div>

      {/* GitHub 图标 */}
      <div
        style={{
          marginTop: 40,
          opacity: interpolate(localFrame, [60, 90], [0, 1], { extrapolateRight: 'clamp' }),
          filter: 'drop-shadow(0 0 20px rgba(46, 164, 79, 0.4))'
        }}
      >
        <svg height="100" width="100" viewBox="0 0 16 16" fill="#2ea44f">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
        </svg>
      </div>

      {/* 底部文字 */}
      <div
        style={{
          position: 'absolute',
          bottom: 80,
          opacity: interpolate(localFrame, [100, 130], [0, 1], { extrapolateRight: 'clamp' }),
        }}
      >
        <p
          style={{
            fontSize: 28,
            color: '#8b949e',
            margin: 0,
            fontWeight: 500,
            letterSpacing: '0.05em'
          }}
        >
          Keep coding, keep contributing! 🚀
        </p>
      </div>
    </AbsoluteFill>
  )
}
