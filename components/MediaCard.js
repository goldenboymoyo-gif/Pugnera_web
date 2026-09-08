import Link from 'next/link';

const titleSlug = (title) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s/]+/g, '-')
    .replace(/-+/g, '-');

export default function MediaCard({ media, overlayPosition = 'center', onClick, href, badgeLabel = null }) {
  const link = href || (media.slug ? `/fights/${media.slug}` : `/fights/${titleSlug(media.title)}`);

  const content = (
    <>
      {badgeLabel ? (
        <span className="badge badge--result">{badgeLabel}</span>
      ) : media.status === 'live' ? (
        <span className="badge badge--live">
          <span className="badge__dot" />
          LIVE
        </span>
      ) : media.status === 'upcoming' ? (
        <span className="badge">Upcoming</span>
      ) : media.status === 'replay' ? (
        <span className="badge">Replay</span>
      ) : null}
      <span className="media-card__play" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
      <div
        className={`media-card__overlay ${overlayPosition === 'bottom' ? 'is-bottom' : ''}`}
      >
        {media.tag ? <span className="media-card__tag">{media.tag}</span> : null}
        <h3 className="media-card__title">{media.title}</h3>
        <p className="media-card__meta">
          {media.date}
          {media.venue ? ` · ${media.venue}` : ''}
          {media.price ? ` · ${media.price}` : ''}
        </p>
      </div>
    </>
  );

  const inner = <div className="media-card__media" style={{ backgroundImage: `url(${media.image})` }}>{content}</div>;

  return (
    <article className={`media-card ${media.status ? `media-card--${media.status}` : ''}`}>
      {onClick ? (
        <button className="media-card__hit" onClick={onClick} aria-label={`Watch ${media.title}`}>
          {inner}
        </button>
      ) : (
        <Link href={link} className="media-card__hit" aria-label={`Open ${media.title}`}>
          {inner}
        </Link>
      )}
    </article>
  );
}