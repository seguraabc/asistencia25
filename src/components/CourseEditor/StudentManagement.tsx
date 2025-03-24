
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Clipboard } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface StudentManagementProps {
  students: any[];
  dates: string[];
  onStudentsChange: (students: any[]) => void;
}

const StudentManagement: React.FC<StudentManagementProps> = ({
  students,
  dates,
  onStudentsChange
}) => {
  const [newStudentName, setNewStudentName] = useState('');
  const [showPasteDialog, setShowPasteDialog] = useState(false);
  const [pasteContent, setPasteContent] = useState('');
  
  const handleAddStudent = () => {
    if (!newStudentName.trim()) {
      toast.error('El nombre del alumno es obligatorio');
      return;
    }
    
    const newStudent = {
      id: Date.now().toString(),
      name: newStudentName.trim(),
      attendances: {}
    };
    
    dates.forEach((date: string) => {
      newStudent.attendances[date] = '';
    });
    
    onStudentsChange([...students, newStudent]);
    setNewStudentName('');
  };
  
  const handleRemoveStudent = (studentId: string) => {
    onStudentsChange(students.filter((s: any) => s.id !== studentId));
  };
  
  const handlePasteStudents = () => {
    if (!pasteContent.trim()) {
      toast.error('El contenido pegado está vacío');
      return;
    }
    
    const studentNames = pasteContent
      .split('\n')
      .map(name => name.trim())
      .filter(name => name.length > 0);
    
    if (studentNames.length === 0) {
      toast.error('No se encontraron nombres válidos');
      return;
    }
    
    const newStudents = studentNames.map(name => ({
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      name: name,
      attendances: {}
    }));
    
    dates.forEach((date: string) => {
      newStudents.forEach(student => {
        student.attendances[date] = '';
      });
    });
    
    onStudentsChange([...students, ...newStudents]);
    
    toast.success(`Se agregaron ${newStudents.length} estudiantes`);
    setShowPasteDialog(false);
    setPasteContent('');
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Alumnos</CardTitle>
        <div className="flex items-center space-x-2">
          <Input
            value={newStudentName}
            onChange={(e) => setNewStudentName(e.target.value)}
            placeholder="Nombre del alumno"
            className="w-64"
          />
          <Button size="sm" onClick={handleAddStudent}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setShowPasteDialog(true)}
          >
            <Clipboard className="h-4 w-4 mr-2" />
            Pegar Lista
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {students.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No hay alumnos. Agrega el primero usando el campo de arriba.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student: any) => (
                <TableRow key={student.id}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleRemoveStudent(student.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      
      <Dialog open={showPasteDialog} onOpenChange={setShowPasteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pegar lista de alumnos</DialogTitle>
            <DialogDescription>
              Pegá la lista de alumnos (un nombre por línea) desde Excel u otra fuente.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={pasteContent}
            onChange={(e) => setPasteContent(e.target.value)}
            placeholder="Ej:&#10;Juan Pérez&#10;María González&#10;Carlos Rodríguez"
            className="min-h-[200px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasteDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handlePasteStudents}>
              Agregar Alumnos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default StudentManagement;
