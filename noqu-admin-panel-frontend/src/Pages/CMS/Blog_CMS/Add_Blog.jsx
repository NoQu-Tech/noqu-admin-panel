import React, { useState } from 'react';
import delete_icon from "./../../../../src/assets/delete.png"
import typography1 from "./../../../../src/assets/typography1.png"
import typography2 from "./../../../../src/assets/typography2.png"
import typography3 from "./../../../../src/assets/typography3.png"

const Add_Blog = ({ refresh }) => {
  const [title, setTitle] = useState('');
  const [shortContent, setShortContent] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [sections, setSections] = useState([{ paragraph: '', image: null, layout: '1' }]);
  const [loading, setLoading] = useState(false)
  const [align, setAlign] = useState(typography1)

  const handleSectionChange = (index, key, value) => {
    const updatedSections = [...sections];
    updatedSections[index][key] = value; ``
    setSections(updatedSections);
  };

  const addSection = () => {
    setSections([...sections, { paragraph: '', image: null, layout: '1' }]);
  };

  const removeSection = (index) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const AddNewsfun = async (e) => {
    e.preventDefault();
    setLoading(true)

    const formData = new FormData();
    formData.append('thumbnail', thumbnail);
    formData.append('title', title);
    formData.append('shortContent', shortContent);

    // Append sections images
    sections.forEach((section, index) => {
      if (section.image) {
        formData.append(`sections[][image]`, section.image); // Correct file key
      }
    });

    // Append sections data as JSON
    formData.append(
      'sections',
      JSON.stringify(
        sections.map(({ paragraph, layout }) => ({
          paragraph,
          layout,
          image: null, // Image filename will be handled by the backend
        }))
      )
    );


    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://noqu.co.in/db/add-blog', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        alert('Blog added successfully!');
        setLoading(false)
        refresh();
      } else {
        alert(`Error: ${data.error}`);
        setLoading(false)
      }
    } catch (err) {
      console.error('Error adding Blog:', err);
    }
  };

  return (
    <div className='CMS_add-News-form'>
      <form onSubmit={AddNewsfun}>
        <h5>Add a Blog</h5>
        <div className="CMS_add-News-form_row">
          <label>Title:</label>
          <input
            type="text"
            placeholder="Title"
            value={title}
            maxLength={100}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="CMS_add-News-form_row">
          <label>Thumbnail Content:</label>
          <input
            type="text"
            placeholder="Max 500 characters"
            value={shortContent}
            onChange={(e) => setShortContent(e.target.value)}
            required
          />
        </div>
        <div className="CMS_add-News-form_row">
          <label>Thumbnail Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setThumbnail(e.target.files[0])}
          />
        </div>
        {sections.map((section, index) => (
          <div key={index} className="CMS_add-News-section">
            <div className="CMS_add-News-section-head">
              <div className="News-layout">
                <label>Section {index + 1}:</label>
                <select
                  value={section.layout}
                  onChange={(e) => handleSectionChange(index, 'layout', e.target.value)}
                >
                  <option onClick={() => setAlign("typography1")} value="1">Layout 1 (text align center)</option>
                  <option onClick={() => setAlign("typography2")} value="2">Layout 2 (text align right)</option>
                  <option onClick={() => setAlign("typography3")} value="3">Layout 3 (text align left)</option>
                </select>
                <div className="">
                  {section.layout === "2" ? <img src={typography2} width={20} alt="" /> : section.layout === "3" ? <img src={typography3} width={20} alt="" /> : <img src={typography1} width={20} alt="" />}
                </div>
              </div>
              <div className="CMS_add-News-section-button">
                <button className='scale-hover' type="button" onClick={() => removeSection(index)}> <img src={delete_icon} width={35} alt="" /> </button>
              </div>
            </div>
            <textarea
              placeholder="Paragraph"
              value={section.paragraph}
              onChange={(e) => handleSectionChange(index, 'paragraph', e.target.value)}
              required
            />
            {section.image && (
              <img
                src={`https://noqu.co.in/uploads/${section.image}`}
                alt={`Section ${index + 1}`}
                width={200}
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleSectionChange(index, 'image', e.target.files[0])}
            />
          </div>
        ))}
        <div className="CMS_add-News-form-add-section-button">
          <button className='scale-hover' type="button" onClick={addSection}><span><p>+</p></span>Add Section</button>
        </div>
        <div className="CMS_add-News-form_button scale-hover">
          <button type="submit">{loading ? "Adding..." : "Add Blog"}</button>
        </div>
      </form>
    </div>
  );
};

export default Add_Blog;