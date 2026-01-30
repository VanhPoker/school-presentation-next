// import {
//   Stage,
//   Layer,
//   Rect,
//   Transformer,
//   Line,
//   Group,
//   Circle,
//   Image as KonvaImage
// } from 'react-konva'
import './index.css'
// import { WhiteboardTool } from '@/stores/use-white-board'
import WhiteboardToolsContainer from './WhiteboardToolsContainer'
// import { useWhiteboardInteract } from '@/hooks/use-white-board-interact'
import WhiteboardToolBar from './WhiteboardToolBar'
import { memo } from 'react'
import { cn } from '@/lib/utils'
import useImage from 'use-image'

interface RenderImageProps {
  shape: any
}

type WhiteboardProps = {
  pathImgArr?: any[]
  handleSaveDataAsUrl?: (base64Url: string) => Promise<void>
  handleSavePlainData?: (data: any[]) => void
  initCoordinates?: any[]
}

const RenderImage = memo(({ shape }: RenderImageProps) => {
  const [image] = useImage(shape.src)
  if (!image) return null
  return null
  // return (
  //   <KonvaImage
  //     x={(Math.min(shape.x, 1280) - (image?.width || 0)) / 2}
  //     y={(shape.y - (image?.height || 0 * 0.5)) / 2}
  //     image={image}
  //   />
  // )
})
RenderImage.displayName = 'RenderImage'

