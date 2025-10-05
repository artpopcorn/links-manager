import CategoryView from '@/components/CategoryView';

interface PageProps {
  params: Promise<{ parent: string; child: string; link: string }>;
}

export default async function LinkPage({ params }: PageProps) {
  const { parent, child, link } = await params;
  return <CategoryView parentSlug={parent} childSlug={child} linkSlug={link} />;
}

