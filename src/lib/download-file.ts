import { supabase } from '@/integrations/supabase/client';

export async function downloadFile(
  storagePathOrUrl: string,
  fileName: string,
  bucket: string = 'case-files',
  options: { signedUrlExpiresIn?: number } = {}
): Promise<void> {
  const expiresIn = options.signedUrlExpiresIn ?? 120;
  let url = storagePathOrUrl;

  if (!/^https?:\/\//i.test(storagePathOrUrl)) {
    // Try signed URL first (works for private buckets).
    const signed = await supabase.storage.from(bucket).createSignedUrl(storagePathOrUrl, expiresIn);
    if (signed.data?.signedUrl) {
      url = signed.data.signedUrl;
    } else {
      // Fallback for public buckets.
      const pub = supabase.storage.from(bucket).getPublicUrl(storagePathOrUrl);
      if (!pub.data?.publicUrl) {
        throw new Error(signed.error?.message || 'Unable to resolve file URL');
      }
      url = pub.data.publicUrl;
    }
  }

  try {
    const res = await fetch(url, { credentials: 'omit' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName || 'download';
    a.rel = 'noopener';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1500);
  } catch (err) {
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || 'download';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    throw err instanceof Error ? err : new Error('Download failed');
  }
}
