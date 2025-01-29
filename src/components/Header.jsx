import { Link } from "react-router-dom";

const Header = () => {
  return (
    <div className="header-container">
      <h1>ArtQuest</h1>
      <p className="nav-links">
        <Link to="/">Home</Link>
        

         {/* Dropdown Menu */}
         <div className="dropdown">
          <button className="dropbtn">Browse</button>
          <div className="dropdown-content">
            <Link to="/browse">The Met</Link>
            <Link to="/browse2">Cleveland Museum</Link>
          </div>
        </div>

       

        <Link to="/exhibition">Exhibition</Link>
      </p>
      
    </div>
  );
};

export default Header;
