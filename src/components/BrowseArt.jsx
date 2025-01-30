import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const BrowseArt = () => {
  const [art, setArt] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true); // New loading state
  const ITEMS_PER_PAGE = 60;

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  useEffect(() => {
    setLoading(true); // Set loading to true before fetching starts
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
        setLoading(false); // Stop loading on error
      });
  }, [currentPage]);

  const fetchArtData = (objectIDs, page) => {
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
        setArt(filteredArt);
        setLoading(false); // Stop loading once data is set
      })
      .catch((error) => {
        console.error('Error fetching artwork details:', error);
        setLoading(false);
      });
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const filteredArt = art.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.artistDisplayName && item.artistDisplayName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <h1 className='browse-heading'>The Metropolitan Museum of Art</h1>

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
          {/* Gallery of artworks */}
          <div className="gallery">
            {filteredArt.map((item) => (
              <div key={item.objectID} className="art-item">
                <Link to={`/art/${item.objectID}`}>
                  <img src={item.primaryImageSmall} alt={item.title} />
                  <h3>{item.title || "Untitled"}</h3>
                  <p>{item.artistDisplayName || "Unknown Artist"}</p>
                  
                </Link>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
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
        </>
      )}
    </div>
  );
};

export default BrowseArt;



