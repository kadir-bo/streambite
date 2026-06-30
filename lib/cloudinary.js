/**
 * Cloudinary Upload Helper
 *
 * Voraussetzung:
 *   1. Kostenloses Cloudinary-Konto erstellen: https://cloudinary.com
 *   2. Cloud Name aus dem Dashboard kopieren
 *   3. Upload Preset anlegen (Settings → Upload → Upload presets → "Unsigned" aktivieren)
 *   4. Beides in .env.local eintragen:
 *        NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=…
 *        NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=…
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

/**
 * Lädt eine Datei per unsigned Upload zu Cloudinary hoch.
 * @returns {Promise<string>} Die sichere URL der hochgeladenen Datei.
 */
export async function uploadToCloudinary(file, folder = "streambite") {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary nicht konfiguriert – NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME " +
        "und NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in .env.local setzen",
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("cloud_name", CLOUD_NAME);
  formData.append("folder", folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
    { method: "POST", body: formData },
  );

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error?.message ?? "Cloudinary Upload fehlgeschlagen");
  }

  const data = await res.json();
  return data.secure_url;
}

/**
 * Lädt einen Dateianhang für eine Chat-Nachricht hoch.
 * @returns {Promise<string>} Die URL des hochgeladenen Anhangs.
 */
export async function uploadAttachment(serverId, channelId, file) {
  const folder = `streambite/attachments/${serverId ?? "dm"}/${channelId}`;
  return uploadToCloudinary(file, folder);
}
