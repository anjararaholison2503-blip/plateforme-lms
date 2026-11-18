import { useEffect, useState } from 'react';
import {
  ChevronRight, ChevronDown, Building2, Plus, Edit, Trash2,
  RefreshCw, Users as UsersIcon, BookOpen,
} from 'lucide-react';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import api from '../../services/api';
import { unitTypeBadgeColor, translateUnitType } from '../../utils/format';

const UNIT_TYPES = ['ESTABLISHMENT', 'FACULTY', 'DEPARTMENT', 'PROGRAM', 'LEVEL', 'CLASS', 'GROUP'];

function TreeNode({ node, level = 0, onEdit, onDelete, onAddChild }) {
  const [expanded, setExpanded] = useState(level < 3);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <div
        className="flex items-center gap-2 py-2 px-3 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg group"
        style={{ paddingLeft: `${level * 20 + 12}px` }}
      >
        <button
          onClick={() => setExpanded(!expanded)}
          className={`w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 dark:hover:bg-slate-600 ${!hasChildren && 'invisible'}`}
        >
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        <Building2 size={16} className="text-gray-400" />

        <span className="font-medium text-gray-800 dark:text-slate-200 text-sm">
          {node.name}
        </span>

        {node.code && (
          <span className="text-xs text-gray-400 font-mono">({node.code})</span>
        )}

        <Badge color={unitTypeBadgeColor(node.type)}>
          {translateUnitType(node.type)}
        </Badge>

        <span className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onAddChild(node)}
            className="p-1.5 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded"
            title="Ajouter une sous-unité"
          >
            <Plus size={14} />
          </button>
          <button
            onClick={() => onEdit(node)}
            className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-600 rounded"
            title="Modifier"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={() => onDelete(node)}
            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
            title="Supprimer"
          >
            <Trash2 size={14} />
          </button>
        </span>
      </div>

      {expanded && hasChildren && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Institution() {
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [editingUnit, setEditingUnit] = useState(null);
  const [parentUnit, setParentUnit] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'FACULTY',
    parentId: null,
    description: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchTree = async () => {
    setLoading(true);
    try {
      const res = await api.get('/institution/tree');
      setTree(res.data.data);
      setError('');
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTree();
  }, []);

  const openCreateModal = (parent = null) => {
    setModalMode('create');
    setParentUnit(parent);
    setEditingUnit(null);
    setFormData({
      name: '',
      code: '',
      type: parent ? 'DEPARTMENT' : 'FACULTY',
      parentId: parent?.id || null,
      description: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (unit) => {
    setModalMode('edit');
    setEditingUnit(unit);
    setParentUnit(null);
    setFormData({
      name: unit.name,
      code: unit.code || '',
      type: unit.type,
      parentId: unit.parentId,
      description: unit.description || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (modalMode === 'create') {
        await api.post('/institution/units', formData);
        setSuccess('Unité créée avec succès');
      } else {
        await api.put(`/institution/units/${editingUnit.id}`, formData);
        setSuccess('Unité modifiée avec succès');
      }
      setModalOpen(false);
      await fetchTree();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (unit) => {
    if (!confirm(`Supprimer définitivement "${unit.name}" ?`)) return;
    try {
      await api.delete(`/institution/units/${unit.id}`);
      setSuccess('Unité supprimée avec succès');
      await fetchTree();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.userMessage);
    }
  };

  return (
    <>
      <Header
        title="Structure de l'établissement"
        subtitle="Gérez la hiérarchie : établissement, facultés, départements, filières..."
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

        <Card
          title="Hiérarchie"
          action={
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchTree}>
                <RefreshCw size={14} />
                Actualiser
              </Button>
              <Button size="sm" onClick={() => openCreateModal()}>
                <Plus size={16} />
                Nouvelle unité
              </Button>
            </div>
          }
        >
          {loading ? (
            <Spinner className="py-20" />
          ) : tree.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="Aucune unité pour le moment"
              description="Commencez par créer votre établissement racine"
              action={
                <Button onClick={() => openCreateModal()}>
                  <Plus size={16} />
                  Créer l'établissement
                </Button>
              }
            />
          ) : (
            <div>
              {tree.map((node) => (
                <TreeNode
                  key={node.id}
                  node={node}
                  onEdit={openEditModal}
                  onDelete={handleDelete}
                  onAddChild={openCreateModal}
                />
              ))}
            </div>
          )}
        </Card>

        {/* Modal création / édition */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={modalMode === 'create' ? 'Nouvelle unité' : 'Modifier l\'unité'}
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
            {parentUnit && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  Sous-unité de : <strong>{parentUnit.name}</strong>
                </p>
              </div>
            )}

            <Input
              label="Nom"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Faculté des Sciences"
              required
            />

            <Input
              label="Code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="Ex: FAC-SCI"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {UNIT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {translateUnitType(type)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                Description (optionnelle)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </form>
        </Modal>
      </main>
    </>
  );
}