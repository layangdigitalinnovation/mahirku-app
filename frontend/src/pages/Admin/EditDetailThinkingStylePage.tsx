"use client"

import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { SerializedEditorState } from "lexical"
import { Editor } from "@/components/blocks/editor-00/editor"
import { Button } from "@/components/ui/Button"
import { useGetThinkingStyleById, useUpdateThinkingStyle } from "@/hooks/useThinkingStylesAdmin"

export default function EditDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [loading, setLoading] = useState(true)

  const { data  } = useGetThinkingStyleById(Number(id))
  const { detailPage } = data?.data || {}
  const [detailPageState, setDetailPageState] = useState<SerializedEditorState | null>(null)
  const updateDetailPage = useUpdateThinkingStyle()
useEffect(() => {
  if (detailPage && detailPageState === null) { // ✅ hanya saat pertama kali
    try {
      setDetailPageState(JSON.parse(detailPage))
    } catch {
      setDetailPageState(null)
    }
    setLoading(false)
  }
}, [detailPage, detailPageState])




  const handleSave = async () => {
    if (!detailPageState) return
    updateDetailPage.mutate({
      id: Number(id),
      payload: {
        detailPage: JSON.stringify(detailPageState),
      }
    })
  }

  if (loading) return <p>Loading...</p>

  return (
    <div className="space-y-4">
      <Editor
        editorSerializedState={detailPageState ?? undefined}
        onSerializedChange={(value) => setDetailPageState(value)}
      />

      <Button onClick={handleSave}>Save</Button>
    </div>
  )
}
