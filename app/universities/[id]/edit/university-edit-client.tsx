'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Country {
  id: string;
  name: string;
  code: string;
}

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
  description?: string;
  website?: string;
  address?: string;
  establishedYear?: number;
  institutionType?: 'public' | 'private' | 'other';
  ranking?: Array<{
    organization: string;
    rank: number;
    year: number;
  }>;
  internationalStudentInfo?: {
    totalStudents?: number;
    internationalStudents?: number;
    internationalPercentage?: number;
    scholarshipsAvailable?: boolean;
    applicationFee?: number;
    applicationFeeCurrency?: string;
  };
  popularSubjects?: string[];
  isActive: boolean;
}

export default function UniversityEditClient({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [university, setUniversity] = useState<University | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [countryId, setCountryId] = useState('');
  const [city, setCity] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [institutionType, setInstitutionType] = useState('');
  const [establishedYear, setEstablishedYear] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [popularSubjects, setPopularSubjects] = useState('');

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchCountries();
    fetchUniversity();
  }, [id]);

  // Warn before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges]);

  // Mark form as changed on any input
  useEffect(() => {
    if (university) {
      setHasChanges(true);
    }
  }, [name, slug, countryId, city, website, address, description, institutionType, establishedYear, isActive, popularSubjects]);

  const fetchCountries = async () => {
    try {
      const response = await fetch('/api/countries');
      const data = await response.json();
      if (data.success) {
        setCountries(data.data.map((c: any) => ({
          id: c._id || c.id,
          name: c.name,
          code: c.code,
        })));
      }
    } catch (error) {
      console.error('Error fetching countries:', error);
    }
  };

  const fetchUniversity = async () => {
    try {
      const response = await fetch(`/api/universities/${id}`);
      const data = await response.json();

      if (data.success) {
        const uni = data.data;
        const universityData: University = {
          id: uni._id || uni.id,
          name: uni.name,
          slug: uni.slug,
          country: uni.country,
          city: uni.city,
          logo: uni.logo,
          coverImage: uni.coverImage,
          description: uni.description,
          website: uni.website,
          address: uni.address,
          establishedYear: uni.establishedYear,
          institutionType: uni.institutionType,
          ranking: uni.ranking,
          internationalStudentInfo: uni.internationalStudentInfo,
          popularSubjects: uni.popularSubjects,
          isActive: uni.isActive,
        };

        setUniversity(universityData);
        setName(universityData.name);
        setSlug(universityData.slug);
        setCountryId(universityData.country.id);
        setCity(universityData.city);
        setWebsite(universityData.website || '');
        setAddress(universityData.address || '');
        setDescription(universityData.description || '');
        setInstitutionType(universityData.institutionType || '');
        setEstablishedYear(universityData.establishedYear?.toString() || '');
        setIsActive(universityData.isActive);
        setPopularSubjects(universityData.popularSubjects?.join(', ') || '');

        if (universityData.logo) {
          setLogoPreview(universityData.logo.url);
        }
        if (universityData.coverImage) {
          setCoverPreview(universityData.coverImage.url);
        }
      } else {
        setError(data.error?.message || 'Failed to load university');
      }
    } catch (err) {
      setError('Failed to load university details');
    } finally {
      setLoading(false);
    }
  };

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
    setHasChanges(true);
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
    setHasChanges(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      let logoData = university?.logo;
      let coverData = university?.coverImage;

      // Upload new logo if selected
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

      // Upload new cover if selected
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

      // Build update payload - only send changed fields
      const payload: any = {};

      if (name !== university?.name) payload.name = name;
      if (slug !== university?.slug) payload.slug = slug;
      if (countryId !== university?.country.id) payload.countryId = countryId;
      if (city !== university?.city) payload.city = city;
      if (website !== (university?.website || '')) payload.website = website || undefined;
      if (address !== (university?.address || '')) payload.address = address || undefined;
      if (description !== (university?.description || '')) payload.description = description || undefined;
      if (institutionType !== (university?.institutionType || '')) payload.institutionType = institutionType || undefined;
      if (establishedYear !== (university?.establishedYear?.toString() || '')) {
        payload.establishedYear = establishedYear ? parseInt(establishedYear) : undefined;
      }
      if (isActive !== university?.isActive) payload.isActive = isActive;
      if (logoFile && logoData) payload.logo = logoData;
      if (coverFile && coverData) payload.coverImage = coverData;

      // Handle popular subjects
      const subjectsArray = popularSubjects
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);
      const originalSubjects = university?.popularSubjects?.join(', ') || '';
      if (popularSubjects !== originalSubjects) {
        payload.popularSubjects = subjectsArray.length > 0 ? subjectsArray : undefined;
      }

      // Only send request if there are changes
      if (Object.keys(payload).length === 0) {
        setError('No changes to save');
        setSaving(false);
        return;
      }

      const response = await fetch(`/api/universities/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        setHasChanges(false);
        router.push(`/universities/${id}`);
      } else {
        setError(data.error?.message || 'Failed to update university');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error && !university) {
    return <ErrorState error={error} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
            <Link href="/universities" className="hover:text-gray-700">
              Universities
            </Link>
            <span>/</span>
            <Link href={`/universities/${id}`} className="hover:text-gray-700">
              {university?.name}
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Edit</span>
          </nav>
          <h1 className="text-2xl font-bold text-gray-900">Edit University</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    University Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country *
                    </label>
                    <select
                      required
                      value={countryId}
                      onChange={(e) => setCountryId(e.target.value)}
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
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Institution Type
                    </label>
                    <select
                      value={institutionType}
                      onChange={(e) => setInstitutionType(e.target.value)}
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
                      value={establishedYear}
                      onChange={(e) => setEstablishedYear(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Website (must be HTTPS)
                  </label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Popular Subjects (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={popularSubjects}
                    onChange={(e) => setPopularSubjects(e.target.value)}
                    placeholder="e.g., Engineering, Medicine, Business"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Enter subjects separated by commas
                  </p>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Images</h3>

              <div className="space-y-6">
                {/* Logo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo (max 2MB)
                  </label>
                  {logoPreview && (
                    <div className="mb-3">
                      <Image
                        src={logoPreview}
                        alt="Logo preview"
                        width={120}
                        height={120}
                        className="rounded border border-gray-300 object-contain bg-white p-2"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleLogoChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Upload a new logo to replace the existing one
                  </p>
                </div>

                {/* Cover Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Image (max 2MB)
                  </label>
                  {coverPreview && (
                    <div className="mb-3">
                      <Image
                        src={coverPreview}
                        alt="Cover preview"
                        width={300}
                        height={150}
                        className="rounded border border-gray-300 object-cover"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleCoverChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Upload a new cover image to replace the existing one
                  </p>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-between items-center pt-6 border-t">
              <Link
                href={`/universities/${id}`}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving || !hasChanges}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="h-4 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorState({ error }: { error: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
        <div className="text-red-600 text-5xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading University</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <Link
          href="/universities"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700"
        >
          ← Back to Universities
        </Link>
      </div>
    </div>
  );
}
