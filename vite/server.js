const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const upload = multer({ dest: path.join(__dirname, 'uploads') });

app.use(express.static(path.join(__dirname, 'imports')));

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    console.error('No file uploaded');
    return res.status(400).send('No file uploaded.');
  }

  console.log('File uploaded:', req.file.originalname);

  const tempPath = req.file.path;
  const targetPath = path.join(__dirname, 'imports', req.file.originalname);

  fs.rename(tempPath, targetPath, err => {
    if (err) {
      console.error('Error moving file:', err);
      return res.status(500).send('Error moving file.');
    }
    console.log('File moved to:', targetPath);
    res.json({ filePath: `/imports/${req.file.originalname}` });
  });
});

app.listen(3005, () => {
  console.log('Server is running on http://localhost:3005');
});