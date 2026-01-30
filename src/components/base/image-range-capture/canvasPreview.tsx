export async function canvasPreview(
  imageTwo: HTMLImageElement | null,
  imageOne: HTMLImageElement,
  canvas: HTMLCanvasElement,
  crop: any,
  imageOneContainer: HTMLDivElement | null,
  imageTwoContainer: HTMLDivElement | null
) {
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('No 2d context')
  }
  if (!imageOne || !imageOneContainer) return
  const scaleX = imageOne.naturalWidth / imageOne.width
  const scaleY = imageOne.naturalHeight / imageOne.height
  const pixelRatio = window.devicePixelRatio
  canvas.width = Math.floor(crop.width * scaleX * pixelRatio)
  canvas.height = Math.floor(crop.height * scaleY * pixelRatio)
  ctx.scale(pixelRatio, pixelRatio)
  ctx.imageSmoothingQuality = 'high'
  const cropX = crop.x * scaleX
  const cropY = crop.y * scaleY
  ctx.save()
  const offsetX = Math.ceil(
    (imageOne.offsetLeft + imageOneContainer.offsetLeft) * scaleX
  )
  if (imageOne) {
    ctx.translate(-cropX + offsetX, -cropY)
    ctx.drawImage(
      imageOne,
      0,
      0,
      imageOne.naturalWidth,
      imageOne.naturalHeight,
      0,
      0,
      imageOne.naturalWidth,
      imageOne.naturalHeight
    )
  }
  if (imageTwo && window.innerWidth >= 1280 && imageTwoContainer) {
    ctx.translate(
      (imageTwoContainer.offsetLeft +
        imageTwo.offsetLeft -
        imageOneContainer.offsetLeft) *
        scaleX,
      0
    )
    ctx.drawImage(
      imageTwo,
      0,
      0,
      imageTwo.naturalWidth,
      imageTwo.naturalHeight,
      0,
      0,
      imageTwo.naturalWidth,
      imageTwo.naturalHeight
    )
  }
  ctx.restore()
}
