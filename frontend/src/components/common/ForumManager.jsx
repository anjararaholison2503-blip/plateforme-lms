import { useEffect, useState } from 'react';
import { MessageSquare, Video, Plus, Send, Calendar, X } from 'lucide-react';
import api from '../../services/api';
import Button from '../ui/Button';

export default function ForumManager({ courseId, userRole }) {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  // Formulaire nouveau sujet
  const [showCreate, setShowCreate] = useState(false);
  const [newTopic, setNewTopic] = useState({ title: '', content: '', meetingLink: '', meetingDate: '' });

  const fetchTopics = async () => {
    try {
      const res = await api.get(`/forum/topics/course/${courseId}`);
      setTopics(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTopics(); }, [courseId]);

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    try {
      await api.post('/forum/topics', { ...newTopic, courseId });
      setShowCreate(false);
      setNewTopic({ title: '', content: '', meetingLink: '', meetingDate: '' });
      fetchTopics();
    } catch (err) {
      alert('Erreur lors de la création');
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    try {
      const res = await api.post(`/forum/topics/${selectedTopic.id}/replies`, { content: replyContent });
      // On met à jour localement
      setSelectedTopic({ ...selectedTopic, replies: [...selectedTopic.replies, res.data.data] });
      setReplyContent('');
    } catch (err) {
      alert('Erreur');
    }
  };

  const openTopic = async (id) => {
    try {
      const res = await api.get(`/forum/topics/${id}`);
      setSelectedTopic(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p>Chargement...</p>;

  // --- VUE DÉTAIL D'UN SUJET ---
  if (selectedTopic) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6">
        <button onClick={() => setSelectedTopic(null)} className="text-sm text-indigo-600 mb-4 flex items-center gap-1 hover:underline">
          <X size={14} /> Retour aux sujets
        </button>
        
        <h3 className="text-xl font-bold mb-2">{selectedTopic.title}</h3>
        <p className="text-sm text-gray-500 mb-4">Par {selectedTopic.author.firstName} {selectedTopic.author.lastName}</p>
        <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl mb-6">
          <p className="text-gray-800 dark:text-slate-200">{selectedTopic.content}</p>
        </div>

        {/* Bouton Visio */}
        {selectedTopic.meetingLink && (
          <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Video className="text-indigo-600" />
              <div>
                <p className="font-bold text-indigo-900">Réunion programmée</p>
                <p className="text-xs text-indigo-700">{new Date(selectedTopic.meetingDate).toLocaleString('fr-FR')}</p>
              </div>
            </div>
            <a href={selectedTopic.meetingLink} target="_blank" rel="noreferrer" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
              Rejoindre
            </a>
          </div>
        )}

        {/* Réponses */}
        <div className="space-y-4 mb-6">
          {selectedTopic.replies.map((reply) => (
            <div key={reply.id} className="p-4 border border-gray-100 dark:border-slate-700 rounded-xl">
              <p className="text-xs text-gray-500 mb-1">{reply.author.firstName} {reply.author.lastName} · {new Date(reply.createdAt).toLocaleString()}</p>
              <p className="text-gray-800 dark:text-slate-200">{reply.content}</p>
            </div>
          ))}
        </div>

        {/* Formulaire de réponse */}
        <form onSubmit={handleReply} className="flex gap-2">
          <input
            type="text"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Écrivez votre réponse..."
            className="flex-1 px-4 py-2 border rounded-xl dark:bg-slate-700 dark:border-slate-600"
          />
          <Button type="submit" className="!bg-indigo-600"><Send size={16} /></Button>
        </form>
      </div>
    );
  }

  // --- VUE LISTE DES SUJETS ---
  return (
    <div>
      {userRole === 'TEACHER' && (
        <div className="mb-6">
          {!showCreate ? (
            <Button onClick={() => setShowCreate(true)} className="!bg-indigo-600"><Plus size={16} /> Nouveau sujet de discussion</Button>
          ) : (
            <form onSubmit={handleCreateTopic} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 space-y-4 mb-6">
              <h4 className="font-bold text-lg">Créer un sujet</h4>
              <input type="text" placeholder="Titre du sujet" required value={newTopic.title} onChange={e => setNewTopic({...newTopic, title: e.target.value})} className="w-full px-4 py-2 border rounded-xl dark:bg-slate-700" />
              <textarea placeholder="Message..." required rows={3} value={newTopic.content} onChange={e => setNewTopic({...newTopic, content: e.target.value})} className="w-full px-4 py-2 border rounded-xl dark:bg-slate-700" />
              
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl space-y-3">
                <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-2"><Video size={16}/> Programmer une visioconférence (Optionnel)</p>
                <input type="url" placeholder="Lien Google Meet / Zoom / Jitsi" value={newTopic.meetingLink} onChange={e => setNewTopic({...newTopic, meetingLink: e.target.value})} className="w-full px-4 py-2 border rounded-xl text-sm" />
                <input type="datetime-local" value={newTopic.meetingDate} onChange={e => setNewTopic({...newTopic, meetingDate: e.target.value})} className="w-full px-4 py-2 border rounded-xl text-sm" />
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Annuler</Button>
                <Button type="submit" className="!bg-emerald-600">Publier</Button>
              </div>
            </form>
          )}
        </div>
      )}

      <div className="space-y-3">
        {topics.map((topic) => (
          <div 
            key={topic.id} 
            onClick={() => openTopic(topic.id)}
            className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-slate-700 hover:border-indigo-300 cursor-pointer transition-colors flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <MessageSquare size={20} />
              </div>
              <div>
                <p className="font-bold text-gray-800 dark:text-slate-100">{topic.title}</p>
                <p className="text-xs text-gray-500">Par {topic.author.firstName} · {topic._count.replies} réponse(s)</p>
              </div>
            </div>
            {topic.meetingLink && (
              <span className="px-3 py-1 bg-rose-50 text-rose-600 text-xs font-bold rounded-full flex items-center gap-1">
                <Video size={12} /> Visio programmée
              </span>
            )}
          </div>
        ))}
        {topics.length === 0 && <p className="text-center text-gray-500 py-8">Aucun sujet pour le moment.</p>}
      </div>
    </div>
  );
}