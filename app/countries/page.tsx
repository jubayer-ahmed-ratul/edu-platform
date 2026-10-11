'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Country {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  flag?: {
    url: string;
    publicId: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function CountriesPage() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [displayedCountries, setDisplayedCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    fetchCountries();
  }, []);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loadingMore, loading, currentPage, countries.length]);

  const fetchCountries = async () => {
    try {
      const response = await fetch('/api/countries');
      const data = await response.json();
      if (data.success) {
        const fetchedCountries = data.data.map((c: any) => ({
          id: c._id || c.id,
          name: c.name,
          code: c.code,
          isActive: c.isActive,
          flag: c.flag,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        }));
        setCountries(fetchedCountries);
        // Show first 6
        setDisplayedCountries(fetchedCountries.slice(0, ITEMS_PER_PAGE));
        setHasMore(fetchedCountries.length > ITEMS_PER_PAGE);
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (loadingMore || !hasMore) return;
    
    setLoadingMore(true);
    
    // Simulate loading delay for smooth UX
    setTimeout(() => {
      const nextPage = currentPage + 1;
      const startIndex = currentPage * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const moreCountries = countries.slice(startIndex, endIndex);
      
      if (moreCountries.length > 0) {
        setDisplayedCountries((prev) => [...prev, ...moreCountries]);
        setCurrentPage(nextPage);
        setHasMore(endIndex < countries.length);
      } else {
        setHasMore(false);
      }
      
      setLoadingMore(false);
    }, 500);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      const response = await fetch(`/api/countries/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        // Remove from both arrays
        setCountries((prev) => prev.filter((c) => c.id !== id));
        setDisplayedCountries((prev) => prev.filter((c) => c.id !== id));
      } else {
        alert('Failed to delete country');
      }
    } catch (error) {
      console.error('Error deleting country:', error);
      alert('Failed to delete country');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section - Static (Always visible) */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Explore Study Destinations
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-6">
              Discover the perfect country for your higher education journey. Browse through our comprehensive 
              list of destinations and find detailed information about each location.
            </p>
            <div className="flex justify-center gap-4">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-6 py-3">
                <p className="text-2xl font-bold">50+</p>
                <p className="text-sm text-blue-100">Countries</p>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-6 py-3">
                <p className="text-2xl font-bold">1000+</p>
                <p className="text-sm text-blue-100">Universities</p>
              </div>
              <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-6 py-3">
                <p className="text-2xl font-bold">24/7</p>
                <p className="text-sm text-blue-100">Support</p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading countries...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Static Content */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Explore Study Destinations
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-6">
            Discover the perfect country for your higher education journey. Browse through our comprehensive 
            list of destinations and find detailed information about each location.
          </p>
          <div className="flex justify-center gap-4">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-6 py-3">
              <p className="text-2xl font-bold">50+</p>
              <p className="text-sm text-blue-100">Countries</p>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-6 py-3">
              <p className="text-2xl font-bold">1000+</p>
              <p className="text-sm text-blue-100">Universities</p>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-6 py-3">
              <p className="text-2xl font-bold">24/7</p>
              <p className="text-sm text-blue-100">Support</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">All Countries</h2>
            <p className="text-gray-600 mt-1">
              {countries.length > 0 
                ? `Showing ${displayedCountries.length} of ${countries.length} countries`
                : 'Select a country to view detailed information'}
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            + Add Country
          </button>
        </div>

        {/* Countries Grid */}
        {displayedCountries.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedCountries.map((country, index) => (
                <CountryCard
                  key={country.id}
                  country={country}
                  index={index}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {/* Loading More Indicator */}
            {loadingMore && (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading more...</span>
              </div>
            )}

            {/* Infinite Scroll Trigger */}
            {hasMore && !loadingMore && (
              <div ref={observerTarget} className="h-20 flex items-center justify-center">
                <span className="text-gray-400 text-sm">Scroll for more</span>
              </div>
            )}

            {/* End of List */}
            {!hasMore && displayedCountries.length > 0 && (
              <div className="text-center py-8 text-gray-500">
                You've reached the end of the list
              </div>
            )}
          </>
        )}
      </div>

      {showAddModal && (
        <AddCountryModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchCountries();
          }}
        />
      )}
    </div>
  );
}

// Country Card Component with Animation
function CountryCard({
  country,
  index,
  onDelete,
}: {
  country: Country;
  index: number;
  onDelete: (id: string, name: string) => void;
}) {
  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 animate-slide-in-left"
      style={{
        animationDelay: `${(index % 6) * 100}ms`,
        opacity: 0,
        animation: `slideInLeft 0.5s ease-out ${(index % 6) * 100}ms forwards`,
      }}
    >
      {/* Flag Image */}
      <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-50">
        {country.flag ? (
          <Image
            src={country.flag.url}
            alt={`${country.name} flag`}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-6xl opacity-30">🌍</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <Link
          href={`/countries/${country.id}`}
          className="block hover:text-blue-600 transition-colors"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-2">{country.name}</h3>
        </Link>

        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {country.code}
          </span>
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full ${
              country.isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {country.isActive ? '● Active' : '● Inactive'}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-gray-200">
          <Link
            href={`/countries/${country.id}`}
            className="flex-1 text-center px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
          >
            View Details
          </Link>
          <Link
            href={`/countries/${country.id}/edit`}
            className="flex-1 text-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded transition-colors"
          >
            Edit
          </Link>
          <button
            onClick={() => onDelete(country.id, country.name)}
            className="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
      <div className="text-6xl mb-4">🌍</div>
      <h3 className="text-2xl font-semibold text-gray-700 mb-2">No Countries Yet</h3>
      <p className="text-gray-500 mb-6">Be the first to add study destinations!</p>
    </div>
  );
}

// Add Country Modal Component
function AddCountryModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    isActive: true,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) {
      setError('Only PNG, JPEG, and WebP images are allowed');
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('File size must be less than 2MB');
      return;
    }

    setError(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setUploading(true);

    try {
      let flagData = undefined;

      // Upload flag if selected
      if (selectedFile) {
        const formDataUpload = new FormData();
        formDataUpload.append('file', selectedFile);

        const uploadResponse = await fetch('/api/uploads/country-flag', {
          method: 'POST',
          body: formDataUpload,
        });

        const uploadResult = await uploadResponse.json();

        if (!uploadResult.success) {
          throw new Error(uploadResult.error?.message || 'Failed to upload flag');
        }

        flagData = uploadResult.data;
      }

      // Create country
      const response = await fetch('/api/countries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          flag: flagData,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
      } else {
        setError(data.error?.message || 'Failed to create country');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4">Add New Country</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Bangladesh"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country Code * (2-3 letters)
            </label>
            <input
              type="text"
              required
              maxLength={3}
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
              placeholder="e.g., BD"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Flag Image (Optional, max 2MB)
            </label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleFileChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">PNG, JPEG, or WebP format</p>
          </div>

          {previewUrl && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
              <Image
                src={previewUrl}
                alt="Flag preview"
                width={96}
                height={64}
                className="rounded border border-gray-300 object-cover"
              />
            </div>
          )}

          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Active</span>
            </label>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Creating...' : 'Create Country'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
