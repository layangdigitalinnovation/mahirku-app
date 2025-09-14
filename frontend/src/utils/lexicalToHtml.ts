import { $generateHtmlFromNodes } from "@lexical/html"
import { createEditor, SerializedEditorState } from "lexical"

export function lexicalStateToHtml(serialized: string): string {
  try {
    const editor = createEditor()
    const editorState = editor.parseEditorState(
      JSON.parse(serialized) as SerializedEditorState
    )

    let html = ""
    editorState.read(() => {
      html = $generateHtmlFromNodes(editor) // ✅ cukup editor saja
    })

    return html
  } catch (err) {
    console.error("Failed to convert Lexical state to HTML:", err)
    return "<p class='text-red-500'>Invalid content</p>"
  }
}
