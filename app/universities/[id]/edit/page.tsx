import UniversityEditClient from './university-edit-client';

export const instant = false;

export default async function UniversityEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <UniversityEditClient id={id} />;
}
