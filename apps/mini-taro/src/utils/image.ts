export function getCoverThumbUrl(url?: string | null): string {
  if (!url) return '/assets/default-cover.png'
  // 学习阶段 OSS 缩略图参数示例
  if (url.includes('aliyuncs.com')) {
    return `${url}?x-oss-process=image/resize,w_240/quality,q_80/format,webp`
  }
  return url
}

export function getCoverDetailUrl(url?: string | null): string {
  if (!url) return '/assets/default-cover.png'
  if (url.includes('aliyuncs.com')) {
    return `${url}?x-oss-process=image/resize,w_800/quality,q_85/format,webp`
  }
  return url
}
