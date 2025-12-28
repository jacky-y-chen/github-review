import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'
import type { GitHubData } from '../../store/useStore'

interface RepositoriesSceneProps {
  data: GitHubData
  startFrame: number
  endFrame: number
}

export const RepositoriesScene: React.FC<RepositoriesSceneProps> = ({ data, startFrame }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  
  const localFrame = frame - startFrame
  
  const titleOpacity = interpolate(localFrame, [0, 20], [0, 1], { extrapolateRight: 'clamp' })

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
        最活跃的仓库
      </h2>

      {/* 仓库列表 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          width: '80%',
          maxWidth: 1200,
        }}
      >
        {data.topRepositories.map((repo, index) => {
          const slideX = spring({
            frame: localFrame - 30 - index * 15,
            fps,
            config: { damping: 15, stiffness: 100 }
          })

          return (
            <div
              key={repo.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 24,
                backgroundColor: '#161b22',
                border: '2px solid #30363d',
                borderRadius: 12,
                padding: '24px 32px',
                transform: `translateX(${(1 - slideX) * -100}px)`,
                opacity: slideX,
              }}
            >
              {/* 排名 */}
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  backgroundColor: '#2ea44f',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 32,
                  fontWeight: 'bold',
                  color: '#ffffff',
                }}
              >
                {index + 1}
              </div>

              {/* 仓库信息 */}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: 'bold',
                    color: '#ffffff',
                    marginBottom: 8,
                  }}
                >
                  {repo.name}
                </div>
                <div
                  style={{
                    fontSize: 20,
                    color: '#8b949e',
                  }}
                >
                  {repo.language}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </AbsoluteFill>
  )
}
