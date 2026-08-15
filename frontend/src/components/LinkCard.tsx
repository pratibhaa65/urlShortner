import { useState } from "react";
import { ShortLink, linksApi, ApiError } from "../lib/api";

interface LinkCardProps {
  link: ShortLink;
  onDelete: () => void;
  onEdit: (link: ShortLink) => void;
}

export function LinkCard({ link, onDelete, onEdit }: LinkCardProps) {
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const shortUrl = `${window.location.origin}/${link.shortCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this link?")) return;

    setError("");
    setDeleting(true);

    try {
      await linksApi.delete(link.id);
      onDelete();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to delete link");
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow border border-gray-200 hover:shadow-lg transition">
      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded flex items-start">
          <span className="mr-2"></span>
          <span>{error}</span>
        </div>
      )}

      {/* Header: Short Code & Copy Button */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-gray-600 font-semibold uppercase">Short Code</p>
          <p className="font-mono font-bold text-lg text-blue-800">{link.shortCode}</p>
          <p className="text-xs text-gray-500 mt-1">{shortUrl}</p>
        </div>
        <button
          onClick={handleCopy}
          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded hover:bg-blue-200 font-medium transition shrink-0 ml-2"
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>

      {/* Actual URL */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <p className="text-xs text-gray-600 font-semibold uppercase">Actual URL</p>
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-800 hover:underline text-sm wrap-break-word line-clamp-2"
        >
          {link.url}
        </a>
      </div>

      <div className="mb-4 text-xs text-gray-500">
        Created At:{" "}
        {new Date(link.createdAt + (link.createdAt.endsWith('Z') ? '' : 'Z')).toLocaleString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(link)}
          className="flex-1 px-3 py-2 bg-amber-50 text-amber-700 rounded hover:bg-amber-100 font-medium text-sm border border-amber-500 transition"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex-1 px-3 py-2 bg-red-50 text-red-700 rounded hover:bg-red-100 font-medium text-sm border border-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {deleting ? " Deleting..." : " Delete"}
        </button>
      </div>
    </div>
  );
}