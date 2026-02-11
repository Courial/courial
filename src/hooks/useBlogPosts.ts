import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DbBlogPost {
  id: string;
  slug: string;
  title: string;
  meta_description: string | null;
  seo_keyword: string | null;
  published_at: string | null;
  published: boolean;
  author: string;
  read_time: string | null;
  category: string | null;
  excerpt: string | null;
  featured_image_prompt: string | null;
  featured_image_url: string | null;
  secondary_image_url: string | null;
  content: any[];
  created_at: string;
  updated_at: string;
}

export function usePublishedPosts() {
  return useQuery({
    queryKey: ["blog-posts", "published"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("published", true)
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data as DbBlogPost[];
    },
  });
}

export function usePublishedPost(slug: string) {
  return useQuery({
    queryKey: ["blog-posts", "published", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();
      if (error) throw error;
      return data as DbBlogPost | null;
    },
    enabled: !!slug,
  });
}

export function useAllPosts() {
  return useQuery({
    queryKey: ["blog-posts", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as DbBlogPost[];
    },
  });
}

export function useUpsertPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (post: Partial<DbBlogPost> & { id?: string }) => {
      const { id, ...rest } = post;
      if (id) {
        const { data, error } = await supabase
          .from("blog_posts")
          .update(rest as any)
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("blog_posts")
          .insert(rest as any)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blog-posts"] });
      toast.success("Post saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blog-posts"] });
      toast.success("Post deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
