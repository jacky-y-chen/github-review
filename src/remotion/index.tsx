import React from 'react'
import { Composition, registerRoot } from 'remotion'
import { GitHubYearVideo } from './GitHubYearVideo'

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="GitHubYearVideo"
        component={GitHubYearVideo}
        durationInFrames={2700}
        fps={60}
        width={1920}
        height={1080}
        defaultProps={{
          data: {
            username: 'demo',
            avatarUrl: 'https://avatars.githubusercontent.com/u/1?v=4',
            totalCommits: 100,
            totalPRs: 20,
            totalIssues: 10,
            topRepositories: [],
            languageStats: [],
            contributionCalendar: [],
            timeRange: '最近 1 年'
          }
        }}
      />
    </>
  )
}

registerRoot(RemotionRoot)
