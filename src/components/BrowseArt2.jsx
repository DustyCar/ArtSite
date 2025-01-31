import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const BrowseArt2 = () => {
  const [art, setArt] = useState([]); // Paginated browsing data
  const [allArt, setAllArt] = useState([]); // Full dataset preloaded for search
  const [searchResults, setSearchResults] = useState([]); // Search results
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(678);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false); // Tracks search mode
  const ITEMS_PER_PAGE = 60;

  // Fetch paginated art for browsing
  useEffect(() => {
    setLoading(true);
    fetchArtworks(currentPage);
    preloadAllArt(); // Preload full dataset for fast searching
  }, [currentPage]);

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
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching artwork data:', error);
        setLoading(false);
      });
  };

  // **Preload all artwork in the background for fast searching**
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

  // **Search using preloaded data**
  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    setIsSearching(true);
    setSearchResults(
      allArt.filter(
        (item) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.creators?.some((creator) =>
            creator?.description?.toLowerCase().includes(searchTerm.toLowerCase())
          )
      )
    );
  };

  const resetSearch = () => {
    setIsSearching(false);
    setSearchResults([]);
    setSearchTerm('');
  };

  return (
    <div>
      <h1 className='browse-heading'>The Cleveland Museum of Art Collection</h1>

      {/* Search Bar */}
      {!isSearching && (
        <div className="search-container">
          <input
            type="text"
            placeholder="Search by artwork title or artist name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
      )}

      {/* Show loading message */}
      {loading && !isSearching ? (
        <p>Fetching artworks, please wait...</p>
      ) : (
        <>
          {/* No artworks found for searchTerm */}
          {isSearching && searchResults.length === 0 && (
            <p>No artworks found for "{searchTerm}"</p>
          )}

          {/* Back to Browse Button */}
          {isSearching && (
            <div className="back-to-browse-container">
              <button onClick={resetSearch} className="back-to-browse-btn">Back to Browse</button>
            </div>
          )}

          {/* Display either search results or paginated results */}
          <div className="gallery">
            {(isSearching ? searchResults : art).map((item) => (
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
































