'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface University {
  id: string;
  name: string;
  slug: string;
  country: {
    id: string;
    name: string;
    code: string;
  };
  city: string;
  logo?: {
    url: string;
    publicId: string;
  };
  coverImage?: {
    url: string;
    publicId: string;
  };
  website?: string;
  institutionType?: 'public' | 'private' | 'other';
  isActive: boolean;
  establishedYear?: number;
  popularSubjects?: string[];
}

interface Country {
  id: string;
  name: string;
  code: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function UniversitiesPage() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Filters
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedCountryId, setSelectedCountryId] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [countries, setCountries] = useState<Country[]>([]);
  
  // Infinite scroll
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch countries for filter
  useEffect(() => {
    fetchCountries();
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchUniversities(1, true);
  }, [search, selectedCountryId, selectedCity, selectedType, selectedStatus]);

  // Debounce search input
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setSearch(searchInput);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchInput]);

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
  }, [hasMore, loadingMore, loading, currentPage]);

  const fetchCountries = async () => {
    try {
      const response = await fetch('/api/countries');
      const data = await response.json();
      if (data.success) {
        setCountries(data.data);
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };

  const fetchUniversities = async (page: number, reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '6',
      });

      if (search) params.append('search', search);
      if (selectedCountryId) params.append('countryId', selectedCountryId);
      if (selectedCity) params.append('city', selectedCity);
      if (selectedType) params.append('institutionType', selectedType);
      if (selectedStatus) params.append('isActive', selectedStatus);

      const response = await fetch(`/api/universities?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        const newUniversities = result.data.data.map((uni: any) => ({
          id: uni._id || uni.id,
          name: uni.name,
          slug: uni.slug,
          country: uni.country,
          city: uni.city,
          logo: uni.logo,
          coverImage: uni.coverImage,
          website: uni.website,
          institutionType: uni.institutionType,
          isActive: uni.isActive,
          establishedYear: uni.establishedYear,
          popularSubjects: uni.popularSubjects,
        }));

        if (reset) {
          setUniversities(newUniversities);
          setCurrentPage(1);
        } else {
          // Check for duplicates before adding
          setUniversities((prev) => {
            const existingIds = new Set(prev.map(u => u.id));
            const uniqueNew = newUniversities.filter((u: University) => !existingIds.has(u.id));
            return [...prev, ...uniqueNew];
          });
        }

        setPagination(result.data.pagination);
        setHasMore(result.data.pagination.page < result.data.pagination.pages);
      } else {
        setError(result.error?.message || 'Failed to load universities');
      }
    } catch (err) {
      setError('Failed to load universities');
      console.error('Error fetching universities:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (hasMore && !loadingMore && pagination) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchUniversities(nextPage, false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      const response = await fetch(`/api/universities/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        setUniversities((prev) => prev.filter((u) => u.id !== id));
      } else {
        alert('Failed to delete university');
      }
    } catch (error) {
      console.error('Error deleting university:', error);
      alert('Failed to delete university');
    }
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearch('');
    setSelectedCountryId('');
    setSelectedCity('');
    setSelectedType('');
    setSelectedStatus('');
  };

  if (loading && universities.length === 0) {
    return <LoadingState />;
  }

  if (error && universities.length === 0) {
    return <ErrorState error={error} onRetry={() => fetchUniversities(1, true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Static Content */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Discover World-Class Universities
          </h1>
          <p className="text-xl text-indigo-100 max-w-3xl mx-auto mb-6">
            Explore top universities from around the globe. Find the perfect institution that matches 
            your academic goals, budget, and career aspirations.
          </p>
          <div className="flex justify-center gap-4">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-6 py-3">
              <p className="text-2xl font-bold">{pagination?.total || '0'}</p>
              <p className="text-sm text-indigo-100">Universities</p>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-6 py-3">
              <p className="text-2xl font-bold">{countries.length}+</p>
              <p className="text-sm text-indigo-100">Countries</p>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-6 py-3">
              <p className="text-2xl font-bold">100%</p>
              <p className="text-sm text-indigo-100">Free Service</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Browse Universities</h2>
            {pagination && (
              <p className="text-gray-600 mt-1">
                Showing {universities.length} of {pagination.total} universities
              </p>
            )}
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            + Add University
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search by Name
              </label>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search universities..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Country Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <select
                value={selectedCountryId}
                onChange={(e) => setSelectedCountryId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Countries</option>
                {countries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            {/* City Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                placeholder="Filter by city..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Institution Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Institution Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Universities Grid */}
        {universities.length === 0 ? (
          <EmptyState hasFilters={!!(search || selectedCountryId || selectedCity || selectedType || selectedStatus)} />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {universities.map((university) => (
                <UniversityCard
                  key={university.id}
                  university={university}
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
            {!hasMore && universities.length > 0 && (
              <div className="text-center py-8 text-gray-500">
                You've reached the end of the list
              </div>
            )}
          </>
        )}
      </div>

      {showAddModal && (
        <AddUniversityModal
          countries={countries}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchUniversities(1, true);
          }}
        />
      )}
    </div>
  );
}

// University Card Component
function UniversityCard({
  university,
  onDelete,
}: {
  university: University;
  onDelete: (id: string, name: string) => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Cover/Logo Image */}
      <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-50">
        {university.coverImage ? (
          <Image
            src={university.coverImage.url}
            alt={`${university.name} cover`}
            fill
            className="object-cover"
          />
        ) : university.logo ? (
          <div className="flex items-center justify-center h-full bg-white">
            <Image
              src={university.logo.url}
              alt={`${university.name} logo`}
              width={120}
              height={120}
              className="object-contain"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <span className="text-6xl opacity-30">🎓</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <Link
          href={`/universities/${university.id}`}
          className="block hover:text-blue-600 transition-colors"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
            {university.name}
          </h3>
        </Link>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">🌍</span>
            <span>{university.country.name}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">📍</span>
            <span>{university.city}</span>
          </div>
          {university.website && (
            <div className="flex items-center text-sm text-gray-600">
              <span className="mr-2">🔗</span>
              <a
                href={university.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline truncate"
                onClick={(e) => e.stopPropagation()}
              >
                Website
              </a>
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {university.institutionType && (
            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
              {university.institutionType}
            </span>
          )}
          <span
            className={`px-2 py-1 text-xs font-medium rounded ${
              university.isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {university.isActive ? 'Active' : 'Inactive'}
          </span>
          {university.establishedYear && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
              Est. {university.establishedYear}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-gray-200">
          <Link
            href={`/universities/${university.id}`}
            className="flex-1 text-center px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
          >
            View
          </Link>
          <Link
            href={`/universities/${university.id}/edit`}
            className="flex-1 text-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded transition-colors"
          >
            Edit
          </Link>
          <button
            onClick={() => onDelete(university.id, university.name)}
            className="flex-1 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// Add University Modal Component (continued in next part due to length)
function AddUniversityModal({
  countries,
  onClose,
  onSuccess,
}: {
  countries: Country[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    countryId: '',
    city: '',
    website: '',
    address: '',
    description: '',
    institutionType: '',
    establishedYear: '',
    isActive: true,
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) {
      setError('Only PNG, JPEG, and WebP images are allowed');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('File size must be less than 2MB');
      return;
    }

    setError(null);
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) {
      setError('Only PNG, JPEG, and WebP images are allowed');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('File size must be less than 2MB');
      return;
    }

    setError(null);
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (value: string) => {
    setFormData({ ...formData, name: value, slug: generateSlug(value) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setUploading(true);

    try {
      let logoData = undefined;
      let coverData = undefined;

      // Upload logo if selected
      if (logoFile) {
        const formDataUpload = new FormData();
        formDataUpload.append('file', logoFile);

        const uploadResponse = await fetch('/api/uploads/university-logo', {
          method: 'POST',
          body: formDataUpload,
        });

        const uploadResult = await uploadResponse.json();

        if (!uploadResult.success) {
          throw new Error(uploadResult.error?.message || 'Failed to upload logo');
        }

        logoData = uploadResult.data;
      }

      // Upload cover if selected
      if (coverFile) {
        const formDataUpload = new FormData();
        formDataUpload.append('file', coverFile);

        const uploadResponse = await fetch('/api/uploads/university-cover', {
          method: 'POST',
          body: formDataUpload,
        });

        const uploadResult = await uploadResponse.json();

        if (!uploadResult.success) {
          throw new Error(uploadResult.error?.message || 'Failed to upload cover image');
        }

        coverData = uploadResult.data;
      }

      // Create university
      const payload: any = {
        name: formData.name,
        slug: formData.slug,
        countryId: formData.countryId,
        city: formData.city,
        isActive: formData.isActive,
      };

      if (logoData) payload.logo = logoData;
      if (coverData) payload.coverImage = coverData;
      if (formData.website) payload.website = formData.website;
      if (formData.address) payload.address = formData.address;
      if (formData.description) payload.description = formData.description;
      if (formData.institutionType) payload.institutionType = formData.institutionType;
      if (formData.establishedYear) payload.establishedYear = parseInt(formData.establishedYear);

      const response = await fetch('/api/universities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
      } else {
        setError(data.error?.message || 'Failed to create university');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8">
        <h2 className="text-2xl font-bold mb-4">Add New University</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              University Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., University of Melbourne"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug * (auto-generated, editable)
            </label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="university-of-melbourne"
            />
          </div>

          {/* Country and City */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country *
              </label>
              <select
                required
                value={formData.countryId}
                onChange={(e) => setFormData({ ...formData, countryId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Country</option>
                {countries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Melbourne"
              />
            </div>
          </div>

          {/* Institution Type and Established Year */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Institution Type
              </label>
              <select
                value={formData.institutionType}
                onChange={(e) => setFormData({ ...formData, institutionType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Type</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Established Year
              </label>
              <input
                type="number"
                min="1000"
                max={new Date().getFullYear()}
                value={formData.establishedYear}
                onChange={(e) => setFormData({ ...formData, establishedYear: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 1853"
              />
            </div>
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website (must be HTTPS)
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://www.example.edu"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Full address"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief description of the university"
            />
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo (Optional, max 2MB)
            </label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleLogoChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {logoPreview && (
              <div className="mt-2">
                <Image
                  src={logoPreview}
                  alt="Logo preview"
                  width={100}
                  height={100}
                  className="rounded border border-gray-300 object-contain"
                />
              </div>
            )}
          </div>

          {/* Cover Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Image (Optional, max 2MB)
            </label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleCoverChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {coverPreview && (
              <div className="mt-2">
                <Image
                  src={coverPreview}
                  alt="Cover preview"
                  width={200}
                  height={100}
                  className="rounded border border-gray-300 object-cover"
                />
              </div>
            )}
          </div>

          {/* Active Status */}
          <div>
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

          <div className="flex justify-end gap-3 pt-4 border-t">
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
              {uploading ? 'Creating...' : 'Create University'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Loading State Component
function LoadingState() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Static (Always visible) */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Discover World-Class Universities
          </h1>
          <p className="text-xl text-indigo-100 max-w-3xl mx-auto mb-6">
            Explore top universities from around the globe. Find the perfect institution that matches 
            your academic goals, budget, and career aspirations.
          </p>
          <div className="flex justify-center gap-4">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-6 py-3">
              <p className="text-2xl font-bold">...</p>
              <p className="text-sm text-indigo-100">Universities</p>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-6 py-3">
              <p className="text-2xl font-bold">...</p>
              <p className="text-sm text-indigo-100">Countries</p>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-6 py-3">
              <p className="text-2xl font-bold">100%</p>
              <p className="text-sm text-indigo-100">Free Service</p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-5">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Error State Component
function ErrorState({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
        <div className="text-red-600 text-5xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Universities</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={onRetry}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
      <div className="text-6xl mb-4">🎓</div>
      <h3 className="text-2xl font-semibold text-gray-700 mb-2">
        {hasFilters ? 'No universities found' : 'No Universities Yet'}
      </h3>
      <p className="text-gray-500 mb-6">
        {hasFilters
          ? 'Try adjusting your filters to find what you\'re looking for'
          : 'Be the first to add a university!'}
      </p>
    </div>
  );
}
