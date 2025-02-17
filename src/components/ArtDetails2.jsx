import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

const ArtDetails2 = () => {
  const { id } = useParams(); // Get artwork ID from URL
  const [artDetail, setArtDetail] = useState(null); // State for artwork details
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error handling
  const [alertMessage, setAlertMessage] = useState('');
  const [isAlertVisible, setIsAlertVisible] = useState(false); // State to manage alert visibility
  const navigate = useNavigate(); // Hook to navigate
  const location = useLocation(); // Determines which museum's page we came from

  // Determine if this is from the Cleveland Museum
  const isFromCleveland = location.pathname.includes('/art2/');

  const apiUrl = isFromCleveland
    ? `https://openaccess-api.clevelandart.org/api/artworks/${id}`
    : `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`;

  useEffect(() => {
    if (!id) {
      setError("Artwork ID is missing.");
      setLoading(false);
      return;
    }

    setLoading(true);

    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => {
        if (data.data || data.objectID) {
          setArtDetail(data.data || data); // Set fetched data
        } else {
          setError('No artwork details found.');
        }
        setLoading(false);
      })
      .catch((error) => {
        setError('Error fetching artwork details: ' + error.message);
        setLoading(false);
      });
  }, [id, apiUrl]);

  const addToExhibition = () => {
    if (!artDetail) return;

    const savedArtworks = JSON.parse(localStorage.getItem('exhibitionArtworks')) || [];

    const newArtwork = isFromCleveland
      ? {
          id: artDetail.id,
          image: artDetail.images?.web?.url || null,
          title: artDetail.title,
          artist: artDetail.creators?.map(creator => creator.description).join(', ') || 'Unknown Artist',
          date: artDetail.creation_date || 'Date Unknown',
          source: 'Cleveland',
        }
      : {
          id: artDetail.objectID,
          title: artDetail.title,
          image: artDetail.primaryImageSmall,
          artist: artDetail.artistDisplayName,
          date: artDetail.objectDate,
          source: 'Met',
        };

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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="art-details">
      <h1>{artDetail.title || 'Untitled'}</h1>
      {artDetail.images?.web?.url || artDetail.primaryImageSmall ? (
        <img
          src={isFromCleveland ? artDetail.images.web.url : artDetail.primaryImageSmall}
          alt={artDetail.title || 'Artwork'}
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      ) : (
        <p>No image available.</p>
      )}
      <p><strong>Artist:</strong> {artDetail.creators?.map(creator => creator.description).join(', ') || artDetail.artistDisplayName || 'Unknown Artist'}</p>
      <p><strong>Date:</strong> {artDetail.creation_date || artDetail.objectDate || 'Date Unknown'}</p>
      
      {/* Back button */}
      <button onClick={() => navigate(-1)} style={{ marginTop: '20px' }}>
        Go Back
      </button>

      {/* Add to Exhibition button */}
      <button onClick={addToExhibition} style={{ marginTop: '20px', marginLeft: '10px', backgroundColor: 'green' }}>
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

export default ArtDetails2;







