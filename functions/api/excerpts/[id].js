import { fromDbRow, jsonResponse, toExcerptRow } from '../../_utils.js'

export async function onRequestPut({ request, env, params }) {
  const body = await request.json()
  if (!body?.content?.trim()) {
    return jsonResponse({ error: '正文不能为空' }, { status: 400 })
  }

  const row = toExcerptRow(body)
  const now = new Date().toISOString()

  const result = await env.DB.prepare(
    `UPDATE excerpts SET content = ?, source = ?, author = ?, tags = ?, note = ?, updated_at = ?
     WHERE id = ?`,
  )
    .bind(row.content, row.source, row.author, row.tags, row.note, now, params.id)
    .run()

  if (result.meta.changes === 0) {
    return jsonResponse({ error: '未找到这条摘录' }, { status: 404 })
  }

  const existing = await env.DB.prepare('SELECT created_at FROM excerpts WHERE id = ?')
    .bind(params.id)
    .first()

  return jsonResponse(
    fromDbRow({ id: params.id, ...row, created_at: existing.created_at, updated_at: now }),
  )
}

export async function onRequestDelete({ env, params }) {
  const result = await env.DB.prepare('DELETE FROM excerpts WHERE id = ?').bind(params.id).run()
  if (result.meta.changes === 0) {
    return jsonResponse({ error: '未找到这条摘录' }, { status: 404 })
  }
  return jsonResponse({ ok: true })
}
