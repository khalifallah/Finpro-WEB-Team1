import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { axiosInstance } from "@/libs/axios/axios.config";
import { 
  FaShoppingCart, 
  FaUser, 
  FaStore, 
  FaMapMarkerAlt, 
  FaChevronDown,
  FaChevronUp,
  FaBars,
  FaTimes,
  FaSearch,
  FaPhone,
  FaClock,
  FaMotorcycle,
  FaStar
} from "react-icons/fa";

interface Category {
  id: number;
  name: string;
  productCount: number;
}

interface FeaturedLink {
  name: string;
  url: string;
  icon?: string;
}

interface StoreInfo {
  id: number;
  name: string;
  address: string;
  distance?: number;
  phone?: string;
  hours?: string;
  deliveryTime?: string;
  rating?: number;
  isOpen?: boolean;
}

interface NavbarProps {
  categories: Category[];
  featuredLinks: FeaturedLink[];
  selectedStore: StoreInfo | null;
  onStoreChange: (storeId: number) => void;
  onLocationRequest: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  categories,
  featuredLinks,
  selectedStore,
  onStoreChange,
  onLocationRequest,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isStoreMenuOpen, setIsStoreMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const { user, logout, isLoading } = useAuth();

  // Fetch cart count when user is logged in
  useEffect(() => {
    if (user) {
      fetchCartCount();
    }
  }, [user]);

  // Try to get user location on component mount
  useEffect(() => {
    const storedLocation = localStorage.getItem("userLocation");
    if (storedLocation) {
      setUserLocation(JSON.parse(storedLocation));
    }
  }, []);

  const fetchCartCount = async () => {
    try {
      const response = await axiosInstance.get("/auth/cart/summary");
      const cartSummary = response.data.data;
      if (cartSummary && !cartSummary.isEmpty) {
        setCartCount(cartSummary.totalItems || 0);
      } else {
        setCartCount(0);
      }
    } catch (error) {
      console.error("Error fetching cart count:", error);
      setCartCount(0);
    }
  };

