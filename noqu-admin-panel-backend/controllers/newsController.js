const { db } = require('../models/db');
// const upload = require('../middlewares/upload'); // Import multer config
const { uploadFields, uploadEditNews } = require('../middlewares/upload');
const path = require('path');
const fs = require('fs');


// Generate Slug Utility
const generateSlug = (title) => {
  return title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
};

exports.addNews = [
  uploadFields, // Handle both thumbnail and section images
  (req, res) => {
    try {
    console.log('Files:', JSON.stringify(req.files, null, 2)); // Format as JSON string
    console.log('Body:', JSON.stringify(req.body, null, 2));  

      const { title, shortContent } = req.body;

      // Parse `sections` if it's a stringified JSON
      let sections = [];
      if (req.body.sections) {
        if (typeof req.body.sections === 'string') {
          sections = JSON.parse(req.body.sections); // Parse stringified JSON
        } else if (Array.isArray(req.body.sections)) {
          sections = req.body.sections;
        } else {
          throw new Error('Invalid sections format');
        }
      }

      const thumbnail = req.files?.thumbnail?.[0]?.filename || null;
      sections = sections.map((section, index) => ({
        ...section,
        image: req.files['sections[][image]']?.[index]?.filename || null,
      }));

      const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''); // Generate slug
      const query =
        'INSERT INTO news2 (title, slug, thumbnail, shortContent, content) VALUES (?, ?, ?, ?, ?)';
      const values = [title, slug, thumbnail, shortContent, JSON.stringify(sections)];

      db.query(query, values, (err, result) => {
        if (err) {
          console.error('Database insertion error:', err);
          return res.status(500).json({ error: 'Failed to add news' });
        }
        res.status(201).json({
          message: 'News added successfully',
          newsId: result.insertId,
        });
      });
    } catch (error) {
      console.error('Error processing request:', error);
      res.status(500).json({ error: 'Failed to process request' });
    }
  },
];






// Delete News with Image Upload
exports.deleteNews = (req, res) => {
  const id = req.body.id;

  db.query('DELETE FROM news2 Where ID = ?', [id], (err) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    res.status(200).json({ message: `${id} Deleted Successfully` });
  });
};


exports.getNews = (req, res) => {
  const id = req.body.id;
  console.log('Received ID:', id); // Log the ID
  if (id !== null) {
    const query = 'SELECT * FROM news2 WHERE id = ?';
    db.query(query, [id], (err, results) => {
      if (err) {
        console.error('Database query error:', err);
        return res.status(500).json({ error: 'Database query error' });
      }
      if (results.length === 0) {
        console.log('No news found with ID:', id); // Log no match found
        return res.status(404).json({ error: 'News not found' });
      }
      console.log('News query results:', results);
      res.json(results[0]);
    });
  } else {
    console.log('Invalid ID received:', id); // Log invalid ID
    return res.json({ error: 'Invalid ID' });
  }
};


// Function to edit news

exports.editNews = [
  uploadEditNews, // Multer middleware for Edit
  (req, res) => {
    try {
      console.log('Files:', JSON.stringify(req.files, null, 2));
      console.log('Body:', JSON.stringify(req.body, null, 2));

      const { id, title, shortContent } = req.body;
      if (!id) return res.status(400).json({ error: 'Missing news ID' });

      // Parse sections from form-data
      let sections = [];
      if (req.body.sections) {
        try {
          sections = JSON.parse(req.body.sections);
        } catch (e) {
          console.error("Error parsing sections JSON:", e);
          return res.status(400).json({ error: 'Invalid sections format' });
        }
      } else {
        return res.status(400).json({ error: 'Sections not provided' });
      }

      // Extract uploaded files into a map
      const filesMap = {};
      req.files?.forEach(file => {
        filesMap[file.fieldname] = file.filename;
      });

      // Get updated thumbnail or fallback to existing one
      const thumbnail = filesMap['thumbnail'] || req.body.thumbnail || null;

      // Update section images (replace only if a new image was uploaded)
      sections = sections.map((section, index) => {
        const imageKey = `sectionImages[${index}]`;
        return {
          ...section,
          image: filesMap[imageKey] || section.image, // Keep old if not replaced
        };
      });

      // Slugify the title
      const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

      const updateQuery = `
        UPDATE news2
        SET title = ?, slug = ?, shortContent = ?, thumbnail = ?, content = ?
        WHERE id = ?
      `;
      const values = [
        title,
        slug,
        shortContent,
        thumbnail,
        JSON.stringify(sections),
        id
      ];

      db.query(updateQuery, values, (err, result) => {
        if (err) {
          console.error('Database update error:', err);
          return res.status(500).json({ error: 'Failed to update news' });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'News not found' });
        }

        res.status(200).json({ message: 'News updated successfully' });
      });

    } catch (error) {
      console.error('Error processing edit request:', error);
      res.status(500).json({ error: 'Failed to process request' });
    }
  }
];





// News List
exports.newslist = (req, res) => {
  console.log('Received request to /api/news'); 
  const query = 'SELECT * FROM news2';
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      res.status(500).json({ error: 'Database query error' });
    } else {
      console.log('Newslist query results:', results);
      res.json(results);
    }
  });
};

// Fetch Full News by Slug
exports.fullnews = (req, res) => {
  const { slug } = req.params;
  const query = 'SELECT * FROM news2 WHERE slug = ?';
  db.query(query, [slug], (err, results) => {
    if (err) {
      res.status(500).json({ error: 'Database query error' });
    } else if (results.length === 0) {
      res.status(404).json({ error: 'News not found' });
    } else {
      res.json(results[0]);
    }
  });
};
