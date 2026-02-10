import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { blogPosts } from "@/data/blog-posts";
import { Helmet } from "react-helmet-async";

const Blog = () => {
  const publishedPosts = blogPosts
    .filter((p) => p.published)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  const featured = publishedPosts[0];
  const rest = publishedPosts.slice(1);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Blog — Courial | Premium Logistics Insights</title>
        <meta name="description" content="Insights on premium delivery, white-glove logistics, chauffeur services, and the future of last-mile experience." />
      </Helmet>
      <Navbar />

      <main className="pt-20 lg:pt-24">
        {/* Header */}
        <section className="container mx-auto px-6 pt-16 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <p className="text-sm font-semibold text-primary tracking-wide uppercase mb-3">Blog</p>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
              Insights & Ideas
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Biweekly perspectives on premium logistics, white-glove delivery, and the future of how things move.
            </p>
          </motion.div>
        </section>

        {/* Featured Post */}
        {featured && (
          <section className="container mx-auto px-6 pb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Link
                to={`/blog/${featured.slug}`}
                className="group block rounded-2xl border border-border bg-card overflow-hidden hover-lift"
              >
                <div className="grid md:grid-cols-2 gap-0">
                  {/* Image placeholder */}
                  <div className="aspect-[16/10] md:aspect-auto bg-muted flex items-center justify-center min-h-[280px]">
                    {featured.featuredImage ? (
                      <img
                        src={featured.featuredImage}
                        alt={featured.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-muted-foreground/40 text-sm">Featured Image</div>
                    )}
                  </div>

                  <div className="p-8 md:p-10 flex flex-col justify-center">
                    <span className="text-xs font-semibold text-primary uppercase tracking-wide mb-3">
                      {featured.category}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                      {featured.title}
                    </h2>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {featured.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(featured.publishedAt)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {featured.readTime}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          </section>
        )}

        {/* Post Grid */}
        {rest.length > 0 && (
          <section className="container mx-auto px-6 pb-24">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map((post, i) => (
                <motion.div
                  key={post.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + i * 0.05 }}
                >
                  <Link
                    to={`/blog/${post.slug}`}
                    className="group block rounded-xl border border-border bg-card overflow-hidden hover-lift h-full"
                  >
                    <div className="aspect-[16/10] bg-muted flex items-center justify-center">
                      {post.featuredImage ? (
                        <img
                          src={post.featuredImage}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-muted-foreground/40 text-sm">Image</div>
                      )}
                    </div>
                    <div className="p-6">
                      <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                        {post.category}
                      </span>
                      <h3 className="text-lg font-bold text-foreground mt-2 mb-2 group-hover:text-primary transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{formatDate(post.publishedAt)}</span>
                        <span>·</span>
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="border-t border-border bg-muted/50">
          <div className="container mx-auto px-6 py-16 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-3">Stay in the loop</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              New insights every two weeks on premium logistics and the future of delivery.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
            >
              Explore Courial <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
