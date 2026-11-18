import { useEffect, useState } from 'react';
import {
  Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight,
  Clock, MapPin, Edit, Trash2, RefreshCw, LayoutGrid, List,
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
import { formatDate } from '../../utils/format';

const EVENT_TYPES = [
  { value: 'COURSE', label: 'Cours', color: 'blue' },
  { value: 'EXAM', label: 'Examen', color: 'red' },
  { value: 'MEETING', label: 'Réunion', color: 'purple' },
  { value: 'DEADLINE', label: 'Échéance', color: 'yellow' },
  { value: 'OTHER', label: 'Autre', color: 'gray' },
];

export default function TeacherCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [viewMode, setViewMode] = useState('MONTH'); // MOIS ou SEMAINE

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', type: 'COURSE', visibility: 'PUBLIC',
    startDate: '', endDate: '', allDay: false, location: '', color: '#3B82F6',
  });

  const fetchEvents = async () => {
    setLoading(true);
    try {
      let start, end;

      if (viewMode === 'MONTH') {
        start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      } else {
        // Si on est en mode SEMAINE
        const day = currentDate.getDay();
        const diffToMonday = day === 0 ? -6 : 1 - day;
        start = new Date(currentDate);
        start.setDate(currentDate.getDate() + diffToMonday);
        start.setHours(0,0,0,0);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23,59,59,999);
      }

      const res = await api.get('/calendar', {
        params: { startDate: start.toISOString(), endDate: end.toISOString() },
      });
      setEvents(res.data.data);
      setError('');
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, [currentDate, viewMode]);

  const goToPrevious = () => {
    if (viewMode === 'MONTH') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() - 7);
      setCurrentDate(newDate);
    }
  };

  const goToNext = () => {
    if (viewMode === 'MONTH') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + 7);
      setCurrentDate(newDate);
    }
  };

  const goToToday = () => setCurrentDate(new Date());

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

    const days = [];
    for (let i = startDay - 1; i >= 0; i--) days.push({ date: new Date(year, month, -i), isCurrentMonth: false });
    for (let i = 1; i <= daysInMonth; i++) days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    return days;
  };

  const getWeekDays = () => {
    const day = currentDate.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(currentDate);
    monday.setDate(currentDate.getDate() + diffToMonday);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const getEventsForDay = (date) => {
    return events.filter((event) => {
      const start = new Date(event.startDate);
      const end = new Date(event.endDate);
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const s = new Date(start);
      s.setHours(0, 0, 0, 0);
      const e = new Date(end);
      e.setHours(23, 59, 59, 999);
      return d >= s && d <= e;
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  };

  const openCreateModal = (date = null) => {
    setEditingEvent(null);
    const baseDate = date || new Date();
    const isoDate = baseDate.toISOString().slice(0, 16);
    setFormData({
      title: '', description: '', type: 'COURSE', visibility: 'PUBLIC',
      startDate: isoDate, endDate: isoDate, allDay: false, location: '', color: '#3B82F6',
    });
    setModalOpen(true);
  };

  const openEditModal = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      type: event.type,
      visibility: event.visibility,
      startDate: new Date(event.startDate).toISOString().slice(0, 16),
      endDate: new Date(event.endDate).toISOString().slice(0, 16),
      allDay: event.allDay,
      location: event.location || '',
      color: event.color || '#3B82F6',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      };

      if (editingEvent) {
        await api.put(`/calendar/${editingEvent.id}`, payload);
        setSuccess('Événement modifié');
      } else {
        await api.post('/calendar', payload);
        setSuccess('Événement créé');
      }
      setModalOpen(false);
      await fetchEvents();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.userMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (event) => {
    if (!confirm(`Supprimer "${event.title}" ?`)) return;
    try {
      await api.delete(`/calendar/${event.id}`);
      setSuccess('Événement supprimé');
      await fetchEvents();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.userMessage);
    }
  };

  const getTypeBadge = (type) => {
    const config = EVENT_TYPES.find((t) => t.value === type) || EVENT_TYPES[4];
    return <Badge color={config.color}>{config.label}</Badge>;
  };

  const monthName = currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  return (
    <>
      <PageHeader
        title={viewMode === 'MONTH' ? "Mon agenda" : "Mon emploi du temps"}
        subtitle={viewMode === 'MONTH' ? "Vos cours et événements" : "Votre planning de la semaine"}
        badge="Enseignant"
        action={
          <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('MONTH')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${viewMode === 'MONTH' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-gray-500'}`}
            >
              <LayoutGrid size={16} /> Vue Mois
            </button>
            <button
              onClick={() => setViewMode('WEEK')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${viewMode === 'WEEK' ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600' : 'text-gray-500'}`}
            >
              <List size={16} /> Emploi du temps
            </button>
          </div>
        }
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-slate-900">
        {error && <div className="mb-4"><Alert type="error" message={error} onClose={() => setError('')} /></div>}
        {success && <div className="mb-4"><Alert type="success" message={success} onClose={() => setSuccess('')} /></div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Card className="lg:col-span-2" noPadding>
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <button onClick={goToPrevious} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700">
                  <ChevronLeft size={20} />
                </button>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-100 capitalize min-w-[200px] text-center">
                  {viewMode === 'MONTH' ? monthName : `Semaine du ${getWeekDays()[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`}
                </h2>
                <button onClick={goToNext} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700">
                  <ChevronRight size={20} />
                </button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={goToToday}>Aujourd'hui</Button>
                <Button size="sm" onClick={() => openCreateModal()}>
                  <Plus size={16} />
                  Nouvel événement
                </Button>
              </div>
            </div>

            {loading ? (
              <Spinner className="py-20" />
            ) : viewMode === 'MONTH' ? (
              <div className="p-4">
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {dayNames.map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-slate-400 py-2">{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {getDaysInMonth().map((day, index) => {
                    const dayEvents = getEventsForDay(day.date);
                    const today = isToday(day.date);
                    return (
                      <div
                        key={index}
                        className={`min-h-[80px] p-1.5 rounded-lg border cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-slate-700 ${
                          today ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-100 dark:border-slate-700'
                        } ${!day.isCurrentMonth ? 'opacity-40' : ''}`}
                        onClick={() => openCreateModal(day.date)}
                      >
                        <div className={`text-xs font-medium mb-1 ${today ? 'text-primary-600 dark:text-primary-400' : 'text-gray-700 dark:text-slate-300'}`}>
                          {day.date.getDate()}
                        </div>
                        <div className="space-y-0.5">
                          {dayEvents.slice(0, 2).map((event) => (
                            <div key={event.id} className="text-[10px] px-1 py-0.5 rounded truncate text-white font-medium" style={{ backgroundColor: event.color || '#3B82F6' }} title={event.title}>
                              {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && <div className="text-[10px] text-gray-500 dark:text-slate-400">+{dayEvents.length - 2}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-4 overflow-x-auto">
                <div className="grid grid-cols-7 gap-2 min-w-[700px]">
                  {getWeekDays().map((day, index) => {
                    const isCurrentDay = isToday(day);
                    const dayEvents = getEventsForDay(day);

                    return (
                      <div key={index} className={`rounded-xl border flex flex-col min-h-[400px] ${isCurrentDay ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-900/10' : 'border-gray-200 dark:border-slate-700'}`}>
                        <div className={`p-3 text-center border-b ${isCurrentDay ? 'bg-indigo-100 dark:bg-indigo-900/40 border-indigo-200 dark:border-indigo-800' : 'border-gray-100 dark:border-slate-700'}`}>
                          <p className={`text-xs font-bold uppercase ${isCurrentDay ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-500'}`}>
                            {day.toLocaleDateString('fr-FR', { weekday: 'short' })}
                          </p>
                          <p className={`text-2xl font-bold ${isCurrentDay ? 'text-indigo-600' : 'text-gray-800 dark:text-slate-200'}`}>
                            {day.getDate()}
                          </p>
                        </div>
                        <div className="p-2 space-y-2 flex-1">
                          {dayEvents.length === 0 ? (
                            <p className="text-xs text-center text-gray-400 mt-4 italic">Libre</p>
                          ) : (
                            dayEvents.map(event => (
                              <div key={event.id} className="p-2 rounded-lg bg-white dark:bg-slate-800 border-l-4 text-xs shadow-sm" style={{ borderLeftColor: event.color || '#4f46e5' }}>
                                <p className="font-bold text-gray-800 dark:text-slate-100 mb-1 leading-tight">{event.title}</p>
                                <div className="text-gray-500 dark:text-slate-400 space-y-1">
                                  <p className="flex items-center gap-1"><Clock size={10} /> {new Date(event.startDate).toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'})}</p>
                                  {event.location && <p className="flex items-center gap-1 truncate"><MapPin size={10} /> {event.location}</p>}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>

          <Card
            title="Mes événements"
            action={
              <Button variant="ghost" size="sm" onClick={fetchEvents}>
                <RefreshCw size={14} />
              </Button>
            }
          >
            {loading ? (
              <Spinner className="py-10" />
            ) : events.length === 0 ? (
              <EmptyState icon={CalendarIcon} title="Aucun événement" description="Créez votre premier événement" />
            ) : (
              <ul className="space-y-3 max-h-[600px] overflow-y-auto">
                {events.map((event) => (
                  <li key={event.id} className="p-3 rounded-lg border border-gray-100 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors group">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: event.color || '#3B82F6' }} />
                          <p className="text-sm font-medium text-gray-800 dark:text-slate-200 truncate">{event.title}</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400 mb-1">
                          <Clock size={12} />
                          {formatDate(event.startDate)}
                        </div>
                        <div className="mt-2">{getTypeBadge(event.type)}</div>
                      </div>
                      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEditModal(event)} className="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-600 rounded">
                          <Edit size={12} />
                        </button>
                        <button onClick={() => handleDelete(event)} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {/* Modal (Création / Modification) */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingEvent ? 'Modifier l\'événement' : 'Nouvel événement'}
          footer={
            <>
              <Button variant="outline" onClick={() => setModalOpen(false)}>Annuler</Button>
              <Button onClick={handleSubmit} loading={saving}>
                {editingEvent ? 'Enregistrer' : 'Créer'}
              </Button>
            </>
          }
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Titre" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Début" type="datetime-local" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} required />
              <Input label="Fin" type="datetime-local" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800"
                >
                  {EVENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <Input label="Lieu / Lien Visio" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
            </div>
          </form>
        </Modal>
      </main>
    </>
  );
}