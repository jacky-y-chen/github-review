import { create } from 'zustand'

export interface GitHubData {
  username: string
  avatarUrl: string
  totalCommits: number
  totalPRs: number
  totalIssues: number
  topRepositories: {
    name: string
    stars: number
    commits: number
    language: string
    description?: string
    url?: string
    topics?: string[]
  }[]
  languageStats: {
    name: string
    percentage: number
    color: string
  }[]
  contributionCalendar: {
    date: string
    count: number
  }[]
  timeRange: string
  aiSummary?: string
}

interface StoreState {
  githubToken: string | null
  modelscopeKey: string | null
  githubData: GitHubData | null
  isLoading: boolean
  error: string | null
  setToken: (token: string) => void
  setModelscopeKey: (key: string) => void
  setGithubData: (data: GitHubData) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearToken: () => void
  clearModelscopeKey: () => void
}

export const useStore = create<StoreState>((set) => ({
  githubToken: sessionStorage.getItem('github_token'),
  modelscopeKey: sessionStorage.getItem('modelscope_key'),
  githubData: null,
  isLoading: false,
  error: null,
  
  setToken: (token: string) => {
    sessionStorage.setItem('github_token', token)
    set({ githubToken: token })
  },
  
  setModelscopeKey: (key: string) => {
    sessionStorage.setItem('modelscope_key', key)
    set({ modelscopeKey: key })
  },
  
  setGithubData: (data: GitHubData) => {
    set({ githubData: data })
  },
  
  setLoading: (loading: boolean) => {
    set({ isLoading: loading })
  },
  
  setError: (error: string | null) => {
    set({ error })
  },
  
  clearToken: () => {
    sessionStorage.removeItem('github_token')
    set({ githubToken: null, githubData: null })
  },
  
  clearModelscopeKey: () => {
    sessionStorage.removeItem('modelscope_key')
    set({ modelscopeKey: null })
  }
}))
