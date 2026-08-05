import { useCallback, useEffect, useState } from 'react'

const API_BASE = '/api/excerpts'

async function parseErrorMessage(response) {
  try {
    const body = await response.json()
    return body.error || `请求失败（${response.status}）`
  } catch {
    return `请求失败（${response.status}）`
  }
}

export function useExcerpts() {
  const [excerpts, setExcerpts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchExcerpts = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(API_BASE)
      if (!response.ok) throw new Error(await parseErrorMessage(response))
      setExcerpts(await response.json())
      setError(null)
    } catch (err) {
      setError(err.message || '无法连接数据库')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchExcerpts()
  }, [fetchExcerpts])

  const addExcerpt = useCallback(async ({ content, source, author, tagsInput, note }) => {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ content, source, author, tagsInput, note }),
    })
    if (!response.ok) throw new Error(await parseErrorMessage(response))
    const data = await response.json()
    setExcerpts((prev) => [data, ...prev])
    return data
  }, [])

  const updateExcerpt = useCallback(async (id, { content, source, author, tagsInput, note }) => {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ content, source, author, tagsInput, note }),
    })
    if (!response.ok) throw new Error(await parseErrorMessage(response))
    const data = await response.json()
    setExcerpts((prev) => prev.map((item) => (item.id === id ? data : item)))
    return data
  }, [])

  const deleteExcerpt = useCallback(async (id) => {
    const response = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' })
    if (!response.ok) throw new Error(await parseErrorMessage(response))
    setExcerpts((prev) => prev.filter((item) => item.id !== id))
  }, [])

  return { excerpts, loading, error, addExcerpt, updateExcerpt, deleteExcerpt, refetch: fetchExcerpts }
}
