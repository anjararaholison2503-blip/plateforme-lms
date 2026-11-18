import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Send, Eye, Lock, CheckCircle2,Trash2 } from 'lucide-react';
import api from '../../services/api';
import Badge from '../ui/Badge';
import Spinner from '../ui/Spinner';

export default function ExamList({ courseId, userRole }) {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const isTeacher = userRole === 'TEACHER' || userRole === 'ADMIN';

  const fetchExams = async () => {
    try {
const res = await api.get(`/exams/course/${courseId}`);
      setExams(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (courseId) fetchExams(); }, [courseId]);

  const handlePublish = async (examId) => {
    if (!confirm('Publier cet examen ? Les étudiants pourront le passer.')) return;
    try {
      await api.patch(`/exams/${examId}/publish`);
      fetchExams();
    } catch (err) {
      alert(err.userMessage || 'Erreur');
    }
  };
    const handleDelete = async (examId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet examen ? Toutes les questions et les copies des étudiants seront effacées.')) return;
    try {
      await api.delete(`/exams/${examId}`);
      fetchExams(); // Rafraîchir la liste
    } catch (err) {
      alert(err.userMessage || 'Erreur lors de la suppression');
    }
  };

  if (loading) return <Spinner className="py-4" />;
  if (exams.length === 0) return <p className="text-sm text-gray-500">Aucun examen pour le moment.</p>;

  return (
    <div className="space-y-3">
      {exams.map((exam) => (
        <div key={exam.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
              <FileText size={20} />
            </div>
            <div>
              <p className="font-semibold text-gray-800 dark:text-slate-200">{exam.title}</p>
              <p className="text-xs text-gray-500">{exam.duration} min · Note de passage : {exam.passingScore}/20</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge color={exam.status === 'PUBLISHED' ? 'emerald' : 'gray'}>
              {exam.status === 'PUBLISHED' ? 'Publié' : 'Brouillon'}
            </Badge>
            
            {isTeacher && exam.status === 'DRAFT' && (
              <button onClick={() => handlePublish(exam.id)} className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1">
                <Send size={14} /> Publier
              </button>
            )}
            
            {/* Bouton Supprimer */}
            {isTeacher && (
            <button 
                onClick={() => handleDelete(exam.id)} 
                className="text-xs text-rose-600 hover:bg-rose-50 border border-rose-200 px-2 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                title="Supprimer l'examen"
            >
                <Trash2 size={14} />
            </button>
            )}

            {!isTeacher && exam.status === 'PUBLISHED' && (
              <button onClick={() => navigate(`/exam/${exam.id}/runner`)} className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg">
                Passer l'examen
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}