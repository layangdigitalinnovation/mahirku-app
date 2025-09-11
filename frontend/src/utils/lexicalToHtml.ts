import { $generateHtmlFromNodes } from "@lexical/html"
import { createEditor, SerializedEditorState } from "lexical"

export function lexicalStateToHtml(serialized: string): string {
  try {
    const editor = createEditor()
    const editorState = editor.parseEditorState(
      JSON.parse(serialized) as SerializedEditorState
    )

    let html = ""
    editor.setEditorState(editorState)
    editor.update(() => {
      html = $generateHtmlFromNodes(editor, null)
    })

    return html
  } catch (err) {
    console.error("Failed to convert Lexical state to HTML:", err)
    return "<p class='text-red-500'>Invalid content</p>"
  }
}
