import { reverseString } from '@/helper/reverseString'
import { Fragment, memo } from 'react'
type WhiteboardRulerLineProps = {
  rulerWidth: number
  generateRulerNumbers: number[]
}
function WhiteboardRulerLine({
  rulerWidth,
  generateRulerNumbers
}: WhiteboardRulerLineProps) {
  return (
    <g clipPath="url(#clip0_2105_46534)">
      {/* Phần thanh màu xám */}

      {/* Phần thanh màu xám */}
      {/* Phần thanh màu trắng */}
      <rect x="0.5" y="33.2559" width={rulerWidth} height="55" fill="white" />
      {/* Phần thanh màu trắng */}
      {generateRulerNumbers.map((item, outerIndex) => {
        const endPoint = rulerWidth - 20
        return (
          <Fragment key={outerIndex}>
            <text
              fill="#171717"
              className="select-none"
              fontSize="12px"
              x={outerIndex >= 10 ? item - 7 : item}
              y={25}
            >
              {outerIndex}
            </text>
            <text
              fill="#171717"
              className="select-none"
              fontSize="12px"
              rotate={180}
              x={
                outerIndex >= 10
                  ? endPoint - outerIndex * 50 + 12
                  : endPoint - outerIndex * 50 + 10
              }
              y={95}
            >
              {outerIndex < 10 ? outerIndex : reverseString(`${outerIndex}`)}
            </text>
            {Array.from(Array(10)).map((_item, index) => {
              if (index === 0) {
                return (
                  <Fragment key={`${outerIndex}-${index}`}>
                    <path
                      d={`M${
                        50 * outerIndex + index * 5 + 20
                      }.5 0.755859V25.7559`}
                      stroke="#171717"
                      strokeLinecap="round"
                    />
                    <path
                      d={`M${
                        endPoint - outerIndex * 50 - index * 5
                      }.5 120.756V95.7559`}
                      stroke="#171717"
                      strokeLinecap="round"
                    />
                  </Fragment>
                )
              }
              if (index !== 5) {
                return (
                  <Fragment key={`${outerIndex}-${index}`}>
                    <path
                      d={`M${
                        50 * outerIndex + index * 5 + 20
                      }.5 0.755859V13.2559`}
                      stroke="#D4D4D4"
                      strokeLinecap="round"
                    />
                    <path
                      d={`M${
                        endPoint - outerIndex * 50 - index * 5
                      }.5 108.256V120.756`}
                      stroke="#D4D4D4"
                      strokeLinecap="round"
                    />
                  </Fragment>
                )
              }
              return (
                <Fragment key={`${outerIndex}-${index}`}>
                  <path
                    d={`M${
                      50 * outerIndex + index * 5 + 20
                    }.5 0.755859V19.2559`}
                    stroke="#737373"
                    strokeLinecap="round"
                  />
                  <path
                    key={`${outerIndex}-${index}`}
                    d={`M${
                      endPoint - outerIndex * 50 - index * 5
                    }.5 102.256V120.756`}
                    stroke="#737373"
                    strokeLinecap="round"
                  />
                </Fragment>
              )
            })}
          </Fragment>
        )
      })}
    </g>
  )
}
export default memo(WhiteboardRulerLine)
