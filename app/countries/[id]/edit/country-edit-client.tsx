'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import type { CountryResponse } from '@/src/modules/countries/country.types';

export default function CountryEditClient({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [country, setCountry] = useState<CountryResponse | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Basic Info State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [flagFile, setFlagFile] = useState<File | null>(null);
  const [flagPreview, setFlagPreview] = useState<string | null>(null);

  // Overview State
  const [description, setDescription] = useState('');
  const [whyStudyHere, setWhyStudyHere] = useState<string[]>([]);
  const [officialLanguages, setOfficialLanguages] = useState<string[]>([]);
  const [currencyName, setCurrencyName] = useState('');
  const [currencyCode, setCurrencyCode] = useState('');
  const [intakes, setIntakes] = useState<string[]>([]);

  // Study Costs State
  const [costsCurrencyCode, setCostsCurrencyCode] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [avgTuitionMin, setAvgTuitionMin] = useState<number | ''>('');
  const [avgTuitionMax, setAvgTuitionMax] = useState<number | ''>('');
  const [bachelorsTuitionMin, setBachelorsTuitionMin] = useState<number | ''>('');
  const [bachelorsTuitionMax, setBachelorsTuitionMax] = useState<number | ''>('');
  const [mastersTuitionMin, setMastersTuitionMin] = useState<number | ''>('');
  const [mastersTuitionMax, setMastersTuitionMax] = useState<number | ''>('');
  const [monthlyLivingMin, setMonthlyLivingMin] = useState<number | ''>('');
  const [monthlyLivingMax, setMonthlyLivingMax] = useState<number | ''>('');
  const [monthlyAccommodationMin, setMonthlyAccommodationMin] = useState<number | ''>('');
  const [monthlyAccommodationMax, setMonthlyAccommodationMax] = useState<number | ''>('');
  const [monthlyFoodMin, setMonthlyFoodMin] = useState<number | ''>('');
  const [monthlyFoodMax, setMonthlyFoodMax] = useState<number | ''>('');
  const [healthInsuranceMin, setHealthInsuranceMin] = useState<number | ''>('');
  const [healthInsuranceMax, setHealthInsuranceMax] = useState<number | ''>('');
  const [otherFees, setOtherFees] = useState<Array<{ name: string; min?: number; max?: number; notes?: string }>>([]);
  const [costsSourceUrl, setCostsSourceUrl] = useState('');

  // Study System State
  const [bachelorsDuration, setBachelorsDuration] = useState('');
  const [mastersDuration, setMastersDuration] = useState('');
  const [academicYearStructure, setAcademicYearStructure] = useState('');
  const [semestersPerYear, setSemestersPerYear] = useState<number | ''>('');
  const [intakesPerYear, setIntakesPerYear] = useState<number | ''>('');
  const [admissionRequirements, setAdmissionRequirements] = useState<string[]>([]);
  const [englishTests, setEnglishTests] = useState<Array<{ testName: string; minimumScore?: string; notes?: string }>>([]);
  const [academicQualifications, setAcademicQualifications] = useState<string[]>([]);
  const [systemSourceUrl, setSystemSourceUrl] = useState('');

  // Top Cities State
  const [topCities, setTopCities] = useState<Array<{
    name: string;
    slug: string;
    image?: { url: string; publicId: string };
    description?: string;
    livingCost?: { min?: number; max?: number };
    currencyCode?: string;
    popularUniversities?: string[];
    popularSubjects?: string[];
    suitableFor?: string[];
  }>>([]);

  useEffect(() => {
    fetchCountry();
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
    if (country) {
      setHasChanges(true);
    }
  }, [name, code, isActive, description, whyStudyHere, officialLanguages, currencyName, currencyCode, intakes, costsCurrencyCode, topCities]);

  const fetchCountry = async () => {
    try {
      const response = await fetch(`/api/countries/${id}`);
      const data = await response.json();

      if (data.success && data.data) {
        const countryData = data.data;
        setCountry(countryData);
        
        // Set basic info
        setName(countryData.name || '');
        setCode(countryData.code || '');
        setIsActive(countryData.isActive ?? true);
        setFlagPreview(countryData.flag?.url || null);

        // Set overview data
        if (countryData.overview) {
          setDescription(countryData.overview.description || '');
          setWhyStudyHere(countryData.overview.whyStudyHere || []);
          setOfficialLanguages(countryData.overview.officialLanguages || []);
          if (countryData.overview.currency) {
            setCurrencyName(countryData.overview.currency.name || '');
            setCurrencyCode(countryData.overview.currency.code || '');
          }
          setIntakes(countryData.overview.intakes || []);
        }

        // Set study costs data
        if (countryData.studyCosts) {
          setCostsCurrencyCode(countryData.studyCosts.currencyCode || '');
          setAcademicYear(countryData.studyCosts.academicYear || '');
          setAvgTuitionMin(countryData.studyCosts.averageAnnualTuition?.min ?? '');
          setAvgTuitionMax(countryData.studyCosts.averageAnnualTuition?.max ?? '');
          setBachelorsTuitionMin(countryData.studyCosts.bachelorsTuition?.min ?? '');
          setBachelorsTuitionMax(countryData.studyCosts.bachelorsTuition?.max ?? '');
          setMastersTuitionMin(countryData.studyCosts.mastersTuition?.min ?? '');
          setMastersTuitionMax(countryData.studyCosts.mastersTuition?.max ?? '');
          setMonthlyLivingMin(countryData.studyCosts.monthlyLivingCost?.min ?? '');
          setMonthlyLivingMax(countryData.studyCosts.monthlyLivingCost?.max ?? '');
          setMonthlyAccommodationMin(countryData.studyCosts.monthlyAccommodationCost?.min ?? '');
          setMonthlyAccommodationMax(countryData.studyCosts.monthlyAccommodationCost?.max ?? '');
          setMonthlyFoodMin(countryData.studyCosts.monthlyFoodCost?.min ?? '');
          setMonthlyFoodMax(countryData.studyCosts.monthlyFoodCost?.max ?? '');
          setHealthInsuranceMin(countryData.studyCosts.annualHealthInsuranceCost?.min ?? '');
          setHealthInsuranceMax(countryData.studyCosts.annualHealthInsuranceCost?.max ?? '');
          setOtherFees(countryData.studyCosts.otherEstimatedFees || []);
          setCostsSourceUrl(countryData.studyCosts.sourceUrl || '');
        }

        // Set study system data
        if (countryData.studySystem) {
          setBachelorsDuration(countryData.studySystem.bachelorsDuration || '');
          setMastersDuration(countryData.studySystem.mastersDuration || '');
          setAcademicYearStructure(countryData.studySystem.academicYearStructure || '');
          setSemestersPerYear(countryData.studySystem.semestersPerYear ?? '');
          setIntakesPerYear(countryData.studySystem.intakesPerYear ?? '');
          setAdmissionRequirements(countryData.studySystem.admissionRequirements || []);
          setEnglishTests(countryData.studySystem.englishTests || []);
          setAcademicQualifications(countryData.studySystem.academicQualifications || []);
          setSystemSourceUrl(countryData.studySystem.sourceUrl || '');
        }

        // Set top cities data
        if (countryData.topCities) {
          setTopCities(countryData.topCities);
        }

        // TODO: Set other sections data
      } else {
        setError('Country not found');
      }
    } catch (err) {
      setError('Failed to load country');
    } finally {
      setLoading(false);
    }
  };

  const handleFlagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) {
      alert('Only PNG, JPEG, and WebP images are allowed');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    setFlagFile(file);
    setFlagPreview(URL.createObjectURL(file));
  };

  const validateForm = (): string | null => {
    // Basic info validation
    if (!name.trim()) {
      return 'Country name is required';
    }
    if (!code.trim()) {
      return 'Country code is required';
    }
    if (code.length < 2 || code.length > 3) {
      return 'Country code must be 2-3 characters';
    }

    // Study costs validation
    if (costsCurrencyCode && costsCurrencyCode.length !== 3) {
      return 'Currency code must be exactly 3 characters';
    }

    // Top cities validation
    for (let i = 0; i < topCities.length; i++) {
      const city = topCities[i];
      if (!city.name.trim()) {
        return `City #${i + 1}: Name is required`;
      }
      if (!city.slug.trim()) {
        return `City #${i + 1}: Slug is required`;
      }
      if (city.currencyCode && city.currencyCode.length !== 3) {
        return `City #${i + 1}: Currency code must be exactly 3 characters`;
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setSaving(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      let flagData = country?.flag;

      // Upload new flag if selected
      if (flagFile) {
        const formData = new FormData();
        formData.append('file', flagFile);

        const uploadResponse = await fetch('/api/uploads/country-flag', {
          method: 'POST',
          body: formData,
        });

        const uploadResult = await uploadResponse.json();

        if (!uploadResult.success) {
          throw new Error(uploadResult.error?.message || 'Failed to upload flag');
        }

        flagData = uploadResult.data;
      }

      // Prepare update data
      const updateData: any = {
        name,
        code,
        isActive,
      };

      if (flagData) {
        updateData.flag = flagData;
      }

      // Add overview data
      if (description || whyStudyHere.length > 0 || officialLanguages.length > 0 || currencyName || intakes.length > 0) {
        updateData.overview = {
          description: description || undefined,
          whyStudyHere: whyStudyHere.length > 0 ? whyStudyHere : undefined,
          officialLanguages: officialLanguages.length > 0 ? officialLanguages : undefined,
          currency: currencyName && currencyCode ? { name: currencyName, code: currencyCode } : undefined,
          intakes: intakes.length > 0 ? intakes : undefined,
        };
      }

      // Add study costs data
      if (costsCurrencyCode) {
        updateData.studyCosts = {
          currencyCode: costsCurrencyCode,
          academicYear: academicYear || undefined,
          averageAnnualTuition: avgTuitionMin || avgTuitionMax ? {
            min: avgTuitionMin || undefined,
            max: avgTuitionMax || undefined,
          } : undefined,
          bachelorsTuition: bachelorsTuitionMin || bachelorsTuitionMax ? {
            min: bachelorsTuitionMin || undefined,
            max: bachelorsTuitionMax || undefined,
          } : undefined,
          mastersTuition: mastersTuitionMin || mastersTuitionMax ? {
            min: mastersTuitionMin || undefined,
            max: mastersTuitionMax || undefined,
          } : undefined,
          monthlyLivingCost: monthlyLivingMin || monthlyLivingMax ? {
            min: monthlyLivingMin || undefined,
            max: monthlyLivingMax || undefined,
          } : undefined,
          monthlyAccommodationCost: monthlyAccommodationMin || monthlyAccommodationMax ? {
            min: monthlyAccommodationMin || undefined,
            max: monthlyAccommodationMax || undefined,
          } : undefined,
          monthlyFoodCost: monthlyFoodMin || monthlyFoodMax ? {
            min: monthlyFoodMin || undefined,
            max: monthlyFoodMax || undefined,
          } : undefined,
          annualHealthInsuranceCost: healthInsuranceMin || healthInsuranceMax ? {
            min: healthInsuranceMin || undefined,
            max: healthInsuranceMax || undefined,
          } : undefined,
          otherEstimatedFees: otherFees.length > 0 ? otherFees : undefined,
          sourceUrl: costsSourceUrl || undefined,
        };
      }

      // Add study system data
      if (bachelorsDuration || mastersDuration || admissionRequirements.length > 0 || englishTests.length > 0) {
        updateData.studySystem = {
          bachelorsDuration: bachelorsDuration || undefined,
          mastersDuration: mastersDuration || undefined,
          academicYearStructure: academicYearStructure || undefined,
          semestersPerYear: semestersPerYear || undefined,
          intakesPerYear: intakesPerYear || undefined,
          admissionRequirements: admissionRequirements.length > 0 ? admissionRequirements : undefined,
          englishTests: englishTests.length > 0 ? englishTests : undefined,
          academicQualifications: academicQualifications.length > 0 ? academicQualifications : undefined,
          sourceUrl: systemSourceUrl || undefined,
        };
      }

      // Add top cities data
      if (topCities.length > 0) {
        updateData.topCities = topCities;
      }

      // TODO: Add other sections data

      // Update country
      const response = await fetch(`/api/countries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (result.success) {
        // Show success message before redirect
        setHasChanges(false); // Clear unsaved changes flag
        alert('Country updated successfully!');
        router.push(`/countries/${id}`);
      } else {
        setError(result.error?.message || 'Failed to update country');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error && !country) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-md w-full text-center">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                <a href="/countries" className="hover:text-gray-700">
                  Countries
                </a>
                <span>/</span>
                <a href={`/countries/${id}`} className="hover:text-gray-700">
                  {country?.name}
                </a>
                <span>/</span>
                <span className="text-gray-900 font-medium">Edit</span>
              </nav>
              <h1 className="text-3xl font-bold text-gray-900">Edit Country Details</h1>
            </div>
            <a
              href={`/countries/${id}`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </a>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <button
                type="button"
                onClick={() => setError(null)}
                className="ml-auto pl-3"
              >
                <span className="text-red-500 hover:text-red-700">✕</span>
              </button>
            </div>
          </div>
        )}

        {/* Basic Information Section */}
        <BasicInfoSection
          name={name}
          setName={setName}
          code={code}
          setCode={setCode}
          isActive={isActive}
          setIsActive={setIsActive}
          flagPreview={flagPreview}
          onFlagChange={handleFlagChange}
        />

        {/* Overview Section */}
        <OverviewSection
          description={description}
          setDescription={setDescription}
          whyStudyHere={whyStudyHere}
          setWhyStudyHere={setWhyStudyHere}
          officialLanguages={officialLanguages}
          setOfficialLanguages={setOfficialLanguages}
          currencyName={currencyName}
          setCurrencyName={setCurrencyName}
          currencyCode={currencyCode}
          setCurrencyCode={setCurrencyCode}
          intakes={intakes}
          setIntakes={setIntakes}
        />

        {/* Study Costs Section */}
        <StudyCostsSection
          costsCurrencyCode={costsCurrencyCode}
          setCostsCurrencyCode={setCostsCurrencyCode}
          academicYear={academicYear}
          setAcademicYear={setAcademicYear}
          avgTuitionMin={avgTuitionMin}
          setAvgTuitionMin={setAvgTuitionMin}
          avgTuitionMax={avgTuitionMax}
          setAvgTuitionMax={setAvgTuitionMax}
          bachelorsTuitionMin={bachelorsTuitionMin}
          setBachelorsTuitionMin={setBachelorsTuitionMin}
          bachelorsTuitionMax={bachelorsTuitionMax}
          setBachelorsTuitionMax={setBachelorsTuitionMax}
          mastersTuitionMin={mastersTuitionMin}
          setMastersTuitionMin={setMastersTuitionMin}
          mastersTuitionMax={mastersTuitionMax}
          setMastersTuitionMax={setMastersTuitionMax}
          monthlyLivingMin={monthlyLivingMin}
          setMonthlyLivingMin={setMonthlyLivingMin}
          monthlyLivingMax={monthlyLivingMax}
          setMonthlyLivingMax={setMonthlyLivingMax}
          monthlyAccommodationMin={monthlyAccommodationMin}
          setMonthlyAccommodationMin={setMonthlyAccommodationMin}
          monthlyAccommodationMax={monthlyAccommodationMax}
          setMonthlyAccommodationMax={setMonthlyAccommodationMax}
          monthlyFoodMin={monthlyFoodMin}
          setMonthlyFoodMin={setMonthlyFoodMin}
          monthlyFoodMax={monthlyFoodMax}
          setMonthlyFoodMax={setMonthlyFoodMax}
          healthInsuranceMin={healthInsuranceMin}
          setHealthInsuranceMin={setHealthInsuranceMin}
          healthInsuranceMax={healthInsuranceMax}
          setHealthInsuranceMax={setHealthInsuranceMax}
          otherFees={otherFees}
          setOtherFees={setOtherFees}
          costsSourceUrl={costsSourceUrl}
          setCostsSourceUrl={setCostsSourceUrl}
        />

        {/* Study System Section */}
        <StudySystemSection
          bachelorsDuration={bachelorsDuration}
          setBachelorsDuration={setBachelorsDuration}
          mastersDuration={mastersDuration}
          setMastersDuration={setMastersDuration}
          academicYearStructure={academicYearStructure}
          setAcademicYearStructure={setAcademicYearStructure}
          semestersPerYear={semestersPerYear}
          setSemestersPerYear={setSemestersPerYear}
          intakesPerYear={intakesPerYear}
          setIntakesPerYear={setIntakesPerYear}
          admissionRequirements={admissionRequirements}
          setAdmissionRequirements={setAdmissionRequirements}
          englishTests={englishTests}
          setEnglishTests={setEnglishTests}
          academicQualifications={academicQualifications}
          setAcademicQualifications={setAcademicQualifications}
          systemSourceUrl={systemSourceUrl}
          setSystemSourceUrl={setSystemSourceUrl}
        />

        {/* Top Cities Section */}
        <TopCitiesSection topCities={topCities} setTopCities={setTopCities} />

        {/* TODO: Add other sections */}

        {/* Save Button */}
        <div className="mt-8 flex justify-end gap-4 sticky bottom-0 bg-gray-50 py-4 border-t border-gray-200">
          <a
            href={`/countries/${id}`}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </a>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {saving && (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {saving ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

// Basic Info Section Component
function BasicInfoSection({
  name,
  setName,
  code,
  setCode,
  isActive,
  setIsActive,
  flagPreview,
  onFlagChange,
}: {
  name: string;
  setName: (value: string) => void;
  code: string;
  setCode: (value: string) => void;
  isActive: boolean;
  setIsActive: (value: boolean) => void;
  flagPreview: string | null;
  onFlagChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Basic Information</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Country Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Country Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., United States"
          />
        </div>

        {/* Country Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Country Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={3}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
            placeholder="e.g., USA"
          />
          <p className="mt-1 text-xs text-gray-500">2-3 letter code (ISO format)</p>
        </div>

        {/* Flag Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Country Flag
          </label>
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={onFlagChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="mt-1 text-xs text-gray-500">PNG, JPEG, or WebP (max 2MB)</p>
        </div>

        {/* Flag Preview */}
        {flagPreview && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Flag Preview
            </label>
            <Image
              src={flagPreview}
              alt="Flag preview"
              width={120}
              height={80}
              className="rounded-lg border-2 border-gray-200 object-cover shadow-sm"
            />
          </div>
        )}

        {/* Active Status */}
        <div className="md:col-span-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">
              Active (Country is visible and available for selection)
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}


// Overview Section Component
function OverviewSection({
  description,
  setDescription,
  whyStudyHere,
  setWhyStudyHere,
  officialLanguages,
  setOfficialLanguages,
  currencyName,
  setCurrencyName,
  currencyCode,
  setCurrencyCode,
  intakes,
  setIntakes,
}: {
  description: string;
  setDescription: (value: string) => void;
  whyStudyHere: string[];
  setWhyStudyHere: (value: string[]) => void;
  officialLanguages: string[];
  setOfficialLanguages: (value: string[]) => void;
  currencyName: string;
  setCurrencyName: (value: string) => void;
  currencyCode: string;
  setCurrencyCode: (value: string) => void;
  intakes: string[];
  setIntakes: (value: string[]) => void;
}) {
  const [newReason, setNewReason] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newIntake, setNewIntake] = useState('');

  const addReason = () => {
    if (newReason.trim()) {
      setWhyStudyHere([...whyStudyHere, newReason.trim()]);
      setNewReason('');
    }
  };

  const removeReason = (index: number) => {
    setWhyStudyHere(whyStudyHere.filter((_, i) => i !== index));
  };

  const addLanguage = () => {
    if (newLanguage.trim()) {
      setOfficialLanguages([...officialLanguages, newLanguage.trim()]);
      setNewLanguage('');
    }
  };

  const removeLanguage = (index: number) => {
    setOfficialLanguages(officialLanguages.filter((_, i) => i !== index));
  };

  const addIntake = () => {
    if (newIntake.trim()) {
      setIntakes([...intakes, newIntake.trim()]);
      setNewIntake('');
    }
  };

  const removeIntake = (index: number) => {
    setIntakes(intakes.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Overview</h2>

      {/* Description */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Brief overview of studying in this country..."
        />
      </div>

      {/* Why Study Here */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Why Study Here
        </label>
        <div className="space-y-2 mb-3">
          {whyStudyHere.map((reason, index) => (
            <div key={index} className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg">
              <span className="text-blue-600">✓</span>
              <span className="flex-1 text-gray-700">{reason}</span>
              <button
                type="button"
                onClick={() => removeReason(index)}
                className="text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newReason}
            onChange={(e) => setNewReason(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addReason())}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Add a reason to study here..."
          />
          <button
            type="button"
            onClick={addReason}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Official Languages */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Official Languages
          </label>
          <div className="space-y-2 mb-3">
            {officialLanguages.map((lang, index) => (
              <div key={index} className="flex items-center gap-2 bg-indigo-50 px-3 py-2 rounded-lg">
                <span className="flex-1 text-gray-700">{lang}</span>
                <button
                  type="button"
                  onClick={() => removeLanguage(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addLanguage())}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., English"
            />
            <button
              type="button"
              onClick={addLanguage}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Add
            </button>
          </div>
        </div>

        {/* Intakes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Major Intakes
          </label>
          <div className="space-y-2 mb-3">
            {intakes.map((intake, index) => (
              <div key={index} className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg">
                <span className="flex-1 text-gray-700">{intake}</span>
                <button
                  type="button"
                  onClick={() => removeIntake(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newIntake}
              onChange={(e) => setNewIntake(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIntake())}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., September"
            />
            <button
              type="button"
              onClick={addIntake}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Currency */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Currency
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            value={currencyName}
            onChange={(e) => setCurrencyName(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Currency name (e.g., US Dollar)"
          />
          <input
            type="text"
            value={currencyCode}
            onChange={(e) => setCurrencyCode(e.target.value.toUpperCase())}
            maxLength={3}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
            placeholder="Currency code (e.g., USD)"
          />
        </div>
      </div>
    </div>
  );
}


// Study Costs Section Component
function StudyCostsSection({
  costsCurrencyCode,
  setCostsCurrencyCode,
  academicYear,
  setAcademicYear,
  avgTuitionMin,
  setAvgTuitionMin,
  avgTuitionMax,
  setAvgTuitionMax,
  bachelorsTuitionMin,
  setBachelorsTuitionMin,
  bachelorsTuitionMax,
  setBachelorsTuitionMax,
  mastersTuitionMin,
  setMastersTuitionMin,
  mastersTuitionMax,
  setMastersTuitionMax,
  monthlyLivingMin,
  setMonthlyLivingMin,
  monthlyLivingMax,
  setMonthlyLivingMax,
  monthlyAccommodationMin,
  setMonthlyAccommodationMin,
  monthlyAccommodationMax,
  setMonthlyAccommodationMax,
  monthlyFoodMin,
  setMonthlyFoodMin,
  monthlyFoodMax,
  setMonthlyFoodMax,
  healthInsuranceMin,
  setHealthInsuranceMin,
  healthInsuranceMax,
  setHealthInsuranceMax,
  otherFees,
  setOtherFees,
  costsSourceUrl,
  setCostsSourceUrl,
}: {
  costsCurrencyCode: string;
  setCostsCurrencyCode: (value: string) => void;
  academicYear: string;
  setAcademicYear: (value: string) => void;
  avgTuitionMin: number | '';
  setAvgTuitionMin: (value: number | '') => void;
  avgTuitionMax: number | '';
  setAvgTuitionMax: (value: number | '') => void;
  bachelorsTuitionMin: number | '';
  setBachelorsTuitionMin: (value: number | '') => void;
  bachelorsTuitionMax: number | '';
  setBachelorsTuitionMax: (value: number | '') => void;
  mastersTuitionMin: number | '';
  setMastersTuitionMin: (value: number | '') => void;
  mastersTuitionMax: number | '';
  setMastersTuitionMax: (value: number | '') => void;
  monthlyLivingMin: number | '';
  setMonthlyLivingMin: (value: number | '') => void;
  monthlyLivingMax: number | '';
  setMonthlyLivingMax: (value: number | '') => void;
  monthlyAccommodationMin: number | '';
  setMonthlyAccommodationMin: (value: number | '') => void;
  monthlyAccommodationMax: number | '';
  setMonthlyAccommodationMax: (value: number | '') => void;
  monthlyFoodMin: number | '';
  setMonthlyFoodMin: (value: number | '') => void;
  monthlyFoodMax: number | '';
  setMonthlyFoodMax: (value: number | '') => void;
  healthInsuranceMin: number | '';
  setHealthInsuranceMin: (value: number | '') => void;
  healthInsuranceMax: number | '';
  setHealthInsuranceMax: (value: number | '') => void;
  otherFees: Array<{ name: string; min?: number; max?: number; notes?: string }>;
  setOtherFees: (value: Array<{ name: string; min?: number; max?: number; notes?: string }>) => void;
  costsSourceUrl: string;
  setCostsSourceUrl: (value: string) => void;
}) {
  const [newFeeName, setNewFeeName] = useState('');
  const [newFeeMin, setNewFeeMin] = useState<number | ''>('');
  const [newFeeMax, setNewFeeMax] = useState<number | ''>('');
  const [newFeeNotes, setNewFeeNotes] = useState('');

  const addOtherFee = () => {
    if (newFeeName.trim()) {
      setOtherFees([
        ...otherFees,
        {
          name: newFeeName.trim(),
          min: newFeeMin || undefined,
          max: newFeeMax || undefined,
          notes: newFeeNotes.trim() || undefined,
        },
      ]);
      setNewFeeName('');
      setNewFeeMin('');
      setNewFeeMax('');
      setNewFeeNotes('');
    }
  };

  const removeFee = (index: number) => {
    setOtherFees(otherFees.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Study Costs</h2>

      {/* Currency and Academic Year */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Currency Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={costsCurrencyCode}
            onChange={(e) => setCostsCurrencyCode(e.target.value.toUpperCase())}
            maxLength={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
            placeholder="e.g., USD"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Academic Year
          </label>
          <input
            type="text"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., 2024-2025"
          />
        </div>
      </div>

      {/* Tuition Fees */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tuition Fees (Annual)</h3>
        
        {/* Average Tuition */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Average Annual Tuition
          </label>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              value={avgTuitionMin}
              onChange={(e) => setAvgTuitionMin(e.target.value ? Number(e.target.value) : '')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Min"
            />
            <input
              type="number"
              value={avgTuitionMax}
              onChange={(e) => setAvgTuitionMax(e.target.value ? Number(e.target.value) : '')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Max"
            />
          </div>
        </div>

        {/* Bachelor's Tuition */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bachelor's Program Tuition
          </label>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              value={bachelorsTuitionMin}
              onChange={(e) => setBachelorsTuitionMin(e.target.value ? Number(e.target.value) : '')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Min"
            />
            <input
              type="number"
              value={bachelorsTuitionMax}
              onChange={(e) => setBachelorsTuitionMax(e.target.value ? Number(e.target.value) : '')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Max"
            />
          </div>
        </div>

        {/* Master's Tuition */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Master's Program Tuition
          </label>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              value={mastersTuitionMin}
              onChange={(e) => setMastersTuitionMin(e.target.value ? Number(e.target.value) : '')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Min"
            />
            <input
              type="number"
              value={mastersTuitionMax}
              onChange={(e) => setMastersTuitionMax(e.target.value ? Number(e.target.value) : '')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Max"
            />
          </div>
        </div>
      </div>

      {/* Living Costs */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Living Costs (Monthly)</h3>
        
        {/* Monthly Living */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monthly Living Cost
          </label>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              value={monthlyLivingMin}
              onChange={(e) => setMonthlyLivingMin(e.target.value ? Number(e.target.value) : '')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Min"
            />
            <input
              type="number"
              value={monthlyLivingMax}
              onChange={(e) => setMonthlyLivingMax(e.target.value ? Number(e.target.value) : '')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Max"
            />
          </div>
        </div>

        {/* Monthly Accommodation */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monthly Accommodation Cost
          </label>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              value={monthlyAccommodationMin}
              onChange={(e) => setMonthlyAccommodationMin(e.target.value ? Number(e.target.value) : '')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Min"
            />
            <input
              type="number"
              value={monthlyAccommodationMax}
              onChange={(e) => setMonthlyAccommodationMax(e.target.value ? Number(e.target.value) : '')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Max"
            />
          </div>
        </div>

        {/* Monthly Food */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monthly Food Cost
          </label>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              value={monthlyFoodMin}
              onChange={(e) => setMonthlyFoodMin(e.target.value ? Number(e.target.value) : '')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Min"
            />
            <input
              type="number"
              value={monthlyFoodMax}
              onChange={(e) => setMonthlyFoodMax(e.target.value ? Number(e.target.value) : '')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Max"
            />
          </div>
        </div>

        {/* Health Insurance */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Annual Health Insurance Cost
          </label>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              value={healthInsuranceMin}
              onChange={(e) => setHealthInsuranceMin(e.target.value ? Number(e.target.value) : '')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Min"
            />
            <input
              type="number"
              value={healthInsuranceMax}
              onChange={(e) => setHealthInsuranceMax(e.target.value ? Number(e.target.value) : '')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Max"
            />
          </div>
        </div>
      </div>

      {/* Other Fees */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Other Estimated Fees</h3>
        
        <div className="space-y-3 mb-4">
          {otherFees.map((fee, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{fee.name}</p>
                  {fee.notes && <p className="text-sm text-gray-600 mt-1">{fee.notes}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => removeFee(index)}
                  className="text-red-600 hover:text-red-800 ml-4"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-gray-700">
                Range: {fee.min || 0} - {fee.max || 0}
              </p>
            </div>
          ))}
        </div>

        <div className="space-y-3 p-4 border-2 border-dashed border-gray-300 rounded-lg">
          <input
            type="text"
            value={newFeeName}
            onChange={(e) => setNewFeeName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Fee name (e.g., Application Fee)"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              value={newFeeMin}
              onChange={(e) => setNewFeeMin(e.target.value ? Number(e.target.value) : '')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Min"
            />
            <input
              type="number"
              value={newFeeMax}
              onChange={(e) => setNewFeeMax(e.target.value ? Number(e.target.value) : '')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Max"
            />
          </div>
          <input
            type="text"
            value={newFeeNotes}
            onChange={(e) => setNewFeeNotes(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Notes (optional)"
          />
          <button
            type="button"
            onClick={addOtherFee}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Fee
          </button>
        </div>
      </div>

      {/* Source URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Source URL (for verification)
        </label>
        <input
          type="url"
          value={costsSourceUrl}
          onChange={(e) => setCostsSourceUrl(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="https://..."
        />
      </div>
    </div>
  );
}


// Study System Section Component
function StudySystemSection({
  bachelorsDuration,
  setBachelorsDuration,
  mastersDuration,
  setMastersDuration,
  academicYearStructure,
  setAcademicYearStructure,
  semestersPerYear,
  setSemestersPerYear,
  intakesPerYear,
  setIntakesPerYear,
  admissionRequirements,
  setAdmissionRequirements,
  englishTests,
  setEnglishTests,
  academicQualifications,
  setAcademicQualifications,
  systemSourceUrl,
  setSystemSourceUrl,
}: {
  bachelorsDuration: string;
  setBachelorsDuration: (value: string) => void;
  mastersDuration: string;
  setMastersDuration: (value: string) => void;
  academicYearStructure: string;
  setAcademicYearStructure: (value: string) => void;
  semestersPerYear: number | '';
  setSemestersPerYear: (value: number | '') => void;
  intakesPerYear: number | '';
  setIntakesPerYear: (value: number | '') => void;
  admissionRequirements: string[];
  setAdmissionRequirements: (value: string[]) => void;
  englishTests: Array<{ testName: string; minimumScore?: string; notes?: string }>;
  setEnglishTests: (value: Array<{ testName: string; minimumScore?: string; notes?: string }>) => void;
  academicQualifications: string[];
  setAcademicQualifications: (value: string[]) => void;
  systemSourceUrl: string;
  setSystemSourceUrl: (value: string) => void;
}) {
  const [newRequirement, setNewRequirement] = useState('');
  const [newQualification, setNewQualification] = useState('');
  const [newTestName, setNewTestName] = useState('');
  const [newTestScore, setNewTestScore] = useState('');
  const [newTestNotes, setNewTestNotes] = useState('');

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setAdmissionRequirements([...admissionRequirements, newRequirement.trim()]);
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    setAdmissionRequirements(admissionRequirements.filter((_, i) => i !== index));
  };

  const addQualification = () => {
    if (newQualification.trim()) {
      setAcademicQualifications([...academicQualifications, newQualification.trim()]);
      setNewQualification('');
    }
  };

  const removeQualification = (index: number) => {
    setAcademicQualifications(academicQualifications.filter((_, i) => i !== index));
  };

  const addEnglishTest = () => {
    if (newTestName.trim()) {
      setEnglishTests([
        ...englishTests,
        {
          testName: newTestName.trim(),
          minimumScore: newTestScore.trim() || undefined,
          notes: newTestNotes.trim() || undefined,
        },
      ]);
      setNewTestName('');
      setNewTestScore('');
      setNewTestNotes('');
    }
  };

  const removeTest = (index: number) => {
    setEnglishTests(englishTests.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Study System</h2>

      {/* Program Duration */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Program Duration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bachelor's Duration
            </label>
            <input
              type="text"
              value={bachelorsDuration}
              onChange={(e) => setBachelorsDuration(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 3-4 years"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Master's Duration
            </label>
            <input
              type="text"
              value={mastersDuration}
              onChange={(e) => setMastersDuration(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 1-2 years"
            />
          </div>
        </div>
      </div>

      {/* Academic Structure */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Structure</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Academic Year Structure
          </label>
          <input
            type="text"
            value={academicYearStructure}
            onChange={(e) => setAcademicYearStructure(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., September to June"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Semesters Per Year
            </label>
            <input
              type="number"
              value={semestersPerYear}
              onChange={(e) => setSemestersPerYear(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Intakes Per Year
            </label>
            <input
              type="number"
              value={intakesPerYear}
              onChange={(e) => setIntakesPerYear(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 3"
            />
          </div>
        </div>
      </div>

      {/* Admission Requirements */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">General Admission Requirements</h3>
        
        <div className="space-y-2 mb-3">
          {admissionRequirements.map((req, index) => (
            <div key={index} className="flex items-center gap-2 bg-blue-50 p-3 rounded-lg">
              <span className="text-blue-600">•</span>
              <span className="flex-1 text-gray-700">{req}</span>
              <button
                type="button"
                onClick={() => removeRequirement(index)}
                className="text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newRequirement}
            onChange={(e) => setNewRequirement(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Add admission requirement..."
          />
          <button
            type="button"
            onClick={addRequirement}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add
          </button>
        </div>
      </div>

      {/* English Language Tests */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">English Language Requirements</h3>
        
        <div className="space-y-3 mb-4">
          {englishTests.map((test, index) => (
            <div key={index} className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{test.testName}</p>
                  {test.minimumScore && (
                    <p className="text-sm text-gray-600 mt-1">Minimum: {test.minimumScore}</p>
                  )}
                  {test.notes && (
                    <p className="text-sm text-gray-500 mt-1">{test.notes}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeTest(index)}
                  className="text-red-600 hover:text-red-800 ml-4"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3 p-4 border-2 border-dashed border-gray-300 rounded-lg">
          <input
            type="text"
            value={newTestName}
            onChange={(e) => setNewTestName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Test name (e.g., IELTS)"
          />
          <input
            type="text"
            value={newTestScore}
            onChange={(e) => setNewTestScore(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Minimum score (e.g., 6.5 overall)"
          />
          <input
            type="text"
            value={newTestNotes}
            onChange={(e) => setNewTestNotes(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Notes (optional)"
          />
          <button
            type="button"
            onClick={addEnglishTest}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Add English Test
          </button>
        </div>
      </div>

      {/* Academic Qualifications */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Qualifications</h3>
        
        <div className="space-y-2 mb-3">
          {academicQualifications.map((qual, index) => (
            <div key={index} className="flex items-center gap-2 bg-green-50 p-3 rounded-lg">
              <span className="text-green-600">•</span>
              <span className="flex-1 text-gray-700">{qual}</span>
              <button
                type="button"
                onClick={() => removeQualification(index)}
                className="text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={newQualification}
            onChange={(e) => setNewQualification(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addQualification())}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Add academic qualification..."
          />
          <button
            type="button"
            onClick={addQualification}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Add
          </button>
        </div>
      </div>

      {/* Source URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Source URL (for verification)
        </label>
        <input
          type="url"
          value={systemSourceUrl}
          onChange={(e) => setSystemSourceUrl(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="https://..."
        />
      </div>
    </div>
  );
}


// Top Cities Section Component
function TopCitiesSection({
  topCities,
  setTopCities,
}: {
  topCities: Array<{
    name: string;
    slug: string;
    image?: { url: string; publicId: string };
    description?: string;
    livingCost?: { min?: number; max?: number };
    currencyCode?: string;
    popularUniversities?: string[];
    popularSubjects?: string[];
    suitableFor?: string[];
  }>;
  setTopCities: (value: typeof topCities) => void;
}) {
  const [isAddingCity, setIsAddingCity] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const addCity = () => {
    const newCity = {
      name: '',
      slug: '',
      description: '',
      livingCost: { min: undefined, max: undefined },
      currencyCode: '',
      popularUniversities: [],
      popularSubjects: [],
      suitableFor: [],
    };
    setTopCities([...topCities, newCity]);
    setEditingIndex(topCities.length);
    setIsAddingCity(true);
  };

  const removeCity = (index: number) => {
    if (confirm('Are you sure you want to remove this city?')) {
      setTopCities(topCities.filter((_, i) => i !== index));
      if (editingIndex === index) {
        setEditingIndex(null);
      }
    }
  };

  const updateCity = (index: number, updates: Partial<typeof topCities[0]>) => {
    const updated = [...topCities];
    updated[index] = { ...updated[index], ...updates };
    setTopCities(updated);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Top Student Cities</h2>
        <button
          type="button"
          onClick={addCity}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          + Add City
        </button>
      </div>

      {topCities.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500 mb-4">No cities added yet</p>
          <button
            type="button"
            onClick={addCity}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Add Your First City
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {topCities.map((city, index) => (
            <CityCard
              key={index}
              city={city}
              index={index}
              isEditing={editingIndex === index}
              onEdit={() => setEditingIndex(index)}
              onSave={() => setEditingIndex(null)}
              onRemove={() => removeCity(index)}
              onUpdate={(updates) => updateCity(index, updates)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// City Card Component
function CityCard({
  city,
  index,
  isEditing,
  onEdit,
  onSave,
  onRemove,
  onUpdate,
}: {
  city: {
    name: string;
    slug: string;
    image?: { url: string; publicId: string };
    description?: string;
    livingCost?: { min?: number; max?: number };
    currencyCode?: string;
    popularUniversities?: string[];
    popularSubjects?: string[];
    suitableFor?: string[];
  };
  index: number;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onRemove: () => void;
  onUpdate: (updates: Partial<typeof city>) => void;
}) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(city.image?.url || null);
  const [uploading, setUploading] = useState(false);

  const [newUniversity, setNewUniversity] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newCategory, setNewCategory] = useState('');

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) {
      alert('Only PNG, JPEG, and WebP images are allowed');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));

    // Upload immediately
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/uploads/city-image', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        onUpdate({ image: result.data });
      } else {
        alert('Failed to upload image');
        setImagePreview(city.image?.url || null);
      }
    } catch (error) {
      alert('Failed to upload image');
      setImagePreview(city.image?.url || null);
    } finally {
      setUploading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const addUniversity = () => {
    if (newUniversity.trim()) {
      onUpdate({
        popularUniversities: [...(city.popularUniversities || []), newUniversity.trim()],
      });
      setNewUniversity('');
    }
  };

  const removeUniversity = (idx: number) => {
    onUpdate({
      popularUniversities: city.popularUniversities?.filter((_, i) => i !== idx),
    });
  };

  const addSubject = () => {
    if (newSubject.trim()) {
      onUpdate({
        popularSubjects: [...(city.popularSubjects || []), newSubject.trim()],
      });
      setNewSubject('');
    }
  };

  const removeSubject = (idx: number) => {
    onUpdate({
      popularSubjects: city.popularSubjects?.filter((_, i) => i !== idx),
    });
  };

  const addCategory = () => {
    if (newCategory.trim()) {
      onUpdate({
        suitableFor: [...(city.suitableFor || []), newCategory.trim()],
      });
      setNewCategory('');
    }
  };

  const removeCategory = (idx: number) => {
    onUpdate({
      suitableFor: city.suitableFor?.filter((_, i) => i !== idx),
    });
  };

  if (!isEditing) {
    return (
      <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
        <div className="flex items-start justify-between">
          <div className="flex gap-4 flex-1">
            {city.image ? (
              <Image
                src={city.image.url}
                alt={city.name}
                width={80}
                height={80}
                className="rounded-lg object-cover"
              />
            ) : (
              <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                No image
              </div>
            )}
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 text-lg">{city.name || 'Unnamed City'}</h4>
              {city.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{city.description}</p>
              )}
              <div className="flex gap-2 mt-2">
                {city.popularUniversities && city.popularUniversities.length > 0 && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {city.popularUniversities.length} universities
                  </span>
                )}
                {city.popularSubjects && city.popularSubjects.length > 0 && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                    {city.popularSubjects.length} subjects
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 border-2 border-blue-300 rounded-lg bg-blue-50">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-900">
          {city.name ? `Editing: ${city.name}` : 'New City'}
        </h4>
        <button
          type="button"
          onClick={onSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Done
        </button>
      </div>

      <div className="space-y-4 bg-white p-4 rounded-lg">
        {/* City Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={city.name}
            onChange={(e) => {
              onUpdate({
                name: e.target.value,
                slug: generateSlug(e.target.value),
              });
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., London"
          />
          {city.slug && (
            <p className="text-xs text-gray-500 mt-1">Slug: {city.slug}</p>
          )}
        </div>

        {/* City Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City Image
          </label>
          <input
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={handleImageChange}
            disabled={uploading}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {uploading && <p className="text-sm text-blue-600 mt-1">Uploading...</p>}
          {imagePreview && (
            <Image
              src={imagePreview}
              alt="Preview"
              width={120}
              height={80}
              className="mt-2 rounded-lg border border-gray-200 object-cover"
            />
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={city.description || ''}
            onChange={(e) => onUpdate({ description: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Brief description of the city..."
          />
        </div>

        {/* Living Cost */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monthly Living Cost Range
          </label>
          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              value={city.currencyCode || ''}
              onChange={(e) => onUpdate({ currencyCode: e.target.value.toUpperCase() })}
              maxLength={3}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
              placeholder="USD"
            />
            <input
              type="number"
              value={city.livingCost?.min || ''}
              onChange={(e) =>
                onUpdate({
                  livingCost: {
                    ...city.livingCost,
                    min: e.target.value ? Number(e.target.value) : undefined,
                  },
                })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Min"
            />
            <input
              type="number"
              value={city.livingCost?.max || ''}
              onChange={(e) =>
                onUpdate({
                  livingCost: {
                    ...city.livingCost,
                    max: e.target.value ? Number(e.target.value) : undefined,
                  },
                })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Max"
            />
          </div>
        </div>

        {/* Popular Universities */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Popular Universities
          </label>
          <div className="space-y-2 mb-2">
            {city.popularUniversities?.map((uni, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded">
                <span className="flex-1 text-sm text-gray-700">{uni}</span>
                <button
                  type="button"
                  onClick={() => removeUniversity(idx)}
                  className="text-red-600 hover:text-red-800"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newUniversity}
              onChange={(e) => setNewUniversity(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addUniversity())}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add university..."
            />
            <button
              type="button"
              onClick={addUniversity}
              className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        </div>

        {/* Popular Subjects */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Popular Subjects
          </label>
          <div className="space-y-2 mb-2">
            {city.popularSubjects?.map((subject, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded">
                <span className="flex-1 text-sm text-gray-700">{subject}</span>
                <button
                  type="button"
                  onClick={() => removeSubject(idx)}
                  className="text-red-600 hover:text-red-800"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubject())}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add subject..."
            />
            <button
              type="button"
              onClick={addSubject}
              className="px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
            >
              Add
            </button>
          </div>
        </div>

        {/* Suitable For */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Suitable For
          </label>
          <div className="space-y-2 mb-2">
            {city.suitableFor?.map((category, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded">
                <span className="flex-1 text-sm text-gray-700">{category}</span>
                <button
                  type="button"
                  onClick={() => removeCategory(idx)}
                  className="text-red-600 hover:text-red-800"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Undergraduate Students"
            />
            <button
              type="button"
              onClick={addCategory}
              className="px-3 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
