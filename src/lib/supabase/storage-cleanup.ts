import { getAdminClient } from "@/lib/supabase/admin";

async function listAllFiles(bucket: string, path: string): Promise<string[]> {
  const supabase = getAdminClient();
  const { data: entries, error } = await supabase.storage.from(bucket).list(path, { limit: 1000 });
  if (error || !entries) return [];

  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = `${path}/${entry.name}`;
    if (entry.id === null) {
      // Folders are returned as entries with a null id — recurse into them.
      files.push(...(await listAllFiles(bucket, fullPath)));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

export async function deleteUserStorage(
  bucket: string,
  path: string
): Promise<{ deleted: number; error: string | null }> {
  try {
    const files = await listAllFiles(bucket, path);
    if (files.length === 0) return { deleted: 0, error: null };

    const supabase = getAdminClient();
    const { error } = await supabase.storage.from(bucket).remove(files);
    if (error) return { deleted: 0, error: error.message };

    return { deleted: files.length, error: null };
  } catch (err) {
    return { deleted: 0, error: err instanceof Error ? err.message : "Unknown storage error" };
  }
}
