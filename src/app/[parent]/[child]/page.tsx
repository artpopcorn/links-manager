import CategoryView from '@/components/CategoryView';

interface PageProps {
  params: Promise<{ parent: string; child: string }>;
}

export default async function ChildPage({ params }: PageProps) {
  const { parent, child } = await params;
  return <CategoryView parentSlug={parent} childSlug={child} />;
}

