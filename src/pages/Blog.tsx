import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, Clock, Loader2 } from "lucide-react";
import { usePublishedPosts } from "@/hooks/useBlogPosts";
import { Helmet } from "react-helmet-async";

const Blog = () => {
  const { data: publishedPosts, isLoading } = usePublishedPosts();

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };


  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Blog — Courial | Premium Logistics Insights</title>
        <meta name="description" content="Insights on premium delivery, white-glove logistics, chauffeur services, and the future of last-mile experience." />
      </Helmet>
      <Navbar />

      <main className="pt-24 md:pt-32">
        {/* Hero */}
        <section className="pb-12 md:pb-20 relative overflow-hidden">
          <div className="absolute inset-0 grid-pattern opacity-50" />
          <div className="absolute inset-0 radial-gradient" />

          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="text-primary font-semibold text-sm uppercase tracking-wider block mb-4">
                  Blog
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 gradient-text-black-orange">
                  Insights & Ideas
                </h1>
                <p className="text-xl text-muted-foreground max-w-xl">
                  Biweekly perspectives on premium logistics, white-glove delivery, and the future of how things move.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {isLoading ? (
          <div className="container mx-auto px-6 py-20 text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
          </div>
        ) : (
          <>
            {publishedPosts && publishedPosts.length > 0 ? (
              <section className="container mx-auto px-6 pb-24">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {publishedPosts.map((post, i) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 + i * 0.05 }}
                    >
                      <Link
                        to={`/blog/${post.slug}`}
                        className="group block rounded-xl border border-border bg-card overflow-hidden hover-lift h-full"
                      >
                        <div className="aspect-[16/10] bg-muted flex items-center justify-center overflow-hidden">
                          {post.featured_image_url ? (
                            <img
                              src={post.featured_image_url}
                              alt={post.title}
                              className="w-full h-full object-cover transition-opacity group-hover:opacity-75"
                            />
                          ) : (
                            <div className="text-muted-foreground/40 text-sm">Image</div>
                          )}
                        </div>
                        <div className="p-6">
                          <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                            {post.category}
                          </span>
                          <h3 className="text-lg font-bold text-foreground mt-2 mb-2 group-hover:text-muted-foreground transition-colors">
                            {post.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            {post.published_at && <span>{formatDate(post.published_at)}</span>}
                            {post.read_time && (
                              <>
                                <span>·</span>
                                <span>{post.read_time}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </section>
            ) : (
              <div className="container mx-auto px-6 py-20 text-center text-muted-foreground">
                No posts yet. Check back soon!
              </div>
            )}
          </>
        )}

      </main>

      <Footer />
    </div>
  );
};

export default Blog;
