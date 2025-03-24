
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface CourseInfoProps {
  name: string;
  onNameChange: (name: string) => void;
}

const CourseInfo: React.FC<CourseInfoProps> = ({ name, onNameChange }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Información del Curso</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label htmlFor="course-name" className="block text-sm font-medium mb-1">
              Nombre del Curso
            </label>
            <Input
              id="course-name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Ej. Matemáticas"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseInfo;
