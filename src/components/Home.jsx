import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [metArtworks, setMetArtworks] = useState([]);
  const [clevelandArtworks, setClevelandArtworks] = useState([]);

  useEffect(() => {
    fetch('https://collectionapi.metmuseum.org/public/collection/v1/objects?hasImages=true')
      .then((response) => response.json())
      .then((data) => {
        const randomObjectIDs = getRandomElements(data.objectIDs, 10);
        const artworkPromises = randomObjectIDs.map((id) =>
          fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`)
            .then((response) => response.json())
            .then((artworkData) => (artworkData.primaryImageSmall ? { ...artworkData, type: 'met' } : null))
        );

        Promise.all(artworkPromises)
          .then((artworksData) => {
            const validArtworks = artworksData.filter((artwork) => artwork !== null).slice(0, 3);
            setMetArtworks(validArtworks);
          })
          .catch((error) => console.error('Error fetching artwork details:', error));
      })
      .catch((error) => console.error('Error fetching objectIDs:', error));

    fetch('https://openaccess-api.clevelandart.org/api/artworks/?has_image=1&limit=100')
      .then((response) => response.json())
      .then((data) => {
        const shuffledArtworks = shuffleArray(data.data);
        const validArtworks = shuffledArtworks.filter((item) => item.images?.web?.url).slice(0, 3);
        setClevelandArtworks(validArtworks.map(artwork => ({ ...artwork, type: 'cleveland' })));
      })
      .catch((error) => console.error('Error fetching Cleveland artworks:', error));
  }, []);

  const getRandomElements = (arr, num) => [...arr].sort(() => 0.5 - Math.random()).slice(0, num);
  const shuffleArray = (array) => array.sort(() => Math.random() - 0.5);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', textAlign: 'center', color: '#B0B0B0' }}>
      <h2 style={{ fontSize: '45px', textAlign: 'center', fontWeight: '600', marginBottom: '20px', color: '#B0B0B0' }}>
        "Browse, Discover, and Save Artworks from Leading Museums"
      </h2>

      {/* Met Museum Section */}
      <section style={{ marginTop: '40px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '10px', color: '#B0B0B0' }}>
          Featured Artworks from the Met Museum
        </h2>
        <p style={{ fontSize: '18px', lineHeight: '1.6', color: '#B0B0B0' }}>
          Explore a selection of stunning artworks from the Metropolitan Museum of Art's collection.
        </p>

        {metArtworks.length > 0 ? (
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {metArtworks.map((artwork) => (
              <div key={artwork.objectID} style={{ textAlign: 'center', width: '300px', marginBottom: '20px' }}>
                <Link to={`/art/${artwork.objectID}`} style={{ textDecoration: 'none', color: 'inherit' }}>
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
                  <h3 style={{ fontSize: '20px', marginTop: '10px', fontWeight: '600', color: '#B0B0B0' }}>
                    {artwork.title || 'Untitled'}
                  </h3>
                  <p style={{ fontSize: '16px', color: '#B0B0B0' }}>
                    {artwork.artistDisplayName || 'Artist Unknown'}
                  </p>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#B0B0B0' }}>Loading artworks...</p>
        )}

        <div style={{ marginTop: '20px' }}>
          <Link to="/browse" style={buttonStyle}>Explore The Met</Link>
        </div>
      </section>

      {/* Cleveland Museum of Art Section */}
      <section style={{ marginTop: '40px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '10px', color: '#B0B0B0' }}>
          Featured Artworks from Cleveland Museum
        </h2>
        <p style={{ fontSize: '18px', lineHeight: '1.6', color: '#B0B0B0' }}>
          Discover incredible artworks from the Cleveland Museum of Art.
        </p>

        {clevelandArtworks.length > 0 ? (
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {clevelandArtworks.map((artwork) => (
              <div key={artwork.id} style={{ textAlign: 'center', width: '300px', marginBottom: '20px' }}>
                <Link to={`/art2/${artwork.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
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
                  <h3 style={{ fontSize: '20px', marginTop: '10px', fontWeight: '600', color: '#B0B0B0' }}>
                    {artwork.title || 'Untitled'}
                  </h3>
                  <p style={{ fontSize: '16px', color: '#B0B0B0' }}>
                    {artwork.creators?.map((creator) => creator?.description).join(', ') || 'Artist Unknown'}
                  </p>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#B0B0B0' }}>Loading artworks...</p>
        )}

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
