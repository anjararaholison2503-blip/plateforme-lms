import { GraduationCap, Plus, Trash2 } from 'lucide-react';
import Button from '../../ui/Button';
import Input from '../../ui/Input';

const emptyDiploma = {
  level: '',
  institution: '',
  year: '',
  mention: '',
};

export default function Step3Education({ data, onChange, errors }) {
  const diplomas = data.diplomas || [];

  const addDiploma = () => {
    onChange({ ...data, diplomas: [...diplomas, { ...emptyDiploma }] });
  };

  const updateDiploma = (index, field, value) => {
    const updated = [...diplomas];
    updated[index][field] = value;
    onChange({ ...data, diplomas: updated });
  };

  const removeDiploma = (index) => {
    onChange({ ...data, diplomas: diplomas.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-2">
          Formation antérieure
        </h2>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Vos diplômes et cursus précédents
        </p>
      </div>

      {diplomas.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl">
          <GraduationCap size={40} className="mx-auto text-gray-300 dark:text-slate-600 mb-3" />
          <p className="text-sm text-gray-500 dark:text-slate-400 mb-3">
            Aucun diplôme ajouté
          </p>
          <Button onClick={addDiploma} size="sm">
            <Plus size={16} />
            Ajouter mon premier diplôme
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {diplomas.map((diploma, index) => (
            <div
              key={index}
              className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800/50"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                  Diplôme #{index + 1}
                </h3>
                <button
                  type="button"
                  onClick={() => removeDiploma(index)}
                  className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Niveau *"
                  value={diploma.level || ''}
                  onChange={(e) => updateDiploma(index, 'level', e.target.value)}
                  placeholder="Ex: Baccalauréat série D"
                />
                <Input
                  label="Établissement"
                  value={diploma.institution || ''}
                  onChange={(e) => updateDiploma(index, 'institution', e.target.value)}
                  placeholder="Lycée Moderne d'Antananarivo"
                />
                <Input
                  label="Année d'obtention"
                  type="number"
                  value={diploma.year || ''}
                  onChange={(e) => updateDiploma(index, 'year', e.target.value)}
                  placeholder="2020"
                />
                <Input
                  label="Mention"
                  value={diploma.mention || ''}
                  onChange={(e) => updateDiploma(index, 'mention', e.target.value)}
                  placeholder="Bien, Très bien..."
                />
              </div>
            </div>
          ))}

          <Button variant="outline" onClick={addDiploma} className="w-full">
            <Plus size={16} />
            Ajouter un autre diplôme
          </Button>
        </div>
      )}

      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <p className="text-xs text-blue-800 dark:text-blue-300">
          💡 Ces informations nous aident à mieux vous orienter. Vous pourrez fournir les justificatifs plus tard.
        </p>
      </div>
    </div>
  );
}