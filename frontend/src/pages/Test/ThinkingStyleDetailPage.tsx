"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { SerializedEditorState } from "lexical";
import { useGetThinkingStyleById } from "@/hooks/useThinkingStylesAdmin";
import { Button } from "@/components/ui/button";

// Simple HTML converter function
function convertEditorStateToHtml(
  editorState: SerializedEditorState | null
): string {
  if (!editorState || !editorState.root) return "";

  const convertNode = (node: any): string => {
    if (!node || !node.children) return "";

    let content = "";
    for (const child of node.children) {
      if (!child) continue;

      if (child.type === "text") {
        let text = child.text || "";
        // Use type-safe bitwise operations
        const format = child.format || 0;
        if (format & 1) text = `<strong>${text}</strong>`; // bold
        if (format & 2) text = `<em>${text}</em>`; // italic
        if (format & 8) text = `<u>${text}</u>`; // underline
        if (format & 4) text = `<s>${text}</s>`; // strikethrough
        content += text;
      } else {
        content += convertNode(child);
      }
    }

    if (!node.type) return content;

    switch (node.type) {
      case "root":
        return content;
      case "paragraph":
        return content
          ? `<p class="mb-4 text-gray-700 leading-relaxed">${content}</p>`
          : "";
      case "heading": {
        const tag =
          node.tag && ["h1", "h2", "h3"].includes(node.tag) ? node.tag : "h1";
        const headingClass =
          {
            h1: "text-3xl font-bold mb-6 text-gray-900",
            h2: "text-2xl font-semibold mb-4 text-gray-800",
            h3: "text-xl font-medium mb-3 text-gray-800",
          }[tag as "h1" | "h2" | "h3"] || "text-lg font-medium mb-2";
        return `<${tag} class="${headingClass}">${content}</${tag}>`;
      }
      case "list": {
        const listType = node.listType || "bullet";
        const listTag = listType === "bullet" ? "ul" : "ol";
        const listClass =
          listType === "bullet"
            ? "list-disc ml-6 mb-4"
            : "list-decimal ml-6 mb-4";
        return `<${listTag} class="${listClass}">${content}</${listTag}>`;
      }
      case "listitem":
        return `<li class="mb-1 text-gray-700">${content}</li>`;
      case "quote":
        return `<blockquote class="border-l-4 border-blue-300 pl-4 italic text-gray-600 mb-4 bg-blue-50 py-2">${content}</blockquote>`;
      default:
        return content;
    }
  };

  try {
    return convertNode(editorState.root);
  } catch (error) {
    console.error("Error converting editor state to HTML:", error);
    return "";
  }
}
// Main ThinkingStyleDetailPage Component
export default function ThinkingStyleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const numericId = Number(id);
  const [htmlContent, setHtmlContent] = useState<string>("");

  const { data, isLoading, error } = useGetThinkingStyleById(numericId);
  const thinkingStyle = data?.data;
  const detailPage = thinkingStyle?.detailPage as string | undefined;

  // Parse and convert detail page content
  useEffect(() => {
    if (detailPage) {
      try {
        const parsed = JSON.parse(detailPage) as SerializedEditorState;
        const htmlString = convertEditorStateToHtml(parsed);
        setHtmlContent(htmlString);
      } catch (err) {
        console.error("Failed to parse detailPage JSON:", err);
        setHtmlContent("");
      }
    } else {
      setHtmlContent("");
    }
  }, [detailPage]);

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
              className="p-8 prose max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700"
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
