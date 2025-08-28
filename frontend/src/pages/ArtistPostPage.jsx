import { useEffect, useState } from "react";
import ArtistPostCard from "./ArtistPostCard";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";
import { useUserStore } from "../stores/useUserStore";
import { Search, Filter, MapPin, Clock, Star, TrendingUp } from "lucide-react";

const ArtistPostPage = () => {
  const { user } = useUserStore();
  const [allPosts, setAllPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [recommendedPosts, setRecommendedPosts] = useState([]);
  const [appliedPostIds, setAppliedPostIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  const generateRecommendations = (posts, artistProfile) => {
    if (!artistProfile) return [];

    return posts.map(post => {
      let score = 0;
      
      if (post.artistType?.includes(artistProfile.category)) {
        score += 40;
      }
      
      if (post.location?.city === artistProfile.location?.city) {
        score += 25;
      } else if (post.location?.state === artistProfile.location?.state) {
        score += 15;
      }
      
      if (post.budget >= 1000) score += 20;
      else if (post.budget >= 500) score += 15;
      else score += 10;
      
      const daysSincePosted = (Date.now() - new Date(post.createdAt || post.date)) / (1000 * 60 * 60 * 24);
      if (daysSincePosted <= 1) score += 10;
      else if (daysSincePosted <= 7) score += 5;
      
      return { ...post, score };
    }).sort((a, b) => b.score - a.score);
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const [postsRes, appliedRes] = await Promise.all([
          axios.get("/jobposts", { withCredentials: true }),
          axios.get("/jobposts/applied", { withCredentials: true }).catch(() => ({ data: [] }))
        ]);

        const applied = new Set(
          (appliedRes.data || []).map(({ jobPostId }) => jobPostId?._id || jobPostId)
        );
        setAppliedPostIds(applied);

        const availablePosts = postsRes.data.filter(post => !applied.has(post._id));
        setAllPosts(availablePosts);
        
        const recommended = generateRecommendations(availablePosts, user);
        setRecommendedPosts(recommended.slice(0, 6)); // Top 6 recommendations
        
        setFilteredPosts(availablePosts);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch posts");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [user]);

  useEffect(() => {
    let filtered = [...allPosts];

    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.artistType?.some(type => type.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(post =>
        post.artistType?.includes(selectedCategory)
      );
    }

    // Sort posts
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
        break;
      case "budget":
        filtered.sort((a, b) => b.budget - a.budget);
        break;
      case "closest":
        if (user?.location) {
          filtered.sort((a, b) => {
            const aMatch = a.location?.city === user.location.city ? 1 : 0;
            const bMatch = b.location?.city === user.location.city ? 1 : 0;
            return bMatch - aMatch;
          });
        }
        break;
      default:
        break;
    }

    setFilteredPosts(filtered);
  }, [allPosts, searchTerm, selectedCategory, sortBy, user]);

  const handleApply = async (postId) => {
    try {
      await axios.post(`/jobposts/${postId}/apply`, {}, { withCredentials: true });
      toast.success("Applied successfully!");
      
      // Update applied posts and remove from available posts
      setAppliedPostIds(prev => new Set([...prev, postId]));
      setAllPosts(prev => prev.filter(p => p._id !== postId));
      setFilteredPosts(prev => prev.filter(p => p._id !== postId));
      setRecommendedPosts(prev => prev.filter(p => p._id !== postId));
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to apply");
    }
  };

  // Get unique categories for filter
  const categories = [...new Set(allPosts.flatMap(post => post.artistType || []))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100 font-sans">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-purple-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                 Kala-Connect
              </div>
            </div>
            <div className="flex gap-6 items-center text-purple-700">
              <a href="/profile" className="hover:text-purple-900 transition-colors font-medium">Profile</a>
              <a href="/applied-jobs" className="hover:text-purple-900 transition-colors font-medium">Applied Jobs</a>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Search and Filters */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-6">
            Discover Opportunities
          </h1>
          
          {/* Search and Filter Bar */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="flex flex-wrap gap-4 items-center">
              {/* Search */}
              <div className="flex-1 min-w-[300px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search jobs by title, description, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent min-w-[150px]"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent min-w-[150px]"
              >
                <option value="newest">Newest First</option>
                <option value="budget">Highest Budget</option>
                <option value="closest">Closest Location</option>
              </select>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
              >
                <Filter className="w-5 h-5" />
                Filters
              </button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range</label>
                    <select className="w-full px-3 py-2 border border-gray-200 rounded-lg">
                      <option>Any Budget</option>
                      <option>Under ₹500</option>
                      <option>₹500 - ₹1000</option>
                      <option>₹1000 - ₹5000</option>
                      <option>Above ₹5000</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Distance</label>
                    <select className="w-full px-3 py-2 border border-gray-200 rounded-lg">
                      <option>Any Location</option>
                      <option>Same City</option>
                      <option>Same State</option>
                      <option>Within 50km</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Posted Within</label>
                    <select className="w-full px-3 py-2 border border-gray-200 rounded-lg">
                      <option>Any Time</option>
                      <option>Last 24 hours</option>
                      <option>Last 7 days</option>
                      <option>Last 30 days</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-500">Loading amazing opportunities...</p>
          </div>
        ) : (
          <>
            {/* Recommended Posts */}
            {recommendedPosts.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-3 rounded-xl">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-purple-800">Recommended for You</h2>
                  <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                    {recommendedPosts.length} matches
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendedPosts.map((post) => (
                    <div key={post._id} className="relative">
                      <ArtistPostCard 
                        post={post} 
                        onApply={handleApply}
                        isApplied={appliedPostIds.has(post._id)}
                      />
                      {post.score >= 60 && (
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                          <TrendingUp className="w-3 h-3 inline mr-1" />
                          Top Match
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Posts */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-purple-800">
                  {searchTerm || selectedCategory ? 'Search Results' : 'All Available Jobs'}
                </h2>
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {filteredPosts.length} jobs
                </div>
              </div>

              {filteredPosts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 max-w-md mx-auto shadow-xl border border-white/20">
                    <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No Jobs Found</h3>
                    <p className="text-gray-600">
                      {searchTerm || selectedCategory 
                        ? "Try adjusting your search criteria or filters."
                        : "No new job posts available at the moment. Check back later!"
                      }
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPosts.map((post) => (
                    <ArtistPostCard 
                      key={post._id} 
                      post={post} 
                      onApply={handleApply}
                      isApplied={appliedPostIds.has(post._id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ArtistPostPage;
