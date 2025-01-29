import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [metArtworks, setMetArtworks] = useState([]);
  const [clevelandArtworks, setClevelandArtworks] = useState([]);

  useEffect(() => {
    // Fetching 3 random artworks from the Met Museum API
    fetch('https://collectionapi.metmuseum.org/public/collection/v1/objects?hasImages=true')
      .then((response) => response.json())
      .then((data) => {
        const randomObjectIDs = getRandomElements(data.objectIDs, 10); // Pick 10 random IDs
        const artworkPromises = randomObjectIDs.map((id) =>
          fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`)
            .then((response) => response.json())
            .then((artworkData) => {
              if (artworkData.primaryImageSmall) {
                return { ...artworkData, type: 'met' }; // Add type 'met' for Met Museum artworks
              }
              return null;
            })
        );

        Promise.all(artworkPromises)
          .then((artworksData) => {
            const validArtworks = artworksData.filter((artwork) => artwork !== null).slice(0, 3); // Show only 3 artworks
            setMetArtworks(validArtworks);
          })
          .catch((error) => console.error('Error fetching artwork details:', error));
      })
      .catch((error) => console.error('Error fetching objectIDs:', error));

    // Fetching 3 random artworks from the Cleveland Museum of Art API
    fetch('https://openaccess-api.clevelandart.org/api/artworks/?has_image=1&limit=100')
      .then((response) => response.json())
      .then((data) => {
        const shuffledArtworks = shuffleArray(data.data);
        const validArtworks = shuffledArtworks.filter((item) => item.images?.web?.url).slice(0, 3); // Show only 3 artworks
        const clevelandArtworks = validArtworks.map(artwork => ({
          ...artwork,
          type: 'cleveland', // Add type 'cleveland' for Cleveland Museum artworks
        }));
        setClevelandArtworks(clevelandArtworks);
      })
      .catch((error) => console.error('Error fetching Cleveland artworks:', error));
  }, []);

  // Helper function to get random elements from an array
  const getRandomElements = (arr, num) => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, num);
  };

  // Shuffle array function
  const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      {/* Met Museum Section */}
      <h2
        className="home-caption"
        style={{ fontSize: '45px', textAlign: 'left', fontWeight: '600', marginBottom: '20px' }}
      >
        "Browse, Discover, and Save Artworks from Leading Museums"
      </h2>

      <section style={{ marginTop: '40px', textAlign: 'left' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '10px' }}>Featured Artworks from the Met Museum</h2>
        <p style={{ fontSize: '18px', lineHeight: '1.6' }}>
          Explore a selection of stunning artworks from the Metropolitan Museum of Art's collection.
        </p>

        {metArtworks.length > 0 ? (
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'left', flexWrap: 'wrap' }}>
            {metArtworks.map((artwork) => {
              const routePath = `/art/${artwork.objectID}`; // Link for Met artworks
              return (
                <div key={artwork.objectID} style={{ textAlign: 'left', width: '300px', marginBottom: '20px' }}>
                  <Link to={routePath}>
                    <img
                      src={artwork.primaryImageSmall}
                      alt={artwork.title || 'Artwork'}
                      style={{
                        width: '100%',
                        height: 'auto',
                        maxHeight: '300px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <h3 style={{ fontSize: '20px', marginTop: '10px', fontWeight: '600' }}>
                      {artwork.title || 'Untitled'}
                    </h3>
                    <p style={{ fontSize: '16px' }}>
                      {artwork.artistDisplayName || 'Artist Unknown'}
                    </p>
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <p>Loading artworks...</p>
        )}

        {/* Explore the Met Button */}
        <div style={{ marginTop: '20px' }}>
          <Link to="/browse" style={buttonStyle}>Explore The Met</Link>
        </div>
      </section>

      {/* Cleveland Museum of Art Section */}
      <section style={{ marginTop: '40px', textAlign: 'left' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '10px' }}>Featured Artworks from Cleveland Museum</h2>
        <p style={{ fontSize: '18px', lineHeight: '1.6' }}>
          Discover incredible artworks from the Cleveland Museum of Art.
        </p>

        {clevelandArtworks.length > 0 ? (
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'left', flexWrap: 'wrap' }}>
            {clevelandArtworks.map((artwork) => {
              const routePath = `/art2/${artwork.id}`; // Link for Cleveland artworks
              return (
                <div key={artwork.id} style={{ textAlign: 'left', width: '300px', marginBottom: '20px' }}>
                  <Link to={routePath}>
                    <img
                      src={artwork.images?.web?.url}
                      alt={artwork.title || 'Artwork'}
                      style={{
                        width: '100%',
                        height: 'auto',
                        maxHeight: '300px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <h3 style={{ fontSize: '20px', marginTop: '10px', fontWeight: '600' }}>
                      {artwork.title || 'Untitled'}
                    </h3>
                    <p style={{ fontSize: '16px' }}>
                      {artwork.creators?.map((creator) => creator?.description).join(', ') || 'Artist Unknown'}
                    </p>
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <p>Loading artworks...</p>
        )}

        {/* Explore the Cleveland Museum Button */}
        <div style={{ marginTop: '20px' }}>
          <Link to="/browse2" style={buttonStyle}>Explore The Cleveland Museum</Link>
        </div>
      </section>
    </div>
  );
};

// Button styles
const buttonStyle = {
  padding: '12px 25px',
  fontSize: '18px',
  backgroundColor: '#0099FF',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  textDecoration: 'none',
  cursor: 'pointer',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  transition: 'background-color 0.3s ease',
};

buttonStyle[':hover'] = {
  backgroundColor: '#007BFF',
};

export default Home;












