export function formatDate(isoString) {
  const date = new Date(isoString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function splitTags(raw) {
  return Array.from(
    new Set(
      String(raw ?? '')
        .split(/[,，\s]+/)
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  )
}
