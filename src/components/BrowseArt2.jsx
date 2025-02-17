import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const BrowseArt2 = () => {
  const [art, setArt] = useState([]); // Paginated browsing data
  const [searchResults, setSearchResults] = useState([]); // Search results
  const [currentPage, setCurrentPage] = useState(() => {
    return parseInt(localStorage.getItem('currentPage')) || 1;
  });
  const [totalPages, setTotalPages] = useState(1); // Will be updated based on search results
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false); // Tracks search mode
  const ITEMS_PER_PAGE = 60;

  // Persist current page in localStorage
  useEffect(() => {
    localStorage.setItem('currentPage', currentPage);
  }, [currentPage]);

  // Fetch paginated art for browsing or search
  useEffect(() => {
    if (!isSearching) {
      setLoading(true);
      fetchArtworks(currentPage); // Fetch normal browsing data
    } else {
      // Fetch search results
      handleSearch();
    }
  }, [currentPage, isSearching]);

  const fetchArtworks = (page, searchQuery = '') => {
    const offset = (page - 1) * ITEMS_PER_PAGE;
    let API_URL = `https://openaccess-api.clevelandart.org/api/artworks/?has_image=1&limit=${ITEMS_PER_PAGE}&skip=${offset}`;

    if (searchQuery) {
      API_URL += `&q=${encodeURIComponent(searchQuery)}`;
    }

    fetch(API_URL)
      .then((response) => response.json())
      .then((data) => {
        if (data.data && data.data.length > 0) {
          setArt(data.data.filter((item) => item.images?.web?.url));
          setTotalPages(Math.ceil(data.total / ITEMS_PER_PAGE)); // Dynamically set totalPages based on the search result
        } else {
          setArt([]);
        }
      })
      .catch((error) => {
        console.error('Error fetching artwork data:', error);
      })
      .finally(() => setLoading(false));
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setIsSearching(false);
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setLoading(true);
    fetchArtworks(currentPage, searchTerm);
  };

  const resetSearch = () => {
    setIsSearching(false);
    setSearchResults([]);
    setSearchTerm('');
    setLoading(true);
    fetchArtworks(currentPage); // Reset to normal browsing after search is cleared
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div>
      <h1 className='browse-heading'>The Cleveland Museum of Art Collection</h1>

      {/* Search Bar */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by title, artist, description, or tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch(); // Trigger search when Enter key is pressed
            }
          }}
        />
        <button onClick={handleSearch}>Search</button>
        {isSearching && <button onClick={resetSearch} className="reset-btn">Reset</button>}
      </div>

      {/* Show loading message */}
      {loading ? (
        <p>Fetching artworks, please wait...</p>
      ) : (
        <>
          {/* No artworks found for searchTerm */}
          {isSearching && art.length === 0 && (
            <p>No artworks found for "{searchTerm}"</p>
          )}

          {/* Display either search results or paginated results */}
          <div className="gallery">
            {art.map((item) => (
              <div key={item.id} className="art-item">
                <Link to={`/art2/${item.id}`}>
                  <img
                    src={item.images?.web?.url}
                    alt={item.title || 'Artwork'}
                    style={{ width: '100%', height: 'auto' }}
                  />
                  <h3>{item.title || 'Untitled'}</h3>
                  <p>{item.creators?.map((creator) => creator?.description).join(', ') || 'Unknown Artist'}</p>
                </Link>
              </div>
            ))}
          </div>

          {/* Pagination Controls (Only show if NOT searching) */}
          {!isSearching && (
            <div className="pagination">
              <button onClick={() => handlePageChange(1)} disabled={currentPage === 1}>First</button>
              <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
              <span>Page {currentPage} of {totalPages}</span>
              <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
              <button onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}>Last</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BrowseArt2;




