   // Store info card component
  const StoreInfoCard = () => (
    <div className="bg-gradient-to-r from-primary/10 to-secondary/5 rounded-xl p-3 md:p-4 border border-primary/20">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <FaStore className="text-primary text-sm md:text-base" />
            <h3 className="font-bold text-sm md:text-base truncate">
              {selectedStore?.name || "Select a Store"}
            </h3>
            {selectedStore?.isOpen !== undefined && (
              <span className={`badge badge-sm ${selectedStore.isOpen ? 'badge-success' : 'badge-error'}`}>
                {selectedStore.isOpen ? 'Open' : 'Closed'}
              </span>
            )}
          </div>
          
          {selectedStore?.address && (
            <div className="flex items-start gap-2 mb-2">
              <FaMapMarkerAlt className="text-gray-500 mt-1 flex-shrink-0 text-xs md:text-sm" />
              <p className="text-xs md:text-sm text-gray-600 line-clamp-2">
                {selectedStore.address}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 md:gap-3 mt-2">
            {selectedStore?.distance && (
              <div className="flex items-center gap-1">
                <span className="text-xs md:text-sm font-semibold text-primary">
                  {selectedStore.distance.toFixed(1)} km
                </span>
                <span className="text-xs text-gray-500">away</span>
              </div>
            )}
            
            {selectedStore?.deliveryTime && (
              <div className="flex items-center gap-1">
                <FaMotorcycle className="text-success text-xs" />
                <span className="text-xs md:text-sm text-gray-700">
                  {selectedStore.deliveryTime}
                </span>
              </div>
            )}
            
            {selectedStore?.rating && (
              <div className="flex items-center gap-1">
                <FaStar className="text-yellow-500 text-xs" />
                <span className="text-xs md:text-sm font-medium">
                  {selectedStore.rating.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Change Store Button */}
        <button
          onClick={() => {
            setIsStoreMenuOpen(!isStoreMenuOpen);
            onLocationRequest();
          }}
          className="btn btn-xs md:btn-sm btn-outline btn-primary ml-2 flex-shrink-0"
          aria-label="Change store"
        >
          <span className="hidden md:inline">Change</span>
          <span className="md:hidden">↻</span>
        </button>
      </div>
    </div>
  );

  // Mobile Store Menu
  const MobileStoreMenu = () => (
    <div className="lg:hidden">
      <div className="flex items-center justify-between p-3 bg-base-100 border-b">
        <div className="flex items-center gap-2">
          <FaMapMarkerAlt className="text-primary" />
          <span className="font-medium">Current Store</span>
        </div>
        <button
          onClick={() => setIsStoreMenuOpen(!isStoreMenuOpen)}
          className="btn btn-ghost btn-sm"
        >
          {isStoreMenuOpen ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </div>
      
      {isStoreMenuOpen && (
        <div className="p-4 bg-base-100 border-b">
          <StoreInfoCard />
          
          <div className="mt-4 space-y-2">
            <button
              onClick={onLocationRequest}
              className="btn btn-primary btn-block"
            >
              <FaMapMarkerAlt className="mr-2" />
              Use My Location
            </button>
            
            <button
              onClick={() => {
                // In a real app, this would open a store list
                onLocationRequest();
              }}
              className="btn btn-outline btn-block"
            >
              Browse All Stores
            </button>
          </div>
        </div>
      )}
    </div>
  );
  
  function getIcon(icon: string | undefined): React.ReactNode {
    if (!icon) return null;
    
    const iconMap: { [key: string]: React.ReactNode } = {
      'shopping-cart': <FaShoppingCart className="mr-2" />,
      'user': <FaUser className="mr-2" />,
      'store': <FaStore className="mr-2" />,
      'location': <FaMapMarkerAlt className="mr-2" />,
      'phone': <FaPhone className="mr-2" />,
      'clock': <FaClock className="mr-2" />,
      'motorcycle': <FaMotorcycle className="mr-2" />,
      'star': <FaStar className="mr-2" />,
      'search': <FaSearch className="mr-2" />,
    };
    
    return iconMap[icon.toLowerCase()] || null;
  }

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-base-100 shadow-lg">
        <div className="container mx-auto px-4">
          {/* Top Row - Logo, Search, User Actions */}
          <div className="flex items-center justify-between h-16">
            {/* Logo & Mobile Menu Button */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden btn btn-ghost btn-square"
                aria-label="Menu"
              >
                {isMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
              </button>
              
              <Link href="/" className="flex-shrink-0">
                <div className="flex items-center gap-2">
                  <img
                    src="Beyond_Market_compressed.png"
                    alt="Beyond Market"
                    className="h-8 w-auto"
                  />
                  <span className="hidden sm:inline font-bold text-xl text-primary">
                    Beyond Market
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Search Bar */}
            <div className="hidden lg:block flex-1 max-w-2xl mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for products, brands and more..."
                  className="input input-bordered w-full pl-10 pr-4 rounded-full"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>

            {/* User Actions */}
            <div className="flex items-center gap-4">
              {/* Mobile Search Button */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="lg:hidden btn btn-ghost btn-square"
                aria-label="Search"
              >
                <FaSearch size={18} />
              </button>

              {/* Cart Icon */}
              <Link href="/cart" className="btn btn-ghost btn-square relative">
                <FaShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 badge badge-primary badge-sm min-w-[1.25rem]">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* User Profile */}
              {user ? (
                <div className="dropdown dropdown-end">
                  <div
                    tabIndex={0}
                    className="btn btn-ghost btn-circle avatar ring ring-transparent hover:ring-primary/20 transition-all"
                  >
                    <div className="w-10 rounded-full">
                      {user.photoUrl ? (
                        <img alt="User" src={user.photoUrl} />
                      ) : (
                        <span className="text-lg font-bold bg-neutral text-white w-full h-full flex items-center justify-center">
                          {user.fullName?.charAt(0)}
                        </span>
                      )}
                    </div>
                  </div>
                  <ul
                    tabIndex={0}
                    className="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-56 mt-2 border"
                  >
                    <li className="menu-title px-4 py-2">
                      <p className="font-bold">{user.fullName}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </li>
                    <li><Link href="/profile">My Profile</Link></li>
                    <li><Link href="/orders">My Orders</Link></li>
                    <li><Link href="/wishlist">Wishlist</Link></li>
                    <div className="divider my-1"></div>
                    <li>
                      <button onClick={logout} className="text-error">
                        Logout
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="btn btn-primary btn-sm rounded-full px-6 hidden sm:inline-flex"
                >
                  Login
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Search Bar */}
          {isSearchOpen && (
            <div className="lg:hidden py-3 border-t">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="input input-bordered w-full pl-10 pr-4"
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          )}

          {/* Store Information Row - Desktop */}
          <div className="hidden lg:block py-3 border-t">
            <div className="flex items-center justify-between">
              <div className="w-1/2">
                <StoreInfoCard />
              </div>
              
              {/* Store Actions */}
              <div className="flex items-center gap-4">
                {selectedStore?.phone && (
                  <a
                    href={`tel:${selectedStore.phone}`}
                    className="btn btn-ghost btn-sm"
                  >
                    <FaPhone className="mr-2" />
                    Call Store
                  </a>
                )}
                
                {selectedStore?.hours && (
                  <div className="flex items-center gap-1 text-sm">
                    <FaClock className="text-gray-500" />
                    <span>{selectedStore.hours}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Store Information Row - Mobile */}
        <MobileStoreMenu />

        {/* Desktop Navigation Menu */}
        <div className="hidden lg:block border-t">
          <div className="container mx-auto px-4">
            <div className="flex items-center h-12">
              {/* Categories Dropdown */}
              <div className="dropdown dropdown-hover">
                <div className="btn btn-ghost rounded-btn flex items-center gap-2">
                  <FaBars />
                  <span className="font-medium">All Categories</span>
                  <FaChevronDown className="text-xs" />
                </div>
                <ul className="dropdown-content menu p-2 shadow-lg bg-base-100 rounded-box w-64 z-50">
                  {categories.map((category) => (
                    <li key={category.id}>
                      <Link
                        href={`/products?category=${category.id}`}
                        className="flex justify-between py-3"
                      >
                        <span>{category.name}</span>
                        <span className="badge badge-ghost">
                          {category.productCount}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Navigation Links */}
              <div className="flex items-center ml-8 space-x-6">
                {featuredLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.url}
                    className="font-medium hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>

              {/* Promo Banner */}
              <div className="ml-auto">
                <div className="badge badge-secondary badge-lg p-3 animate-pulse">
                  🚚 Free Delivery • 🎁 10% Off First Order
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Side Menu */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="absolute left-0 top-0 h-full w-80 bg-base-100 shadow-xl">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Menu</h2>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="btn btn-ghost btn-circle"
                >
                  <FaTimes />
                </button>
              </div>
              
              {/* User Info in Mobile Menu */}
              {user && (
                <div className="mt-4 p-3 bg-base-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      <div className="w-12 rounded-full">
                        {user.photoUrl ? (
                          <img src={user.photoUrl} alt={user.fullName} />
                        ) : (
                          <span className="text-lg font-bold bg-neutral text-white w-full h-full flex items-center justify-center">
                            {user.fullName?.charAt(0)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="font-bold">{user.fullName}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Menu Content */}
            <div className="overflow-y-auto h-[calc(100vh-140px)]">
              <ul className="menu p-4 space-y-2">
                <li className="menu-title">Shopping</li>
                {featuredLinks.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.url}
                      onClick={() => setIsMenuOpen(false)}
                      className="py-3"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
                
                <div className="divider"></div>
                
                <li className="menu-title">Categories</li>
                {categories.map((category) => (
                  <li key={category.id}>
                    <Link
                      href={`/products?category=${category.id}`}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex justify-between py-3"
                    >
                      <span>{category.name}</span>
                      <span className="badge badge-ghost">
                        {category.productCount}
                      </span>
                    </Link>
                  </li>
                ))}
                
                {!user && (
                  <>
                    <div className="divider"></div>
                    <li>
                      <Link 
                        href="/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="btn btn-primary"
                      >
                        Login / Register
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Store Status Bar for Mobile */}
      {selectedStore && !isStoreMenuOpen && (
        <div className="lg:hidden fixed bottom-4 right-4 z-40">
          <button
            onClick={() => setIsStoreMenuOpen(true)}
            className="btn btn-primary btn-circle shadow-lg"
            aria-label="Store info"
          >
            <FaStore size={20} />
          </button>
        </div>
      )}
    </>
  );
};

export default Navbar;