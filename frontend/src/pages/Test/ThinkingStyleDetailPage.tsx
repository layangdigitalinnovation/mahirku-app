import { useParams } from "react-router-dom"
import { useGetThinkingStyleById } from "@/hooks/useThinkingStylesAdmin"
import { lexicalStateToHtml } from "@/utils/lexicalToHtml"

const ThinkingStyleDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, isError } = useGetThinkingStyleById(Number(id))

  if (isLoading) return <p>Loading...</p>
  if (isError) return <p>Failed to load data ❌</p>

  const { detailPage, type   } = data?.data || {}

const htmlContent = detailPage ? lexicalStateToHtml(detailPage) : ""

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">{type}</h1>

      {/* Render detailPage read-only */}
      <div className="border rounded-lg p-4 bg-white shadow">
        {htmlContent ? (
          <div
  dangerouslySetInnerHTML={{
    __html: htmlContent,
  }}
/>
        ) : (
          <p className="text-gray-500 italic">No details available</p>
        )}
      </div>
    </div>
  )
}

export default ThinkingStyleDetailPage
