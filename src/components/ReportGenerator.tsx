import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Download, Calendar, Plus, Trash2 } from 'lucide-react';
import { getCourse, calculateAttendancePercentage, addGradeToStudent, calculateAverageGrade } from '@/utils/googleSheetsApi';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface ReportGeneratorProps {
  courseId: string;
  onBack: () => void;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ courseId, onBack }) => {
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingGrade, setIsAddingGrade] = useState(false);
  const [newGrade, setNewGrade] = useState({ name: '', value: 0 });
  const [isUpdating, setIsUpdating] = useState(false);
  
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const data = await getCourse(courseId);
        setCourse(data);
      } catch (error) {
        console.error('Error fetching course', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourse();
  }, [courseId]);
  
  const handleAddGradeToAll = async () => {
    if (!newGrade.name.trim()) {
      toast.error('El nombre de la evaluación es obligatorio');
      return;
    }

    setIsUpdating(true);
    try {
      const updatedCourse = { ...course };
      const gradeId = Date.now().toString();
      
      for (const student of updatedCourse.students) {
        if (!student.grades) {
          student.grades = [];
        }
        
        await addGradeToStudent(
          courseId,
          student.id,
          { ...newGrade, id: gradeId + student.id }
        );
        
        student.grades.push({
          id: gradeId + student.id,
          name: newGrade.name,
          value: newGrade.value
        });
      }
      
      setCourse(updatedCourse);
      toast.success('Evaluación agregada a todos los alumnos');
      setIsAddingGrade(false);
      setNewGrade({ name: '', value: 0 });
    } catch (error) {
      console.error('Error adding grade to all students', error);
      toast.error('Error al agregar la evaluación');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const exportToCSV = () => {
    if (!course) return;
    
    const headers = ['Alumno', 'Porcentaje de Asistencia', 'Promedio', ...course.dates.map((date: string) => format(new Date(date), 'dd/MM/yyyy'))];
    
    const rows = course.students.map((student: any) => {
      const percentage = calculateAttendancePercentage(student, course.dates);
      const average = calculateAverageGrade(student);
      const attendanceData = course.dates.map((date: string) => student.attendances[date] || '');
      return [student.name, `${percentage}%`, average, ...attendanceData];
    });
    
    const csvContent = [
      headers,
      ...rows
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_${course.name}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto p-4">
        <div className="mb-6 flex items-center">
          <Button variant="ghost" size="sm" onClick={onBack} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <Skeleton className="h-8 w-48" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-64 mb-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (!course) {
    return (
      <div className="container max-w-4xl mx-auto p-4">
        <div className="mb-6 flex items-center">
          <Button variant="ghost" size="sm" onClick={onBack} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No se pudo cargar la información del curso</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container max-w-4xl mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={onBack} className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <h2 className="text-xl font-medium">{course.name}</h2>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setIsAddingGrade(true)} variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Agregar Evaluación
          </Button>
          <Button onClick={exportToCSV} className="gap-2">
            <Download className="h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Reporte de Asistencia y Calificación Promedio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Alumno</TableHead>
                  <TableHead>% Asistencia</TableHead>
                  <TableHead>Promedio</TableHead>
                  {course.dates.map((date: string) => (
                    <TableHead key={date} className="text-center">
                      {format(new Date(date), 'dd/MM')}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {course.students.map((student: any) => {
                  const percentage = calculateAttendancePercentage(student, course.dates);
                  const average = calculateAverageGrade(student);
                  return (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell 
                        className={`
                          ${percentage >= 80 ? 'text-attendance-present' : 
                            percentage >= 60 ? 'text-attendance-justified' : 
                            'text-attendance-absent'}
                        `}
                      >
                        {percentage}%
                      </TableCell>
                      <TableCell
                        className={`
                          ${average >= 8 ? 'text-attendance-present font-medium' : 
                            average >= 6 ? 'text-attendance-justified' : 
                            'text-attendance-absent'}
                        `}
                      >
                        {average}
                      </TableCell>
                      {course.dates.map((date: string) => {
                        const status = student.attendances[date] || '';
                        return (
                          <TableCell key={date} className="text-center">
                            <span 
                              className={`
                                inline-block w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-medium
                                ${status === 'P' ? 'bg-attendance-present' : 
                                  status === 'A' ? 'bg-attendance-absent' : 
                                  status === 'J' ? 'bg-attendance-justified' : 
                                  status === 'X' ? 'bg-gray-400' : 'bg-gray-200'}
                              `}
                            >
                              {status}
                            </span>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAddingGrade} onOpenChange={setIsAddingGrade}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Evaluación a Todos los Alumnos</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="grade-name">Nombre</Label>
              <Input
                id="grade-name"
                value={newGrade.name}
                onChange={(e) => setNewGrade({...newGrade, name: e.target.value})}
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
                value={newGrade.value}
                onChange={(e) => setNewGrade({...newGrade, value: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingGrade(false)}>Cancelar</Button>
            <Button onClick={handleAddGradeToAll} disabled={isUpdating}>
              {isUpdating ? 'Guardando...' : 'Guardar para Todos'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportGenerator;
