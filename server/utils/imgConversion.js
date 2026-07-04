const sharp = require('sharp');

// Example route for handling uploads
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const inputPath = req.file.path; // Path to the uploaded file
    const outputPath = `processed/${req.file.filename}.webp`;

    // Resize and convert to WebP
    await sharp(inputPath)
      .resize(1000, 1000, {
        fit: 'inside', // Maintain aspect ratio
      })
      .toFormat('webp') // Convert to WebP
      .toFile(outputPath);

    res.send({ message: 'Image processed successfully', filePath: outputPath });
  } catch (err) {
    res.status(500).send(err.message);
  }
});