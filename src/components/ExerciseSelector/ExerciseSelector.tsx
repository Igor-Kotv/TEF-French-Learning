import { ChevronDown, ClipboardList, Plus } from 'lucide-react';
import { useState, type ReactElement } from 'react';

import type { TefExercise } from '../../tefWriting';
import { TaskCreatorModal } from '../TaskCreatorModal/TaskCreatorModal';
import './ExerciseSelector.scss';

interface ExerciseSelectorProps {
  exercises: TefExercise[];
  selectedExerciseId: string;
  onExerciseChange: (exerciseId: string) => void;
  onExerciseCreate: (exercise: TefExercise) => void;
}

export const ExerciseSelector = ({
  exercises,
  selectedExerciseId,
  onExerciseChange,
  onExerciseCreate,
}: ExerciseSelectorProps): ReactElement => {
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);

  return (
    <>
      <div className="exercise-selector">
        <label className="exercise-selector__label" htmlFor="exercise">
          <ClipboardList size={18} aria-hidden="true" />
          <span>Exercice</span>
        </label>
        <div className="exercise-selector__controls">
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
