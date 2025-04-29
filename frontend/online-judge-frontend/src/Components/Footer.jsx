import React from 'react';
//import './Footer.css'; // Import the CSS file
import './css/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <span className="footer-text">
          © 2023 <a href="https://flowbite.com/" className="footer-link">Flowbite™</a>. All Rights Reserved.
        </span>
        <ul className="footer-links">
          <li><a href="#" className="footer-link">About</a></li>
          <li><a href="#" className="footer-link">Privacy Policy</a></li>
          <li><a href="#" className="footer-link">Licensing</a></li>
          <li><a href="#" className="footer-link">Contact</a></li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;