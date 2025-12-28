import { useState } from 'react'
import InputForm from './components/InputForm'
import StatsDisplay from './components/StatsDisplay'
import VideoPreview from './components/VideoPreview'

function App() {
  const [showStats, setShowStats] = useState(false)
  const [showVideo, setShowVideo] = useState(false)

  const handleDataFetched = () => {
    setShowStats(true)
    setShowVideo(false)
  }

  const handleGenerateVideo = () => {
    setShowVideo(true)
    setShowStats(false)
  }

  const handleBack = () => {
    setShowStats(true)
    setShowVideo(false)
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 py-12 relative z-10">
        <header className="text-center mb-16 animate-float">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            <span className="text-white">GitHub</span> <span className="text-gradient">Year in Review</span>
          </h1>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto leading-relaxed">
            一键生成你的 GitHub 年度代码旅程，探索你的开源贡献与成长
          </p>
        </header>

        <div className="max-w-4xl mx-auto">
          {!showStats && !showVideo && (
            <InputForm onDataFetched={handleDataFetched} />
          )}

          {showStats && !showVideo && (
            <StatsDisplay onGenerateVideo={handleGenerateVideo} />
          )}

          {showVideo && (
            <VideoPreview onBack={handleBack} />
          )}
        </div>
      </div>
    </div>
  )
}

export default App
