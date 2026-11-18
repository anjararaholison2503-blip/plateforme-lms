import { useEffect, useState } from 'react';
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight,
  Clock, MapPin, RefreshCw, LayoutGrid, List
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import api from '../../services/api';
import { formatDate } from '../../utils/format';

const EVENT_TYPES = [
  { value: 'COURSE', label: 'Cours', color: 'blue' },
  { value: 'EXAM', label: 'Examen', color: 'red' },
  { value: 'HOLIDAY', label: 'Vacances', color: 'green' },
  { value: 'MEETING', label: 'Réunion', color: 'purple' },
  { value: 'DEADLINE', label: 'Échéance', color: 'yellow' },
  { value: 'OTHER', label: 'Autre', color: 'gray' },
];

export default function StudentCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // ⬇️ NOUVEAU : Mode d'affichage (MOIS ou SEMAINE)
  const [viewMode, setViewMode] = useState('MONTH'); 

  const fetchEvents = async () => {
    setLoading(true);
    try {
      let start, end;

      if (viewMode === 'MONTH') {
        start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      } else {
        // Si on est en vue SEMAINE, on charge du lundi au dimanche
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

  // Navigation
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

  // --- LOGIQUE VUE MOIS ---
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

  // --- LOGIQUE VUE SEMAINE ---
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

  const getTypeBadge = (type) => {
    const config = EVENT_TYPES.find((t) => t.value === type) || EVENT_TYPES[5];
    return <Badge color={config.color}>{config.label}</Badge>;
  };

  const monthName = currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  return (
    <>
      <PageHeader
        title={viewMode === 'MONTH' ? "Mon agenda" : "Emploi du temps"}
        subtitle={viewMode === 'MONTH' ? "Cours, examens et événements" : "Planning de la semaine"}
        badge="Étudiant"
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          {/* ZONE PRINCIPALE (CALENDRIER OU EDT) */}
          <Card className="lg:col-span-2" noPadding>
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <button onClick={goToPrevious} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"><ChevronLeft size={20} /></button>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-100 capitalize min-w-[200px] text-center">
                  {viewMode === 'MONTH' ? monthName : `Semaine du ${getWeekDays()[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`}
                </h2>
                <button onClick={goToNext} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"><ChevronRight size={20} /></button>
              </div>
              <Button variant="outline" size="sm" onClick={goToToday}>Aujourd'hui</Button>
            </div>

            {loading ? (
              <Spinner className="py-20" />
            ) : viewMode === 'MONTH' ? (
              
              /* --- AFFICHAGE VUE MOIS --- */
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
                      <div key={index} className={`min-h-[80px] p-1.5 rounded-lg border ${today ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-gray-100 dark:border-slate-700'} ${!day.isCurrentMonth ? 'opacity-40' : ''}`}>
                        <div className={`text-xs font-medium mb-1 ${today ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-700 dark:text-slate-300'}`}>
                          {day.date.getDate()}
                        </div>
                        <div className="space-y-0.5">
                          {dayEvents.slice(0, 2).map((event) => (
                            <div key={event.id} className="text-[10px] px-1 py-0.5 rounded truncate text-white font-medium" style={{ backgroundColor: event.color || '#10b981' }} title={event.title}>
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
              
              /* --- AFFICHAGE VUE EMPLOI DU TEMPS --- */
              <div className="p-4 overflow-x-auto">
                <div className="grid grid-cols-7 gap-2 min-w-[700px]">
                  {getWeekDays().map((day, index) => {
                    const isCurrentDay = isToday(day);
                    const dayEvents = getEventsForDay(day);

                    return (
                      <div key={index} className={`rounded-xl border flex flex-col min-h-[400px] ${isCurrentDay ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-900/10' : 'border-gray-200 dark:border-slate-700'}`}>
                        
                        {/* En-tête du jour */}
                        <div className={`p-3 text-center border-b ${isCurrentDay ? 'bg-indigo-100 dark:bg-indigo-900/40 border-indigo-200 dark:border-indigo-800' : 'border-gray-100 dark:border-slate-700'}`}>
                          <p className={`text-xs font-bold uppercase ${isCurrentDay ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-500'}`}>
                            {day.toLocaleDateString('fr-FR', { weekday: 'short' })}
                          </p>
                          <p className={`text-2xl font-bold ${isCurrentDay ? 'text-indigo-600' : 'text-gray-800 dark:text-slate-200'}`}>
                            {day.getDate()}
                          </p>
                        </div>

                        {/* Cours du jour */}
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

          {/* ZONE LATÉRALE (LISTE DES ÉVÉNEMENTS) */}
          <Card
            title="Événements"
            action={<Button variant="ghost" size="sm" onClick={fetchEvents}><RefreshCw size={14} /></Button>}
          >
            {loading ? (
              <Spinner className="py-10" />
            ) : events.length === 0 ? (
              <EmptyState icon={CalendarIcon} title="Aucun événement" description="Rien de prévu pour cette période" />
            ) : (
              <ul className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {events.map((event) => (
                  <li key={event.id} className="p-3 rounded-lg border border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/30">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: event.color || '#10b981' }} />
                      <p className="text-sm font-medium text-gray-800 dark:text-slate-200 truncate">{event.title}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400 mb-1">
                      <Clock size={12} /> {formatDate(event.startDate)}
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
                        <MapPin size={12} /> {event.location}
                      </div>
                    )}
                    <div className="mt-2">{getTypeBadge(event.type)}</div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </main>
    </>
  );
}