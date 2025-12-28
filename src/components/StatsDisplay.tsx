import { useStore } from '../store/useStore'

interface StatsDisplayProps {
  onGenerateVideo: () => void
}

const StatsDisplay = ({ onGenerateVideo }: StatsDisplayProps) => {
  const { githubData, clearToken } = useStore()

  if (!githubData) return null

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <span className="text-4xl">📊</span> 数据概览
        </h2>
        <div className="flex gap-3">
          <button
            onClick={() => {
              clearToken()
              window.location.reload()
            }}
            className="px-6 py-2 btn-secondary rounded-xl"
          >
            ← 重新输入
          </button>
          <button
            onClick={onGenerateVideo}
            className="px-8 py-3 btn-primary rounded-xl font-bold text-lg"
          >
            生成视频 →
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="glass-card rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
          <p className="text-gray-400 text-sm mb-2 font-medium">总提交数</p>
          <p className="text-4xl font-bold text-green-400">{githubData.totalCommits.toLocaleString()}</p>
        </div>
        <div className="glass-card rounded-2xl p-6 hover:scale-105 transition-transform duration-300 animation-delay-200">
          <p className="text-gray-400 text-sm mb-2 font-medium">Pull Requests</p>
          <p className="text-4xl font-bold text-blue-400">{githubData.totalPRs.toLocaleString()}</p>
        </div>
        <div className="glass-card rounded-2xl p-6 hover:scale-105 transition-transform duration-300 animation-delay-400">
          <p className="text-gray-400 text-sm mb-2 font-medium">Issues</p>
          <p className="text-4xl font-bold text-yellow-400">{githubData.totalIssues.toLocaleString()}</p>
        </div>
        <div className="glass-card rounded-2xl p-6 hover:scale-105 transition-transform duration-300">
          <p className="text-gray-400 text-sm mb-2 font-medium">时间范围</p>
          <p className="text-xl font-bold text-white">{githubData.timeRange}</p>
        </div>
      </div>

      {/* 语言分布 */}
      <div className="glass-card rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="text-2xl">💻</span> 开发语言分布
        </h3>
        <div className="space-y-4">
          {githubData.languageStats.map((lang, index) => (
            <div key={lang.name} className="group">
              <div className="flex justify-between mb-2">
                <span className="text-gray-300 font-medium group-hover:text-white transition-colors">{lang.name}</span>
                <span className="text-gray-400 font-mono">{lang.percentage.toFixed(1)}%</span>
              </div>
              <div className="w-full h-3 bg-black/30 rounded-full overflow-hidden backdrop-blur-sm">
                <div 
                  className="h-full transition-all duration-1000 ease-out rounded-full relative overflow-hidden"
                  style={{ 
                    width: `${lang.percentage}%`,
                    backgroundColor: lang.color,
                    transitionDelay: `${index * 100}ms`
                  }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite] skew-x-12"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top 仓库 */}
      <div className="glass-card rounded-2xl p-8">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="text-2xl">🏆</span> 最活跃的仓库 Top {githubData.topRepositories.length}
        </h3>
        <div className="space-y-4">
          {githubData.topRepositories.map((repo, index) => (
            <div key={repo.name} className="flex items-center gap-4 p-4 bg-black/20 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-300 group">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-green-500/20 group-hover:scale-110 transition-transform">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-lg truncate group-hover:text-blue-400 transition-colors">{repo.name}</p>
                <p className="text-sm text-gray-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                  {repo.language}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-blue-400 font-semibold">{repo.commits} commits</p>
                <p className="text-sm text-yellow-400 flex items-center justify-end gap-1">
                  <span>⭐</span> {repo.stars}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI 项目总结 */}
      {githubData.aiSummary && (
        <div className="glass-card rounded-2xl p-8 border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-pink-900/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl shadow-lg shadow-purple-500/20 animate-pulse">
              🤖
            </div>
            <h3 className="text-xl font-bold text-white">AI 项目总结</h3>
          </div>
          
          <div className="relative z-10 bg-black/20 rounded-xl p-6 border border-white/5 backdrop-blur-sm">
            <p className="text-gray-200 leading-relaxed whitespace-pre-wrap font-light tracking-wide">
              {githubData.aiSummary}
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-purple-300 mt-4 relative z-10 opacity-70 group-hover:opacity-100 transition-opacity">
            <span className="animate-spin-slow">✨</span>
            <span>由魔搭社区 DeepSeek-V3 智能生成</span>
          </div>
        </div>
      )}

      {/* 贡献统计 */}
      <div className="glass-card rounded-2xl p-8 text-center">
        <h3 className="text-xl font-bold text-white mb-4">贡献概况</h3>
        <p className="text-gray-300 text-lg">
          在 <span className="text-green-400 font-bold text-xl px-2">{githubData.timeRange}</span> 中，
          你共贡献了 <span className="text-green-400 font-bold text-2xl px-2">{githubData.contributionCalendar.reduce((sum, day) => sum + day.count, 0).toLocaleString()}</span> 次，
          涉及 <span className="text-blue-400 font-bold text-2xl px-2">{githubData.topRepositories.length}</span> 个活跃仓库。
        </p>
      </div>
    </div>
  )
}

export default StatsDisplay
