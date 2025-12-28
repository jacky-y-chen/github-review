import { useState } from 'react'
import { Player } from '@remotion/player'
import { useStore } from '../store/useStore'
import { GitHubYearVideo, calculateTotalFrames } from '../remotion/GitHubYearVideo'
import { renderVideo } from '../services/videoRenderer'

interface VideoPreviewProps {
  onBack: () => void
}

const VideoPreview = ({ onBack }: VideoPreviewProps) => {
  const { githubData, clearToken } = useStore()
  const [isRendering, setIsRendering] = useState(false)
  const [renderProgress, setRenderProgress] = useState(0)
  const [quality, setQuality] = useState<'preview' | 'export'>('preview')

  if (!githubData) return null

  const handleClearAndBack = () => {
    clearToken()
    onBack()
  }

  const handleBack = () => {
    onBack()
  }

  const handleExport = async () => {
    setIsRendering(true)
    setRenderProgress(0)

    try {
      await renderVideo(githubData, (progress: number) => {
        setRenderProgress(progress)
      })
    } catch (error) {
      console.error('渲染失败:', error)
      alert('视频渲染失败，请重试')
    } finally {
      setIsRendering(false)
      setRenderProgress(0)
    }
  }

  // 动态计算视频时长 - 使用和视频组件相同的逻辑
  const hasContributions = githubData?.contributionCalendar && githubData.contributionCalendar.length > 0
  const totalFrames60fps = calculateTotalFrames(hasContributions)
  
  // 统一使用 60fps，只在 preview 模式降低分辨率
  const videoConfig = quality === 'preview' 
    ? { width: 1280, height: 720, fps: 60, duration: totalFrames60fps }
    : { width: 1920, height: 1080, fps: 60, duration: totalFrames60fps }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* 控制按钮 */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <button
          onClick={handleBack}
          disabled={isRendering}
          className="px-6 py-2 btn-secondary rounded-xl disabled:opacity-50"
        >
          ← 返回
        </button>
        
        <div className="flex gap-3">
          <button
            onClick={() => setQuality('preview')}
            disabled={isRendering}
            className={`px-6 py-2 rounded-xl transition-all duration-300 ${
              quality === 'preview' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                : 'btn-secondary'
            }`}
          >
            预览模式 (720p)
          </button>
          <button
            onClick={() => setQuality('export')}
            disabled={isRendering}
            className={`px-6 py-2 rounded-xl transition-all duration-300 ${
              quality === 'export' 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                : 'btn-secondary'
            }`}
          >
            高清模式 (1080p)
          </button>
          <button
            onClick={handleExport}
            disabled={isRendering}
            className="px-8 py-2 btn-primary rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRendering ? '渲染中...' : '导出视频'}
          </button>
        </div>
      </div>

      {/* 渲染进度条 */}
      {isRendering && (
        <div className="glass-card rounded-xl p-6 animate-pulse">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white text-sm font-medium">渲染进度</span>
            <span className="text-green-400 text-sm font-bold">{Math.round(renderProgress)}%</span>
          </div>
          <div className="w-full h-3 bg-black/30 rounded-full overflow-hidden backdrop-blur-sm">
            <div 
              className="h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-300 relative"
              style={{ width: `${renderProgress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite] skew-x-12"></div>
            </div>
          </div>
        </div>
      )}

      {/* 视频播放器 */}
      <div className="glass-card rounded-2xl p-6 md:p-8">
        <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
          <Player
            component={GitHubYearVideo}
            inputProps={{ data: githubData }}
            durationInFrames={videoConfig.duration}
            fps={videoConfig.fps}
            compositionWidth={videoConfig.width}
            compositionHeight={videoConfig.height}
            style={{
              width: '100%',
              height: '100%',
            }}
            controls
          />
        </div>
        <div className="mt-4 text-sm text-gray-400 text-center flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          当前模式: {quality === 'preview' ? '预览 (720p/60fps)' : '高清 (1080p/60fps)'}
        </div>
      </div>

      {/* 数据统计预览 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="glass-card rounded-xl p-6 text-center hover:scale-105 transition-transform">
          <p className="text-gray-400 text-sm mb-2 font-medium">总提交数</p>
          <p className="text-3xl font-bold text-white">{githubData.totalCommits}</p>
        </div>
        <div className="glass-card rounded-xl p-6 text-center hover:scale-105 transition-transform">
          <p className="text-gray-400 text-sm mb-2 font-medium">Pull Requests</p>
          <p className="text-3xl font-bold text-white">{githubData.totalPRs}</p>
        </div>
        <div className="glass-card rounded-xl p-6 text-center hover:scale-105 transition-transform">
          <p className="text-gray-400 text-sm mb-2 font-medium">Issues</p>
          <p className="text-3xl font-bold text-white">{githubData.totalIssues}</p>
        </div>
        <div className="glass-card rounded-xl p-6 text-center hover:scale-105 transition-transform">
          <p className="text-gray-400 text-sm mb-2 font-medium">活跃仓库</p>
          <p className="text-3xl font-bold text-white">{githubData.topRepositories.length}</p>
        </div>
      </div>
    </div>
  )
}

export default VideoPreview
