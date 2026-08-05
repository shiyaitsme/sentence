export function parseTags(raw) {
  return Array.from(
    new Set(
      String(raw ?? '')
        .split(/[,，\s]+/)
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  )
}

export function toExcerptRow({ content, source, author, tagsInput, note }) {
  return {
    content: String(content ?? '').trim(),
    source: source?.trim() || null,
    author: author?.trim() || null,
    note: note?.trim() || null,
    tags: JSON.stringify(parseTags(tagsInput)),
  }
}

export function fromDbRow(row) {
  return {
    ...row,
    tags: row.tags ? JSON.parse(row.tags) : [],
  }
}

export function jsonResponse(data, init) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) },
  })
}
