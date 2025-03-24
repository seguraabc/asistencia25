
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, FileText, Edit, Plus, RefreshCw } from 'lucide-react';
import { getCourses } from '@/utils/googleSheetsApi';

interface CourseSelectorProps {
  onSelectCourse: (courseId: string) => void;
  onEditCourse: (courseId: string) => void;
  onViewReport: (courseId: string) => void;
  onCreateCourse: () => void;
}

const CourseSelector: React.FC<CourseSelectorProps> = ({ 
  onSelectCourse, 
  onEditCourse, 
  onViewReport,
  onCreateCourse
}) => {
  const [courses, setCourses] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0); // Add a refresh key for forcing re-fetch
  
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const data = await getCourses();
        setCourses(data);
      } catch (error) {
        console.error('Error fetching courses', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCourses();
  }, [refreshKey]); // Add refreshKey as a dependency to trigger re-fetch
  
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1); // Increment refresh key to trigger re-fetch
  };
  
  return (
    <div className="container max-w-4xl mx-auto p-4 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-light tracking-tight mb-2">Mis Cursos</h1>
        <p className="text-muted-foreground">Administrar asistencia y reportes</p>
      </div>
      
      <div className="flex justify-between mb-6">
        <Button onClick={handleRefresh} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </Button>
        <Button onClick={onCreateCourse} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Curso
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="overflow-hidden glass-card">
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))
        ) : (
          // Course cards
          courses.length > 0 ? courses.map((course) => (
            <Card key={course.id} className="overflow-hidden glass-card border hover:shadow-md transition-all duration-300">
              <CardContent className="p-0">
                <div className="grid grid-cols-1 sm:grid-cols-4">
                  <Button 
                    variant="ghost" 
                    className="h-auto p-6 flex items-center justify-start col-span-2"
                    onClick={() => onSelectCourse(course.id)}
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                      <BookOpen className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-medium">{course.name}</h3>
                      <p className="text-sm text-muted-foreground">Ver asistencia</p>
                    </div>
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    className="h-auto p-6 border-t sm:border-t-0 sm:border-l"
                    onClick={() => onViewReport(course.id)}
                  >
                    <FileText className="h-5 w-5 mr-2" />
                    Reportes
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    className="h-auto p-6 border-t sm:border-t-0 sm:border-l"
                    onClick={() => onEditCourse(course.id)}
                  >
                    <Edit className="h-5 w-5 mr-2" />
                    Editar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-light mb-2">No hay cursos</h3>
              <p className="text-muted-foreground mb-6">Comienza creando tu primer curso</p>
              <Button onClick={onCreateCourse} className="gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Curso
              </Button>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default CourseSelector;
