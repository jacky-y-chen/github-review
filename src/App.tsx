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

      {/* GitHub Link */}
      <div className="absolute top-6 right-6 z-50">
        <a
          href="https://github.com/jacky-y-chen/github-review"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-white/20 shadow-lg shadow-black/5"
        >
          <svg className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Star on GitHub</span>
        </a>
      </div>

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
