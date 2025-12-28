import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion'

interface Props {
  children: React.ReactNode
  totalFrames: number
}

export const CameraLayout: React.FC<Props> = ({ children, totalFrames }) => {
  const frame = useCurrentFrame()

  // 缓慢缩放：从 1.0 放大到 1.05
  const scale = interpolate(frame, [0, totalFrames], [1, 1.05], {
    extrapolateRight: 'clamp'
  })

  return (
    <AbsoluteFill 
      style={{ 
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
      }}
    >
      {children}
    </AbsoluteFill>
  )
}
