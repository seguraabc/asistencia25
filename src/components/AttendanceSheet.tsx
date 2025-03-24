
import React, { useState, useEffect } from 'react';
import { Course, getCourse } from '@/utils/googleSheetsApi';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import DateSelector from './DateSelector';
import StudentRow from './StudentRow';
import { toast } from "sonner";

interface AttendanceSheetProps {
  courseId: string;
  onBack: () => void;
}

const AttendanceSheet: React.FC<AttendanceSheetProps> = ({ courseId, onBack }) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const fetchCourseData = async () => {
    try {
      setIsLoading(true);
      const data = await getCourse(courseId);
      setCourse(data);
      
      // Select the first date by default (chronological order)
      if (data && data.dates.length > 0) {
        // Make sure dates are sorted chronologically
        const sortedDates = [...data.dates].sort();
        setSelectedDate(sortedDates[0]);
      }
    } catch (error) {
      console.error('Error fetching course data', error);
      toast.error('Error al cargar los datos del curso');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCourseData();
  }, [courseId]);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchCourseData();
    setIsRefreshing(false);
  };
  
  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };
  
  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto p-4">
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-8 w-32" />
        </div>
        <Skeleton className="h-12 w-full mb-8" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full mb-4" />
        ))}
      </div>
    );
  }
  
  if (!course) {
    return (
      <div className="container max-w-4xl mx-auto p-4 text-center">
        <p className="text-xl text-muted-foreground">No se encontraron datos para este curso</p>
        <Button onClick={onBack} className="mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container max-w-4xl mx-auto p-4 pb-24 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-2 -ml-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-3xl font-light tracking-tight">{course.name}</h1>
          <p className="text-muted-foreground mt-1">
            {course.students.length} alumnos · {course.dates.length} clases
          </p>
        </div>
        
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="h-9"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>
      
      {course.dates.length > 0 && selectedDate ? (
        <>
          <DateSelector
            courseId={course.id}
            dates={course.dates}
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
            onRefresh={handleRefresh}
          />
          
          <div className="space-y-4">
            {course.students.map(student => (
              <StudentRow
                key={student.id}
                student={student}
                date={selectedDate}
                courseId={course.id}
                dates={course.dates}
                onUpdate={handleRefresh}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">No hay fechas registradas para este curso</p>
        </div>
      )}
    </div>
  );
};

export default AttendanceSheet;
