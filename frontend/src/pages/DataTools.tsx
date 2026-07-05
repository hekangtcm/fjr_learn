import { useState } from 'react'
import apiClient from '@/lib/api-client'
import { useQuery } from '@tanstack/react-query'

export function DataTools() {
  const [jobId, setJobId] = useState<string | null>(null)

  const { data: job } = useQuery({
    queryKey: ['import-job', jobId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/imports/${jobId}`)
      return data
    },
    enabled: !!jobId,
    refetchInterval: (query) => {
      const status = (query.state.data as any)?.status
      return status === 'SUCCESS' || status === 'FAILED' ? false : 1000
    },
  })

  const upload = async (file: File) => {
    const form = new FormData()
    form.append('file', file)
    const { data } = await apiClient.post('/imports/books', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    setJobId(data.id)
  }

  const progress = job?.total ? Math.round((job.processed / job.total) * 100) : 0

  const exportBooks = async () => {
    const res = await apiClient.get('/exports/books', { responseType: 'blob' })
    const url = window.URL.createObjectURL(res.data)
    const a = document.createElement('a')
    a.href = url
    a.download = 'booknest-books.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-bold">数据工具</h1>

      <div className="rounded border p-4">
        <h2 className="font-semibold">CSV 导入书籍</h2>
        <input
          data-testid="csv-upload-input"
          type="file"
          accept=".csv"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) upload(file)
          }}
        />
      </div>

      {job && (
        <div className="rounded border p-4">
          <div>状态：{job.status}</div>
          <div>进度：{job.processed}/{job.total}</div>
          <div className="mt-2 h-2 rounded bg-gray-200">
            <div className="h-2 rounded bg-blue-600" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-2 text-sm text-gray-500">
            成功：{job.successCount}，失败：{job.failedCount}
          </div>
        </div>
      )}

      <button
        onClick={exportBooks}
        className="inline-block rounded bg-gray-800 px-4 py-2 text-white"
      >
        导出当前 Workspace 书籍
      </button>
    </div>
  )
}
