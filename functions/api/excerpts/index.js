import { fromDbRow, jsonResponse, toExcerptRow } from '../../_utils.js'

export async function onRequestGet({ env }) {
  const { results } = await env.DB.prepare(
    'SELECT * FROM excerpts ORDER BY created_at DESC',
  ).all()
  return jsonResponse(results.map(fromDbRow))
}

export async function onRequestPost({ request, env }) {
  const body = await request.json()
  if (!body?.content?.trim()) {
    return jsonResponse({ error: '正文不能为空' }, { status: 400 })
  }

  const row = toExcerptRow(body)
  const id = crypto.randomUUID()
  const now = new Date().toISOString()

  await env.DB.prepare(
    `INSERT INTO excerpts (id, content, source, tags, note, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(id, row.content, row.source, row.tags, row.note, now, now)
    .run()

  return jsonResponse(fromDbRow({ id, ...row, created_at: now, updated_at: now }), { status: 201 })
}
