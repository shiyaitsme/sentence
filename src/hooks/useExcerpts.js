import { useCallback, useEffect, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

function parseTags(raw) {
  return Array.from(
    new Set(
      raw
        .split(/[,，\s]+/)
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  )
}

export function useExcerpts() {
  const [excerpts, setExcerpts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchExcerpts = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error: fetchError } = await supabase
      .from('excerpts')
      .select('*')
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setError(null)
      setExcerpts(data ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchExcerpts()
  }, [fetchExcerpts])

  const addExcerpt = useCallback(async ({ content, source, tagsInput, note }) => {
    if (!isSupabaseConfigured) throw new Error('尚未连接 Supabase，请先在 .env.local 中配置')
    const payload = {
      content: content.trim(),
      source: source?.trim() || null,
      note: note?.trim() || null,
      tags: parseTags(tagsInput ?? ''),
    }
    const { data, error: insertError } = await supabase
      .from('excerpts')
      .insert(payload)
      .select()
      .single()

    if (insertError) throw new Error(insertError.message)
    setExcerpts((prev) => [data, ...prev])
    return data
  }, [])

  const updateExcerpt = useCallback(async (id, { content, source, tagsInput, note }) => {
    if (!isSupabaseConfigured) throw new Error('尚未连接 Supabase，请先在 .env.local 中配置')
    const payload = {
      content: content.trim(),
      source: source?.trim() || null,
      note: note?.trim() || null,
      tags: parseTags(tagsInput ?? ''),
    }
    const { data, error: updateError } = await supabase
      .from('excerpts')
      .update(payload)
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw new Error(updateError.message)
    setExcerpts((prev) => prev.map((item) => (item.id === id ? data : item)))
    return data
  }, [])

  const deleteExcerpt = useCallback(async (id) => {
    if (!isSupabaseConfigured) throw new Error('尚未连接 Supabase，请先在 .env.local 中配置')
    const { error: deleteError } = await supabase.from('excerpts').delete().eq('id', id)
    if (deleteError) throw new Error(deleteError.message)
    setExcerpts((prev) => prev.filter((item) => item.id !== id))
  }, [])

  return { excerpts, loading, error, addExcerpt, updateExcerpt, deleteExcerpt, refetch: fetchExcerpts }
}
