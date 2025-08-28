
const Footer = () => {
  return (
    <footer id="footer" className="bg-[#f2f2f2] text-gray-600 py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* About */}
        <div>
          <h3 className="text-xl font-medium text-black mb-3">KalaConnect</h3>
          <p className="text-black">
            Your one-stop platform to discover and book talented artists for your events. 
            Connecting creativity with opportunity.
          </p>
        </div>

        <div>
          <h4 className="text-lg font-medium text-black-800 mb-3">Quick Links</h4>
          <ul className="space-y-2">
            <li><a href="/about" className="hover:text-purple-500">About Us</a></li>
            <li><a href="/category" className="hover:text-purple-500">Categories</a></li>
            <li><a href="/my-bookings" className="hover:text-purple-500">Bookings</a></li>
            <li><a href="/contact" className="hover:text-purple-500">Contact</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-medium text-black mb-3">Contact Us</h4>
          <p className="text-gray-500">Email: support@kalaconnect.com</p>
          <p className="text-gray-500">Phone: +977 (123) 456-7890</p>
          <div className="flex space-x-4 mt-3">
            <a href="#" className="hover:text-purple-500">Facebook</a>
            <a href="#" className="hover:text-purple-500">Instagram</a>
            <a href="#" className="hover:text-purple-500">Twitter</a>
          </div>
        </div>

      </div>

      <div className="border-t border-gray-700 mt-8 pt-4 text-center text-gray-600 text-sm">
        © {new Date().getFullYear()} KalaConnect. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;