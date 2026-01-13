import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface NavbarProps {
  isAuthenticated: boolean;
  onLogout: () => void;
}

const Navbar = ({ isAuthenticated, onLogout }: NavbarProps) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
    `text-gray-200 hover:text-white transition-colors font-medium ${
      isActive ? 'text-white underline underline-offset-8' : ''
    }`;

  const mobileNavLinkClassName = ({ isActive }: { isActive: boolean }) =>
    `block px-3 py-2 rounded-md text-base font-medium ${
      isActive ? 'text-white bg-gray-800' : 'text-gray-200 hover:text-white hover:bg-gray-800'
    }`;

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-900 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-transparent flex-shrink-0">
                <img 
                  src="./logo_app.png" 
                  alt="FitTracker" 
                  className="w-full h-full object-cover object-center scale-125" 
                />
              </div>
              <span className="text-xl font-bold text-white">FitTracker</span>
            </Link>
          </div>

          <div className="hidden md:flex flex-1 items-center">
            <div className="flex-1 flex justify-center items-center space-x-8">
              {isAuthenticated && (
                <>
                  <NavLink to="/dashboard" className={navLinkClassName}>
                    Dashboard
                  </NavLink>
                  <NavLink to="/workouts" className={navLinkClassName}>
                    Workouts
                  </NavLink>
                  <NavLink to="/meals" className={navLinkClassName}>
                    Meals
                  </NavLink>
                  <NavLink to="/progress" className={navLinkClassName}>
                    Progress
                  </NavLink>
                  <NavLink to="/feed" className={navLinkClassName}>
                    Feed
                  </NavLink>
                  <NavLink to="/profile" className={navLinkClassName}>
                    Profile
                  </NavLink>
                </>
              )}
            </div>

            <div className="flex justify-end items-center space-x-4">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white transition-colors font-medium px-4 py-2 rounded"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-200 hover:text-white transition-colors font-medium"
                  >
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-200 hover:text-white focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gray-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {isAuthenticated ? (
              <>
                <NavLink
                  to="/dashboard"
                  className={mobileNavLinkClassName}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/workouts"
                  className={mobileNavLinkClassName}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Workouts
                </NavLink>
                <NavLink
                  to="/meals"
                  className={mobileNavLinkClassName}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Meals
                </NavLink>
                <NavLink
                  to="/progress"
                  className={mobileNavLinkClassName}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Progress
                </NavLink>
                <NavLink
                  to="/feed"
                  className={mobileNavLinkClassName}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Feed
                </NavLink>
                <NavLink
                  to="/profile"
                  className={mobileNavLinkClassName}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Profile
                </NavLink>
                <div className="px-3 py-2 border-t border-gray-700 mt-2">
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-red-600 hover:bg-red-700 text-white transition-colors font-medium px-4 py-2 rounded text-center"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-200 hover:text-white hover:bg-gray-800"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-800"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;