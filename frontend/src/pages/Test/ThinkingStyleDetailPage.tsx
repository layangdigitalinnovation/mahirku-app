
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCreateBlockNote } from "@blocknote/react";
import { useGetThinkingStyleById } from "@/hooks/useThinkingStyleTest";

// Main ThinkingStyleDetailPage Component
export default function ThinkingStyleDetailPage() {
   const editor = useCreateBlockNote();
  const { id } = useParams<{ id: string }>();
  const numericId = Number(id);
  const [htmlContent, setHtmlContent] = useState<string>("");

  const { data, isLoading, error } = useGetThinkingStyleById(numericId);
  const thinkingStyle = data?.data;
  const detailPage = thinkingStyle?.detailPage as string | undefined;

  // Parse and convert detail page content
  useEffect(() => {

    async function convertToHtml(params:string) {
      const parsed = JSON.parse(params)
      const htmlString = await editor.blocksToFullHTML(parsed);
      return htmlString;
    }


    if (detailPage) {
      try {
        convertToHtml(detailPage).then(htmlString => {
          setHtmlContent(htmlString);
        })
      } catch (err) {
        console.error("Failed to parse detailPage JSON:", err);
        setHtmlContent("");
      }
    } else {
      setHtmlContent("");
    }
  }, [detailPage, editor]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading thinking style...</p>
        </div>
      </div>
    );
  }

  if (error || !thinkingStyle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Thinking Style Not Found
          </h1>
          <p className="text-gray-600 mb-4">
            The thinking style you're looking for doesn't exist.
          </p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {thinkingStyle.type || "Untitled Thinking Style"}
              </h1>
              {thinkingStyle.description && (
                <p className="mt-2 text-sm text-gray-600">
                  {thinkingStyle.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg border shadow-sm">
          {htmlContent ? (
            <div
              className="p-8 prose-xs max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          ) : (
            <div className="p-8 text-center">
              <div className="text-gray-400 text-lg mb-2">
                No content available
              </div>
              <p className="text-gray-500 text-sm mb-6">
                This thinking style hasn't been configured yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
