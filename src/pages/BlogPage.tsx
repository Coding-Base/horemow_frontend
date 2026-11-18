import React, { useMemo, useState } from "react";
import {
  MessageCircle,
  Search,
  Clock,
  User,
  Calendar,
  ArrowRight,
  X,
  Send,
  CornerDownRight,
  Tag,
  Check,
} from "lucide-react";
import PageIntro from "../components/common/PageIntro";
import { useBlogContent, addBlogComment } from "../lib/contentStore";
import type { BlogPost, BlogComment } from "../data/content";
import { useDebounce } from "../lib/useDebounce";

const CATEGORIES = [
  "All Topics",
  "Faith & practice",
  "Christian Holiness",
  "Church & leadership",
  "Family",
  "End-Time & Heaven",
  "Missions & Evangelism",
  "Biblical Doctrine",
];

export default function BlogPage() {
  const blogPosts = useBlogContent();
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 300);
  const [selectedTopic, setSelectedTopic] = useState("All Topics");

  // Reader Modal State
  const [activeArticle, setActiveArticle] = useState<BlogPost | null>(null);

  // New Comment Form State
  const [commentName, setCommentName] = useState("");
  const [commentEmail, setCommentEmail] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentSuccess, setCommentSuccess] = useState(false);

  // Replying state (stores parentId)
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyName, setReplyName] = useState("");
  const [replyEmail, setReplyEmail] = useState("");
  const [replyText, setReplyText] = useState("");

  const filtered = useMemo(() => {
    return blogPosts.filter((post) => {
      if (post.status === "Draft") return false;

      const q = debouncedSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        (post.body && post.body.toLowerCase().includes(q)) ||
        (post.author && post.author.toLowerCase().includes(q)) ||
        (post.metaKeywords && post.metaKeywords.toLowerCase().includes(q));

      const matchesTopic =
        selectedTopic === "All Topics" || post.category === selectedTopic;

      return matchesSearch && matchesTopic;
    });
  }, [debouncedSearch, selectedTopic, blogPosts]);

  const handlePostTopComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeArticle || !commentName.trim() || !commentText.trim()) return;

    const newComment: BlogComment = {
      id: `comm-${Date.now()}`,
      authorName: commentName.trim(),
      authorEmail: commentEmail.trim() || "member@horemow.org",
      content: commentText.trim(),
      createdAt: new Date().toISOString(),
      parentId: null,
      replies: [],
    };

    addBlogComment(activeArticle.id, newComment);

    // Update activeArticle local comments for immediate UI responsiveness
    setActiveArticle((prev) =>
      prev ? { ...prev, comments: [...(prev.comments || []), newComment] } : null
    );

    setCommentName("");
    setCommentEmail("");
    setCommentText("");
    setCommentSuccess(true);
    setTimeout(() => setCommentSuccess(false), 4000);
  };

  const handlePostReply = (parentId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!activeArticle || !replyName.trim() || !replyText.trim()) return;

    const newReply: BlogComment = {
      id: `reply-${Date.now()}`,
      authorName: replyName.trim(),
      authorEmail: replyEmail.trim() || "member@horemow.org",
      content: replyText.trim(),
      createdAt: new Date().toISOString(),
      parentId: parentId,
      replies: [],
    };

    addBlogComment(activeArticle.id, newReply);

    // Update activeArticle local comments tree
    setActiveArticle((prev) => {
      if (!prev) return null;
      const addNested = (list: BlogComment[]): BlogComment[] => {
        return list.map((c) => {
          if (c.id === parentId) {
            return { ...c, replies: [...(c.replies || []), newReply] };
          }
          if (c.replies && c.replies.length > 0) {
            return { ...c, replies: addNested(c.replies) };
          }
          return c;
        });
      };
      return { ...prev, comments: addNested(prev.comments || []) };
    });

    setReplyingToId(null);
    setReplyName("");
    setReplyEmail("");
    setReplyText("");
  };

  return (
    <>
      <PageIntro
        description="Scriptural reflections, doctrinal studies, and spiritual exhortations from Pastor Paul Rika and HOREMOW ministers for global holiness."
        eyebrow="Stories & Reflections"
        title="The HOREMOW Journal."
      />

      <section className="py-12 bg-cream/30 min-h-screen">
        <div className="mx-auto w-[min(1240px,calc(100%-2.5rem))]">
          {/* Controls: Search and Categories */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-ink placeholder:text-slate-400 shadow-sm focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search articles by title, topic, scripture, or author..."
                  type="text"
                  value={searchInput}
                />
              </div>

              <span className="text-xs font-semibold text-slate-500">
                Showing <strong className="text-ink">{filtered.length}</strong> publication{filtered.length === 1 ? "" : "s"}
              </span>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {CATEGORIES.map((topic) => (
                <button
                  className={`rounded-full px-4 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                    selectedTopic === topic
                      ? "bg-brand-blue text-white shadow-sm"
                      : "bg-white text-slate-600 border border-slate-200 hover:border-brand-blue hover:text-brand-blue"
                  }`}
                  key={topic}
                  onClick={() => setSelectedTopic(topic)}
                  type="button"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {/* Articles Grid */}
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((post) => (
              <article
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                key={post.id || post.title}
                onClick={() => setActiveArticle(post)}
              >
                <div>
                  {/* Thumbnail / Header */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                    <img
                      alt={post.title}
                      className="size-full object-cover transition duration-500 group-hover:scale-105"
                      src={
                        post.thumbnailUrl ||
                        "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951666/FB_IMG_1794950361014_ikxpij.jpg"
                      }
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-brand-blue shadow-sm">
                      {post.category}
                    </span>
                  </div>

                  <div className="p-5 space-y-2.5">
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> {post.date}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {post.readTime || "5 min read"}
                      </span>
                    </div>

                    <h3 className="font-serif text-lg font-bold leading-snug text-ink group-hover:text-brand-blue transition line-clamp-2">
                      {post.title}
                    </h3>

                    <p className="text-xs leading-relaxed text-slate-600 line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-100 px-5 py-3.5 flex items-center justify-between text-xs bg-slate-50/50">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700">
                    <User size={13} className="text-brand-blue" />
                    <span className="truncate max-w-[140px]">{post.author || "Pastor Paul Rika"}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[11px] text-slate-500">
                      <MessageCircle size={13} /> {post.comments?.length || 0}
                    </span>
                    <span className="font-bold text-brand-blue flex items-center gap-1 group-hover:translate-x-1 transition">
                      Read <ArrowRight size={13} />
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="mt-12 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <Search className="mx-auto text-slate-300" size={36} />
              <h3 className="mt-3 font-serif text-lg font-bold text-ink">No articles found</h3>
              <p className="mt-1 text-xs text-slate-500">
                No articles match your search or topic filter. Please try a different term.
              </p>
              <button
                className="mt-4 rounded-lg bg-brand-blue px-4 py-2 text-xs font-bold text-white hover:bg-brand-blue/90"
                onClick={() => {
                  setSearchInput("");
                  setSelectedTopic("All Topics");
                }}
                type="button"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* FULL ARTICLE READER & COMMENTING MODAL */}
      {activeArticle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 sm:p-6 backdrop-blur-sm overflow-y-auto"
          onClick={() => setActiveArticle(null)}
        >
          <div
            className="relative my-8 w-full max-w-3xl rounded-3xl bg-white shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Image */}
            <div className="relative aspect-[21/9] w-full bg-slate-900 overflow-hidden">
              <img
                alt={activeArticle.title}
                className="size-full object-cover opacity-85"
                src={
                  activeArticle.thumbnailUrl ||
                  "https://res.cloudinary.com/dae0htmcz/image/upload/v1794951666/FB_IMG_1794950361014_ikxpij.jpg"
                }
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              <button
                aria-label="Close reader"
                className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-black/50 text-white hover:bg-black/80 transition"
                onClick={() => setActiveArticle(null)}
                type="button"
              >
                <X size={18} />
              </button>

              <div className="absolute bottom-5 left-6 right-6 text-white space-y-1.5">
                <span className="rounded-full bg-brand-blue px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
                  {activeArticle.category}
                </span>
                <h1 className="font-serif text-xl sm:text-2xl lg:text-3xl font-extrabold leading-tight text-white drop-shadow-sm">
                  {activeArticle.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 font-medium pt-1">
                  <span className="flex items-center gap-1.5 text-white font-bold">
                    <User size={13} className="text-gold" /> {activeArticle.author || "Pastor Paul Rika"}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Calendar size={13} /> {activeArticle.date}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock size={13} /> {activeArticle.readTime || "5 min read"}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Body & Content */}
            <div className="max-h-[65vh] overflow-y-auto p-6 sm:p-8 space-y-8 scrollbar-thin">
              {/* Excerpt Callout */}
              <div className="rounded-xl border-l-4 border-brand-blue bg-soft-blue/40 p-4 text-sm font-medium italic text-slate-800 leading-relaxed">
                "{activeArticle.excerpt}"
              </div>

              {/* Main Article Text */}
              <div className="prose prose-slate max-w-none text-sm sm:text-base leading-relaxed text-slate-700 whitespace-pre-line space-y-4">
                {activeArticle.body || activeArticle.excerpt}
              </div>

              {/* Keywords / Meta Tags */}
              {activeArticle.metaKeywords && (
                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <Tag size={12} /> Tags:
                  </span>
                  {activeArticle.metaKeywords.split(",").map((kw, i) => (
                    <span
                      className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                      key={i}
                    >
                      #{kw.trim()}
                    </span>
                  ))}
                </div>
              )}

              {/* ---------------- THREADED COMMENTS SECTION ---------------- */}
              <div className="pt-8 border-t border-slate-200 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg font-bold text-ink flex items-center gap-2">
                    <MessageCircle size={18} className="text-brand-blue" />
                    Discussion & Reflections ({activeArticle.comments?.length || 0})
                  </h3>
                  <span className="text-xs text-slate-400">Moderated global forum</span>
                </div>

                {commentSuccess && (
                  <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800 flex items-center gap-2">
                    <Check size={16} /> Thank you! Your reflection has been posted to this article.
                  </div>
                )}

                {/* Top-Level Add Comment Form */}
                <form
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-3"
                  onSubmit={handlePostTopComment}
                >
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Leave a Comment or Spiritual Reflection
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-ink focus:border-brand-blue focus:outline-none"
                      onChange={(e) => setCommentName(e.target.value)}
                      placeholder="Your Full Name *"
                      required
                      type="text"
                      value={commentName}
                    />
                    <input
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-ink focus:border-brand-blue focus:outline-none"
                      onChange={(e) => setCommentEmail(e.target.value)}
                      placeholder="Your Email (kept confidential)"
                      type="email"
                      value={commentEmail}
                    />
                  </div>
                  <textarea
                    className="w-full rounded-lg border border-slate-300 bg-white p-3 text-xs font-medium text-ink focus:border-brand-blue focus:outline-none"
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Share how this teaching spoke to your walk of holiness..."
                    required
                    rows={3}
                    value={commentText}
                  />
                  <div className="flex justify-end">
                    <button
                      className="flex items-center gap-1.5 rounded-lg bg-brand-blue px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-blue/90 transition"
                      type="submit"
                    >
                      <Send size={13} /> Post Reflection
                    </button>
                  </div>
                </form>

                {/* Comments List & Nested Replies */}
                {(!activeArticle.comments || activeArticle.comments.length === 0) ? (
                  <p className="text-center py-6 text-xs text-slate-400 italic">
                    Be the first to share a reflection or testimony on this article.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {activeArticle.comments.map((comment) => (
                      <div
                        className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 space-y-3 shadow-sm"
                        key={comment.id}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="grid size-8 place-items-center rounded-full bg-soft-blue text-brand-blue font-bold text-xs">
                              {comment.authorName ? comment.authorName[0] : "B"}
                            </div>
                            <div>
                              <div className="font-bold text-xs text-ink">{comment.authorName}</div>
                              <div className="text-[10px] text-slate-400">
                                {new Date(comment.createdAt).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </div>
                            </div>
                          </div>

                          <button
                            className="flex items-center gap-1 text-xs font-bold text-brand-blue hover:underline"
                            onClick={() => setReplyingToId(replyingToId === comment.id ? null : comment.id)}
                            type="button"
                          >
                            <CornerDownRight size={13} /> Reply
                          </button>
                        </div>

                        <p className="text-xs text-slate-700 leading-relaxed">{comment.content}</p>

                        {/* Inline Reply Form for this comment */}
                        {replyingToId === comment.id && (
                          <form
                            className="mt-3 rounded-xl border border-brand-blue/30 bg-soft-blue/20 p-3 space-y-2 ml-4"
                            onSubmit={(e) => handlePostReply(comment.id, e)}
                          >
                            <div className="text-[11px] font-bold text-brand-blue">
                              Replying to {comment.authorName}:
                            </div>
                            <div className="grid gap-2 sm:grid-cols-2">
                              <input
                                className="rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs focus:border-brand-blue focus:outline-none"
                                onChange={(e) => setReplyName(e.target.value)}
                                placeholder="Your Name *"
                                required
                                type="text"
                                value={replyName}
                              />
                              <input
                                className="rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs focus:border-brand-blue focus:outline-none"
                                onChange={(e) => setReplyEmail(e.target.value)}
                                placeholder="Your Email"
                                type="email"
                                value={replyEmail}
                              />
                            </div>
                            <textarea
                              className="w-full rounded border border-slate-300 bg-white p-2 text-xs focus:border-brand-blue focus:outline-none"
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Write your response..."
                              required
                              rows={2}
                              value={replyText}
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                className="rounded px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200"
                                onClick={() => setReplyingToId(null)}
                                type="button"
                              >
                                Cancel
                              </button>
                              <button
                                className="rounded bg-brand-blue px-3 py-1 text-xs font-bold text-white hover:bg-brand-blue/90"
                                type="submit"
                              >
                                Submit Reply
                              </button>
                            </div>
                          </form>
                        )}

                        {/* Nested Replies Rendering */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-3 space-y-2 border-l-2 border-brand-blue/20 pl-4">
                            {comment.replies.map((reply) => (
                              <div
                                className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs space-y-1.5"
                                key={reply.id}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-ink">{reply.authorName}</span>
                                  <span className="text-[10px] text-slate-400">
                                    {new Date(reply.createdAt).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </span>
                                </div>
                                <p className="text-slate-600 leading-normal">{reply.content}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                HOREMOW Global Literature & Journal
              </span>
              <button
                className="rounded-lg bg-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-300 transition"
                onClick={() => setActiveArticle(null)}
                type="button"
              >
                Close Reader
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
