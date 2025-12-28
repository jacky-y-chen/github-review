import type { GitHubData } from '../store/useStore'

// 注意: @remotion/bundler 和 @remotion/renderer 只能在 Node.js 环境使用
// 浏览器端渲染使用简化方案

export async function renderVideo(
  data: GitHubData,
  onProgress: (progress: number) => void
): Promise<void> {
  try {
    onProgress(5)

    // 注意: 浏览器端渲染有限制，这里提供一个简化的导出方案
    // 实际生产环境建议使用服务器端渲染或 Remotion Lambda
    
    // 方案1: 使用 Canvas 录制 (浏览器端)
    // 这需要使用 MediaRecorder API
    
    // 方案2: 提示用户使用 Remotion CLI (推荐)
    const shouldUseSimpleExport = confirm(
      '即将导出视频配置文件。\n\n' +
      '要在本地生成高清 MP4 视频，我们需要：\n' +
      '1. 下载配置文件 (input-props.json)\n' +
      '2. 在终端运行一条命令\n\n' +
      '是否继续？'
    )

    if (!shouldUseSimpleExport) {
      throw new Error('用户取消导出')
    }

    // 简易导出方案：使用 Canvas Capture
    await exportVideoSimple(data, onProgress)

  } catch (error) {
    console.error('渲染错误:', error)
    throw error
  }
}

async function exportVideoSimple(
  data: GitHubData,
  onProgress: (progress: number) => void
): Promise<void> {
  // 这是一个简化的实现，实际需要使用 MediaRecorder
  // 或者引导用户使用 CLI 工具
  
  return new Promise((resolve, reject) => {
    try {
      onProgress(20)

      // 模拟渲染进度
      let progress = 20
      const interval = setInterval(() => {
        progress += 10
        if (progress >= 90) {
          clearInterval(interval)
        }
        onProgress(progress)
      }, 500)

      // 实际应该使用 Canvas + MediaRecorder
      // 这里为演示目的，提供下载数据的方式
      setTimeout(() => {
        clearInterval(interval)
        onProgress(100)

        // 创建数据下载
        const dataStr = JSON.stringify({ data }, null, 2) // Wrap in { data: ... } to match props structure
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'input-props.json'
        link.click()
        URL.revokeObjectURL(url)

        alert(
          '✅ 配置数据已导出！\n\n' +
          '由于浏览器限制，生成高清 MP4 需要在终端运行命令。\n\n' +
          '请按以下步骤操作：\n' +
          '1. 将下载的 "input-props.json" 文件移动到项目根目录\n' +
          '2. 在终端运行: npm run build:video\n\n' +
          '完成后，视频将保存在 out/video.mp4'
        )

        resolve()
      }, 1500)

    } catch (error) {
      reject(error)
    }
  })
}

// 服务器端渲染示例（需要 Node.js 环境）
// 这个函数仅作为文档参考，实际使用需要在 Node.js 环境中运行
export async function renderVideoServer(
  data: GitHubData,
  onProgress: (progress: number) => void
): Promise<string> {
  // 这个函数需要在 Node.js 环境运行
  // 需要动态导入 Node.js 专用模块
  
  const { bundle } = await import('@remotion/bundler')
  const { renderMedia, selectComposition } = await import('@remotion/renderer')
  const { webpackOverride } = await import('./webpackOverride')
  
  // Bundle the Remotion project
  const bundleLocation = await bundle({
    entryPoint: './src/remotion/index.ts',
    webpackOverride,
  })

  onProgress(30)

  // Select composition
  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: 'GitHubYearVideo',
    inputProps: { data },
  })

  onProgress(40)

  // Render video
  const outputLocation = `out/github-year-${data.username}-${Date.now()}.mp4`
  
  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: 'h264',
    outputLocation,
    inputProps: { data },
    onProgress: ({ progress }) => {
      onProgress(40 + progress * 60)
    },
  })

  return outputLocation
}
