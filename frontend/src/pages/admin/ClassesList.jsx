import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { School, Users, ChevronRight, Plus } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Spinner from '../../components/ui/Spinner';
import api from '../../services/api';

export default function ClassesList() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/institution/classes')
      .then(res => setClasses(res.data.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner className="py-20" />;

  return (
    <>
      <PageHeader 
        title="Gestion des Classes" 
        subtitle="Consultez les effectifs par classe et exportez les listes"
        badge="Administration"
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-slate-900">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {classes.map(cls => (
            <div 
              key={cls.id} 
              onClick={() => navigate(`/admin/classes/${cls.id}`)}
              className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                  <School size={24} />
                </div>
                <ChevronRight size={20} className="text-gray-300 group-hover:text-indigo-500 transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-slate-100 mb-1">{cls.name}</h3>
              <p className="text-sm text-gray-500 mb-4">Code : {cls.code || 'N/A'}</p>
              
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-slate-400 bg-gray-50 dark:bg-slate-700/50 p-3 rounded-lg">
                <Users size={16} /> 
                {cls._count?.users || 0} étudiant(s) inscrit(s)
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}