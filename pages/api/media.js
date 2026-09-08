// Fighter media uploads -> Supabase Storage ("fighter-media" bucket),
// tracked in public.media. Uploads are placed in the owner's folder
// (<user_id>/...) matching the storage RLS layout.
import { ok, fail, asyncHandler } from '../../lib/api';
import { rateLimit } from '../../lib/rate-limit';
import { supabaseAdmin } from '../../lib/supabase/server';
import { getUserFromRequest } from '../../lib/auth';

export const config = { api: { bodyParser: { sizeLimit: '3mb' } } };

const MIME_EXT = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

const DATA_URL_RE = /^data:(image\/(?:jpeg|png|webp|gif));base64,([A-Za-z0-9+/=]+)$/;

function publicStorageUrl(bucket, path) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, '');
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}

const handler = asyncHandler(async (req, res) => {
  const supabase = supabaseAdmin();
  if (!supabase) return fail(res, 503, 'Backend not configured');

  if (req.method === 'POST') {
    const limited = rateLimit(req, { limit: 20, windowMs: 10 * 60_000 });
    if (limited) return fail(res, 429, 'Too many uploads', { retryAfter: limited.retryAfter });

    const user = await getUserFromRequest(req);
    if (!user) return fail(res, 401, 'Please sign in.');

    const dataUrl = (req.body && req.body.dataUrl || '').trim();
    const match = DATA_URL_RE.exec(dataUrl);
    if (!match) return fail(res, 400, 'Upload must be a JPEG, PNG, WEBP or GIF data URL');

    const mime = match[1];
    const bytes = Buffer.from(match[2], 'base64');
    if (bytes.length === 0) return fail(res, 400, 'Empty file');
    if (bytes.length > MAX_BYTES) return fail(res, 413, 'Image must be under 2 MB');

    const path = `${user.id}/avatar_${Date.now()}.${MIME_EXT[mime]}`;
    const { error: upErr } = await supabase.storage.from('fighter-media').upload(path, bytes, {
      contentType: mime,
      cacheControl: '31536000',
      upsert: true,
    });
    if (upErr) return fail(res, 400, upErr.message);

    const { error: rowErr } = await supabase.from('media').insert({
      user_id: user.id,
      bucket: 'fighter-media',
      path,
      mimetype: mime,
      size_bytes: bytes.length,
    });
    if (rowErr) {
      // Metadata tracking failure should not lose the upload; still return the URL.
      if (process.env.NODE_ENV !== 'production') console.error('[media.upload] media row', rowErr);
    }

    return ok(res, { url: publicStorageUrl('fighter-media', path) });
  }

  if (req.method === 'DELETE') {
    const user = await getUserFromRequest(req);
    if (!user) return fail(res, 401, 'Please sign in.');

    const id = (req.query.id || '').toString();
    if (!id) return fail(res, 400, 'Missing media id');

    const { data: row, error: getErr } = await supabase
      .from('media')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (getErr || !row) return fail(res, 404, 'Media not found');
    if (row.user_id !== user.id) return fail(res, 403, 'Not your media');

    await supabase.storage.from(row.bucket).remove([row.path]);
    await supabase.from('media').delete().eq('id', id);

    return ok(res, { deleted: true });
  }

  return fail(res, 405, 'Method not allowed');
});

export default handler;