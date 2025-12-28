import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion'
import type { GitHubData } from '../../store/useStore'

interface LanguageSceneProps {
  data: GitHubData
  startFrame: number
  endFrame: number
}

export const LanguageScene: React.FC<LanguageSceneProps> = ({ data, startFrame, endFrame }) => {
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
      gap: 60
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
        开发语言分布
      </h2>

      {/* 语言柱状图 */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 32,
          width: '80%',
          maxWidth: 1200,
        }}
      >
        {data.languageStats.map((lang, index) => {
          // 统一的动画进度 (0 到 1)
          const progress = spring({
            frame: localFrame - 30 - index * 10,
            fps,
            config: { damping: 20, stiffness: 60 }  // 更慢更平滑
          })

          return (
            <div
              key={lang.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 24,
              }}
            >
              {/* 语言名称 */}
              <div
                style={{
                  width: 180,
                  fontSize: 28,
                  color: '#ffffff',
                  fontWeight: 600,
                  textAlign: 'right',
                }}
              >
                {lang.name}
              </div>

              {/* 进度条 */}
              <div
                style={{
                  flex: 1,
                  height: 50,
                  backgroundColor: '#161b22',
                  borderRadius: 8,
                  overflow: 'hidden',
                  border: '1px solid #30363d',
                }}
              >
                <div
                  style={{
                    width: `${lang.percentage * progress}%`,
                    height: '100%',
                    backgroundColor: lang.color,
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>

              {/* 百分比 */}
              <div
                style={{
                  width: 100,
                  fontSize: 32,
                  color: lang.color,
                  fontWeight: 'bold',
                  fontFeatureSettings: '"tnum"',
                }}
              >
                {(lang.percentage * progress).toFixed(1)}%
              </div>
            </div>
          )
        })}
      </div>
    </AbsoluteFill>
  )
}
