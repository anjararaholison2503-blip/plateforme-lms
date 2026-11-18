import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import { DollarSign } from 'lucide-react';

export default function Finance() {
  return (
    <>
      <Header title="Finances" subtitle="Gérez les frais de scolarité et paiements" />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <Card>
          <EmptyState
            icon={DollarSign}
            title="Gestion financière"
            description="Cette section sera bientôt disponible."
          />
        </Card>
      </main>
    </>
  );
}