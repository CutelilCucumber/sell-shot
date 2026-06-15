const supabase = require('../config/supabase');
const path = require('path');

async function uploadFile(file, userId) {
  const ext = path.extname(file.originalname).toLowerCase();
  const filename = `${userId}/${Date.now()}-${file.originalname}`;

  const { data, error } = await supabase.storage
    .from(process.env.SUPABASE_BUCKET)
    .upload(filename, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });

  if (error) throw new Error(error.message);

  const { data: { publicUrl } } = supabase.storage
    .from(process.env.SUPABASE_BUCKET)
    .getPublicUrl(filename);

  return publicUrl;
}

async function deleteFile(storageUrl) {
  const filename = storageUrl.split('/asset-imgs/')[1];

  const { error } = await supabase.storage
    .from(process.env.SUPABASE_BUCKET)
    .remove([filename]);

  if (error) throw new Error(error.message);
}

module.exports = { uploadFile, deleteFile };