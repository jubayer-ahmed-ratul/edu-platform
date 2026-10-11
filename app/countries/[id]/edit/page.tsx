import CountryEditClient from './country-edit-client';

// Opt out of static optimization
export const instant = false;

export default async function CountryEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <CountryEditClient id={id} />;
}
