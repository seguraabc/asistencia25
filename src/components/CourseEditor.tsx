
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { getCourse, createCourse, updateCourse, deleteCourse } from '@/utils/googleSheetsApi';
import { toast } from "sonner";
import { format } from 'date-fns';
import { 
  StudentManagement, 
  DateManagement, 
  CalendarGenerator,
  CourseInfo,
  DeleteCourseDialog,
  GradeManagement
} from './CourseEditor/index';

interface CourseEditorProps {
  courseId: string | null;
  onBack: () => void;
  onSave: () => void;
}

const CourseEditor: React.FC<CourseEditorProps> = ({ courseId, onBack, onSave }) => {
  const [course, setCourse] = useState<any>({
    id: '',
    name: '',
    students: [],
    dates: []
  });
  const [isLoading, setIsLoading] = useState(courseId !== null);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCalendarGenerator, setShowCalendarGenerator] = useState(false);
  
  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) {
        setIsLoading(false);
        return;
      }
      
      try {
        const data = await getCourse(courseId);
        if (data) {
          setCourse(data);
        }
      } catch (error) {
        console.error('Error fetching course', error);
        toast.error('No se pudo cargar el curso');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourse();
  }, [courseId]);
  
  const handleSave = async () => {
    if (!course.name.trim()) {
      toast.error('El nombre del curso es obligatorio');
      return;
    }
    
    if (course.students.length === 0) {
      toast.error('Debe agregar al menos un alumno');
      return;
    }
    
    setIsSaving(true);
    
    try {
      let success;
      if (courseId) {
        success = await updateCourse(course);
      } else {
        success = await createCourse(course);
      }
      
      if (success) {
        toast.success(courseId ? 'Curso actualizado correctamente' : 'Curso creado correctamente');
        onSave();
      } else {
        toast.error('Error al guardar el curso');
      }
    } catch (error) {
      console.error('Error saving course', error);
      toast.error('Error al guardar el curso');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDelete = async () => {
    if (!courseId) return;
    
    try {
      const success = await deleteCourse(courseId);
      if (success) {
        toast.success('Curso eliminado correctamente');
        onSave();
      } else {
        toast.error('Error al eliminar el curso');
      }
    } catch (error) {
      console.error('Error deleting course', error);
      toast.error('Error al eliminar el curso');
    }
  };
  
  const handleNameChange = (name: string) => {
    setCourse({
      ...course,
      name
    });
  };
  
  const handleStudentsChange = (students: any[]) => {
    setCourse({
      ...course,
      students
    });
  };
  
  const handleDatesChange = (dates: string[]) => {
    const updatedStudents = course.students.map((student: any) => {
      const newAttendances = { ...student.attendances };
      
      // Remove dates that are no longer in the list
      Object.keys(newAttendances).forEach(date => {
        if (!dates.includes(date)) {
          delete newAttendances[date];
        }
      });
      
      // Add new dates with empty attendance
      dates.forEach(date => {
        if (!newAttendances[date]) {
          newAttendances[date] = '';
        }
      });
      
      return {
        ...student,
        attendances: newAttendances
      };
    });
    
    setCourse({
      ...course,
      dates,
      students: updatedStudents
    });
  };
  
  const handleGenerateCalendar = (generatedDates: string[]) => {
    const newDates = [...new Set([...course.dates, ...generatedDates])].sort();
    handleDatesChange(newDates);
  };
  
  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto p-4">
        <div className="animate-pulse text-center py-12">Cargando...</div>
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
          <h2 className="text-xl font-medium">{courseId ? 'Editar Curso' : 'Nuevo Curso'}</h2>
        </div>
        <div className="flex gap-2">
          {courseId && (
            <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          )}
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            <Save className="h-4 w-4" />
            Guardar
          </Button>
        </div>
      </div>
      
      <div className="space-y-6">
        <CourseInfo 
          name={course.name} 
          onNameChange={handleNameChange} 
        />
        
        <StudentManagement 
          students={course.students} 
          dates={course.dates}
          onStudentsChange={handleStudentsChange}
        />
        
        {course.students.length > 0 && (
          <GradeManagement
            courseId={course.id}
            students={course.students}
            onStudentsChange={handleStudentsChange}
          />
        )}
        
        <DateManagement 
          dates={course.dates}
          onDatesChange={handleDatesChange}
          onShowCalendarGenerator={() => setShowCalendarGenerator(true)}
        />
      </div>
      
      <DeleteCourseDialog 
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        courseName={course.name}
        onDelete={handleDelete}
      />
      
      <CalendarGenerator
        open={showCalendarGenerator}
        onOpenChange={setShowCalendarGenerator}
        onGenerateCalendar={handleGenerateCalendar}
      />
    </div>
  );
};

export default CourseEditor;
