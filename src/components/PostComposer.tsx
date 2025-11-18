import React, { useRef, useState } from "react";
import api from "../api/api"; // adjust import if needed
import "../styles/PostComposer.css";

type PostComposerProps = {
  onCreated?: (newPost:{content:string}) => void;
};

export default function PostComposer({ onCreated }: PostComposerProps) {
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      setImageFile(null);
      setPreviewUrl(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    setError(null);
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function removeImage() {
    setImageFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!content.trim() && !imageFile) {
      setError("Add text or select an image first.");
      return;
    }

    try {
      setLoading(true);

      const fd = new FormData();
      if (content.trim()) fd.append("content", content.trim());
      if (imageFile) fd.append("image", imageFile);

      const res = await api.post("post/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setContent("");
      removeImage();

      onCreated?.(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="post-composer" onSubmit={handleSubmit}>
      <textarea
        className="composer-textarea"
        placeholder="What's happening?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        disabled={loading}
      />

      {previewUrl && (
        <div className="composer-preview-row">
          <img src={previewUrl} alt="preview" className="composer-preview-img" />
          <button
            type="button"
            className="composer-remove-img"
            onClick={removeImage}
            disabled={loading}
          >
            Remove
          </button>
        </div>
      )}

      <div className="composer-controls">
        <label className="composer-file-label">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            disabled={loading}
          />
          <span>Add Image</span>
        </label>

        <button
          type="submit"
          className="composer-post-btn"
          disabled={loading || (!content.trim() && !imageFile)}
        >
          {loading ? "Posting..." : "Post"}
        </button>
      </div>

      {error && <div className="composer-error">{error}</div>}
    </form>
  );
}
