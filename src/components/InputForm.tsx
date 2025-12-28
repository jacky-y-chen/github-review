import { useState } from 'react'
import { useStore } from '../store/useStore'
import { fetchGitHubData } from '../services/githubApi'
import { generateTop3Summary } from '../services/modelscopeLLM'

interface InputFormProps {
  onDataFetched: () => void
}

const InputForm = ({ onDataFetched }: InputFormProps) => {
  const [username, setUsername] = useState('')
  const [token, setToken] = useState('')
  const [modelscopeKey, setModelscopeKeyInput] = useState('')
  const [timeRange, setTimeRange] = useState('1year')
  const [showTokenInfo, setShowTokenInfo] = useState(false)
  const [showModelscopeInfo, setShowModelscopeInfo] = useState(false)
  
  const { 
    setToken: saveToken, 
    setModelscopeKey: saveModelscopeKey,
    setGithubData, 
    setLoading, 
    setError, 
    isLoading, 
    error 
  } = useStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!username.trim() || !token.trim()) {
      setError('请输入 GitHub 用户名和 Personal Token')
      return
    }

    setLoading(true)
    setError(null)
    saveToken(token)
    
    if (modelscopeKey.trim()) {
      saveModelscopeKey(modelscopeKey)
    }

    try {
      const data = await fetchGitHubData(username, token, timeRange)
      
      // 如果有魔搭 Key，生成 AI 总结
      if (modelscopeKey.trim() && data.topRepositories.length >= 3) {
        console.log('开始生成 AI 总结...')
        try {
          const top3 = data.topRepositories.slice(0, 3)
          const aiSummary = await generateTop3Summary({
            projects: top3.map(r => ({
              name: r.name,
              description: r.description || '',
              topics: r.topics || [],
              stars: r.stars,
              commits: r.commits,
              language: r.language
            })),
            languages: data.languageStats,
            totalStars: top3.reduce((sum, r) => sum + r.stars, 0),
            totalCommits: top3.reduce((sum, r) => sum + r.commits, 0)
          }, modelscopeKey)
          
          // 只有成功获取到非降级内容才算成功
          if (aiSummary && !aiSummary.includes('继续保持这份热情')) {
            data.aiSummary = aiSummary
            console.log('✅ AI 总结生成成功（使用魔搭 DeepSeek-V3）')
          } else {
            console.warn('⚠️ 使用了降级方案，未调用 AI 模型')
            data.aiSummary = aiSummary // 仍然保存降级总结
          }
        } catch (aiError: any) {
          console.error('❌ AI 总结生成失败:', aiError)
          
          // 给用户友好的错误提示
          if (aiError.message?.includes('400')) {
            alert('⚠️ 魔搭 API 调用失败 (400 错误)\n\n可能原因:\n1. API Key 格式不正确\n2. API Key 已过期或无效\n3. 模型访问权限不足\n\n建议:\n- 检查 API Key 是否正确复制（无空格）\n- 访问 https://www.modelscope.cn/my/myaccesstoken 重新生成 Key\n- 查看 F12 控制台获取详细错误信息\n\n将使用基础总结代替 AI 生成')
          }
          // 即使失败也生成降级总结，确保视频有内容
        }
      } else if (data.topRepositories.length >= 3) {
        // 没有 API Key，使用降级方案
        console.log('ℹ️ 未提供魔搭 API Key，使用基础总结')
        const { generateFallbackSummary } = await import('../services/modelscopeLLM')
        const top3 = data.topRepositories.slice(0, 3)
        data.aiSummary = generateFallbackSummary({
          projects: top3.map(r => ({
            name: r.name,
            description: r.description || '',
            topics: r.topics || [],
            stars: r.stars,
            commits: r.commits,
            language: r.language
          })),
          languages: data.languageStats,
          totalStars: top3.reduce((sum, r) => sum + r.stars, 0),
          totalCommits: top3.reduce((sum, r) => sum + r.commits, 0)
        })
      }
      
      setGithubData(data)
      onDataFetched()
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据失败，请检查用户名和 Token')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-8 space-y-8 animate-fade-in">
        
        {/* GitHub 用户名 */}
        <div className="group">
          <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2 group-focus-within:text-blue-400 transition-colors">
            GitHub 用户名
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="例如: octocat"
            className="w-full px-4 py-3 glass-input rounded-xl text-white placeholder-gray-500 focus:outline-none"
            disabled={isLoading}
          />
        </div>

        {/* Personal Token */}
        <div className="group">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="token" className="block text-sm font-medium text-gray-300 group-focus-within:text-blue-400 transition-colors">
              GitHub Personal Access Token
            </label>
            <button
              type="button"
              onClick={() => setShowTokenInfo(!showTokenInfo)}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              {showTokenInfo ? '隐藏说明' : '如何获取？'}
            </button>
          </div>
          
          <input
            type="password"
            id="token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            className="w-full px-4 py-3 glass-input rounded-xl text-white placeholder-gray-500 focus:outline-none"
            disabled={isLoading}
          />
          
          {showTokenInfo && (
            <div className="mt-4 p-4 bg-black/30 border border-white/10 rounded-xl text-sm text-gray-300 space-y-3 backdrop-blur-sm">
              <p className="font-semibold text-white">获取 Personal Access Token:</p>
              <ol className="list-decimal list-inside space-y-2 ml-2 text-gray-400">
                <li>访问 GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)</li>
                <li>点击 "Generate new token" → "Generate new token (classic)"</li>
                <li>选择所需权限（scopes）:
                  <ul className="list-disc list-inside ml-6 mt-1 text-gray-500">
                    <li><code className="text-green-400 bg-green-900/30 px-1 rounded">repo</code> - 访问仓库信息</li>
                    <li><code className="text-green-400 bg-green-900/30 px-1 rounded">read:user</code> - 读取用户信息</li>
                  </ul>
                </li>
                <li>生成并复制 Token</li>
              </ol>
              <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-yellow-200/80 text-xs flex items-center gap-2">
                  <span>🔒</span> <strong>安全提示:</strong> Token 仅存储在浏览器内存中，刷新即焚。
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 魔搭社区 API Key (可选) */}
        <div className="group">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="modelscopeKey" className="block text-sm font-medium text-gray-300 group-focus-within:text-purple-400 transition-colors">
              魔搭社区 API Key <span className="text-gray-500 text-xs">(可选 - 生成 AI 总结)</span>
            </label>
            <button
              type="button"
              onClick={() => setShowModelscopeInfo(!showModelscopeInfo)}
              className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              {showModelscopeInfo ? '隐藏说明' : '如何获取？'}
            </button>
          </div>
          
          <input
            type="password"
            id="modelscopeKey"
            value={modelscopeKey}
            onChange={(e) => setModelscopeKeyInput(e.target.value)}
            placeholder="ms_xxxxxxxxxxxxxxxx (可选)"
            className="w-full px-4 py-3 glass-input rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-purple-500/20"
            disabled={isLoading}
          />
          
          {showModelscopeInfo && (
            <div className="mt-4 p-4 bg-black/30 border border-purple-500/20 rounded-xl text-sm text-gray-300 space-y-3 backdrop-blur-sm">
              <p className="font-semibold text-white flex items-center gap-2">
                <span className="text-xl">✨</span>
                获取魔搭社区 API Key:
              </p>
              <ol className="list-decimal list-inside space-y-2 ml-2 text-gray-400">
                <li>访问 <a href="https://www.modelscope.cn/" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">魔搭社区官网</a></li>
                <li>注册/登录账号</li>
                <li>进入 <a href="https://www.modelscope.cn/my/myaccesstoken" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">个人中心 → API-TOKEN</a></li>
                <li>创建新的 API Token 并复制</li>
              </ol>
              <div className="mt-3 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                <p className="text-purple-200/80 text-xs">
                  ✨ <strong>AI 功能:</strong> 填写后将使用 DeepSeek-V3 模型分析你的 Top 3 项目，生成专业的技术总结。
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 时间范围 */}
        <div className="group">
          <label htmlFor="timeRange" className="block text-sm font-medium text-gray-300 mb-2 group-focus-within:text-blue-400 transition-colors">
            时间范围
          </label>
          <div className="relative">
            <select
              id="timeRange"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full px-4 py-3 glass-input rounded-xl text-white appearance-none cursor-pointer focus:outline-none"
              disabled={isLoading}
            >
              <option value="3months" className="bg-gray-900">最近 3 个月</option>
              <option value="6months" className="bg-gray-900">最近 6 个月</option>
              <option value="1year" className="bg-gray-900">最近 1 年</option>
              <option value="all" className="bg-gray-900">全部时间</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl animate-pulse">
            <p className="text-red-300 text-sm flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              {error}
            </p>
          </div>
        )}

        {/* 提交按钮 */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 btn-primary rounded-xl font-bold text-lg tracking-wide disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-3">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              正在分析数据...
            </span>
          ) : (
            '生成年度视频'
          )}
        </button>
      </form>
    </div>
  )
}

export default InputForm
