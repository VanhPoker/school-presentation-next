import Image from "next/image";

export default function MediaRender({
  url,
  type,
  containerClass,
  isMini,
  handleImageLoadDone,
}: any) {
  if (!url) return null;

  if (type?.includes("image") || type === "images") {
    return (
      <div className={containerClass}>
        <div className="relative w-full h-full">
          <Image
            src={url}
            alt="media"
            fill
            className="object-cover"
            onLoadingComplete={() =>
              handleImageLoadDone && handleImageLoadDone(true)
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      {type}: {url}
    </div>
  );
}
