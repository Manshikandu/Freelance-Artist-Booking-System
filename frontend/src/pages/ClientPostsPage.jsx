
import { useEffect, useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";
import { Trash2, PlusCircle, Calendar, Clock, MapPin, User, MessageSquare, ExternalLink, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";

const ClientPostsPage = () => {
  const { user } = useUserStore();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get("/jobposts/my", { withCredentials: true });
        setPosts(res.data);
      } catch (error) {
        toast.error(error.response?.data?.message || "Error fetching posts");
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "client") fetchPosts();
  }, [user]);

  const handleDelete = useCallback(async (postId) => {
    try {
      await axios.delete(`/jobposts/${postId}`);
      setPosts((prev) => prev.filter((post) => post._id !== postId));
      toast.success("Post deleted successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error deleting post");
    }
  }, []);

  if (!user || user.role !== "client") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Loading your job posts...</p>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <>
      <Navbar forceBackground={true} backgroundColor="bg-black" forceProfileBackground={true} />

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-100">
        <div className="pt-24 px-6 pb-12 max-w-7xl mx-auto">
          {/* Header Section */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex justify-between items-center mb-8">
              <div className="text-left">
                <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-4">
                  My Job Posts
                </h1>
                <p className="text-xl text-gray-600">
                  Manage your job postings and connect with talented artists
                </p>
              </div>

              <motion.button
                onClick={() => navigate("/createpost")}
                className="flex items-center gap-3 bg-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-purple-700 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <PlusCircle className="w-6 h-6" />
                Create New Job Post
              </motion.button>
            </div>
          </motion.div>

          {/* Job Posts Section */}
          <motion.div
            className="mb-16"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-purple-100 p-3 rounded-xl">
                <Briefcase className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-3xl font-bold text-purple-800">Active Job Posts</h2>
              <div className="bg-purple-600 text-white text-sm px-3 py-1 rounded-full font-medium">
                {posts.length}
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white/60 rounded-2xl p-6 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <motion.div 
                className="text-center py-16"
                variants={itemVariants}
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 max-w-md mx-auto shadow-xl border border-white/20">
                  <div className="bg-purple-100 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                    <Briefcase className="w-10 h-10 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">No Job Posts Yet</h3>
                  <p className="text-gray-600 mb-6">Start by creating your first job post to connect with amazing artists.</p>
                  <button
                    onClick={() => navigate("/createpost")}
                    className="bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors"
                  >
                    Create Your First Post
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                  <motion.div
                    key={post._id}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group"
                    variants={itemVariants}
                    whileHover={{ y: -5 }}
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-purple-800 line-clamp-2 group-hover:text-purple-600 transition-colors">
                          {post.title}
                        </h3>
                        <motion.button
                          onClick={() => handleDelete(post._id)}
                          className="bg-red-50 text-red-600 p-2 rounded-xl hover:bg-red-100 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>

                      <p className="text-gray-700 mb-6 line-clamp-3 leading-relaxed">{post.description}</p>

                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-purple-500" />
                          <span>{new Date(post.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <Clock className="w-4 h-4 text-purple-500" />
                          <span>{new Date(post.time).toLocaleTimeString()}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 text-purple-500" />
                          <span>{post.location?.city}, {post.location?.state}</span>
                        </div>
                      </div>

                      {post.artistType?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.artistType.map((type, idx) => (
                            <span
                              key={idx}
                              className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 text-xs font-medium px-3 py-1 rounded-full"
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                        <span className="text-green-600 font-bold text-lg">Rs. {post.budget}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-green-100 p-3 rounded-xl">
                <User className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-purple-800">Applied Artists</h2>
              <div className="bg-green-600 text-white text-sm px-3 py-1 rounded-full font-medium">
                {posts.flatMap(p => p.applicants || []).length}
              </div>
            </div>

            {posts.flatMap(p => p.applicants || []).length === 0 ? (
              <motion.div 
                className="text-center py-16"
                variants={itemVariants}
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 max-w-md mx-auto shadow-xl border border-white/20">
                  <div className="bg-green-100 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                    <User className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">No Applications Yet</h3>
                  <p className="text-gray-600">Artists haven't applied to your posts yet. Share your posts to get more visibility!</p>
                </div>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) =>
                  (post.applicants || []).map(({ artist, appliedAt, message, sampleURL }, idx) => (
                    <motion.div
                      key={`${post._id}-${idx}`}
                      variants={itemVariants}
                      whileHover={{ y: -5 }}
                    >
                      <Link
                        to={`/artist/${artist?._id}`}
                        className="block bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 group relative overflow-hidden"
                      >
                        
                        <div className="flex gap-4 items-start mb-4 relative z-10">
                          <img
                            src={artist?.profilePicture?.url || "/assets/default-avatar.png"}
                            alt="Artist"
                            className="w-16 h-16 rounded-2xl object-cover ring-4 ring-purple-100 group-hover:ring-purple-200 transition-all"
                          />
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-purple-800 group-hover:text-purple-600 transition-colors">
                              {artist?.fullName || artist?.username || "Unknown Artist"}
                            </h3>
                            <p className="text-sm text-gray-600 capitalize font-medium">
                              {artist?.category || "Category not specified"}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Calendar className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-500">
                                Applied {new Date(appliedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {message && (
                          <div className="bg-gray-50 rounded-xl p-3 mb-4">
                            <div className="flex items-start gap-2">
                              <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-gray-700 line-clamp-3">{message}</p>
                            </div>
                          </div>
                        )}

                        {sampleURL && (
                          <div className="mb-4">
                            <a
                              href={sampleURL}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                              View Sample Work
                            </a>
                          </div>
                        )}

                        <div className="flex gap-3">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              navigate(`/book?artistId=${artist?._id}`);
                            }}
                            className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-purple-700 transition-all duration-300 transform hover:scale-105"
                          >
                            Book Now
                          </button>
                        </div>
                      </Link>
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default ClientPostsPage;



