import { useState } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock, User, Loader2, Share2, Mail, Users, AtSign } from "lucide-react";
import { usePublishedPost } from "@/hooks/useBlogPosts";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ContentBlock {
  type: string;
  text?: string;
  items?: string[];
  src?: string;
  alt?: string;
  caption?: string;
}

const renderBlock = (block: ContentBlock, index: number) => {
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
        <div key={index} className="my-10 p-6 rounded-xl bg-primary/5 border border-primary/15">
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
            <li key={i} className="flex items-start gap-3 text-foreground/80 leading-relaxed">
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
          <img src={block.src} alt={block.alt || ""} className="w-full rounded-lg" loading="lazy" />
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
  const { data: post, isLoading } = usePublishedPost(slug || "");
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [emailing, setEmailing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sendMode, setSendMode] = useState<"all" | "specific">("all");
  const [specificEmails, setSpecificEmails] = useState("");

  const handleShare = async () => {
    if (!post) return;
    const postUrl = `${window.location.origin}/blog/${post.slug}`;
    const shareText = `Check out "${post.title}" on the Courial Blog! 📖`;

    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, text: shareText, url: postUrl });
      } catch { /* user cancelled */ }
    } else {
      try {
        await navigator.clipboard.writeText(postUrl);
        toast({ title: "Link copied!", description: "Share this article with your network." });
      } catch {
        toast({ title: "Failed to copy", variant: "destructive" });
      }
    }
  };

  const handleEmailClick = () => {
    setSendMode("all");
    setSpecificEmails("");
    setConfirmOpen(true);
  };

  const parsedSpecificEmails = specificEmails
    .split(/[,;\s]+/)
    .map((e) => e.trim().toLowerCase())
    .filter((e) => e.includes("@"));

  const handleEmailConfirm = async () => {
    if (!post) return;
    if (sendMode === "specific" && parsedSpecificEmails.length === 0) {
      toast({ title: "No valid emails", description: "Enter at least one valid email address.", variant: "destructive" });
      return;
    }
    setConfirmOpen(false);
    setEmailing(true);
    try {
      const body: Record<string, unknown> = { postId: post.id, dryRun: true };
      if (sendMode === "specific") {
        body.emails = parsedSpecificEmails;
      }
      const { data, error } = await supabase.functions.invoke("email-blog-post", { body });
      if (error) throw error;
      toast({ title: "Dry run complete", description: `Would send to ${data?.recipientCount || 0} recipient(s). No emails were actually sent.` });
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to invoke email function", variant: "destructive" });
    } finally {
      setEmailing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!post) return <Navigate to="/blog" replace />;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  const content = (Array.isArray(post.content) ? post.content : []) as ContentBlock[];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{post.title} — Courial Blog</title>
        <meta name="description" content={post.meta_description || ""} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.meta_description || ""} />
        <meta property="og:type" content="article" />
        {post.published_at && <meta name="article:published_time" content={post.published_at} />}
      </Helmet>
      <Navbar />

      <main className="pt-20 lg:pt-24">
        <article className="container mx-auto px-6 pt-12 pb-20">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
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
            {/* Category + Action Buttons */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                {post.category}
              </span>
              <div className="flex items-center gap-2 ml-auto">
                <Button variant="ghost" size="sm" onClick={handleShare} className="gap-1.5">
                  <Share2 className="w-3.5 h-3.5" /> Share
                </Button>
                {isAdmin && (
                  <Button variant="ghost" size="sm" onClick={handleEmailClick} disabled={emailing} className="gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> {emailing ? "Sending..." : "Email to Users"}
                  </Button>
                )}
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-3 mb-6 tracking-tight leading-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-10 pb-10 border-b border-border">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                {post.author}
              </span>
              {post.published_at && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(post.published_at)}
                </span>
              )}
              {post.read_time && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {post.read_time}
                </span>
              )}
            </div>

            {post.featured_image_url && (
              <div className="mb-10 rounded-xl overflow-hidden">
                <img src={post.featured_image_url} alt={post.title} className="w-full" />
              </div>
            )}

            <div className="prose-courial">
              {content.map((block, i) => {
                const midpoint = Math.floor(content.length / 2);
                return (
                  <div key={i}>
                    {renderBlock(block, i)}
                    {i === midpoint && (post as any).secondary_image_url && (
                      <figure className="my-10 rounded-xl overflow-hidden">
                        <img
                          src={(post as any).secondary_image_url}
                          alt={`${post.title} - continued`}
                          className="w-full rounded-xl"
                          loading="lazy"
                        />
                      </figure>
                    )}
                  </div>
                );
              })}
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
          </motion.div>
        </article>
      </main>

      <Footer />

      {/* Email Confirmation Dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              Email Blog Post
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <span className="block text-sm">
                  Send <strong>"{post?.title}"</strong> via email.
                </span>

                {/* Mode toggle */}
                <div className="flex gap-2 justify-center">
                  <Button
                    type="button"
                    size="sm"
                    variant={sendMode === "all" ? "default" : "outline"}
                    className="flex-1 gap-1.5"
                    onClick={() => setSendMode("all")}
                  >
                    <Users className="w-3.5 h-3.5" /> All Users
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={sendMode === "specific" ? "default" : "outline"}
                    className="flex-1 gap-1.5"
                    onClick={() => setSendMode("specific")}
                  >
                    <AtSign className="w-3.5 h-3.5" /> Specific Emails
                  </Button>
                </div>

                {sendMode === "specific" && (
                  <div className="space-y-2">
                    <Input
                      placeholder="Enter emails separated by commas..."
                      value={specificEmails}
                      onChange={(e) => setSpecificEmails(e.target.value)}
                      className="bg-background"
                    />
                    <span className="block text-xs text-muted-foreground">
                      {parsedSpecificEmails.length > 0
                        ? `📬 ${parsedSpecificEmails.length} recipient(s)`
                        : "Enter one or more email addresses"}
                    </span>
                  </div>
                )}

                <span className="block text-muted-foreground text-xs font-medium text-primary">
                  🧪 DRY RUN — No emails will actually be sent.
                </span>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEmailConfirm}
              disabled={sendMode === "specific" && parsedSpecificEmails.length === 0}
            >
              {sendMode === "all" ? "Test: Send to All" : `Test: Send to ${parsedSpecificEmails.length}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BlogPost;
