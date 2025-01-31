import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const BrowseArt = () => {
  const [art, setArt] = useState([]); // Paginated art for browsing
  const [searchResults, setSearchResults] = useState([]); // For holding search results
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false); // Track if search is in progress
  const ITEMS_PER_PAGE = 60;

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  useEffect(() => {
    if (!isSearching) {
      setLoading(true);
      fetch('https://collectionapi.metmuseum.org/public/collection/v1/objects?hasImages=true')
        .then((response) => response.json())
        .then((artworkData) => {
          let objectIDs = artworkData.objectIDs;
          objectIDs = shuffleArray(objectIDs);
          setTotalPages(Math.ceil(objectIDs.length / ITEMS_PER_PAGE));
          fetchArtData(objectIDs, currentPage);
        })
        .catch((error) => {
          console.error('Error fetching object IDs:', error);
          setLoading(false);
        });
    }
  }, [currentPage, isSearching]);

  const fetchArtData = (objectIDs, page = 1, isSearch = false) => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const paginatedIDs = objectIDs.slice(start, end);

    Promise.all(
      paginatedIDs.map((id) =>
        fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`)
          .then((response) => response.json())
          .catch((error) => {
            console.error(`Error fetching details for object ID ${id}:`, error);
            return null;
          })
      )
    )
      .then((artDetails) => {
        const filteredArt = artDetails.filter(
          (item) => item && item.primaryImageSmall
        );

        // If it's a search, filter by title or artist (case-insensitive)
        if (isSearch) {
          const filteredSearchResults = filteredArt.filter((item) => {
            const titleMatch = item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase());
            const artistMatch = item.artistDisplayName && item.artistDisplayName.toLowerCase().includes(searchTerm.toLowerCase());
            return titleMatch || artistMatch; // Match either title or artist name
          });
          setSearchResults(filteredSearchResults); // Update search results (no pagination)
        } else {
          setArt(filteredArt); // Update art for paginated browsing
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching artwork details:', error);
        setLoading(false);
      });
  };

  const handleSearch = () => {
    setLoading(true);
    setIsSearching(true); // Switch to search mode
    const searchURL = `https://collectionapi.metmuseum.org/public/collection/v1/search?q=${searchTerm}&hasImages=true`;
    fetch(searchURL)
      .then((response) => response.json())
      .then((data) => {
        const objectIDs = data.objectIDs || [];
        if (objectIDs.length > 0) {
          fetchArtData(objectIDs, 1, true); // Pass true to indicate no pagination
        } else {
          setSearchResults([]); // No results found
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error('Error fetching search results:', error);
        setLoading(false);
      });
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleBackToBrowse = () => {
    setIsSearching(false); // Go back to the regular paginated view
    setSearchTerm(''); // Clear the search term
    setLoading(true); // Reset loading state
    setCurrentPage(1); // Reset to first page
    setArt([]); // Reset art state to empty while switching back
  };

  const displayArt = isSearching ? searchResults : art;

  return (
    <div>
      <h1 className="browse-heading">The Metropolitan Museum of Art</h1>

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

      {/* Show loading message while fetching data */}
      {loading ? (
        <p>Fetching artworks, please wait...</p>
      ) : (
        <>
          {/* Back to Browse Button */}
          {isSearching && (
            <button onClick={handleBackToBrowse}>Back to Browse</button>
          )}

          {/* Gallery of artworks */}
          <div className="gallery">
            {displayArt.length === 0 && isSearching && (
              <p>No results found for "{searchTerm}"</p>
            )}
            {displayArt.map((item) => (
              <div key={item.objectID} className="art-item">
                <Link to={`/art/${item.objectID}`}>
                  <img src={item.primaryImageSmall} alt={item.title} />
                  <h3>{item.title || 'Untitled'}</h3>
                  <p>{item.artistDisplayName || 'Unknown Artist'}</p>
                </Link>
              </div>
            ))}
          </div>

          {/* Pagination Controls (only for non-search mode) */}
          {!isSearching && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
              >
                First
              </button>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
              >
                Last
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BrowseArt;








