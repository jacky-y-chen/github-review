/**
 * 魔搭社区 LLM API 服务
 * 文档: https://www.modelscope.cn/docs/
 */

export interface ProjectInfo {
  name: string
  description: string
  topics: string[]
  stars: number
  commits: number
  language: string
}

export interface Top3Summary {
  projects: ProjectInfo[]
  languages: { name: string; percentage: number }[]
  totalStars: number
  totalCommits: number
}

/**
 * 使用魔搭社区 API 生成 Top 3 项目总结
 */
export async function generateTop3Summary(
  input: Top3Summary,
  apiKey: string
): Promise<string> {
  const prompt = `请分析以下开发者的 GitHub Top 3 活跃项目，从【项目功能】和【技术实现】两个维度生成一段精炼的总结（120-180字）：

## Top 3 项目概况

${input.projects.map((p, i) => `
${i + 1}. **${p.name}** (${p.language})
   - ⭐ ${p.stars} Stars | 💻 ${p.commits} Commits
   - 描述: ${p.description || '无描述'}
   - 标签: ${p.topics.join(', ') || '无'}
`).join('\n')}

## 整体技术栈
${input.languages.map(l => `${l.name} (${l.percentage.toFixed(1)}%)`).join(' | ')}

## 统计数据
- 总 Star 数: ${input.totalStars}
- 总提交数: ${input.totalCommits}

---

要求：
1. 综合分析这三个项目的共同特点和技术亮点
2. 用简洁专业的语言概括开发者的技术方向和特长
3. 突出项目价值和影响力
4. 语气友好、鼓励性，适合年度总结视频
5. 严格控制在 120-180 字以内
6. 用中文回答`

  try {
    const requestBody = {
      model: 'deepseek-ai/DeepSeek-V3.2',  // 使用 Base 版本
      messages: [
        {
          role: 'system',
          content: '你是一个专业的技术项目分析师，擅长用简洁的语言总结和评价开源项目。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    }

    console.log('发送魔搭 API 请求:', { 
      url: 'https://api-inference.modelscope.cn/v1/chat/completions',
      model: requestBody.model,
      hasApiKey: !!apiKey,
      apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + '...' : 'none'
    })

    const response = await fetch('https://api-inference.modelscope.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorData: any
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { error: errorText }
      }
      console.error('魔搭 API 错误详情:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      })
      throw new Error(`魔搭 API 调用失败 (${response.status}): ${errorData.message || errorData.error || '未知错误'}`)
    }

    const data = await response.json()
    const summary = data.choices?.[0]?.message?.content
    
    if (!summary) {
      throw new Error('未获取到 AI 总结内容')
    }

    return summary.trim()
  } catch (error) {
    console.error('魔搭 LLM 调用失败:', error)
    // 返回兜底总结
    return generateFallbackSummary(input)
  }
}

/**
 * 生成兜底总结（当 API 调用失败时）
 */
export function generateFallbackSummary(input: Top3Summary): string {
  const mainLang = input.languages[0]?.name || '多种技术'
  const projectNames = input.projects.map(p => p.name).join('、')
  
  let summary = `你在过去一段时间中，主要活跃于 ${projectNames} 等项目。`
  
  summary += `技术栈以 ${mainLang} 为主，`
  
  if (input.languages.length > 1) {
    const otherLangs = input.languages.slice(1, 3).map(l => l.name).join('、')
    summary += `同时也使用 ${otherLangs} 等技术。`
  }
  
  summary += `这些项目累计获得了 ${input.totalStars} 个 Star 和 ${input.totalCommits} 次提交，`
  summary += `展示了扎实的技术功底和持续的开发热情。`
  
  const hasDescription = input.projects.some(p => p.description)
  if (hasDescription) {
    summary += `项目涵盖了多个技术领域，体现了全面的技术能力。`
  }
  
  summary += `继续保持这份热情，未来可期！🚀`
  
  return summary
}

/**
 * 验证魔搭 API Key 是否有效（简单测试）
 */
export async function validateModelscopeKey(apiKey: string): Promise<boolean> {
  try {
    // 尝试一个简单的 API 调用测试
    const response = await fetch('https://api-inference.modelscope.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-ai/DeepSeek-V3.2',
        messages: [
          { role: 'user', content: 'Hello' }
        ],
        max_tokens: 10
      })
    })
    
    if (response.ok) {
      console.log('✅ 魔搭 API Key 验证成功')
      return true
    } else {
      const error = await response.text()
      console.warn('⚠️ 魔搭 API Key 验证失败:', response.status, error)
      return false
    }
  } catch (error) {
    console.error('❌ 魔搭 API Key 验证异常:', error)
    return false
  }
}
