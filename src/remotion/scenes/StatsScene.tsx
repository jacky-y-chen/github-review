import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'
import type { GitHubData } from '../../store/useStore'

interface StatsSceneProps {
  data: GitHubData
  startFrame: number
  endFrame: number
}

const StatCard: React.FC<{
  title: string
  value: number
  icon: string
  delay: number
  frame: number
  fps: number
}> = ({ title, value, icon, delay, frame, fps }) => {
  const scale = spring({
    frame: frame - delay,
    fps,
    config: { damping: 12, stiffness: 100 }
  })

  const countValue = Math.floor(
    interpolate(frame - delay, [0, 60], [0, value], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp'
    })
  )

  return (
    <div
      style={{
        transform: `scale(${scale})`,
        backgroundColor: 'rgba(22, 27, 34, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 24,
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        minWidth: 300,
        backdropFilter: 'blur(10px)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
      }}
    >
      <div style={{ 
        fontSize: 56,
        filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.3))'
      }}>{icon}</div>
      <div
        style={{
          fontSize: 72,
          fontWeight: 800,
          color: '#2ea44f',
          fontFeatureSettings: '"tnum"',
          textShadow: '0 0 20px rgba(46, 164, 79, 0.4)'
        }}
      >
        {countValue.toLocaleString()}
      </div>
      <div
        style={{
          fontSize: 28,
          color: '#8b949e',
          textAlign: 'center',
          fontWeight: 500
        }}
      >
        {title}
      </div>
    </div>
  )
}

export const StatsScene: React.FC<StatsSceneProps> = ({ data, startFrame }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  
  const localFrame = frame - startFrame

  const titleOpacity = interpolate(localFrame, [0, 20], [0, 1], { extrapolateRight: 'clamp' })
  const titleY = interpolate(localFrame, [0, 20], [20, 0], { extrapolateRight: 'clamp' })

  return (
    <AbsoluteFill style={{ 
      padding: 80,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 60,
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* 标题 */}
      <h2
        style={{
          fontSize: 64,
          fontWeight: 800,
          color: '#ffffff',
          margin: 0,
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          textShadow: '0 10px 20px rgba(0,0,0,0.5)'
        }}
      >
        年度贡献统计
      </h2>

      {/* 统计卡片网格 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 40,
          marginTop: 40,
        }}
      >
        <StatCard
          title="总提交数"
          value={data.totalCommits}
          icon="💻"
          delay={20}
          frame={localFrame}
          fps={fps}
        />
        <StatCard
          title="Pull Requests"
          value={data.totalPRs}
          icon="🔀"
          delay={40}
          frame={localFrame}
          fps={fps}
        />
        <StatCard
          title="Issues"
          value={data.totalIssues}
          icon="📝"
          delay={60}
          frame={localFrame}
          fps={fps}
        />
      </div>
    </AbsoluteFill>
  )
}
