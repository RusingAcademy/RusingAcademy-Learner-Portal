import { DiscussionEmbed } from 'disqus-react';

/**
 * DisqusComments - Reusable Disqus comments component
 * 
 * Integrates Disqus discussion threads for any content type.
 * Used for Learning Capsules, blog posts, and other interactive content.
 */

interface DisqusCommentsProps {
  /** Unique identifier for the discussion thread */
  identifier: string;
  /** Title displayed in Disqus */
  title: string;
  /** Full URL of the page (optional, defaults to current URL) */
  url?: string;
  /** Language code (default: 'en') */
  language?: string;
  /** Additional CSS classes for the container */
  className?: string;
}

// Disqus shortname for RusingAcademy Learning Ecosystem
const DISQUS_SHORTNAME = 'rusingacademy-learning-ecosystem';

export default function DisqusComments({
  identifier,
  title,
  url,
  language = 'en',
  className = '',
}: DisqusCommentsProps) {
  // Use current URL if not provided
  const pageUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  const disqusConfig = {
    url: pageUrl,
    identifier: identifier,
    title: title,
    language: language,
  };

  return (
    <div className={`disqus-comments-container ${className}`}>
      <DiscussionEmbed
        shortname={DISQUS_SHORTNAME}
        config={disqusConfig}
      />
    </div>
  );
}

/**
 * DisqusCommentCount - Display comment count for a thread
 */
export function DisqusCommentCount({
  identifier,
  title,
  url,
  children = 'Comments',
}: DisqusCommentsProps & { children?: React.ReactNode }) {
  // Note: CommentCount requires the same config structure
  // This is a placeholder for future implementation if needed
  return (
    <span className="disqus-comment-count">
      {children}
    </span>
  );
}
