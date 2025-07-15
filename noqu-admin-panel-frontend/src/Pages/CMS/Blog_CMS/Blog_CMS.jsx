import React, { useEffect, useState } from 'react';
import './Blog_CMS.css'
import PopUp from '../../../Components/PopUp/PopUp';
import axios from '../../../utils/axiosInstance';
import backarrow from "./../../../../src/assets/backarrow.png"
import edit from "./../../../../src/assets/edit.png"
import delete_icon from "./../../../../src/assets/delete.png"
import refresh from "./../../../../src/assets/refresh.png"
import Add_Blog from './Add_Blog';
import Edit_Blog from './Edit_Blog';

const Blog_CMS = () => {


  const [blobItems, setblobItems] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBlogId, setcurrentBlogId] = useState(null);
  const [CMS_Content, setCMS_Content] = useState('BlogTable');
  const [editId, setEditId] = useState(null);
  const [searchByDate, setSearchByDate] = useState(null);
  const [filteredBlog, setfilteredBlog] = useState([]); // Filtered dataset


  const openModal = (userId) => {
    setcurrentBlogId(userId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setcurrentBlogId(null);
  };

  const fetchData = async () => {
    setLoading(true)
    // fetch('http://localhost:3003/db/news')
    fetch('https://noqu.co.in/db/blog')
      .then((response) => response.json())
      .then((data) => setblobItems(data))
      .catch((err) => console.error('Error fetching blog:', err));
    setLoading(false)
  };
  // Set up auto-refresh with useEffect
  useEffect(() => {
    fetchData(); // Initial fetch
  }, []);

  // Listen for currentBlogId change and update CMS_Content accordingly
  useEffect(() => {
    if (editId !== null) {
      console.log("the id is", editId)
      setCMS_Content('Edit');
    }
  }, [editId]);


  // Sorting function
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    // if (direction == 'ascending'){
    //   setSortingArrow(<>&#9662;</>)
    // }else if (direction == 'descending'){
    //   setSortingArrow(<>&#9652;</>)
    // }
    // else{  
    //   setSortingArrow('')
    // }
  };

  // Memoized sorted data
  const sortedData = React.useMemo(() => {
    let sortableItems = [...filteredBlog];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredBlog, sortConfig]);

  const handleSearch2 = (event) => {
    const value = event.target.value;
    setSearchByDate(value);

    if (value.length !== 0) {
      const filtered = blobItems.filter(item =>
        item.created_at.toLowerCase().includes(value.toLowerCase()) // Adjust the property to search
      );
      setfilteredBlog(filtered);
    } else {
      // If no search term, reset to the original dataset
      setfilteredBlog(blobItems);
    }
  };
  // Ensure `filteredBlog` is used for displaying the table
  useEffect(() => {
    setfilteredBlog(blobItems); // Initialize filteredBlog with all news items
  }, [blobItems]);


  const DeleteNews = (blogId) => {
    console.log("the ID is :", blogId)
    // axios.post('http://localhost:3003/db/delete', { id: userId, email: userEmail })

    axios.post('https://noqu.co.in/db/delete-blog', { id: blogId })
      .then((_response) => {
        console.log(_response.data.message)
        fetchData();
        setIsModalOpen(false);
      })
      .catch((error) => {
        console.error(error);
      });
  };


  return (
    <>
      <div className="CMS_add-News">
        <div className="CMS-head">
          <h1 className='TAM_h1'>{CMS_Content !== "BlogTable" ? <img src={backarrow} style={{cursor:'pointer'}} width={25} onClick={() => {
            setCMS_Content("BlogTable")
            setEditId(null)
          }} /> : ""}CMS</h1>
        </div>
        {/* ------------------------------------------------------------------------------------------------------------- */}
        <div className="CMS-content">
          {CMS_Content === "BlogTable" && <div className="CMS-news-table">
            <h1 className='TAM_h1'>Blog</h1>
            <div className="CMS-content-head">
              <div className='CMS_add-News'>
                <button className='scale-hover' onClick={() => setCMS_Content("Add")}>CREATE <span>+</span></button>
              </div>
              <div className='CMS-content-head-refresh' onClick={() => {
                fetchData()
                setSearchByDate('')
                setSortConfig(newsItems)
              }}>
                <img src={refresh} width={17} style={{ marginRight: "8px" }} /> Refresh
              </div>
              <input
                type="date"
                value={searchByDate}
                onChange={handleSearch2}
              />
            </div>
            {loading ? (
              <div className='nodata'>Loading...</div>
            ) : filteredBlog.length === 0 ? (
              <div className="nodata">
                <p>No data found</p>
              </div>
            ) : (
              <>
                <table>
                  <thead>
                    <tr>
                      <th style={{ cursor: "pointer" }} onClick={() => requestSort('id')}>ID <span>{sortConfig.key === 'id' && sortConfig.direction === 'ascending' ? <>&#9662;</> : <>&#9652;</>}</span></th>
                      <th style={{ cursor: "pointer", width: "350px" }} onClick={() => requestSort('email')}>TITLE <span>{sortConfig.key === 'email' && sortConfig.direction === 'ascending' ? <>&#9662;</> : <>&#9652;</>}</span></th>
                      <th style={{ cursor: "pointer" }} onClick={() => requestSort('created_at')}>CREATED AT <span>{sortConfig.key === 'created_at' && sortConfig.direction === 'ascending' ? <>&#9662;</> : <>&#9652;</>}</span></th>
                      <th style={{ cursor: "pointer" }} onClick={() => requestSort('modified_at')}>MODIFIED AT <span>{sortConfig.key === 'modified_at' && sortConfig.direction === 'ascending' ? <>&#9662;</> : <>&#9652;</>}</span></th>
                      <th>EDIT</th>
                      <th>DELETE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* <tr>
                  {sortedData.length}
                </tr> */}
                    {sortedData.map(news => (
                      <>
                        <tr key={news.id}>
                          <td>{news.id}</td>
                          <td>{news.title}</td>
                          <td>{new Date(news.created_at).toLocaleString()}</td>
                          <td>{new Date(news.modified_at).toLocaleString()}</td>
                          <td>
                            <button className='scale-hover' onClick={() => {
                              setEditId(news.id); // This sets the currentBlogId first
                            }}><img src={edit} alt="Edit" width={25} /></button>
                          </td>
                          <td>
                            <button className='scale-hover' onClick={() => openModal(news.id)}><img src={delete_icon} alt="Delete" width={25} /></button>
                          </td>
                        </tr >
                      </>
                    ))}
                  </tbody>
                  <PopUp isOpen={isModalOpen} onClose={closeModal}>
                    <h2>Delete News</h2>
                    <p>Are you sure you want to delete {currentBlogId}?</p>
                    <button className='scale-hover' onClick={() => DeleteNews(currentBlogId)}>Delete</button>
                  </PopUp>
                </table>
              </>
            )}
          </div>}
        </div>
        <div className="CMS-other-content">
          {CMS_Content === "Add" && < Add_Blog refresh={fetchData} />}
          {CMS_Content === "Edit" && < Edit_Blog refresh={fetchData} userId={editId} />}
        </div>
      </div >
    </>
  )
}

export default Blog_CMS