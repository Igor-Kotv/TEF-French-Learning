import { ChevronDown, ClipboardList, Plus, X } from 'lucide-react';
import { useState, type ReactElement } from 'react';

import type { TefExercise } from '../../tefWriting';
import { TaskCreatorModal } from '../TaskCreatorModal/TaskCreatorModal';
import './ExerciseSelector.scss';

interface ExerciseSelectorProps {
  exercises: TefExercise[];
  selectedExerciseId: string;
  selectedExerciseIsCustom: boolean;
  onExerciseChange: (exerciseId: string) => void;
  onExerciseCreate: (exercise: TefExercise) => void;
  onExerciseDelete: (exerciseId: string) => void;
}

export const ExerciseSelector = ({
  exercises,
  selectedExerciseId,
  selectedExerciseIsCustom,
  onExerciseChange,
  onExerciseCreate,
  onExerciseDelete,
}: ExerciseSelectorProps): ReactElement => {
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const selectedExercise = exercises.find((exercise) => exercise.id === selectedExerciseId);

  const handleDeleteSelectedExercise = (): void => {
    if (!selectedExercise || !selectedExerciseIsCustom) {
      return;
    }

    const confirmed = window.confirm(`Supprimer la tâche personnalisée « ${selectedExercise.title} » ?`);

    if (!confirmed) {
      return;
    }

    onExerciseDelete(selectedExercise.id);
  };

  return (
    <>
      <div className="exercise-selector">
        <label className="exercise-selector__label" htmlFor="exercise">
          <ClipboardList size={18} aria-hidden="true" />
          <span>Exercice</span>
        </label>
        <div
          className={
            selectedExerciseIsCustom
              ? 'exercise-selector__controls exercise-selector__controls--with-delete'
              : 'exercise-selector__controls'
          }
        >
          <div className="select-wrap">
            <select
              id="exercise"
              value={selectedExerciseId}
              onChange={(event) => {
                onExerciseChange(event.target.value);
              }}
            >
              {exercises.map((exercise) => (
                <option key={exercise.id} value={exercise.id}>
                  {exercise.title}
                </option>
              ))}
            </select>
            <ChevronDown size={18} aria-hidden="true" />
          </div>
          <button
            className="exercise-selector__add-button"
            type="button"
            aria-label="Ajouter une tâche"
            onClick={() => {
              setIsCreatorOpen(true);
            }}
          >
            <Plus size={20} aria-hidden="true" />
          </button>
          {selectedExerciseIsCustom ? (
            <button
              className="exercise-selector__delete-button"
              type="button"
              aria-label="Supprimer la tâche personnalisée"
              onClick={handleDeleteSelectedExercise}
            >
              <X size={20} aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>

      {isCreatorOpen ? (
        <TaskCreatorModal
          onClose={() => {
            setIsCreatorOpen(false);
          }}
          onCreateTask={onExerciseCreate}
        />
      ) : null}
    </>
  );
};
