import { useParams, Link, Navigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { blogPosts, BlogContentBlock } from "@/data/blog-posts";
import { Helmet } from "react-helmet-async";

const renderBlock = (block: BlogContentBlock, index: number) => {
  switch (block.type) {
    case "heading2":
      return (
        <h2 key={index} className="text-2xl md:text-3xl font-bold text-foreground mt-12 mb-4">
          {block.text}
        </h2>
      );
    case "heading3":
      return (
        <h3 key={index} className="text-xl font-semibold text-foreground mt-8 mb-3">
          {block.text}
        </h3>
      );
    case "paragraph":
      return (
        <p
          key={index}
          className="text-foreground/80 leading-relaxed mb-4"
          dangerouslySetInnerHTML={{
            __html: (block.text || "")
              .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
              .replace(/\*(.*?)\*/g, "<em>$1</em>"),
          }}
        />
      );
    case "blockquote":
      return (
        <blockquote
          key={index}
          className="border-l-4 border-primary pl-6 py-2 my-8 italic text-foreground/70"
        >
          {block.text}
        </blockquote>
      );
    case "protip":
      return (
        <div
          key={index}
          className="my-10 p-6 rounded-xl bg-primary/5 border border-primary/15"
        >
          <p className="text-xs font-bold text-primary uppercase tracking-wide mb-2">Pro Tip</p>
          <p
            className="text-foreground/80 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: (block.text || "")
                .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                .replace(/\*(.*?)\*/g, "<em>$1</em>"),
            }}
          />
        </div>
      );
    case "list":
      return (
        <ul key={index} className="my-6 space-y-3">
          {block.items?.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-3 text-foreground/80 leading-relaxed"
            >
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              <span
                dangerouslySetInnerHTML={{
                  __html: item
                    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                    .replace(/\*(.*?)\*/g, "<em>$1</em>"),
                }}
              />
            </li>
          ))}
        </ul>
      );
    case "image":
      return (
        <figure key={index} className="my-8">
          <img
            src={block.src}
            alt={block.alt || ""}
            className="w-full rounded-lg"
            loading="lazy"
          />
          {block.caption && (
            <figcaption className="text-sm text-muted-foreground mt-2 text-center">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    default:
      return null;
  }
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find((p) => p.slug === slug && p.published);

  if (!post) return <Navigate to="/blog" replace />;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  // Find next/prev posts
  const publishedPosts = blogPosts
    .filter((p) => p.published)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  const currentIndex = publishedPosts.findIndex((p) => p.slug === slug);
  const nextPost = publishedPosts[currentIndex + 1];
  const prevPost = publishedPosts[currentIndex - 1];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{post.title} — Courial Blog</title>
        <meta name="description" content={post.metaDescription} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.metaDescription} />
        <meta property="og:type" content="article" />
        <meta name="article:published_time" content={post.publishedAt} />
      </Helmet>
      <Navbar />

      <main className="pt-20 lg:pt-24">
        <article className="container mx-auto px-6 pt-12 pb-20">
          {/* Back link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-10"
            >
              <ArrowLeft className="w-4 h-4" /> All posts
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto"
          >
            {/* Meta */}
            <span className="text-xs font-semibold text-primary uppercase tracking-wide">
              {post.category}
            </span>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-6 tracking-tight leading-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-10 pb-10 border-b border-border">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                {post.author}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(post.publishedAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {post.readTime}
              </span>
            </div>

            {/* Featured Image */}
            {post.featuredImage && (
              <div className="mb-10 rounded-xl overflow-hidden">
                <img
                  src={post.featuredImage}
                  alt={post.title}
                  className="w-full"
                />
              </div>
            )}

            {/* Content */}
            <div className="prose-courial">
              {post.content.map((block, i) => renderBlock(block, i))}
            </div>

            {/* Soft CTA */}
            <div className="mt-16 p-8 rounded-xl bg-muted/60 border border-border text-center">
              <p className="text-lg font-semibold text-foreground mb-2">
                Curious what premium logistics looks like?
              </p>
              <p className="text-muted-foreground mb-5">
                Whether you're a business or an individual, explore how Courial is redefining the standard.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  to="/business"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-foreground text-background font-semibold text-sm hover:bg-foreground/90 transition-colors"
                >
                  For Businesses <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                </Link>
                <Link
                  to="/users"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border font-semibold text-sm hover:bg-muted transition-colors"
                >
                  For Users <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                </Link>
              </div>
            </div>

            {/* Navigation */}
            {(prevPost || nextPost) && (
              <div className="mt-12 pt-10 border-t border-border grid grid-cols-2 gap-6">
                <div>
                  {nextPost && (
                    <Link to={`/blog/${nextPost.slug}`} className="group">
                      <p className="text-xs text-muted-foreground mb-1">← Older</p>
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {nextPost.title}
                      </p>
                    </Link>
                  )}
                </div>
                <div className="text-right">
                  {prevPost && (
                    <Link to={`/blog/${prevPost.slug}`} className="group">
                      <p className="text-xs text-muted-foreground mb-1">Newer →</p>
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {prevPost.title}
                      </p>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPost;
