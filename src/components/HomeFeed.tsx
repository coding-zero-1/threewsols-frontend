import { useCallback, useEffect, useState } from "react";
import api from "../api/api";
import PostComposer from "../components/PostComposer";
import "../styles/HomeFeed.css";
import { logout } from "../api/api";
import { useNavigate } from "react-router-dom";

type RawPost = Record<string, any>;

type Post = {
  _id: string;
  content?: string | null;
  imageUrl?: string | null;
  likes: number;
  comments: string[] | number;
  author?: { name?: string } | string;
  createdAt?: string;
  raw?: RawPost;
};

function pickContent(post: RawPost): string | null {
  return post.content ?? post.text ?? post.body ?? null;
}

function pickImageUrl(post: RawPost): string | null {
  // Common places image urls might live
  const candidates = [
    "imageUrl",
    "image",
    "image_url",
    "img",
    "photo",
    "url",
    "secure_url",
    // Some backends return an object e.g. image: { url: "..." }
    // We'll handle that below.
  ];

  for (const key of candidates) {
    const v = post[key];
    if (!v) continue;
    if (typeof v === "string" && v.trim()) return v;
    if (typeof v === "object" && v !== null) {
      // try common nested keys
      if (typeof v.url === "string" && v.url.trim()) return v.url;
      if (typeof v.secure_url === "string" && v.secure_url.trim())
        return v.secure_url;
    }
  }

  // cloudinary sometimes stores data under 'images' array
  if (Array.isArray(post.images) && post.images.length > 0) {
    const first = post.images[0];
    if (typeof first === "string") return first;
    if (first?.secure_url) return first.secure_url;
    if (first?.url) return first.url;
  }

  return null;
}

export default function HomeFeed() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("post/all-post");
      // DEBUG: log raw response so you can inspect shape in console
      console.debug("GET /posts response:", res);

      // Normalize the array payload from multiple common shapes
      let rawList: any[] = [];
      if (Array.isArray(res.data)) rawList = res.data;
      else if (Array.isArray(res.data.posts)) rawList = res.data.posts;
      else if (Array.isArray(res.data.data)) rawList = res.data.data;
      else if (
        res.data &&
        typeof res.data === "object" &&
        Array.isArray(res.data.items)
      )
        rawList = res.data.items;
      else if (res.data && typeof res.data === "object" && res.data.post)
        rawList = [res.data.post];
      else {
        // fallback: if res.data is an object with keys that look like posts, try to coerce
        console.warn(
          "Unexpected /posts response shape. Res.data will be inspected in console."
        );
        rawList = Array.isArray(res.data) ? res.data : [];
      }

      // map/normalize posts
      const normalized = rawList
        .map((p: RawPost) => {
          const content = pickContent(p);
          const imageUrl = pickImageUrl(p);
          const likes =
            typeof p.likes === "number" ? p.likes : Number(p.likes) || 0;
          const comments = Array.isArray(p.comments)
            ? p.comments
            : p.comments ?? [];
          const id = p._id ?? p.id ?? p._doc?._id ?? String(Math.random());
          const author = p.author ?? p.user ?? p._doc?.author ?? p._doc?.user;
          const createdAt = p.createdAt ?? p.created_at ?? p._doc?.createdAt;
          return {
            _id: id,
            content,
            imageUrl,
            likes,
            comments,
            author,
            createdAt,
            raw: p,
          } as Post;
        })
        // newest first if possible: use createdAt fallback to preserve order
        .sort((a, b) => {
          const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return tb - ta;
        });

      setPosts(normalized);
    } catch (err) {
      console.error("fetchPosts error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  function handlePostCreated(newPost: any) {
    // try to normalize the newly created post just like fetch
    if (!newPost) {
      fetchPosts();
      return;
    }
    const content = pickContent(newPost);
    const imageUrl = pickImageUrl(newPost);
    const id = newPost._id ?? newPost.id ?? String(Math.random());
    const likes =
      typeof newPost.likes === "number"
        ? newPost.likes
        : Number(newPost.likes) || 0;
    const comments = Array.isArray(newPost.comments)
      ? newPost.comments
      : newPost.comments ?? [];
    const createdAt = newPost.createdAt ?? newPost.created_at;
    const author = newPost.author ?? newPost.user;
    const normalized: Post = {
      _id: id,
      content,
      imageUrl,
      likes,
      comments,
      createdAt,
      author,
      raw: newPost,
    };
    setPosts((p) => [normalized, ...p]);
  }

  return (
    <div className="homefeed-root">
      <div className="feed-header">
        <h2>Home Feed</h2>
        <button
          className="logout-btn"
          onClick={() => {
            logout();
            navigate("/signin");
          }}
        >
          Logout
        </button>
      </div>
      <PostComposer onCreated={handlePostCreated} />

      {loading && <div className="homefeed-loading">Loading posts…</div>}
      {error && <div className="homefeed-error">Error: {error}</div>}
      {!loading && posts.length === 0 && (
        <div className="homefeed-empty">No posts yet — be the first!</div>
      )}

      <div className="homefeed-list">
        {posts.map((post) => (
          <article key={post._id} className="post-item">
            <header className="post-header">
              <div className="post-author">
                <div className="post-author-avatar" aria-hidden>
                  {typeof post.author === "string"
                    ? "U"
                    : post.author?.name?.[0] ?? "U"}
                </div>
                <div className="post-author-meta">
                  <div className="post-author-name">
                    {typeof post.author === "string"
                      ? "User"
                      : post.author?.name ?? "User"}
                  </div>
                  {post.createdAt && (
                    <div className="post-time">
                      {new Date(post.createdAt).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            </header>

            {post.content ? (
              <p className="post-content">{post.content}</p>
            ) : null}

            {post.imageUrl ? (
              <div className="post-image-wrap">
                <img src={post.imageUrl} alt="post" className="post-image" />
              </div>
            ) : null}

            <footer className="post-footer">
              <div className="post-stats">
                <span className="stat">
                  <strong>{post.likes ?? 0}</strong>
                  <span className="stat-label"> Likes</span>
                </span>

                <span className="stat">
                  <strong>
                    {Array.isArray(post.comments)
                      ? post.comments.length
                      : Number(post.comments) || 0}
                  </strong>
                  <span className="stat-label"> Comments</span>
                </span>
              </div>

              {/* debug toggle: click to open raw payload in console */}
              <button
                type="button"
                onClick={() => console.debug("raw post payload:", post.raw)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#6b7280",
                }}
                aria-label="Inspect raw post object"
              >
                ⋯
              </button>
            </footer>
          </article>
        ))}
      </div>
    </div>
  );
}
