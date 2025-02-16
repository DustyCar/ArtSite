import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const BrowseArt2 = () => {
  const [art, setArt] = useState([]); // Paginated browsing data
  const [allArt, setAllArt] = useState([]); // Full dataset preloaded for search
  const [searchResults, setSearchResults] = useState([]); // Search results
  const [currentPage, setCurrentPage] = useState(() => {
    return parseInt(localStorage.getItem('currentPage')) || 1;
  });
  const [totalPages, setTotalPages] = useState(678);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false); // Tracks search mode
  const ITEMS_PER_PAGE = 60;

  // Persist current page in localStorage
  useEffect(() => {
    localStorage.setItem('currentPage', currentPage);
  }, [currentPage]);

  // Fetch paginated art for browsing
  useEffect(() => {
    if (!isSearching) {
      setLoading(true);
      fetchArtworks(currentPage);
      preloadAllArt();
    }
  }, [currentPage, isSearching]);

  const fetchArtworks = (page) => {
    const offset = (page - 1) * ITEMS_PER_PAGE;
    const API_URL = `https://openaccess-api.clevelandart.org/api/artworks/?has_image=1&limit=${ITEMS_PER_PAGE}&skip=${offset}`;

    fetch(API_URL)
      .then((response) => response.json())
      .then((data) => {
        if (data.data && data.data.length > 0) {
          setArt(shuffleArray(data.data.filter((item) => item.images?.web?.url)));
        } else {
          setArt([]);
        }
      })
      .catch((error) => {
        console.error('Error fetching artwork data:', error);
      })
      .finally(() => setLoading(false));
  };

  // Preload all artwork in the background for fast searching
  const preloadAllArt = () => {
    if (allArt.length > 0) return; // Avoid duplicate fetch

    const API_URL = `https://openaccess-api.clevelandart.org/api/artworks/?has_image=1&limit=5000`;
    fetch(API_URL)
      .then((response) => response.json())
      .then((data) => {
        if (data.data && data.data.length > 0) {
          setAllArt(data.data.filter((item) => item.images?.web?.url));
        }
      })
      .catch((error) => console.error('Error preloading full artwork dataset:', error));
  };

  const shuffleArray = (array) => array.sort(() => Math.random() - 0.5);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Improved Search Function
  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    setIsSearching(true);
    setLoading(true);

    const lowerSearch = searchTerm.toLowerCase();

    const filteredResults = allArt.filter(
      (item) =>
        item.title.toLowerCase().includes(lowerSearch) ||
        item.creators?.some((creator) =>
          creator?.description?.toLowerCase().includes(lowerSearch)
        ) ||
        item.department?.toLowerCase().includes(lowerSearch) ||
        item.technique?.toLowerCase().includes(lowerSearch) ||
        item.description?.toLowerCase().includes(lowerSearch) ||
        (item.tags && item.tags.some((tag) => tag.toLowerCase().includes(lowerSearch))) // NEW: Search in tags
    );

    setSearchResults(filteredResults);
    setLoading(false);
  };

  const resetSearch = () => {
    setIsSearching(false);
    setSearchResults([]);
    setSearchTerm('');
  };

  const displayArt = isSearching ? searchResults : art;

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
          {isSearching && searchResults.length === 0 && (
            <p>No artworks found for "{searchTerm}"</p>
          )}

          {/* Display either search results or paginated results */}
          <div className="gallery">
            {displayArt.map((item) => (
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



































