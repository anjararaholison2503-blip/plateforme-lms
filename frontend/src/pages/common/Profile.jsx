import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Camera, Save, User } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import api from '../../services/api';

export default function Profile() {
  const auth = useAuth();
  const user = auth?.user;
  const updateUser = auth?.updateUser;
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    password: '',
  });

  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || null);
  const [avatarFile, setAvatarFile] = useState(null);

  // ⚠️ Si user n'existe pas, on affiche un message (pas de page blanche)
  if (!user) {
    return (
      <>
        <PageHeader title="Mon Profil" />
        <main className="flex-1 p-8 bg-gray-50 dark:bg-slate-900">
          <Alert type="error" message="Utilisateur non connecté. Veuillez vous reconnecter." />
        </main>
      </>
    );
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
      };

      if (formData.password && formData.password.trim() !== '') {
        payload.password = formData.password;
      }

      const res = await api.put('/auth/profile', payload);
      
      let avatarUrl = res.data.data.avatarUrl;
      
      if (avatarFile) {
        const formDataAvatar = new FormData();
        formDataAvatar.append('avatar', avatarFile);
        const avatarRes = await api.post('/auth/profile/avatar', formDataAvatar, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        avatarUrl = avatarRes.data.data.avatarUrl;
      }

      if (typeof updateUser === 'function') {
        updateUser({ ...res.data.data, avatarUrl });
      }

      setSuccess('Profil mis à jour avec succès !');
      setFormData({ ...formData, password: '' });
    } catch (err) {
      setError(err.userMessage || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader title="Mon Profil" subtitle="Gérez vos informations personnelles" />
      
      <main className="flex-1 p-4 sm:p-8 bg-gray-50 dark:bg-slate-900 overflow-y-auto">
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-8">
          
          {error && <div className="mb-4"><Alert type="error" message={error} onClose={() => setError('')} /></div>}
          {success && <div className="mb-4"><Alert type="success" message={success} onClose={() => setSuccess('')} /></div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Avatar */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview.startsWith('blob:') ? avatarPreview : `http://localhost:5000${avatarPreview}`} 
                      alt="Avatar" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <User size={48} />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full cursor-pointer hover:bg-indigo-700 shadow-md">
                  <Camera size={18} />
                  <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                </label>
              </div>
              <p className="text-sm text-gray-500 mt-2">Cliquez sur l'icône pour changer la photo</p>
            </div>

            {/* Champs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Prénom</label>
                <input type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full px-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nom</label>
                <input type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full px-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Adresse Email</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600" required />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Nouveau mot de passe (optionnel)</label>
              <input type="password" placeholder="Laisser vide pour ne pas changer" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600" />
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-slate-700 flex justify-end">
              <Button type="submit" loading={loading} className="!bg-indigo-600">
                <Save size={16} /> Enregistrer les modifications
              </Button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}