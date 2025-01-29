import React from 'react';
import './App.css';
import Home from './components/Home';
import Header from './components/Header';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BrowseArt from './components/BrowseArt';
import BrowseArt2 from './components/BrowseArt2';
import Exhibition from './components/Exhibition';
import ArtDetails from './components/ArtDetails'; // Import the ArtDetails component
import ArtDetails2 from './components/ArtDetails2';


function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <header>
          <Header />
        </header>
        <main className="main">
          <Routes>
          <Route path="/" element={<Home />} />
              <Route path="/browse" element={<BrowseArt />} />
              <Route path="/exhibition" element={<Exhibition />} />
              <Route path="/browse2" element={<BrowseArt2 />} />
              <Route path="/art/:id" element={<ArtDetails />} />  {/* Route for ArtDetails */}
               <Route path="/art2/:id" element={<ArtDetails2 />} /> {/* Route for ArtDetails2 */}
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;




