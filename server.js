const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { ImageAnnotatorClient } = require('@google-cloud/vision');

const app = express();
const port = process.env.PORT || 8080;
const upload = multer({ dest: 'uploads/' });

const client = new ImageAnnotatorClient();
app.use(express.static(path.join(__dirname, 'public')));

app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const [result] = await client.labelDetection(filePath);
    const labels = result.labelAnnotations;
    fs.unlinkSync(filePath);

    let html = '<h1>Detected Labels</h1><ul>';
    labels.forEach(label => {
      html += `<li>${label.description} - Score: ${(label.score * 100).toFixed(2)}%</li>`;
    });
    html += '</ul><a href="/">Try another image</a>';
    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error processing image');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
