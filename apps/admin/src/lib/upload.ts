export async function uploadImage(file: File, apiBase: string) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${apiBase}/uploads/image`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Upload failed");
  return data.data as {
    filename: string;
    path: string;
    mimetype: string;
    size: number;
  };
}
