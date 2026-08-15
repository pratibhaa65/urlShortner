import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { linksApi, ShortLink, ApiError } from "../lib/api";
import { CreateLinkForm } from "../components/CreateLinkForm";
import { LinkCard } from "../components/LinkCard";
import { EditLinkModal } from "../components/EditLinkModal";
import { Pagination } from "../components/Pagination";

export function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingLink, setEditingLink] = useState<ShortLink | null>(null);

  // Load links on mount and when page changes
  useEffect(() => {
    loadLinks();
  }, [currentPage]);

  const loadLinks = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await linksApi.list(currentPage);
      setLinks(response.links);
      setTotalPages(response.totalPages);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError("Failed to load links");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleDelete = () => {
    loadLinks();
  };

  const handleCreateSuccess = () => {
    setCurrentPage(1);
    loadLinks();
  };

  const handleEditSuccess = () => {
    loadLinks();
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-serif text-[#5A0B0B]">URL Shortener</h1>
            <p className="text-sm text-gray-600 mt-1 px-1">Logged in as: <span className="font-semibold">{user?.email}</span></p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-[#752121] text-white rounded-lg hover:bg-[#942929] font-semibold transition transform hover:scale-105 active:scale-95"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Create Link Form */}
        <CreateLinkForm onSuccess={handleCreateSuccess} />

        {/* Global Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start">
            <span className="mr-3">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-lg text-gray-600">Loading your links...</div>
          </div>
        ) : links.length === 0 ? (
          /* Empty State */
          <div className="bg-white p-12 rounded-lg shadow border border-gray-200 text-center">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-lg text-gray-600">No links yet</p>
            <p className="text-sm text-gray-500 mt-2">Create your first short link above to get started!</p>
          </div>
        ) : (
          <>
            {/* Links Grid */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 px-2">Your Short Links</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {links.map((link) => (
                  <LinkCard
                    key={link.id}
                    link={link}
                    onDelete={handleDelete}
                    onEdit={setEditingLink}
                  />
                ))}
              </div>
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {/* Edit Modal */}
      <EditLinkModal
        link={editingLink}
        onClose={() => setEditingLink(null)}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}