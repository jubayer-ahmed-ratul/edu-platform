import CountryDetailsClient from './country-details-client';

// Opt out of static optimization to allow runtime params
export const instant = false;

export default async function CountryDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <CountryDetailsClient id={id} />;
}
