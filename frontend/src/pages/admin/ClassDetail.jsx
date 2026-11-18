import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Search, Mail, Phone } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import api from '../../services/api';

export default function ClassDetail() {
  const { id } = useParams();
  const [students, setStudents] = useState([]);
  const [className, setClassName] = useState('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // On récupère les infos de la classe et ses étudiants
    Promise.all([
      api.get('/institution/classes'),
      api.get(`/institution/classes/${id}/students`)
    ]).then(([classesRes, studentsRes]) => {
      const currentClass = classesRes.data.data.find(c => c.id === parseInt(id));
      setClassName(currentClass?.name || 'Classe');
      setStudents(studentsRes.data.data || []);
    }).catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleExport = async () => {
    try {
      // On utilise axios pour télécharger le fichier
      const response = await api.get(`/institution/classes/${id}/export`, { responseType: 'blob' });
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Etudiants_${className}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Erreur lors de l\'export Excel');
    }
  };

  const filteredStudents = students.filter(s => 
    `${s.firstName} ${s.lastName} ${s.matricule}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Spinner className="py-20" />;

  return (
    <>
      <PageHeader 
        title={`Classe : ${className}`} 
        subtitle={`Liste des étudiants (${students.length})`}
        badge="Administration"
        action={
          <div className="flex gap-2">
            <Button onClick={handleExport} className="!bg-emerald-600">
              <Download size={16} /> Exporter Excel
            </Button>
            <Link to="/admin/classes">
              <Button variant="outline">
                <ArrowLeft size={16} /> Retour
              </Button>
            </Link>
          </div>
        }
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-slate-900">
        <div className="max-w-6xl mx-auto">
          
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden">
            {/* Barre de recherche */}
            <div className="p-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
              <div className="relative w-full max-w-md">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un étudiant par nom ou matricule..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 text-sm"
                />
              </div>
            </div>

            {/* Tableau */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white dark:bg-slate-800 text-gray-500 text-sm border-b dark:border-slate-700">
                    <th className="p-4 font-medium">Matricule</th>
                    <th className="p-4 font-medium">Nom complet</th>
                    <th className="p-4 font-medium">Contact</th>
                    <th className="p-4 font-medium">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {filteredStudents.map(student => (
                    <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                      <td className="p-4 text-sm font-mono text-gray-600">{student.matricule || '—'}</td>
                      <td className="p-4">
                        <p className="font-medium text-gray-800 dark:text-slate-200">{student.lastName} {student.firstName}</p>
                      </td>
                      <td className="p-4 text-sm text-gray-500">
                        <p className="flex items-center gap-1"><Mail size={12}/> {student.email}</p>
                        {student.phone && <p className="flex items-center gap-1 mt-1"><Phone size={12}/> {student.phone}</p>}
                      </td>
                      <td className="p-4">
                        <Badge color={student.status === 'ACTIVE' ? 'emerald' : 'gray'}>
                          {student.status === 'ACTIVE' ? 'Actif' : student.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr><td colSpan="4" className="p-8 text-center text-gray-500">Aucun étudiant trouvé.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}