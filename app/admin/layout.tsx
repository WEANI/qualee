import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Qualee Admin',
  description: 'Administration Dashboard for Qualee',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-layout">
      {children}
    </div>
  );
}
