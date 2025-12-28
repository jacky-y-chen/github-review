import { AbsoluteFill } from 'remotion'
import type { GitHubData } from '../store/useStore'
import { StarBackground } from './components/StarBackground'
import { TransitionWrapper } from './components/TransitionWrapper'
import { CameraLayout } from './components/CameraLayout'
import { OpeningScene } from './scenes/OpeningScene'
import { StatsScene } from './scenes/StatsScene'
import { LanguageScene } from './scenes/LanguageScene'
import { RepositoriesScene } from './scenes/RepositoriesScene'
import { ContributionScene } from './scenes/ContributionScene'
import { SummaryScene } from './scenes/SummaryScene'
import { EndingScene } from './scenes/EndingScene'

interface GitHubYearVideoProps {
  data: GitHubData
}

/**
 * 计算视频总帧数
 */
export const calculateTotalFrames = (hasContributions: boolean): number => {
  const OVERLAP = 20
  
  const allScenes = [
    { duration: 180, show: true },           // 开场 3秒
    { duration: 300, show: true },           // 统计 5秒
    { duration: 300, show: true },           // 语言 5秒
    { duration: 300, show: true },           // 仓库 5秒
    { duration: 300, show: hasContributions }, // 贡献 5秒
    { duration: 300, show: true },           // 总结 5秒
    { duration: 180, show: true },           // 结尾 3秒
  ]
  
  const scenes = allScenes.filter(s => s.show)
  
  // 计算总帧数：第一个场景完整，中间场景减去重叠，最后一个场景完整
  let totalFrames = scenes[0].duration
  for (let i = 1; i < scenes.length - 1; i++) {
    totalFrames += scenes[i].duration - OVERLAP
  }
  if (scenes.length > 1) {
    totalFrames += scenes[scenes.length - 1].duration
  }
  
  return totalFrames
}

export const GitHubYearVideo: React.FC<GitHubYearVideoProps> = ({ data }) => {
  const OVERLAP = 20 // 转场重叠帧数

  // 检查是否有贡献数据
  const hasContributions = data.contributionCalendar && data.contributionCalendar.length > 0

  // 场景配置 - 统一5秒节奏
  const allScenes = [
    { Component: OpeningScene, duration: 180, show: true },           // 3秒 - 开场
    { Component: StatsScene, duration: 300, show: true },             // 5秒 - 统计
    { Component: LanguageScene, duration: 300, show: true },          // 5秒 - 语言
    { Component: RepositoriesScene, duration: 300, show: true },      // 5秒 - 仓库
    { Component: ContributionScene, duration: 300, show: hasContributions }, // 5秒 - 贡献（条件显示）
    { Component: SummaryScene, duration: 300, show: true },           // 5秒 - 总结
    { Component: EndingScene, duration: 180, show: true },            // 3秒 - 结尾
  ]

  // 只保留需要显示的场景
  const scenes = allScenes.filter(scene => scene.show)

  let currentStart = 0
  const sceneConfigs = scenes.map((scene, index) => {
    const config = {
      Component: scene.Component,
      start: currentStart,
      end: currentStart + scene.duration
    }
    // 除了最后一个场景，都有重叠
    if (index < scenes.length - 1) {
      currentStart += scene.duration - OVERLAP
    } else {
      currentStart += scene.duration
    }
    return config
  })

  const totalFrames = sceneConfigs[sceneConfigs.length - 1].end

  return (
    <AbsoluteFill>
      {/* 星空背景 */}
      <StarBackground />

      {/* 运镜效果 */}
      <CameraLayout totalFrames={totalFrames}>
        {sceneConfigs.map((scene, index) => (
          <TransitionWrapper
            key={index}
            startFrame={scene.start}
            endFrame={scene.end}
            transitionDuration={OVERLAP}
          >
            <scene.Component 
              data={data} 
              startFrame={scene.start} 
              endFrame={scene.end} 
            />
          </TransitionWrapper>
        ))}
      </CameraLayout>
    </AbsoluteFill>
  )
}
