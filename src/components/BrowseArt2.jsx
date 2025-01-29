import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const BrowseArt2 = () => {
  const [art, setArt] = useState([]); 
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(678);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true); // New loading state
  const ITEMS_PER_PAGE = 60;

  useEffect(() => {
    setLoading(true); // Start loading before fetching
    fetchArtworks(currentPage);
  }, [currentPage]);

  const fetchArtworks = (page) => {
    const offset = (page - 1) * ITEMS_PER_PAGE;
    const API_URL = `https://openaccess-api.clevelandart.org/api/artworks/?has_image=1&limit=${ITEMS_PER_PAGE}&skip=${offset}`;

    fetch(API_URL)
      .then((response) => response.json())
      .then((data) => {
        if (data.data && data.data.length > 0) {
          setArt(shuffleArray(data.data.filter(item => item.images?.web?.url)));
        } else {
          console.log('No items found');
          setArt([]);
        }
        setLoading(false); // Stop loading after data is set
      })
      .catch((error) => {
        console.error('Error fetching artwork data:', error);
        setLoading(false); // Stop loading if an error occurs
      });
  };

  const shuffleArray = (array) => array.sort(() => Math.random() - 0.5);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const filteredArt = art.filter(
    (item) =>
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.creators?.some((creator) =>
        creator?.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );

  return (
    <div>
      <h1>The Cleveland Museum of Art Collection</h1>

      {/* Search Bar */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by artwork title or artist name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Show loading message while fetching data */}
      {loading ? (
        <p>Fetching artworks, please wait...</p>
      ) : (
        <>
          {/* Gallery */}
          <div className="gallery">
            {filteredArt.length > 0 ? (
              filteredArt.map((item) => (
                <div key={item.id} className="art-item">
                  <Link to={`/art2/${item.id}`}>
                    <img
                      src={item.images?.web?.url}
                      alt={item.title || 'Artwork'}
                      style={{ width: '100%', height: 'auto' }}
                    />
                    <h3>{item.title || 'Untitled'}</h3>
                    <p>{item.creators?.map((creator) => creator?.description).join(', ') || 'Unknown Artist'}</p>
                    <p>{item.creation_date || 'Date Unknown'}</p>
                  </Link>
                </div>
              ))
            ) : (
              <p>No artworks available matching your search.</p>
            )}
          </div>

          {/* Pagination */}
          <div className="pagination">
            <button onClick={() => handlePageChange(1)} disabled={currentPage === 1}>
              First
            </button>
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
              Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
              Next
            </button>
            <button onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}>
              Last
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default BrowseArt2;





























