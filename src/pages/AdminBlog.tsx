import { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useAllPosts, useUpsertPost, useDeletePost, DbBlogPost } from "@/hooks/useBlogPosts";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";
import {
  Sparkles, Trash2, Edit, Eye, EyeOff, Plus, Image, LogIn, Loader2, ArrowLeft, Wand2,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

const AdminBlog = () => {
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const { data: posts, isLoading } = useAllPosts();
  const upsertPost = useUpsertPost();
  const deletePost = useDeletePost();

  const [editingPost, setEditingPost] = useState<Partial<DbBlogPost> | null>(null);
  const [showTopics, setShowTopics] = useState(false);
  const [topics, setTopics] = useState<any[]>([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [generatingImage, setGeneratingImage] = useState<string | null>(null);
  const [generatingContent, setGeneratingContent] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleSignIn = async () => {
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) toast.error(error.message);
  };

  const handleSuggestTopics = async () => {
    setLoadingTopics(true);
    setShowTopics(true);
    try {
      const existingTopics = posts?.map((p) => p.title).join(", ") || "";
      const { data, error } = await supabase.functions.invoke("suggest-blog-topics", {
        body: { existingTopics },
      });
      if (error) throw error;
      setTopics(data.topics || []);
    } catch (e: any) {
      toast.error(e.message || "Failed to get suggestions");
    } finally {
      setLoadingTopics(false);
    }
  };

  const handleGenerateImage = async (post: DbBlogPost) => {
    setGeneratingImage(post.id);
    try {
      const prompt = post.featured_image_prompt || `Professional hero image for a blog post titled "${post.title}". Premium logistics theme, cinematic lighting, warm tones.`;
      const { data, error } = await supabase.functions.invoke("generate-blog-image", {
        body: { prompt, postId: post.id },
      });
      if (error) throw error;
      toast.success("Image generated!");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate image");
    } finally {
      setGeneratingImage(null);
    }
  };

  const handleGenerateContent = async () => {
    if (!editingPost?.title) {
      toast.error("Add a title first");
      return;
    }
    setGeneratingContent(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-blog-content", {
        body: {
          title: editingPost.title,
          seoKeyword: editingPost.seo_keyword || "",
          excerpt: editingPost.excerpt || "",
        },
      });
      if (error) throw error;
      setEditingPost((prev) => prev ? { ...prev, content: data.content } : prev);
      toast.success("Content generated! Review and edit below.");
    } catch (e: any) {
      toast.error(e.message || "Failed to generate content");
    } finally {
      setGeneratingContent(false);
    }
  };

  const handleTopicToPost = (topic: any) => {
    const slug = topic.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    setEditingPost({
      title: topic.title,
      slug,
      seo_keyword: topic.seoKeyword,
      category: topic.category,
      excerpt: topic.excerpt,
      featured_image_prompt: topic.featuredImagePrompt,
      author: "Courial Team",
      read_time: "7 min read",
      content: [],
      published: false,
    });
    setShowTopics(false);
  };

  const handleSave = async () => {
    if (!editingPost?.title || !editingPost?.slug) {
      toast.error("Title and slug are required");
      return;
    }
    await upsertPost.mutateAsync(editingPost as any);
    setEditingPost(null);
  };

  // Auth states
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 lg:pt-24">
          <div className="container mx-auto px-6 py-24 text-center">
            <h1 className="text-3xl font-bold mb-4">Admin Access Required</h1>
            <p className="text-muted-foreground mb-8">Sign in with Google to access the blog admin.</p>
            <Button onClick={handleSignIn} variant="hero" size="lg">
              <LogIn className="w-4 h-4 mr-2" /> Sign in with Google
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 lg:pt-24">
          <div className="container mx-auto px-6 py-24 text-center">
            <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
            <p className="text-muted-foreground mb-4">
              Your account ({user.email}) doesn't have admin privileges.
            </p>
            <Button onClick={signOut} variant="outline">Sign Out</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Editor view
  if (editingPost) {
    return (
      <div className="min-h-screen bg-background">
        <Helmet><title>Edit Post — Admin</title></Helmet>
        <Navbar />
        <main className="pt-20 lg:pt-24">
          <div className="container mx-auto px-6 py-12 max-w-3xl">
            <button
              onClick={() => setEditingPost(null)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
            >
              <ArrowLeft className="w-4 h-4" /> Back to posts
            </button>

            <h1 className="text-2xl font-bold mb-8">
              {editingPost.id ? "Edit Post" : "New Post"}
            </h1>

            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium mb-1 block">Title</label>
                <Input
                  value={editingPost.title || ""}
                  onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                  placeholder="Post title"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Slug</label>
                <Input
                  value={editingPost.slug || ""}
                  onChange={(e) => setEditingPost({ ...editingPost, slug: e.target.value })}
                  placeholder="url-friendly-slug"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">SEO Keyword</label>
                  <Input
                    value={editingPost.seo_keyword || ""}
                    onChange={(e) => setEditingPost({ ...editingPost, seo_keyword: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Category</label>
                  <Input
                    value={editingPost.category || ""}
                    onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Meta Description</label>
                <Input
                  value={editingPost.meta_description || ""}
                  onChange={(e) => setEditingPost({ ...editingPost, meta_description: e.target.value })}
                  placeholder="Max 155 characters"
                  maxLength={155}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Excerpt</label>
                <Textarea
                  value={editingPost.excerpt || ""}
                  onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                  placeholder="Short hook for the blog listing"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Author</label>
                  <Input
                    value={editingPost.author || ""}
                    onChange={(e) => setEditingPost({ ...editingPost, author: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Read Time</label>
                  <Input
                    value={editingPost.read_time || ""}
                    onChange={(e) => setEditingPost({ ...editingPost, read_time: e.target.value })}
                    placeholder="7 min read"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Featured Image Prompt</label>
                <Textarea
                  value={editingPost.featured_image_prompt || ""}
                  onChange={(e) => setEditingPost({ ...editingPost, featured_image_prompt: e.target.value })}
                  placeholder="AI image generation prompt"
                  rows={2}
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium">Content (JSON)</label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateContent}
                    disabled={generatingContent}
                  >
                    {generatingContent ? (
                      <Loader2 className="w-3 h-3 animate-spin mr-1" />
                    ) : (
                      <Wand2 className="w-3 h-3 mr-1" />
                    )}
                    AI Write
                  </Button>
                </div>
                <Textarea
                  value={
                    typeof editingPost.content === "string"
                      ? editingPost.content
                      : JSON.stringify(editingPost.content || [], null, 2)
                  }
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setEditingPost({ ...editingPost, content: parsed });
                    } catch {
                      // Keep raw string while editing
                      setEditingPost({ ...editingPost, content: e.target.value as any });
                    }
                  }}
                  rows={16}
                  className="font-mono text-xs"
                />
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-border">
                <Button
                  onClick={handleSave}
                  variant="hero"
                  disabled={upsertPost.isPending}
                >
                  {upsertPost.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                  Save Post
                </Button>
                <Button variant="outline" onClick={() => setEditingPost(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Posts list view
  return (
    <div className="min-h-screen bg-background">
      <Helmet><title>Blog Admin — Courial</title></Helmet>
      <Navbar />
      <main className="pt-20 lg:pt-24">
        <div className="container mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Blog Admin</h1>
              <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/">
                <Button variant="ghost" size="sm" className="border border-foreground/25">Live</Button>
              </Link>
              <Button variant="outline" size="sm" onClick={signOut}>Sign Out</Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 mb-8">
            <Button onClick={() => setEditingPost({ content: [], author: "Courial Team", published: false })} variant="hero" size="sm">
              <Plus className="w-4 h-4 mr-1" /> New Post
            </Button>
            <Button onClick={handleSuggestTopics} variant="outline" size="sm" disabled={loadingTopics}>
              {loadingTopics ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Sparkles className="w-4 h-4 mr-1" />}
              AI Suggest Topics
            </Button>
          </div>

          {/* Posts table */}
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mx-auto" />
            </div>
          ) : (
            <div className="border border-border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Title</th>
                    <th className="px-4 py-3 font-medium hidden md:table-cell">Category</th>
                    <th className="px-4 py-3 font-medium hidden md:table-cell">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {posts?.map((post) => (
                    <tr key={post.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="font-medium">{post.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">/{post.slug}</div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                        {post.category}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                          post.published
                            ? "bg-green-100 text-green-800"
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {post.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          {post.published ? "Live" : "Draft"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => upsertPost.mutate({ id: post.id, published: !post.published, published_at: post.published ? post.published_at : new Date().toISOString().split("T")[0] })}
                            title={post.published ? "Unpublish" : "Publish"}
                          >
                            {post.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleGenerateImage(post)}
                            disabled={generatingImage === post.id}
                            title="Generate featured image"
                          >
                            {generatingImage === post.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Image className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setEditingPost(post)}
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteConfirm(post.id)}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {posts?.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">
                        No posts yet. Create one or let AI suggest topics!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Topic suggestions dialog */}
      <Dialog open={showTopics} onOpenChange={setShowTopics}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>AI Topic Suggestions</DialogTitle>
            <DialogDescription>Click a topic to start a new post with it.</DialogDescription>
          </DialogHeader>
          {loadingTopics ? (
            <div className="py-8 text-center">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Generating ideas...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {topics.map((topic, i) => (
                <button
                  key={i}
                  onClick={() => handleTopicToPost(topic)}
                  className="w-full text-left p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm">{topic.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{topic.excerpt}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          {topic.category}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Keyword: {topic.seoKeyword}
                        </span>
                      </div>
                    </div>
                    <Plus className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Post?</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteConfirm) {
                  deletePost.mutate(deleteConfirm);
                  setDeleteConfirm(null);
                }
              }}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBlog;
