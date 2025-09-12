"use client"

import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { SerializedEditorState } from "lexical"
import { Editor } from "@/components/blocks/editor-00/editor"
import { Button } from "@/components/ui/Button"
import { useGetThinkingStyleById, useUpdateThinkingStyle } from "@/hooks/useThinkingStylesAdmin"

export default function EditDetailPage() {
  const { id } = useParams<{ id: string }>()
  const numericId = Number(id);

  // undefined = belum di-init; null = ter-init tapi kosong; object = terisi
  const [detailPageState, setDetailPageState] = useState<
    SerializedEditorState | null | undefined
  >(undefined)

  const { data, isLoading, isFetched } = useGetThinkingStyleById(numericId)
  const updateDetailPage = useUpdateThinkingStyle()

  const detailPage = data?.data?.detailPage as string | undefined

  // Hanya lakukan inisialisasi sekali: saat data sudah fetched dan state masih undefined
  useEffect(() => {
    if (!isFetched) return
    if (detailPageState !== undefined) return // sudah di-init sebelumnya

    if (detailPage) {
      try {
        setDetailPageState(JSON.parse(detailPage) as SerializedEditorState)
      } catch (err) {
        console.error("Failed to parse detailPage JSON:", err)
        setDetailPageState(null) // treat corrupted JSON as empty
      }
    } else {
      // kalau null/undefined dari DB -> init sebagai kosong (null)
      setDetailPageState(null)
    }
  }, [isFetched, detailPage, detailPageState])

  const handleSave = () => {
    // jangan blok save jika state === null (artinya kosong tapi valid)
    if (detailPageState === undefined) return // belum siap
    updateDetailPage.mutate(
      {
        id: numericId,
        payload: {
          detailPage: JSON.stringify(detailPageState),
        },
      },
    )
  }

  // Tampilkan loading sampai state sudah di-init (bukan undefined)
  if (isLoading || detailPageState === undefined) {
    return <p>Loading...</p>
  }

  return (
    <div className="space-y-4">
      <Editor
        // library menerima undefined untuk editor kosong; kita pakai undefined ketika null => convert
        editorSerializedState={detailPageState ?? undefined}
        onSerializedChange={(value) => setDetailPageState(value)}
      />

      <Button disabled={updateDetailPage.isPending} onClick={handleSave}>
        Save
      </Button>
    </div>
  )
}
