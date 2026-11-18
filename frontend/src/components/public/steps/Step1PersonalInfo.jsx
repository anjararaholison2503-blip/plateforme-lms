import { User, Calendar, Flag } from 'lucide-react';
import Input from '../../ui/Input';

export default function Step1PersonalInfo({ data, onChange, errors }) {
  const update = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">
          Informations personnelles
        </h2>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Commençons par vos informations de base
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Input
          label="Nom de famille *"
          value={data.lastName || ''}
          onChange={(e) => update('lastName', e.target.value.toUpperCase())}
          placeholder="RAKOTO"
          error={errors.lastName}
          icon={User}
        />
        <Input
          label="Prénom(s) *"
          value={data.firstName || ''}
          onChange={(e) => update('firstName', e.target.value)}
          placeholder="Marie"
          error={errors.firstName}
          icon={User}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
            Genre *
          </label>
          <select
            value={data.gender || ''}
            onChange={(e) => update('gender', e.target.value)}
            className={`
              w-full px-4 py-2.5 border rounded-lg text-sm
              bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100
              focus:outline-none focus:ring-2 focus:ring-indigo-500
              ${errors.gender ? 'border-red-300' : 'border-gray-300 dark:border-slate-600'}
            `}
          >
            <option value="">— Sélectionner —</option>
            <option value="M">Masculin</option>
            <option value="F">Féminin</option>
          </select>
          {errors.gender && <p className="mt-1 text-xs text-red-600">{errors.gender}</p>}
        </div>

        <Input
          label="Date de naissance *"
          type="date"
          value={data.birthDate || ''}
          onChange={(e) => update('birthDate', e.target.value)}
          error={errors.birthDate}
          icon={Calendar}
        />

        <Input
          label="Lieu de naissance"
          value={data.birthPlace || ''}
          onChange={(e) => update('birthPlace', e.target.value)}
          placeholder="Antananarivo"
        />

        <Input
          label="Nationalité *"
          value={data.nationality || ''}
          onChange={(e) => update('nationality', e.target.value)}
          placeholder="Malagasy"
          error={errors.nationality}
          icon={Flag}
        />
      </div>
    </div>
  );
}