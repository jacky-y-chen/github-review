import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion'
import type { GitHubData } from '../../store/useStore'

interface ContributionSceneProps {
  data: GitHubData
  startFrame: number
  endFrame: number
}

export const ContributionScene: React.FC<ContributionSceneProps> = ({ data, startFrame }) => {
  const frame = useCurrentFrame()
  
  const localFrame = frame - startFrame
  
  const titleOpacity = interpolate(localFrame, [0, 20], [0, 1], { extrapolateRight: 'clamp' })

  // 取最近52周的数据
  const recentContributions = data.contributionCalendar.slice(-364)
  const maxCount = Math.max(...recentContributions.map(d => d.count), 1)

  const getColor = (count: number): string => {
    if (count === 0) return '#161b22'
    const intensity = count / maxCount
    if (intensity < 0.25) return '#0e4429'
    if (intensity < 0.5) return '#006d32'
    if (intensity < 0.75) return '#26a641'
    return '#39d353'
  }

  // 分组为周
  const weeks: Array<Array<{ date: string; count: number }>> = []
  for (let i = 0; i < recentContributions.length; i += 7) {
    weeks.push(recentContributions.slice(i, i + 7))
  }

  return (
    <AbsoluteFill style={{ 
      backgroundColor: '#0d1117',
      padding: 80,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 50
    }}>
      {/* 标题 */}
      <h2
        style={{
          fontSize: 56,
          fontWeight: 'bold',
          color: '#ffffff',
          margin: 0,
          opacity: titleOpacity,
        }}
      >
        贡献热力图
      </h2>

      {/* 热力图 */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          padding: 40,
          backgroundColor: '#161b22',
          borderRadius: 16,
          border: '2px solid #30363d',
        }}
      >
        {weeks.slice(0, 52).map((week, weekIndex) => {
          const opacity = interpolate(
            localFrame,
            [30 + weekIndex * 2, 30 + weekIndex * 2 + 20],
            [0, 1],
            { extrapolateRight: 'clamp' }
          )

          return (
            <div
              key={weekIndex}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                opacity,
              }}
            >
              {week.map((day, dayIndex) => (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  style={{
                    width: 18,
                    height: 18,
                    backgroundColor: getColor(day.count),
                    borderRadius: 3,
                    border: day.count > 0 ? '1px solid #30363d' : 'none',
                  }}
                  title={`${day.date}: ${day.count} contributions`}
                />
              ))}
            </div>
          )
        })}
      </div>

      {/* 图例 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          opacity: interpolate(localFrame, [200, 230], [0, 1], { extrapolateRight: 'clamp' }),
        }}
      >
        <span style={{ fontSize: 20, color: '#8b949e' }}>少</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <div
            key={level}
            style={{
              width: 24,
              height: 24,
              backgroundColor: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'][level],
              borderRadius: 4,
              border: '1px solid #30363d',
            }}
          />
        ))}
        <span style={{ fontSize: 20, color: '#8b949e' }}>多</span>
      </div>
    </AbsoluteFill>
  )
}
