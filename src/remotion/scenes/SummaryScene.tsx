import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'
import type { GitHubData } from '../../store/useStore'

interface SummarySceneProps {
  data: GitHubData
  startFrame: number
  endFrame: number
}

export const SummaryScene: React.FC<SummarySceneProps> = ({ data, startFrame, endFrame }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  
  const localFrame = frame - startFrame
  
  const opacity = interpolate(localFrame, [0, 30], [0, 1], { extrapolateRight: 'clamp' })
  
  const scale = spring({
    frame: localFrame - 10,
    fps,
    config: { damping: 15, stiffness: 100 }
  })

  const summary = data.aiSummary || '感谢你的持续贡献，让开源世界更加精彩！继续保持这份热情，未来可期！🚀'
  const top3 = data.topRepositories.slice(0, Math.min(3, data.topRepositories.length))

  return (
    <AbsoluteFill style={{ 
      backgroundColor: 'transparent',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 80,
      opacity
    }}>
      {/* 标题 */}
      <div
        style={{
          marginBottom: 40,
          transform: `scale(${scale})`,
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: 20
        }}>
          <span style={{ fontSize: 48 }}>🏆</span>
          <h2 style={{
            fontSize: 48,
            fontWeight: 'bold',
            color: '#2ea44f',
            margin: 0,
          }}>
            Top {top3.length} 项目总结
          </h2>
        </div>
      </div>

      {/* Top 3 项目卡片 */}
      <div style={{
        display: 'flex',
        gap: 20,
        marginBottom: 40,
        opacity: interpolate(localFrame, [20, 50], [0, 1], { extrapolateRight: 'clamp' })
      }}>
        {top3.map((repo, index) => (
          <div
            key={repo.name}
            style={{
              backgroundColor: 'rgba(22, 27, 34, 0.6)',
              border: '2px solid #30363d',
              borderRadius: 12,
              padding: 20,
              minWidth: 280,
              transform: `scale(${interpolate(localFrame, [30 + index * 10, 50 + index * 10], [0.8, 1], { extrapolateRight: 'clamp' })})`,
            }}
          >
            <div style={{
              fontSize: 32,
              marginBottom: 8,
              textAlign: 'center'
            }}>
              {['🥇', '🥈', '🥉'][index] || '🏅'}
            </div>
            <p style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: '#ffffff',
              margin: '0 0 8px 0',
              textAlign: 'center',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {repo.name}
            </p>
          </div>
        ))}
      </div>

      {/* AI 生成的总结内容 */}
      <div
        style={{
          maxWidth: 1400,
          backgroundColor: 'rgba(22, 27, 34, 0.8)',
          border: data.aiSummary ? '2px solid #a371f7' : '2px solid #30363d',
          borderRadius: 16,
          padding: 60,
          backdropFilter: 'blur(10px)',
          transform: `scale(${scale})`,
        }}
      >
        <p style={{
          fontSize: 28,
          lineHeight: 1.8,
          color: '#ffffff',
          margin: 0,
          textAlign: 'center',
          fontWeight: 400,
        }}>
          {summary}
        </p>
      </div>

      {/* AI 标识 */}
      {data.aiSummary && (
        <div
          style={{
            marginTop: 30,
            opacity: interpolate(localFrame, [80, 110], [0, 1], { extrapolateRight: 'clamp' }),
          }}
        >
          <p style={{
            fontSize: 18,
            color: '#a371f7',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            <span style={{ fontSize: 20 }}>✨</span>
            由魔搭社区 DeepSeek-V3 智能生成
          </p>
        </div>
      )}
    </AbsoluteFill>
  )
}
