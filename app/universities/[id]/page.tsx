import UniversityDetailsClient from './university-details-client';

export const instant = false;

export default async function UniversityDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <UniversityDetailsClient id={id} />;
}
