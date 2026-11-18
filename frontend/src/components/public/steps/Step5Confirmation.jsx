import {
  User, Mail, Phone, MapPin, GraduationCap, FileText, Calendar,
  CheckCircle2, AlertCircle,
} from 'lucide-react';

export default function Step5Confirmation({ data, onSubmit, submitting, error }) {
  const formatDate = (date) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const getInitials = () => {
    const first = data.firstName?.[0] || '';
    const last = data.lastName?.[0] || '';
    return (first + last).toUpperCase() || '?';
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">
          Récapitulatif
        </h2>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Vérifiez vos informations avant de soumettre votre dossier
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 flex items-start gap-3">
          <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* En-tête avec avatar */}
      <div className="p-5 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-xl">
            {getInitials()}
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-slate-100">
              {data.firstName} {data.lastName}
            </h3>
            <p className="text-sm text-gray-600 dark:text-slate-400">{data.email}</p>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Infos personnelles */}
        <SectionCard icon={User} title="Informations personnelles">
          <InfoRow label="Nom" value={data.lastName} />
          <InfoRow label="Prénom(s)" value={data.firstName} />
          <InfoRow label="Genre" value={data.gender === 'M' ? 'Masculin' : data.gender === 'F' ? 'Féminin' : '—'} />
          <InfoRow label="Date de naissance" value={formatDate(data.birthDate)} />
          <InfoRow label="Nationalité" value={data.nationality} />
        </SectionCard>

        {/* Contact */}
        <SectionCard icon={Mail} title="Contact">
          <InfoRow label="Email" value={data.email} />
          <InfoRow label="Téléphone" value={data.phone} />
          <InfoRow label="Ville" value={data.city} />
          <InfoRow label="Adresse" value={data.address} />
        </SectionCard>

        {/* Formation */}
        <SectionCard icon={GraduationCap} title="Formation antérieure" fullWidth>
          {data.diplomas && data.diplomas.length > 0 ? (
            <div className="space-y-2">
              {data.diplomas.map((d, i) => (
                <div key={i} className="p-2 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
                  <p className="text-sm font-medium text-gray-800 dark:text-slate-200">{d.level}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {d.institution} {d.year ? `· ${d.year}` : ''}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-slate-400">Aucun diplôme renseigné</p>
          )}
        </SectionCard>

        {/* Documents */}
        <SectionCard icon={FileText} title="Documents fournis" fullWidth>
          {data.documents && Object.keys(data.documents).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(data.documents).map(([type, doc]) => (
                <div key={type} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  <span className="text-gray-700 dark:text-slate-300">
                    {type === 'CIN' ? 'CIN' : type === 'DIPLOMA' ? 'Diplôme' : 'Photo'} : {doc.fileName}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-slate-400">Aucun document fourni</p>
          )}
        </SectionCard>
      </div>

      {/* Confirmation */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 flex items-start gap-3">
        <AlertCircle size={18} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800 dark:text-blue-300">
          <p className="font-medium mb-1">En cliquant sur «Soumettre», vous acceptez que :</p>
          <ul className="text-xs space-y-0.5 ml-4 list-disc">
            <li>Vos informations soient vérifiées par l'administration</li>
            <li>Vous recevrez un email de confirmation à l'adresse {data.email}</li>
            <li>Vous serez contacté pour finaliser votre inscription</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Sous-composants
function SectionCard({ icon: Icon, title, children, fullWidth }) {
  return (
    <div className={`p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 ${fullWidth ? 'md:col-span-2' : ''}`}>
      <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3 flex items-center gap-2">
        <Icon size={14} />
        {title}
      </h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="text-gray-500 dark:text-slate-400">{label}</span>
      <span className="font-medium text-gray-800 dark:text-slate-200 text-right">
        {value || '—'}
      </span>
    </div>
  );
}