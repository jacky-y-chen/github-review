import { graphql } from '@octokit/graphql'
import type { GitHubData } from '../store/useStore'

const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  Go: '#00ADD8',
  Rust: '#dea584',
  Ruby: '#701516',
  PHP: '#4F5D95',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  Swift: '#ffac45',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Vue: '#41b883',
  Shell: '#89e051',
  Other: '#8b949e'
}

interface TimeRangeConfig {
  months: number | null
  label: string
}

const TIME_RANGES: Record<string, TimeRangeConfig> = {
  '3months': { months: 3, label: '最近 3 个月' },
  '6months': { months: 6, label: '最近 6 个月' },
  '1year': { months: 12, label: '最近 1 年' },
  'all': { months: null, label: '全部时间' }
}

export async function fetchGitHubData(
  username: string,
  token: string,
  timeRange: string
): Promise<GitHubData> {
  const graphqlWithAuth = graphql.defaults({
    headers: {
      authorization: `token ${token}`,
    },
  })

  try {
    const rangeConfig = TIME_RANGES[timeRange] || TIME_RANGES['1year']
    const fromDate = rangeConfig.months
      ? new Date(Date.now() - rangeConfig.months * 30 * 24 * 60 * 60 * 1000).toISOString()
      : new Date(2008, 0, 1).toISOString() // GitHub 创建时间

    // 获取用户基本信息和贡献数据
    const response: any = await graphqlWithAuth(`
      query($username: String!, $from: DateTime!) {
        user(login: $username) {
          login
          name
          avatarUrl
          id
          contributionsCollection(from: $from) {
            totalCommitContributions
            totalPullRequestContributions
            totalIssueContributions
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  date
                  contributionCount
                }
              }
            }
          }
          repositories(
            first: 100
            orderBy: {field: UPDATED_AT, direction: DESC}
            ownerAffiliations: OWNER
          ) {
            nodes {
              name
              stargazerCount
              languages(first: 10, orderBy: {field: SIZE, direction: DESC}) {
                edges {
                  size
                  node {
                    name
                    color
                  }
                }
              }
              defaultBranchRef {
                target {
                  ... on Commit {
                    history(first: 100) {
                      totalCount
                    }
                  }
                }
              }
            }
          }
        }
      }
    `, {
      username,
      from: fromDate
    })

    const user = response.user
    const contributions = user.contributionsCollection

    // 处理仓库数据
    const repositories = user.repositories.nodes
      .map((repo: any) => {
        const primaryLang = repo.languages?.edges?.[0]?.node?.name || 'Other'
        return {
          name: repo.name,
          stars: repo.stargazerCount,
          commits: repo.defaultBranchRef?.target?.history?.totalCount || 0,
          language: primaryLang
        }
      })
      .filter((repo: any) => repo.commits > 0)
      .sort((a: any, b: any) => b.commits - a.commits)
      .slice(0, 5)

    // 统计语言使用情况 - 按代码字节数
    const languageMap = new Map<string, number>()
    const languageColorMap = new Map<string, string>()

    user.repositories.nodes.forEach((repo: any) => {
      if (repo.languages?.edges) {
        repo.languages.edges.forEach((edge: any) => {
          const langName = edge.node.name
          const size = edge.size
          const color = edge.node.color
          
          languageMap.set(langName, (languageMap.get(langName) || 0) + size)
          if (!languageColorMap.has(langName)) {
            languageColorMap.set(langName, color || LANGUAGE_COLORS[langName] || LANGUAGE_COLORS.Other)
          }
        })
      }
    })

    const totalBytes = Array.from(languageMap.values()).reduce((sum, count) => sum + count, 0)
    const languageStats = Array.from(languageMap.entries())
      .map(([name, count]) => ({
        name,
        percentage: totalBytes > 0 ? (count / totalBytes) * 100 : 0,
        color: languageColorMap.get(name) || LANGUAGE_COLORS[name] || LANGUAGE_COLORS.Other
      }))
      .filter(stat => stat.percentage > 0.5)
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5)

    // 处理贡献日历
    const contributionCalendar = contributions.contributionCalendar.weeks
      .flatMap((week: any) => week.contributionDays)
      .map((day: any) => ({
        date: day.date,
        count: day.contributionCount
      }))

    // 获取 Top 3 项目的详细信息
    const top3ReposWithDetails = await Promise.all(
      repositories.slice(0, 3).map(async (repo: { name: string; commits: number; stars: number; language: string }) => {
        try {
          const repoDetails: any = await graphqlWithAuth(`
            query($owner: String!, $name: String!) {
              repository(owner: $owner, name: $name) {
                description
                url
                repositoryTopics(first: 10) {
                  nodes {
                    topic {
                      name
                    }
                  }
                }
              }
            }
          `, {
            owner: username,
            name: repo.name
          })

          const repoData = repoDetails.repository
          return {
            ...repo,
            description: repoData.description || '',
            url: repoData.url,
            topics: repoData.repositoryTopics.nodes.map((n: any) => n.topic.name)
          }
        } catch (error) {
          console.error(`获取仓库 ${repo.name} 详情失败:`, error)
          return {
            ...repo,
            description: '',
            url: '',
            topics: []
          }
        }
      })
    )

    // 更新 repositories 数组
    const enrichedRepositories = [
      ...top3ReposWithDetails,
      ...repositories.slice(3)
    ]

    return {
      username: user.login,
      avatarUrl: user.avatarUrl,
      totalCommits: contributions.totalCommitContributions,
      totalPRs: contributions.totalPullRequestContributions,
      totalIssues: contributions.totalIssueContributions,
      topRepositories: enrichedRepositories,
      languageStats,
      contributionCalendar,
      timeRange: rangeConfig.label
    }
  } catch (error: any) {
    if (error.message?.includes('401')) {
      throw new Error('Token 无效或已过期，请检查您的 Personal Access Token')
    } else if (error.message?.includes('404')) {
      throw new Error('用户不存在，请检查 GitHub 用户名')
    } else {
      throw new Error(`获取数据失败: ${error.message}`)
    }
  }
}
