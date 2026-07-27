import { ChevronDown, ClipboardList } from 'lucide-react';
import type { ReactElement } from 'react';

import type { TefExercise } from '../../tefWriting';
import './ExerciseSelector.scss';

interface ExerciseSelectorProps {
  exercises: TefExercise[];
  selectedExerciseId: string;
  onExerciseChange: (exerciseId: string) => void;
}

export const ExerciseSelector = ({
  exercises,
  selectedExerciseId,
  onExerciseChange,
}: ExerciseSelectorProps): ReactElement => {
  return (
    <div className="exercise-selector">
      <label className="exercise-selector__label" htmlFor="exercise">
        <ClipboardList size={18} aria-hidden="true" />
        <span>Exercice</span>
      </label>
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
    </div>
  );
};
