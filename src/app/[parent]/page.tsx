import CategoryView from '@/components/CategoryView';

interface PageProps {
  params: Promise<{ parent: string }>;
}

export default async function ParentPage({ params }: PageProps) {
  const { parent } = await params;
  return <CategoryView parentSlug={parent} />;
}

