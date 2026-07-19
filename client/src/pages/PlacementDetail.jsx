import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getAllPlacements } from "../utils/api";

function PlacementDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [placement, setPlacement] = useState(null);
  const [relatedPlacements, setRelatedPlacements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlacementDetail();
  }, [id]);

  const fetchPlacementDetail = async () => {
    try {
      const data = await getAllPlacements();
      const currentPlacement = data.placements.find((p) => p._id === id);
      setPlacement(currentPlacement);

      if (currentPlacement) {
        const related = data.placements
          .filter(
            (p) =>
              p._id !== id &&
              (p.company === currentPlacement.company ||
                Math.abs(p.package - currentPlacement.package) <= 2),
          )
          .slice(0, 3);
        setRelatedPlacements(related);
      }
    } catch (error) {
      console.error("Error fetching placement:", error);
    } finally {
      setLoading(false);
    }
  };

  const estimateReadingTime = (text) => {
    const wordsPerMinute = 200;
    const words = text.split(" ").length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${placement.company} Placement - ${placement.package} LPA`,
        text: `Check out this placement story from ${placement.company}!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          <p className="mt-4 text-white font-semibold">
            Loading placement details...
          </p>
        </div>
      </div>
    );
  }

  if (!placement) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-white text-xl font-semibold mb-4">
            Placement not found
          </p>
          <Link to="/placements">
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl">
              ← Back to Placements
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header with Breadcrumbs */}
      <div className="bg-slate-800 border-b border-slate-700 shadow-2xl sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm">
              <Link
                to="/"
                className="text-gray-400 hover:text-white transition"
              >
                Home
              </Link>
              <span className="text-gray-600">/</span>
              <Link
                to="/placements"
                className="text-gray-400 hover:text-white transition"
              >
                Placements
              </Link>
              <span className="text-gray-600">/</span>
              <span className="text-white font-semibold">
                {placement.company}
              </span>
            </div>
            <button
              onClick={() => navigate("/placements")}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition text-sm"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="bg-linear-to-br from-blue-600 to-purple-700 rounded-3xl p-12 mb-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>

          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="px-4 py-2 bg-green-500 bg-opacity-90 text-white rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                <span>✓</span>
                <span>Verified</span>
              </div>
              <div className="px-4 py-2 bg-blue-500 bg-opacity-90 text-white rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                <span>📅</span>
                <span>Batch {placement.batch}</span>
              </div>
            </div>

            <h1 className="text-5xl font-bold text-white mb-6">
              {placement.company}
            </h1>

            <div className="flex items-center gap-8 mb-6">
              <div>
                <p className="text-blue-200 text-sm mb-1">Package Offered</p>
                <p className="text-6xl font-bold text-white">
                  ₹{placement.package}
                </p>
                <p className="text-blue-200 text-lg">LPA</p>
              </div>

              <div className="h-20 w-px bg-white bg-opacity-30"></div>

              <div>
                <p className="text-blue-200 text-sm mb-1">Student</p>
                <p className="text-2xl font-bold text-white">
                  {placement.isAnonymous
                    ? "🔒 Anonymous"
                    : placement.studentName}
                </p>
                <p className="text-blue-200 text-sm mt-1">
                  Posted on{" "}
                  {new Date(placement.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <button
              onClick={handleShare}
              className="px-6 py-3 bg-white text-blue-600 hover:bg-gray-100 font-bold rounded-xl shadow-lg transition flex items-center gap-2"
            >
              <span>🔗</span>
              <span>Share this story</span>
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Interview Experience */}
            {placement.interviewExperience && (
              <div className="bg-slate-800 rounded-2xl p-8 shadow-xl border border-slate-700">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    💡 Interview Experience
                  </h2>
                  <span className="text-sm text-gray-400">
                    📖 {estimateReadingTime(placement.interviewExperience)} min
                    read
                  </span>
                </div>

                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-line">
                    {placement.interviewExperience}
                  </p>
                </div>
              </div>
            )}

            {/* Documents Section */}
            {(placement.offerLetterUrl || placement.idCardUrl) && (
              <div className="bg-slate-800 rounded-2xl p-8 shadow-xl border border-slate-700">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  📄 Documents
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  {placement.offerLetterUrl && (
                    <a
                      href={placement.offerLetterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 bg-slate-700 hover:bg-slate-600 rounded-xl transition group"
                    >
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-2xl">
                        📄
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-semibold group-hover:text-blue-400 transition">
                          Offer Letter
                        </p>
                        <p className="text-gray-400 text-sm">Click to view</p>
                      </div>
                      <span className="text-gray-400 group-hover:text-white transition">
                        →
                      </span>
                    </a>
                  )}

                  {placement.idCardUrl && (
                    <a
                      href={placement.idCardUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 bg-slate-700 hover:bg-slate-600 rounded-xl transition group"
                    >
                      <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center text-2xl">
                        🆔
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-semibold group-hover:text-purple-400 transition">
                          ID Card
                        </p>
                        <p className="text-gray-400 text-sm">
                          Verification proof
                        </p>
                      </div>
                      <span className="text-gray-400 group-hover:text-white transition">
                        →
                      </span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info Card */}
            <div className="bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700 lg:sticky lg:top-8">
              <h3 className="text-lg font-bold text-white mb-4">Quick Info</h3>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Company</span>
                  <span className="text-white font-semibold">
                    {placement.company}
                  </span>
                </div>
                <div className="h-px bg-slate-700"></div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Package</span>
                  <span className="text-green-400 font-bold">
                    ₹{placement.package} LPA
                  </span>
                </div>
                <div className="h-px bg-slate-700"></div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Batch</span>
                  <span className="text-white font-semibold">
                    {placement.batch}
                  </span>
                </div>
                <div className="h-px bg-slate-700"></div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Student</span>
                  <span className="text-white font-semibold">
                    {placement.isAnonymous
                      ? "Anonymous"
                      : placement.studentName}
                  </span>
                </div>
                <div className="h-px bg-slate-700"></div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Posted</span>
                  <span className="text-white font-semibold">
                    {new Date(placement.createdAt).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Related Placements */}
            {relatedPlacements.length > 0 && (
              <div className="bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700">
                <h3 className="text-lg font-bold text-white mb-4">
                  Related Placements
                </h3>

                <div className="space-y-3">
                  {relatedPlacements.map((related) => (
                    <Link
                      key={related._id}
                      to={`/placement/${related._id}`}
                      className="block p-4 bg-slate-700 hover:bg-slate-600 rounded-xl transition group"
                    >
                      <p className="text-white font-semibold mb-1 group-hover:text-blue-400 transition">
                        {related.company}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{related.batch}</span>
                        <span className="text-green-400 font-bold">
                          ₹{related.package} LPA
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="mt-12 flex justify-center">
          <Link to="/placements">
            <button className="px-8 py-4 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg transition">
              ← View All Placements
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PlacementDetail;
