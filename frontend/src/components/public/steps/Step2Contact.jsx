import { Mail, Phone, MapPin } from 'lucide-react';
import Input from '../../ui/Input';

export default function Step2Contact({ data, onChange, errors }) {
  const update = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">
          Informations de contact
        </h2>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Comment pouvons-nous vous contacter ?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <Input
            label="Adresse email *"
            type="email"
            value={data.email || ''}
            onChange={(e) => update('email', e.target.value)}
            placeholder="marie.rakoto@email.mg"
            error={errors.email}
            icon={Mail}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
            📧 C'est à cette adresse que vous recevrez vos identifiants
          </p>
        </div>

        <Input
          label="Téléphone *"
          value={data.phone || ''}
          onChange={(e) => update('phone', e.target.value)}
          placeholder="+261 34 12 345 67"
          error={errors.phone}
          icon={Phone}
        />

        <Input
          label="Ville"
          value={data.city || ''}
          onChange={(e) => update('city', e.target.value)}
          placeholder="Antananarivo"
        />

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
            <MapPin size={14} />
            Adresse complète *
          </label>
          <textarea
            value={data.address || ''}
            onChange={(e) => update('address', e.target.value)}
            rows={3}
            placeholder="Lot II A 12 Bis, Ankadifotsy, Antananarivo 101"
            className={`
              w-full px-4 py-2.5 border rounded-lg text-sm
              bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100
              focus:outline-none focus:ring-2 focus:ring-indigo-500
              ${errors.address ? 'border-red-300' : 'border-gray-300 dark:border-slate-600'}
            `}
          />
          {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address}</p>}
        </div>
      </div>
    </div>
  );
}