import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Exhibition = () => {
  const [metArtworks, setMetArtworks] = useState([]);
  const [clevelandArtworks, setClevelandArtworks] = useState([]);

  useEffect(() => {
    const savedArtworks = JSON.parse(localStorage.getItem('exhibitionArtworks')) || [];

    // Categorize artworks by source
    const met = savedArtworks.filter(art => art.source === 'Met');
    const cleveland = savedArtworks.filter(art => art.source === 'Cleveland');

    setMetArtworks(met);
    setClevelandArtworks(cleveland);
  }, []);

  const removeArtwork = (id) => {
    const updatedArtworks = [...metArtworks, ...clevelandArtworks].filter(art => art.id !== id);
    setMetArtworks(updatedArtworks.filter(art => art.source === 'Met'));
    setClevelandArtworks(updatedArtworks.filter(art => art.source === 'Cleveland'));

    localStorage.setItem('exhibitionArtworks', JSON.stringify(updatedArtworks));
  };

  return (
    <div>
      <h1>Your Exhibition</h1>

      {/* Met Artworks Section */}
      {metArtworks.length > 0 && (
        <div>
          <h2>The Metropolitan Museum of Art</h2>
          <div className="exhibition-gallery">
            {metArtworks.map((art) => (
              <div key={art.id} className="art-item">
                <Link to={`/art/${art.id}`}>
                  <img src={art.image} alt={art.title || 'Untitled'} style={{ maxWidth: '100%', height: 'auto' }} />
                  <h3>{art.title || 'Untitled'}</h3>
                </Link>
                <p><strong>Artist:</strong> {art.artist || 'Unknown Artist'}</p>
                <p><strong>Date:</strong> {art.date || 'Date Unknown'}</p>
                <button onClick={() => removeArtwork(art.id)}>Remove</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cleveland Artworks Section */}
      {clevelandArtworks.length > 0 && (
        <div>
          <h2>The Cleveland Museum of Art</h2>
          <div className="exhibition-gallery">
            {clevelandArtworks.map((art) => (
              <div key={art.id} className="art-item">
                <Link to={`/art2/${art.id}`}>
                  <img src={art.image} alt={art.title || 'Untitled'} style={{ maxWidth: '100%', height: 'auto' }} />
                  <h3>{art.title || 'Untitled'}</h3>
                </Link>
                <p><strong>Artist:</strong> {art.artist || 'Unknown Artist'}</p>
                <p><strong>Date:</strong> {art.date || 'Date Unknown'}</p>
                <button onClick={() => removeArtwork(art.id)}>Remove</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {metArtworks.length === 0 && clevelandArtworks.length === 0 && (
        <div>No artworks in your exhibition yet.</div>
      )}
    </div>
  );
};

export default Exhibition;


