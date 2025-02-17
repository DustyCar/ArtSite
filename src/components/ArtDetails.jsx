import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

const ArtDetails = () => {
  const { id } = useParams(); // Get the artwork ID from the URL
  const [artDetail, setArtDetail] = useState(null);
  const [alertMessage, setAlertMessage] = useState('');
  const [isAlertVisible, setIsAlertVisible] = useState(false); // State to manage alert visibility
  const navigate = useNavigate(); // Hook for navigation
  const location = useLocation(); // Determines which museum's page we came from

  // Determine the source based on the route
  const isFromMet = location.pathname.includes('/art/');
  const apiUrl = isFromMet
    ? `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`
    : `https://openaccess-api.clevelandart.org/api/artworks/${id}`;

  useEffect(() => {
    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => setArtDetail(data))
      .catch((error) => console.error('Error fetching artwork details:', error));
  }, [id, apiUrl]);

  const addToExhibition = () => {
    const savedArtworks = JSON.parse(localStorage.getItem('exhibitionArtworks')) || [];
    
    const newArtwork = isFromMet
      ? {
          id: artDetail.objectID,
          title: artDetail.title,
          image: artDetail.primaryImageSmall,
          artist: artDetail.artistDisplayName || 'Unknown Artist', // Default to "Unknown Artist"
          date: artDetail.objectDate || 'Date Unknown', // Default to "Date Unknown"
          source: 'Met',
        }
      : {
          id: artDetail.id,
          title: artDetail.title,
          image: artDetail.images?.web?.url,
          artist: artDetail.creators?.map((creator) => creator.description).join(', ') || 'Unknown Artist', // Default to "Unknown Artist"
          date: artDetail.creation_date || 'Date Unknown', // Default to "Date Unknown"
          source: 'Cleveland',
        };

    // Avoid duplicates
    if (!savedArtworks.some((art) => art.id === newArtwork.id)) {
      savedArtworks.push(newArtwork);
      localStorage.setItem('exhibitionArtworks', JSON.stringify(savedArtworks));

      const message = `${newArtwork.title || 'Untitled'} has been added to your exhibition!`;
      setAlertMessage(message);
      setIsAlertVisible(true);

      // Hide the alert after 1 second
      setTimeout(() => {
        setIsAlertVisible(false);
      }, 3000);
    } else {
      const message = `${newArtwork.title || 'Untitled'} is already in your exhibition.`;
      setAlertMessage(message);
      setIsAlertVisible(true);

      // Hide the alert after 1 second
      setTimeout(() => {
        setIsAlertVisible(false);
      }, 3000);
    }
  };

  if (!artDetail) {
    return <div>Loading...</div>; // Display loading while fetching
  }

  return (
    <div className="art-details">
      <h1>{artDetail.title || 'Untitled'}</h1>
      <img
        src={isFromMet ? artDetail.primaryImageSmall : artDetail.images?.web?.url}
        alt={artDetail.title}
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      <p><strong>Artist:</strong> {isFromMet ? artDetail.artistDisplayName || 'Unknown Artist' : artDetail.creators?.map((creator) => creator.description).join(', ') || 'Unknown Artist'}</p>
      <p><strong>Date:</strong> {isFromMet ? artDetail.objectDate || 'Date Unknown' : artDetail.creation_date || 'Date Unknown'}</p>
      
      {/* Back button */}
      <button onClick={() => navigate(-1)} style={{ marginTop: '20px', marginRight: '10px' }}>
        Go Back
      </button>

      {/* Add to Exhibition button */}
      <button onClick={addToExhibition} style={{ marginTop: '20px', backgroundColor: 'green' }}>
        Add to Exhibition
      </button>

      {/* Alert */}
      {isAlertVisible && (
        <div className="alert">
          <p>{alertMessage}</p>
        </div>
      )}
    </div>
  );
};

export default ArtDetails;



