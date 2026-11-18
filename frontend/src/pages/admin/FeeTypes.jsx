import { useEffect, useState, useCallback } from 'react';
import {
  Layers, Plus, Search, RefreshCw, Edit, Trash2, DollarSign,
  Clock, CheckCircle2, XCircle,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import api from '../../services/api';
import useDebounce from '../../hooks/useDebounce';

const emptyForm = {
  code: '',
  name: '',
  description: '',
  isRecurring: false,
  isActive: true,
  displayOrder: 0,
};

export default function FeeTypes() {
  const [feeTypes, setFeeTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [deleteModal, setDeleteModal] = useState({ open: false, item: null });

  const fetchFeeTypes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/finance/fee-types');
      setFeeTypes(res.data.data || []);
      setError('');
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeeTypes();
  }, [fetchFeeTypes]);

  const filtered = feeTypes.filter((t) => {
    if (!debouncedSearch) return true;
    const s = debouncedSearch.toLowerCase();
    return (
      t.name?.toLowerCase().includes(s) ||
      t.code?.toLowerCase().includes(s) ||
      t.description?.toLowerCase().includes(s)
    );
  });

  const openCreate = () => {
    setModalMode('create');
    setEditing(null);
    setFormData(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setModalMode('edit');
    setEditing(item);
    setFormData({
      code: item.code,
      name: item.name,
      description: item.description || '',
      isRecurring: item.isRecurring,
      isActive: item.isActive,
      displayOrder: item.displayOrder || 0,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...formData,
        displayOrder: parseInt(formData.displayOrder) || 0,
      };

      if (modalMode === 'create') {
        await api.post('/finance/fee-types', payload);
        setSuccess('Type de frais créé avec succès');
      } else {
        await api.put(`/finance/fee-types/${editing.id}`, payload);
        setSuccess('Type de frais modifié');
      }
      setModalOpen(false);
      await fetchFeeTypes();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/finance/fee-types/${deleteModal.item.id}`);
      setSuccess('Type de frais supprimé');
      setDeleteModal({ open: false, item: null });
      await fetchFeeTypes();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.userMessage);
      setDeleteModal({ open: false, item: null });
    }
  };

  return (
    <>
      <PageHeader
        title="Types de frais"
        subtitle="Définissez les catégories de frais (inscription, scolarité, examens...)"
        badge="Finance"
        action={
          <Button size="sm" onClick={openCreate}>
            <Plus size={16} />
            Nouveau type
          </Button>
        }
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-slate-900">
        {error && (
          <div className="mb-4">
            <Alert type="error" message={error} onClose={() => setError('')} />
          </div>
        )}
        {success && (
          <div className="mb-4">
            <Alert type="success" message={success} onClose={() => setSuccess('')} />
          </div>
        )}

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <MiniStat
            icon={Layers}
            label="Total types"
            value={feeTypes.length}
            color="violet"
          />
          <MiniStat
            icon={Clock}
            label="Récurrents"
            value={feeTypes.filter((t) => t.isRecurring).length}
            color="blue"
          />
          <MiniStat
            icon={CheckCircle2}
            label="Actifs"
            value={feeTypes.filter((t) => t.isActive).length}
            color="emerald"
          />
        </div>

        {/* Barre d'outils */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="relative flex-1 min-w-[240px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un type de frais..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <Button variant="outline" size="sm" onClick={fetchFeeTypes}>
            <RefreshCw size={14} />
          </Button>
        </div>

        {/* Liste */}
        {loading ? (
          <Spinner className="py-20" />
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700">
            <EmptyState
              icon={Layers}
              title="Aucun type de frais"
              description="Créez votre premier type de frais pour commencer"
              action={
                <Button onClick={openCreate}>
                  <Plus size={16} />
                  Créer un type
                </Button>
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="group bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-11 h-11 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                    <DollarSign size={20} className="text-violet-600 dark:text-violet-400" />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(item)}
                      className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 rounded"
                      title="Modifier"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteModal({ open: true, item })}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                      title="Supprimer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono bg-gray-100 dark:bg-slate-700 px-2 py-0.5 rounded text-gray-600 dark:text-slate-300">
                    {item.code}
                  </span>
                  {item.isRecurring && <Badge color="blue">Récurrent</Badge>}
                  {!item.isActive && <Badge color="gray">Inactif</Badge>}
                </div>

                <h3 className="font-semibold text-gray-800 dark:text-slate-100 mb-1">
                  {item.name}
                </h3>

                {item.description && (
                  <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2">
                    {item.description}
                  </p>
                )}

                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-slate-400">
                    {item._count?.fees || 0} frais lié(s)
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal création/édition */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={modalMode === 'create' ? 'Nouveau type de frais' : 'Modifier le type de frais'}
          footer={
            <>
              <Button variant="outline" onClick={() => setModalOpen(false)}>Annuler</Button>
              <Button onClick={handleSubmit} loading={saving}>
                {modalMode === 'create' ? 'Créer' : 'Enregistrer'}
              </Button>
            </>
          }
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Code *"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="Ex: SCOLARITE"
                required
              />
              <Input
                label="Ordre d'affichage"
                type="number"
                min="0"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
              />
            </div>

            <Input
              label="Nom *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Frais de scolarité"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-slate-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/30">
                <input
                  type="checkbox"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 dark:text-slate-300">
                    Frais récurrent
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    Payable plusieurs fois (mensuel). Sera divisé en échéances.
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-slate-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/30">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 dark:text-slate-300">
                    Actif
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    Les types inactifs ne peuvent pas être utilisés pour créer de nouveaux frais.
                  </p>
                </div>
              </label>
            </div>
          </form>
        </Modal>

        {/* Modal suppression */}
        <Modal
          isOpen={deleteModal.open}
          onClose={() => setDeleteModal({ open: false, item: null })}
          title="Supprimer le type de frais"
          footer={
            <>
              <Button variant="outline" onClick={() => setDeleteModal({ open: false, item: null })}>
                Annuler
              </Button>
              <Button variant="danger" onClick={handleDelete}>Supprimer</Button>
            </>
          }
        >
          <p className="text-sm text-gray-600 dark:text-slate-300">
            Voulez-vous vraiment supprimer le type{' '}
            <strong>{deleteModal.item?.name}</strong> ?
          </p>
          <p className="text-xs text-red-600 dark:text-red-400 mt-2">
            ⚠️ Cette action est irréversible. Impossible si des frais y sont rattachés.
          </p>
        </Modal>
      </main>
    </>
  );
}

// Sous-composant
function MiniStat({ icon: Icon, label, value, color }) {
  const colors = {
    violet: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400',
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-slate-400">{label}</p>
        <p className="text-xl font-bold text-gray-800 dark:text-slate-100">{value}</p>
      </div>
    </div>
  );
}