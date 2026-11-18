import { useEffect, useState, useCallback } from 'react';
import {
  Users as UsersIcon, Plus, Search, RefreshCw, Edit, Trash2,
  Mail, Phone, ChevronLeft, ChevronRight, UserCheck, UserX, Upload,
} from 'lucide-react';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import ImportModal from '../../components/admin/ImportModal';
import api from '../../services/api';
import useDebounce from '../../hooks/useDebounce';
import {
  formatUserName, getInitials, translateRole, roleBadgeColor,
  translateStatus, statusBadgeColor, formatDateTime, translateUnitType,
} from '../../utils/format';



const ROLES = ['ADMIN', 'TEACHER', 'STUDENT', 'ACCOUNTANT', 'PARENT'];
const STATUSES = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING'];

const emptyForm = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  phone: '',
  role: 'STUDENT',
  status: 'ACTIVE',
  unitId: '',
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [importModalOpen, setImportModalOpen] = useState(false);

  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 400);

  const [units, setUnits] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [deleteModal, setDeleteModal] = useState({ open: false, user: null });

  // Chargement des utilisateurs
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (filterRole) params.role = filterRole;
      if (filterStatus) params.status = filterStatus;

      const res = await api.get('/users', { params });
      setUsers(res.data.data);
      setPagination(res.data.pagination);
      setError('');
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, filterRole, filterStatus]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Chargement des unités pour le select
  useEffect(() => {
    api.get('/institution/units')
      .then((res) => setUnits(res.data.data))
      .catch(() => {});
  }, []);

  // Reset page si les filtres changent
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filterRole, filterStatus]);

  const openCreateModal = () => {
    setModalMode('create');
    setEditingUser(null);
    setFormData(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (user) => {
    setModalMode('edit');
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '',
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || '',
      role: user.role,
      status: user.status,
      unitId: user.unitId || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...formData };
      if (payload.unitId === '') payload.unitId = null;
      if (modalMode === 'edit' && !payload.password) delete payload.password;
          // ═══ Convertir unitId en entier ═══
    if (payload.unitId) {
      payload.unitId = parseInt(payload.unitId);
    } else {
      payload.unitId = null;
    }
      if (modalMode === 'create') {
        await api.post('/users', payload);
        setSuccess('Utilisateur créé avec succès');
      } else {
        await api.put(`/users/${editingUser.id}`, payload);
        setSuccess('Utilisateur modifié avec succès');
      }
      setModalOpen(false);
      await fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/users/${deleteModal.user.id}`);
      setSuccess('Utilisateur supprimé avec succès');
      setDeleteModal({ open: false, user: null });
      await fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.userMessage);
      setDeleteModal({ open: false, user: null });
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.patch(`/users/${user.id}/status`, { status: newStatus });
      setSuccess(`Statut mis à jour : ${translateStatus(newStatus)}`);
      await fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.userMessage);
    }
  };

  return (
    <>
      <Header
        title="Utilisateurs"
        subtitle="Gérez les étudiants, enseignants et personnel administratif"
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
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

        <Card>
          {/* Barre d'outils */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom ou email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-2 text-sm bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-700 dark:text-slate-100"
            >
              <option value="">Tous les rôles</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>{translateRole(r)}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 text-sm bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-gray-700 dark:text-slate-100"
            >
              <option value="">Tous les statuts</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{translateStatus(s)}</option>
              ))}
            </select>

            <Button variant="outline" size="sm" onClick={fetchUsers}>
              <RefreshCw size={14} />
            </Button>
            
            <Button variant="secondary" size="sm" onClick={() => setImportModalOpen(true)}>
              <Upload size={16} />
              Importer Excel
            </Button>

            <Button size="sm" onClick={openCreateModal}>
              <Plus size={16} />
              Nouvel utilisateur
            </Button>

          </div>

          {/* Tableau */}
          {loading ? (
            <Spinner className="py-20" />
          ) : users.length === 0 ? (
            <EmptyState
              icon={UsersIcon}
              title="Aucun utilisateur"
              description="Aucun utilisateur ne correspond à vos critères"
              action={
                <Button onClick={openCreateModal}>
                  <Plus size={16} />
                  Créer un utilisateur
                </Button>
              }
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-slate-700">
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">
                        Utilisateur
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">
                        Contact
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">
                        Rôle
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">
                        Unité
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">
                        Statut
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">
                        Dernière connexion
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr
                        key={u.id}
                        className="border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 font-semibold text-sm">
                              {getInitials(u)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-800 dark:text-slate-200">
                                {formatUserName(u)}
                              </p>
                              <p className="text-xs text-gray-400">{u.email}</p>
                              {u.matricule && (
                                <p className="text-xs font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">
                                  {u.matricule}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-xs text-gray-500 dark:text-slate-400 space-y-1">
                            {u.email && (
                              <div className="flex items-center gap-1">
                                <Mail size={12} /> {u.email}
                              </div>
                            )}
                            {u.phone && (
                              <div className="flex items-center gap-1">
                                <Phone size={12} /> {u.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge color={roleBadgeColor(u.role)}>
                            {translateRole(u.role)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-600 dark:text-slate-400">
                          {u.unit ? `${u.unit.name}` : '—'}
                        </td>
                        <td className="py-3 px-4">
                          <Badge color={statusBadgeColor(u.status)}>
                            {translateStatus(u.status)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-500 dark:text-slate-400">
                          {u.lastLoginAt ? formatDateTime(u.lastLoginAt) : 'Jamais'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleToggleStatus(u)}
                              className={`p-1.5 rounded ${
                                u.status === 'ACTIVE'
                                  ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30'
                                  : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-600'
                              }`}
                              title={u.status === 'ACTIVE' ? 'Désactiver' : 'Activer'}
                            >
                              {u.status === 'ACTIVE' ? <UserCheck size={14} /> : <UserX size={14} />}
                            </button>
                            <button
                              onClick={() => openEditModal(u)}
                              className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-600 rounded"
                              title="Modifier"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteModal({ open: true, user: u })}
                              className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                              title="Supprimer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 dark:border-slate-700">
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {pagination.total} utilisateur(s) — Page {pagination.page} sur {pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft size={14} />
                      Précédent
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Suivant
                      <ChevronRight size={14} />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>

        {/* Modal Création / Édition */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={modalMode === 'create' ? 'Nouvel utilisateur' : 'Modifier l\'utilisateur'}
          size="lg"
          footer={
            <>
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSubmit} loading={saving}>
                {modalMode === 'create' ? 'Créer' : 'Enregistrer'}
              </Button>
            </>
          }
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Prénom"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
              <Input
                label="Nom"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>

            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />

            {formData.role === 'STUDENT' && editingUser?.matricule && (
            <Input
              label="Matricule"
              value={editingUser.matricule}
              disabled
              className="bg-gray-100 dark:bg-slate-700"
            />
            )}

            <Input
              label={modalMode === 'create' ? 'Mot de passe' : 'Nouveau mot de passe (laisser vide pour conserver)'}
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Minimum 6 caractères"
              required={modalMode === 'create'}
            />

            <Input
              label="Téléphone (optionnel)"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                  Rôle
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{translateRole(r)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                  Statut
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{translateStatus(s)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                Unité de rattachement (optionnelle)
              </label>
              <select
                value={formData.unitId}
                onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100"
              >
                <option value="">— Aucune —</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({translateUnitType(u.type)})
                  </option>
                ))}
              </select>
            </div>
          </form>
        </Modal>

        {/* Modal suppression */}
        <Modal
          isOpen={deleteModal.open}
          onClose={() => setDeleteModal({ open: false, user: null })}
          title="Confirmer la suppression"
          footer={
            <>
              <Button variant="outline" onClick={() => setDeleteModal({ open: false, user: null })}>
                Annuler
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Supprimer
              </Button>
            </>
          }
        >
          <p className="text-sm text-gray-600 dark:text-slate-300">
            Voulez-vous vraiment supprimer l'utilisateur{' '}
            <strong>{formatUserName(deleteModal.user)}</strong> ?
          </p>
          <p className="text-xs text-red-600 dark:text-red-400 mt-2">
            ⚠️ Cette action est irréversible. Toutes les données liées (sessions, tokens) seront supprimées.
          </p>
        </Modal>
        
        <ImportModal
          isOpen={importModalOpen}
          onClose={() => setImportModalOpen(false)}
          onSuccess={fetchUsers}
          title="Importer des utilisateurs"
          templateUrl="/users/import/template"
          importUrl="/users/import"
        />
        
      </main>
    </>
  );
}