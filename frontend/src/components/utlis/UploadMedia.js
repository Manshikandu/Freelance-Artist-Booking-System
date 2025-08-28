
export async function uploadMedia(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "artist_media"); // from Cloudinary
  formData.append("folder", "media");
  const res = await fetch("https://api.cloudinary.com/v1_1/dq5rjqhnl/image/upload", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json();
    console.error("Cloudinary upload error:", errorData);
    throw new Error("Upload failed");
  }

  const data = await res.json();
  return data.secure_url; 
}