export default function Whiteboard(
  {
    // pathImgArr,
    // handleSaveDataAsUrl,
    // handleSavePlainData
    // initCoordinates = []
  }: WhiteboardProps
) {
  // const {
  //   stageRef,
  //   layerRef,
  //   transformerRef,
  //   selectedNodeId,
  //   isDrawing,
  //   shapes,
  //   deleteNodeButtonPosition,
  //   handleMouseMove,
  //   handleMouseUp,
  //   handleMouseDown,
  //   handleUpdateRulerPosition,
  //   handleNodeDragEnd,
  //   handleRedo,
  //   handleUndo,
  //   handleDeleteNode,
  //   handleUpdateDeleteNodeButtonPosition
  // } = useWhiteboardInteract(initCoordinates)

  // const handleSaveData = useCallback(async () => {
  //   if (!stageRef.current || !handleSaveDataAsUrl || !handleSavePlainData)
  //     return
  //   transformerRef.current?.nodes([])
  //   const base64Image = stageRef.current.toDataURL()
  //   await handleSaveDataAsUrl(base64Image)
  //   await handleSavePlainData(shapes || [])
  // }, [shapes])

  return (
    <div id="whiteboard-gkebook" className={cn('relative')}>
      {/* <Stage
        ref={stageRef}
        width={1280}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMousemove={isDrawing ? handleMouseMove : undefined}
        onMouseup={handleMouseUp}
      >
        <Layer ref={layerRef}>
          <Rect
            onClick={(e) => {
              e.cancelBubble = true
              transformerRef.current?.nodes([])
              selectedNodeId.current = ''
              handleUpdateDeleteNodeButtonPosition(undefined)
            }}
            width={1280}
            height={1320}
          />
          {Array.isArray(shapes) &&
            shapes.map((shape, index) => {
              if (shape.type === WhiteboardTool.RECT) {
                const { width, height, x, y } = shape
                if (width === 0 || height === 0) return null
                return (
                  <Group id={`rect-${index}`} key={`rect-${index}`}>
                    <Rect
                      draggable
                      onDragStart={(e) => {
                        e.cancelBubble = true
                        transformerRef.current?.nodes([])
                        handleUpdateDeleteNodeButtonPosition(undefined)
                      }}
                      strokeScaleEnabled={false}
                      onDragMove={() => {}}
                      onDragEnd={(e) => {
                        handleNodeDragEnd(e, index)
                      }}
                      onClick={(e) => {
                        if (!stageRef.current) return
                        e.cancelBubble = true
                        transformerRef.current?.nodes([e.currentTarget])
                        selectedNodeId.current = `rect-${index}`
                        const position =
                          transformerRef.current?.getAbsolutePosition(
                            stageRef.current
                          )
                        if (!position) return
                        handleUpdateDeleteNodeButtonPosition({
                          x: position.x + e.target.width() + 170,
                          y: position.y - 20,
                          index
                        })
                      }}
                      stroke={'black'}
                      strokeWidth={4}
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                    />
                  </Group>
                )
              }
              if (shape.type === WhiteboardTool.PEN) {
                return (
                  <Group id={`line-${index}`} key={`line-${index}`}>
                    <Line
                      draggable
                      onDragStart={() => {
                        transformerRef.current?.nodes([])
                        handleUpdateDeleteNodeButtonPosition(undefined)
                      }}
                      onDragMove={() => {}}
                      onDragEnd={(e) => {
                        handleNodeDragEnd(e, index)
                      }}
                      strokeScaleEnabled={false}
                      onClick={(e) => {
                        if (!stageRef.current) return
                        transformerRef.current?.nodes([e.currentTarget])
                        selectedNodeId.current = `line-${index}`
                        const position =
                          transformerRef.current?.getAbsolutePosition(
                            stageRef.current
                          )
                        if (!position) return
                        handleUpdateDeleteNodeButtonPosition({
                          x: position.x + e.target.width() + 170,
                          y: position.y - 20,
                          index
                        })
                      }}
                      points={shape.points}
                      stroke={'#000000'}
                      strokeWidth={5}
                      hitStrokeWidth={100}
                      x={shape.x}
                      y={shape.y}
                      tension={0.5}
                      lineCap="round"
                      lineJoin="round"
                      //   globalCompositeOperation={
                      //     line.tool === 'eraser' ? 'destination-out' : 'source-over'
                      //   }
                    />
                  </Group>
                )
              }
              if (shape.type === WhiteboardTool.CIRCLE) {
                const { radius, x, y } = shape
                if (radius === 0) return null
                return (
                  <Group id={`circle-${index}`} key={`circle-${index}`}>
                    <Circle
                      draggable
                      onDragStart={() => {
                        transformerRef.current?.nodes([])
                        handleUpdateDeleteNodeButtonPosition(undefined)
                      }}
                      strokeScaleEnabled={false}
                      onDragMove={() => {}}
                      onDragEnd={(e) => {
                        handleNodeDragEnd(e, index)
                      }}
                      onClick={(e) => {
                        if (!stageRef.current) return
                        transformerRef.current?.nodes([e.currentTarget])
                        selectedNodeId.current = `circle-${index}`
                        const position =
                          transformerRef.current?.getAbsolutePosition(
                            stageRef.current
                          )
                        if (!position) return
                        handleUpdateDeleteNodeButtonPosition({
                          x: position.x + e.target.width() + 170,
                          y: position.y - 20,
                          index
                        })
                      }}
                      radius={shape.radius}
                      stroke={'#000000'}
                      strokeWidth={5}
                      x={x}
                      y={y}
                      hitStrokeWidth={100}
                    />
                  </Group>
                )
              }
              if (shape.type === WhiteboardTool.LINE) {
                return (
                  <Group
                    id={`straightline-${index}`}
                    key={`straightline-${index}`}
                  >
                    <Line
                      draggable
                      onDragStart={(e) => {
                        e.cancelBubble = true
                        transformerRef.current?.nodes([])
                        handleUpdateDeleteNodeButtonPosition(undefined)
                      }}
                      strokeScaleEnabled={false}
                      onDragMove={() => {}}
                      onDragEnd={(e) => {
                        handleNodeDragEnd(e, index)
                      }}
                      onClick={(e) => {
                        if (!stageRef.current) return
                        e.cancelBubble = true
                        transformerRef.current?.nodes([e.currentTarget])
                        selectedNodeId.current = `straightline-${index}`
                        const position =
                          transformerRef.current?.getAbsolutePosition(
                            stageRef.current
                          )
                        if (!position) return
                        handleUpdateDeleteNodeButtonPosition({
                          x: position.x + e.target.width() + 170,
                          y: position.y - 20,
                          index
                        })
                      }}
                      x={shape.x}
                      y={shape.y}
                      points={shape.points.split(' ').map((point) => +point)}
                      stroke={'#000000'}
                      strokeWidth={5}
                      hitStrokeWidth={100}
                      tension={0.5}
                      lineCap="round"
                      lineJoin="round"
                      //   globalCompositeOperation={
                      //     line.tool === 'eraser' ? 'destination-out' : 'source-over'
                      //   }
                    />
                  </Group>
                )
              }
              return null
            })}
          {pathImgArr &&
            pathImgArr.map((shape, index) => {
              return <div key={index + 1}>{<RenderImage shape={shape} />}</div>
            })}
          <Transformer
            ref={transformerRef}
            onTransformStart={() => {
              handleUpdateDeleteNodeButtonPosition(undefined)
            }}
            padding={20}
            enabledAnchors={[
              'top-left',
              'top-right',
              'bottom-left',
              'bottom-right'
            ]}
            ignoreStroke={true}
            anchorCornerRadius={100}
            keepRatio={false}
            onTransformEnd={() => {}}
          />
        </Layer>
      </Stage> */}
      <WhiteboardToolsContainer
      // isDrawing={isDrawing}
      // updateRulerPosition={handleUpdateRulerPosition}
      />
      {/* {deleteNodeButtonPosition && (
        <span
          className="absolute border border-rose-300 rounded-full"
          style={{
            top: deleteNodeButtonPosition.y - 40,
            left: deleteNodeButtonPosition.x
          }}
          onClick={() => {
            transformerRef.current?.nodes([])
            handleDeleteNode(deleteNodeButtonPosition.index)
            handleUpdateDeleteNodeButtonPosition(undefined)
          }}
        >
          <X x={400} color="red" y={0} onClick={() => {}} />
        </span>
      )} */}
      <WhiteboardToolBar
        doSave={async () => {}}
        doRedo={() => {
          // handleUpdateDeleteNodeButtonPosition(undefined)
          // handleRedo()
        }}
        doUndo={() => {
          // handleUpdateDeleteNodeButtonPosition(undefined)
          // handleUndo()
        }}
        // doSave={handleSaveData}
      />
    </div>
  )
}
