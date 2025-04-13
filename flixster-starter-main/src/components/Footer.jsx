import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-links">
                    <a href="#" className="footer-link">FAQ</a>
                    <a href="#" className="footer-link">Help Center</a>
                    <a href="#" className="footer-link">Terms of Use</a>
                    <a href="#" className="footer-link">Privacy</a>
                    <a href="#" className="footer-link">Cookie Preferences</a>
                    <a href="#" className="footer-link">Corporate Information</a>
                </div>
                <div className="footer-social">
                    <a href="#" className="social-link">Facebook</a>
                    <a href="#" className="social-link">Instagram</a>
                    <a href="#" className="social-link">Twitter</a>
                    <a href="#" className="social-link">YouTube</a>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; 2024 Gabriella, Inc.</p>
            </div>
        </footer>
    );
};

export default Footer;