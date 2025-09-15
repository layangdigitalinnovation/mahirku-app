import { useEffect, useState } from "react";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import { Button } from "@/components/ui/button";
import { useGetThinkingStyleById, useUpdateThinkingStyle } from "@/hooks/useThinkingStylesAdmin";
import * as Tooltip from "@/components/ui/tooltip";
import { useParams } from "react-router-dom";










export default function EditDetailPage() {
  const [editorContent, setEditorContent] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { id } = useParams<{ id: string }>();
  
  // Initialize editor
  const editor = useCreateBlockNote({
    initialContent: editorContent ? JSON.parse(editorContent) : undefined,
  });

  // Mock hooks
  const { data, isLoading } = useGetThinkingStyleById(Number(id));
  const updateDetailPage = useUpdateThinkingStyle();

  const detailPage = data?.data?.detailPage;

  // ✅ Initialize editor content SETELAH data loaded
  useEffect(() => {
    if (detailPage && !isInitialized && editor) {
      const initializeContent = async () => {
        try {
          console.log('Initializing editor with backend data...');
          
          // Parse JSON blocks dari backend
          const parsedBlocks = JSON.parse(detailPage);
          console.log('Parsed blocks:', parsedBlocks);
          
          // Set blocks ke editor dengan delay untuk memastikan editor ready
          setTimeout(() => {
            editor.replaceBlocks(editor.document, parsedBlocks);
            setEditorContent(detailPage);
            setIsInitialized(true);
            console.log('Editor initialized successfully');
          }, 100);
          
        } catch (error) {
          console.error('Error initializing editor:', error);
          // Fallback: set as initialized with empty content
          setIsInitialized(true);
        }
      };

      initializeContent();
    }
  }, [detailPage, editor, isInitialized]);

  // Handle editor changes
  const handleEditorChange = () => {
    // Jangan track changes sebelum fully initialized
    if (!isInitialized) return;
    
    try {
      const currentBlocks = editor.document;
      const newContent = JSON.stringify(currentBlocks);
      
      // Only update if content actually changed
      if (newContent !== editorContent) {
        setEditorContent(newContent);
        setHasChanges(true);
        console.log('Content changed');
      }
    } catch (error) {
      console.error('Error handling editor change:', error);
    }
  };

const handleUpdateDetailPage = async () => {
  if (!editorContent) return;
  
  try {
    // Get HTML version for preview/display purposes
    
    updateDetailPage.mutate({
      id: Number(id),
      payload: {
        detailPage : editorContent,
      },
    });
    
    setHasChanges(false);
  } catch (error) {
    console.error('Error updating detail page:', error);
  }
};




  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Content Editor</h1>
        <div className="flex items-center space-x-2">
          {hasChanges && (
            <span className="text-sm text-amber-600 bg-amber-100 px-2 py-1 rounded">
              Unsaved changes
            </span>
          )}
          <span className="text-sm text-gray-500">
            ID: {Number(id)}
          </span>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden shadow-sm">
        <BlockNoteView
          editor={editor}
          onChange={handleEditorChange}
          theme="light"
          shadCNComponents={
            {
              Tooltip
            }
          }
        />
      </div>

      <div className="flex items-center justify-between pt-4">
        <div className="flex space-x-3">
          <Button 
            onClick={handleUpdateDetailPage}
            disabled={updateDetailPage.isPending || !hasChanges}
            className="flex items-center space-x-2"
          >
            {updateDetailPage.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </Button>
        </div>

        <div className="text-sm text-gray-500">
          Last saved: {hasChanges ? 'Unsaved' : 'Up to date'}
        </div>
      </div>
    </div>
  );
}