import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const BrowseArt = () => {
  const [art, setArt] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const ITEMS_PER_PAGE = 60;
  const objectIDsRef = useRef([]);

  useEffect(() => {
    const savedPage = localStorage.getItem('currentPage');
    if (savedPage) setCurrentPage(parseInt(savedPage, 10));
  }, []);

  useEffect(() => {
    localStorage.setItem('currentPage', currentPage);
  }, [currentPage]);

  useEffect(() => {
    if (!isSearching) {
      setLoading(true);
      fetch('https://collectionapi.metmuseum.org/public/collection/v1/objects')
        .then(response => response.json())
        .then(data => {
          if (!data.objectIDs || data.objectIDs.length === 0) {
            console.error('No object IDs returned');
            setLoading(false);
            return;
          }
          objectIDsRef.current = data.objectIDs.sort(() => Math.random() - 0.5);
          setTotalPages(Math.ceil(objectIDsRef.current.length / ITEMS_PER_PAGE));
          fetchArtData(objectIDsRef.current, currentPage);
        })
        .catch(error => {
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
      paginatedIDs.map(id =>
        fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`)
          .then(response => response.json())
          .catch(error => {
            console.error(`Error fetching details for ID ${id}:`, error);
            return null;
          })
      )
    )
      .then(artDetails => {
        const filteredArt = artDetails.filter(item => item && item.primaryImageSmall);
        isSearch ? setSearchResults(filteredArt) : setArt(filteredArt);
      })
      .catch(error => console.error('Error fetching artwork details:', error))
      .finally(() => setLoading(false));
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    setIsSearching(true);
    
    fetch(`https://collectionapi.metmuseum.org/public/collection/v1/search?q=${searchTerm}`)
      .then(response => response.json())
      .then(data => {
        if (data.objectIDs?.length) {
          fetchArtData(data.objectIDs, 1, true);
        } else {
          setSearchResults([]);
          setLoading(false);
        }
      })
      .catch(error => {
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
    setIsSearching(false);
    setSearchTerm('');
    setLoading(true);
    setCurrentPage(1);
    setArt([]);
  };

  const displayArt = isSearching ? searchResults : art;

  return (
    <div>
      <h1 className='browse-heading'>The Metropolitan Museum of Art</h1>

      <div className='search-container'>
        <input
          type='text'
          placeholder='Search by title, artist, description, or tags...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}

          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch(); // Trigger search when Enter key is pressed
            }
          }}
        />
        <button onClick={handleSearch}>Search</button>
        {isSearching && <button onClick={handleBackToBrowse} className='reset-btn'>Reset</button>}
      </div>

      {loading ? (
        <p>Loading artworks, please wait...</p>
      ) : (
        <>
          {isSearching && searchResults.length === 0 && <p>No results found for "{searchTerm}"</p>}

          <div className='gallery'>
            {displayArt.map(item => (
              <div key={item.objectID} className='art-item'>
                <Link to={`/art/${item.objectID}`}>
                  <img src={item.primaryImageSmall} alt={item.title || 'Artwork'} />
                  <h3>{item.title || 'Untitled'}</h3>
                  <p>{item.artistDisplayName || 'Unknown Artist'}</p>
                </Link>
              </div>
            ))}
          </div>

          {!isSearching && (
            <div className='pagination'>
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

export default BrowseArt;











