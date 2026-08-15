import { useState } from "react";
import { linksApi, ApiError } from "../lib/api";

interface CreateLinkFormProps {
  onSuccess: () => void;
}

export function CreateLinkForm({ onSuccess }: CreateLinkFormProps) {
  const [url, setUrl] = useState("");
  const [shortCode, setShortCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const result = await linksApi.create(url, shortCode || undefined);
      setSuccess(`Link created! Short code: ${result.shortCode}`);
      setUrl("");
      setShortCode("");
      setTimeout(() => setSuccess(""), 3000);
      onSuccess();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to create short link");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
      <h2 className="text-2xl font-bold mb-4 text-[#7b2a2a]">Shorten Long URLs</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start">
          <span className="mr-3">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-start">
          <span className="mr-3">✓</span>
          <span>{success}</span>
        </div>
      )}

      <div className="space-y-4">
        {/* URL Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Actual URL</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://urlshortner.com/id123"
            required
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-400 transition"
          />
          <p className="text-xs text-gray-500 mt-1">Enter the full URL you want to shorten</p>
        </div>

        {/* Short Code Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Short Code
          </label>
          <input
            type="text"
            value={shortCode}
            onChange={(e) => setShortCode(e.target.value)}
            placeholder="e.g. link"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-400 transition"
          />
          <p className="text-xs text-gray-500 mt-1">Leave empty for auto-generated code</p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-40 bg-linear-to-r bg-emerald-800 hover:bg-emerald-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              Creating...
            </span>
          ) : (
            "Create Link"
          )}
        </button>
      </div>
    </form>
  );
}