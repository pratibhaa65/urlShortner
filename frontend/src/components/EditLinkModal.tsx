import { useState, useEffect } from "react";
import { ShortLink, linksApi, ApiError } from "../lib/api";

interface EditLinkModalProps {
  link: ShortLink | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditLinkModal({ link, onClose, onSuccess }: EditLinkModalProps) {
  const [url, setUrl] = useState("");
  const [shortCode, setShortCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (link) {
      setUrl(link.url);
      setShortCode(link.shortCode);
      setError("");
    }
  }, [link]);

  if (!link) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await linksApi.update(link.id, url, shortCode);
      onSuccess();
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to update link");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/10 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Edit Link</h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded text-sm flex items-start">
            <span className="mr-2">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* URL Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
            />
          </div>

          {/* Short Code Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Short Code</label>
            <input
              type="text"
              value={shortCode}
              onChange={(e) => setShortCode(e.target.value)}
              required
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 font-medium transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#752121] text-white rounded-lg hover:bg-[#942929] focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}