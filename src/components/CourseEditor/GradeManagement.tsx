import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { addGradeToStudent, removeGradeFromStudent, updateGradeForStudent } from '@/utils/googleSheetsApi';

interface GradeManagementProps {
  courseId: string;
  students: any[];
  onStudentsChange: (students: any[]) => void;
}

const GradeManagement: React.FC<GradeManagementProps> = ({ courseId, students, onStudentsChange }) => {
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isAddingGrade, setIsAddingGrade] = useState(false);
  const [isEditingGrade, setIsEditingGrade] = useState(false);
  const [currentGrade, setCurrentGrade] = useState({ id: '', name: '', value: 0 });
  const [isUpdating, setIsUpdating] = useState(false);

  const handleOpenAddGrade = (student: any) => {
    setSelectedStudent(student);
    setCurrentGrade({ id: '', name: '', value: 0 });
    setIsAddingGrade(true);
  };

  const handleOpenEditGrade = (student: any, grade: any) => {
    setSelectedStudent(student);
    setCurrentGrade({ ...grade });
    setIsEditingGrade(true);
  };

  const handleAddGrade = async () => {
    if (!currentGrade.name.trim()) {
      toast.error('El nombre de la evaluación es obligatorio');
      return;
    }

    setIsUpdating(true);
    try {
      const result = await addGradeToStudent(
        courseId,
        selectedStudent.id,
        { ...currentGrade, id: Date.now().toString() }
      );
      
      if (result) {
        const updatedStudents = students.map(student => {
          if (student.id === selectedStudent.id) {
            const updatedGrades = [...(student.grades || []), {
              ...currentGrade,
              id: Date.now().toString()
            }];
            return { ...student, grades: updatedGrades };
          }
          return student;
        });
        
        onStudentsChange(updatedStudents);
        toast.success('Evaluación agregada correctamente');
        setIsAddingGrade(false);
      } else {
        toast.error('Error al agregar la evaluación');
      }
    } catch (error) {
      console.error('Error adding grade', error);
      toast.error('Error al agregar la evaluación');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateGrade = async () => {
    if (!currentGrade.name.trim()) {
      toast.error('El nombre de la evaluación es obligatorio');
      return;
    }

    setIsUpdating(true);
    try {
      const result = await updateGradeForStudent(
        courseId,
        selectedStudent.id,
        currentGrade
      );
      
      if (result) {
        const updatedStudents = students.map(student => {
          if (student.id === selectedStudent.id) {
            const updatedGrades = (student.grades || []).map(grade => 
              grade.id === currentGrade.id ? currentGrade : grade
            );
            return { ...student, grades: updatedGrades };
          }
          return student;
        });
        
        onStudentsChange(updatedStudents);
        toast.success('Evaluación actualizada correctamente');
        setIsEditingGrade(false);
      } else {
        toast.error('Error al actualizar la evaluación');
      }
    } catch (error) {
      console.error('Error updating grade', error);
      toast.error('Error al actualizar la evaluación');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteGrade = async (student: any, gradeId: string) => {
    setIsUpdating(true);
    try {
      const result = await removeGradeFromStudent(courseId, student.id, gradeId);
      
      if (result) {
        const updatedStudents = students.map(s => {
          if (s.id === student.id) {
            const updatedGrades = (s.grades || []).filter(g => g.id !== gradeId);
            return { ...s, grades: updatedGrades };
          }
          return s;
        });
        
        onStudentsChange(updatedStudents);
        toast.success('Evaluación eliminada correctamente');
      } else {
        toast.error('Error al eliminar la evaluación');
      }
    } catch (error) {
      console.error('Error deleting grade', error);
      toast.error('Error al eliminar la evaluación');
    } finally {
      setIsUpdating(false);
    }
  };

  const calculateAverage = (grades: any[] = []) => {
    if (grades.length === 0) return 0;
    const sum = grades.reduce((acc, grade) => acc + (grade.value || 0), 0);
    return Math.round((sum / grades.length) * 10) / 10;
  };

  return (
    <Card className="glass-card hover:shadow-md transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Evaluaciones</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {students.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            Agregue alumnos para gestionar evaluaciones
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Alumno</TableHead>
                <TableHead>Evaluaciones</TableHead>
                <TableHead>Promedio</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map(student => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {(student.grades || []).map(grade => (
                        <Badge 
                          key={grade.id}
                          variant="outline"
                          className="flex items-center gap-2 cursor-pointer hover:bg-muted"
                          onClick={() => handleOpenEditGrade(student, grade)}
                        >
                          {grade.name}: {grade.value}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteGrade(student, grade.id);
                            }}
                            className="text-destructive hover:bg-destructive/10 rounded-full p-1"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {calculateAverage(student.grades)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenAddGrade(student)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <Dialog open={isAddingGrade} onOpenChange={setIsAddingGrade}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Agregar Evaluación</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="grade-name">Nombre</Label>
                <Input
                  id="grade-name"
                  value={currentGrade.name}
                  onChange={(e) => setCurrentGrade({...currentGrade, name: e.target.value})}
                  placeholder="Ej. Parcial 1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="grade-value">Calificación (0-10)</Label>
                <Input
                  id="grade-value"
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={currentGrade.value}
                  onChange={(e) => setCurrentGrade({...currentGrade, value: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddingGrade(false)}>Cancelar</Button>
              <Button onClick={handleAddGrade} disabled={isUpdating}>
                {isUpdating ? 'Guardando...' : 'Guardar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditingGrade} onOpenChange={setIsEditingGrade}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Evaluación</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-grade-name">Nombre</Label>
                <Input
                  id="edit-grade-name"
                  value={currentGrade.name}
                  onChange={(e) => setCurrentGrade({...currentGrade, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-grade-value">Calificación (0-10)</Label>
                <Input
                  id="edit-grade-value"
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={currentGrade.value}
                  onChange={(e) => setCurrentGrade({...currentGrade, value: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditingGrade(false)}>Cancelar</Button>
              <Button onClick={handleUpdateGrade} disabled={isUpdating}>
                {isUpdating ? 'Actualizando...' : 'Actualizar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default GradeManagement;
