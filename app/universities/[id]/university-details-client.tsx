'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
  createdAt: string;
  updatedAt: string;
}

export default function UniversityDetailsClient({ id }: { id: string }) {
  const router = useRouter();
  const [university, setUniversity] = useState<University | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchUniversity();
  }, [id]);

  const fetchUniversity = async () => {
    try {
      const response = await fetch(`/api/universities/${id}`);
      const data = await response.json();

      if (data.success) {
        const uni = data.data;
        setUniversity({
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
          createdAt: uni.createdAt,
          updatedAt: uni.updatedAt,
        });
      } else {
        setError(data.error?.message || 'Failed to load university');
      }
    } catch (err) {
      setError('Failed to load university details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${university?.name}? This action cannot be undone.`)) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/universities/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        router.push('/universities');
      } else {
        alert('Failed to delete university: ' + (data.error?.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting university:', error);
      alert('Failed to delete university');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error || !university) {
    return <ErrorState error={error || 'University not found'} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
            <Link href="/universities" className="hover:text-gray-700">
              Universities
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{university.name}</span>
          </nav>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">{university.name}</h1>
            <Link
              href="/universities"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              ← Back to Universities
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          {/* Cover Image */}
          {university.coverImage && (
            <div className="relative h-64 w-full">
              <Image
                src={university.coverImage.url}
                alt={`${university.name} cover`}
                fill
                className="object-cover"
              />
            </div>
          )}

          <div className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start gap-6">
              {/* Logo */}
              {university.logo && (
                <div className="flex-shrink-0">
                  <Image
                    src={university.logo.url}
                    alt={`${university.name} logo`}
                    width={120}
                    height={120}
                    className="rounded-lg border-2 border-gray-200 object-contain bg-white p-2"
                  />
                </div>
              )}

              {/* Info */}
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">{university.name}</h2>

                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      university.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {university.isActive ? '● Active' : '● Inactive'}
                  </span>

                  {university.institutionType && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 capitalize">
                      {university.institutionType}
                    </span>
                  )}

                  {university.establishedYear && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                      Est. {university.establishedYear}
                    </span>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-700">
                    <span className="mr-2 text-lg">🌍</span>
                    <Link
                      href={`/countries/${university.country.id}`}
                      className="hover:text-blue-600 font-medium"
                    >
                      {university.country.name} ({university.country.code})
                    </Link>
                  </div>

                  <div className="flex items-center text-gray-700">
                    <span className="mr-2 text-lg">📍</span>
                    <span>{university.city}</span>
                  </div>

                  {university.website && (
                    <div className="flex items-center text-gray-700">
                      <span className="mr-2 text-lg">🔗</span>
                      <a
                        href={university.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}

                  {university.address && (
                    <div className="flex items-start text-gray-700">
                      <span className="mr-2 text-lg">📫</span>
                      <span>{university.address}</span>
                    </div>
                  )}
                </div>

                {university.description && (
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {university.description}
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                  <Link
                    href={`/universities/${university.id}/edit`}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Edit University
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Subjects */}
        {university.popularSubjects && university.popularSubjects.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Popular Subjects</h3>
            <div className="flex flex-wrap gap-2">
              {university.popularSubjects.map((subject, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                >
                  {subject}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Rankings */}
        {university.ranking && university.ranking.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">University Rankings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {university.ranking.map((rank, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                >
                  <p className="font-semibold text-gray-900 mb-1">{rank.organization}</p>
                  <p className="text-2xl font-bold text-blue-600 mb-1">#{rank.rank}</p>
                  <p className="text-sm text-gray-500">Year: {rank.year}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* International Student Info */}
        {university.internationalStudentInfo && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              International Student Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {university.internationalStudentInfo.totalStudents && (
                <InfoItem
                  label="Total Students"
                  value={university.internationalStudentInfo.totalStudents.toLocaleString()}
                />
              )}
              {university.internationalStudentInfo.internationalStudents && (
                <InfoItem
                  label="International Students"
                  value={university.internationalStudentInfo.internationalStudents.toLocaleString()}
                />
              )}
              {university.internationalStudentInfo.internationalPercentage !== undefined && (
                <InfoItem
                  label="International Percentage"
                  value={`${university.internationalStudentInfo.internationalPercentage}%`}
                />
              )}
              {university.internationalStudentInfo.scholarshipsAvailable !== undefined && (
                <InfoItem
                  label="Scholarships Available"
                  value={university.internationalStudentInfo.scholarshipsAvailable ? 'Yes' : 'No'}
                />
              )}
              {university.internationalStudentInfo.applicationFee && (
                <InfoItem
                  label="Application Fee"
                  value={`${university.internationalStudentInfo.applicationFeeCurrency || 'USD'} ${university.internationalStudentInfo.applicationFee}`}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm font-medium text-gray-500 mb-1">{label}</dt>
      <dd className="text-lg font-semibold text-gray-900">{value}</dd>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="h-4 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
          <div className="flex gap-6">
            <div className="w-30 h-30 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="flex-1">
              <div className="h-8 bg-gray-200 rounded w-64 mb-4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            </div>
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
