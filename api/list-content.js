const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

router.get('/api/list-content', async (req, res) => {
  try {
    const type = req.query.type;
    const contentDir = path.join(__dirname, '../content', type);
    
    const files = await fs.readdir(contentDir);
    const mdFiles = files.filter(file => file.endsWith('.md'));
    
    const fileDetails = await Promise.all(mdFiles.map(async file => {
      const content = await fs.readFile(path.join(contentDir, file), 'utf8');
      const titleMatch = content.match(/^#\s+(.+)$/m);
      return {
        name: file.replace('.md', ''),
        title: titleMatch ? titleMatch[1] : file.replace('.md', '')
      };
    }));
    
    res.json(fileDetails);
  } catch (error) {
    res.status(500).json({ error: 'Failed to list content' });
  }
});

module.exports = router; 