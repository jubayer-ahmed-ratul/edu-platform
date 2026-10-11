'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { CountryResponse } from '@/src/modules/countries/country.types';

export default function CountryDetailsClient({ id }: { id: string }) {
  const [country, setCountry] = useState<CountryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCountry();
  }, [id]);

  const fetchCountry = async () => {
    try {
      const response = await fetch(`/api/countries/${id}`);
      const data = await response.json();

      if (data.success) {
        setCountry(data.data);
      } else {
        setError(data.error?.message || 'Failed to load country');
      }
    } catch (err) {
      setError('Failed to load country details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error || !country) {
    return <ErrorState error={error || 'Country not found'} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
            <a href="/countries" className="hover:text-gray-700">
              Countries
            </a>
            <span>/</span>
            <span className="text-gray-900 font-medium">{country.name}</span>
          </nav>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">{country.name}</h1>
            <a
              href="/countries"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              ← Back to Countries
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <HeroSection country={country} />

        {/* Overview Section */}
        {country.overview && <OverviewSection overview={country.overview} />}

        {/* Study Costs Section */}
        {country.studyCosts && <StudyCostsSection costs={country.studyCosts} />}

        {/* Study System Section */}
        {country.studySystem && <StudySystemSection system={country.studySystem} />}

        {/* Top Cities Section */}
        {country.topCities && country.topCities.length > 0 && (
          <TopCitiesSection cities={country.topCities} />
        )}
      </div>
    </div>
  );
}

// Hero Section Component
function HeroSection({ country }: { country: CountryResponse }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
      <div className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start gap-6">
          {/* Flag */}
          {country.flag ? (
            <div className="flex-shrink-0">
              <Image
                src={country.flag.url}
                alt={`${country.name} flag`}
                width={120}
                height={80}
                className="rounded-lg border-2 border-gray-200 object-cover shadow-sm"
              />
            </div>
          ) : (
            <div className="flex-shrink-0 w-30 h-20 bg-gray-100 rounded-lg border-2 border-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-sm">No flag</span>
            </div>
          )}

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-bold text-gray-900">{country.name}</h2>
              <span className="text-2xl text-gray-500">({country.code})</span>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  country.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {country.isActive ? '● Active' : '● Inactive'}
              </span>
            </div>

            {country.overview?.description && (
              <p className="text-gray-700 leading-relaxed">
                {country.overview.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Overview Section Component
function OverviewSection({ overview }: { overview: CountryResponse['overview'] }) {
  if (!overview) return null;

  const hasContent =
    overview.whyStudyHere?.length ||
    overview.officialLanguages?.length ||
    overview.currency ||
    overview.intakes?.length;

  if (!hasContent) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 mb-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Overview</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Why Study Here */}
        {overview.whyStudyHere && overview.whyStudyHere.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Why Study Here
            </h4>
            <ul className="space-y-2">
              {overview.whyStudyHere.map((reason, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-600 mr-2">✓</span>
                  <span className="text-gray-700">{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Official Languages */}
        {overview.officialLanguages && overview.officialLanguages.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Official Languages
            </h4>
            <div className="flex flex-wrap gap-2">
              {overview.officialLanguages.map((lang, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Currency */}
        {overview.currency && (
          <div>
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Currency
            </h4>
            <p className="text-gray-900 font-medium">
              {overview.currency.name} ({overview.currency.code})
            </p>
          </div>
        )}

        {/* Intakes */}
        {overview.intakes && overview.intakes.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Major Intakes
            </h4>
            <div className="flex flex-wrap gap-2">
              {overview.intakes.map((intake, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-800"
                >
                  {intake}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Study Costs Section Component
function StudyCostsSection({ costs }: { costs: CountryResponse['studyCosts'] }) {
  if (!costs) return null;

  const formatCost = (min?: number, max?: number, currency?: string) => {
    const curr = currency || costs.currencyCode;
    if (min !== undefined && max !== undefined) {
      return `${curr} ${min.toLocaleString()} - ${curr} ${max.toLocaleString()}`;
    }
    if (min !== undefined) {
      return `${curr} ${min.toLocaleString()}+`;
    }
    if (max !== undefined) {
      return `Up to ${curr} ${max.toLocaleString()}`;
    }
    return 'Not available';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Study Costs</h3>
        {costs.academicYear && (
          <span className="text-sm text-gray-500">Academic Year: {costs.academicYear}</span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tuition Fees */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Tuition Fees
          </h4>

          {costs.averageAnnualTuition && (
            <CostItem
              label="Average Annual Tuition"
              value={formatCost(
                costs.averageAnnualTuition.min,
                costs.averageAnnualTuition.max
              )}
            />
          )}

          {costs.bachelorsTuition && (
            <CostItem
              label="Bachelor's Program"
              value={formatCost(costs.bachelorsTuition.min, costs.bachelorsTuition.max)}
            />
          )}

          {costs.mastersTuition && (
            <CostItem
              label="Master's Program"
              value={formatCost(costs.mastersTuition.min, costs.mastersTuition.max)}
            />
          )}
        </div>

        {/* Living Costs */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Living Costs
          </h4>

          {costs.monthlyLivingCost && (
            <CostItem
              label="Monthly Living Cost"
              value={formatCost(costs.monthlyLivingCost.min, costs.monthlyLivingCost.max)}
            />
          )}

          {costs.monthlyAccommodationCost && (
            <CostItem
              label="Monthly Accommodation"
              value={formatCost(
                costs.monthlyAccommodationCost.min,
                costs.monthlyAccommodationCost.max
              )}
            />
          )}

          {costs.monthlyFoodCost && (
            <CostItem
              label="Monthly Food"
              value={formatCost(costs.monthlyFoodCost.min, costs.monthlyFoodCost.max)}
            />
          )}

          {costs.annualHealthInsuranceCost && (
            <CostItem
              label="Annual Health Insurance"
              value={formatCost(
                costs.annualHealthInsuranceCost.min,
                costs.annualHealthInsuranceCost.max
              )}
            />
          )}
        </div>
      </div>

      {/* Other Fees */}
      {costs.otherEstimatedFees && costs.otherEstimatedFees.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Other Estimated Fees
          </h4>
          <div className="space-y-3">
            {costs.otherEstimatedFees.map((fee, index) => (
              <div key={index} className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-gray-900 font-medium">{fee.name}</p>
                  {fee.notes && <p className="text-sm text-gray-500 mt-1">{fee.notes}</p>}
                </div>
                <p className="text-gray-900 font-medium ml-4">
                  {formatCost(fee.min, fee.max)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Source and Verification */}
      {(costs.sourceUrl || costs.lastVerifiedAt) && (
        <div className="mt-6 pt-6 border-t border-gray-200 text-sm text-gray-500">
          {costs.lastVerifiedAt && (
            <p className="mb-2">
              Last verified: {new Date(costs.lastVerifiedAt).toLocaleDateString()}
            </p>
          )}
          {costs.sourceUrl && (
            <a
              href={costs.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              View Source →
            </a>
          )}
        </div>
      )}

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> These are estimated costs and may vary by institution,
          program, and location. Please verify with individual universities for accurate
          information.
        </p>
      </div>
    </div>
  );
}

function CostItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-700">{label}</span>
      <span className="text-gray-900 font-medium">{value}</span>
    </div>
  );
}

// Study System Section Component
function StudySystemSection({ system }: { system: CountryResponse['studySystem'] }) {
  if (!system) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 mb-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Study System</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Program Duration */}
        {(system.bachelorsDuration || system.mastersDuration) && (
          <div>
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Program Duration
            </h4>
            <div className="space-y-2">
              {system.bachelorsDuration && (
                <p className="text-gray-700">
                  <span className="font-medium">Bachelor's:</span> {system.bachelorsDuration}
                </p>
              )}
              {system.mastersDuration && (
                <p className="text-gray-700">
                  <span className="font-medium">Master's:</span> {system.mastersDuration}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Academic Structure */}
        {(system.academicYearStructure ||
          system.semestersPerYear ||
          system.intakesPerYear) && (
          <div>
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Academic Structure
            </h4>
            <div className="space-y-2">
              {system.academicYearStructure && (
                <p className="text-gray-700">{system.academicYearStructure}</p>
              )}
              {system.semestersPerYear && (
                <p className="text-gray-700">
                  <span className="font-medium">Semesters per year:</span>{' '}
                  {system.semestersPerYear}
                </p>
              )}
              {system.intakesPerYear && (
                <p className="text-gray-700">
                  <span className="font-medium">Intakes per year:</span>{' '}
                  {system.intakesPerYear}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Admission Requirements */}
      {system.admissionRequirements && system.admissionRequirements.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Admission Requirements
          </h4>
          <ul className="space-y-2">
            {system.admissionRequirements.map((req, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span className="text-gray-700">{req}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* English Tests */}
      {system.englishTests && system.englishTests.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            English Language Requirements
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {system.englishTests.map((test, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
              >
                <p className="font-medium text-gray-900 mb-1">{test.testName}</p>
                {test.minimumScore && (
                  <p className="text-sm text-gray-600 mb-2">
                    Minimum: {test.minimumScore}
                  </p>
                )}
                {test.notes && <p className="text-xs text-gray-500">{test.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Academic Qualifications */}
      {system.academicQualifications && system.academicQualifications.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Academic Qualifications
          </h4>
          <ul className="space-y-2">
            {system.academicQualifications.map((qual, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                <span className="text-gray-700">{qual}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Source and Verification */}
      {(system.sourceUrl || system.lastVerifiedAt) && (
        <div className="mt-6 pt-6 border-t border-gray-200 text-sm text-gray-500">
          {system.lastVerifiedAt && (
            <p className="mb-2">
              Last verified: {new Date(system.lastVerifiedAt).toLocaleDateString()}
            </p>
          )}
          {system.sourceUrl && (
            <a
              href={system.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              View Source →
            </a>
          )}
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Requirements vary by university and program. These are
          general guidelines. Please check with specific institutions for their exact
          requirements.
        </p>
      </div>
    </div>
  );
}

// Top Cities Section Component
function TopCitiesSection({ cities }: { cities: CountryResponse['topCities'] }) {
  if (!cities || cities.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 mb-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Top Student Cities</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cities.map((city, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* City Image */}
            {city.image ? (
              <div className="relative h-48 w-full">
                <Image
                  src={city.image.url}
                  alt={city.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="h-48 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                <span className="text-4xl font-bold text-blue-600 opacity-50">
                  {city.name.charAt(0)}
                </span>
              </div>
            )}

            {/* City Info */}
            <div className="p-4">
              <h4 className="text-lg font-bold text-gray-900 mb-2">{city.name}</h4>

              {city.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {city.description}
                </p>
              )}

              {/* Living Cost */}
              {city.livingCost && (
                <div className="mb-3">
                  <span className="text-xs font-semibold text-gray-500 uppercase">
                    Monthly Living Cost
                  </span>
                  <p className="text-sm text-gray-900 font-medium">
                    {city.currencyCode || 'Currency'}{' '}
                    {city.livingCost.min?.toLocaleString()}
                    {city.livingCost.max &&
                      ` - ${city.livingCost.max.toLocaleString()}`}
                  </p>
                </div>
              )}

              {/* Popular Universities */}
              {city.popularUniversities && city.popularUniversities.length > 0 && (
                <div className="mb-3">
                  <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">
                    Popular Universities
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {city.popularUniversities.slice(0, 3).map((uni, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                      >
                        {uni}
                      </span>
                    ))}
                    {city.popularUniversities.length > 3 && (
                      <span className="text-xs text-gray-500 px-2 py-1">
                        +{city.popularUniversities.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Popular Subjects */}
              {city.popularSubjects && city.popularSubjects.length > 0 && (
                <div className="mb-3">
                  <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">
                    Popular Subjects
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {city.popularSubjects.slice(0, 3).map((subject, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Suitable For */}
              {city.suitableFor && city.suitableFor.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-gray-500 uppercase block mb-1">
                    Suitable For
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {city.suitableFor.slice(0, 2).map((category, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Loading Skeleton Component
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
            <div className="w-30 h-20 bg-gray-200 rounded-lg animate-pulse"></div>
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

// Error State Component
function ErrorState({ error }: { error: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
        <div className="text-red-600 text-5xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Country</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <a
          href="/countries"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700"
        >
          ← Back to Countries
        </a>
      </div>
    </div>
  );
}
