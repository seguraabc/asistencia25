
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import CourseSelector from '@/components/CourseSelector';
import AttendanceSheet from '@/components/AttendanceSheet';
import ReportGenerator from '@/components/ReportGenerator';
import CourseEditor from '@/components/CourseEditor';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut } from 'lucide-react';

const Index = () => {
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [view, setView] = useState<'courses' | 'attendance' | 'report' | 'editor'>('courses');
  const [isLoading, setIsLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Add refresh trigger
  const { logout, user } = useAuth();
  
  const handleBack = () => {
    if (view === 'attendance' || view === 'report' || view === 'editor') {
      setView('courses');
      setSelectedCourseId(null);
      // Trigger refresh when returning from editor
      if (view === 'editor') {
        setRefreshTrigger(prev => prev + 1);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };
  
  const handleCourseSaved = () => {
    setView('courses');
    setSelectedCourseId(null);
    // Trigger refresh when course is saved
    setRefreshTrigger(prev => prev + 1);
  };
  
  const renderView = () => {
    switch (view) {
      case 'attendance':
        return (
          <AttendanceSheet
            courseId={selectedCourseId!}
            onBack={handleBack}
          />
        );
      case 'report':
        return (
          <ReportGenerator
            courseId={selectedCourseId!}
            onBack={handleBack}
          />
        );
      case 'editor':
        return (
          <CourseEditor
            courseId={selectedCourseId}
            onBack={handleBack}
            onSave={handleCourseSaved}
          />
        );
      default:
        return (
          <CourseSelector 
            key={refreshTrigger} // Add key to force re-render
            onSelectCourse={(id) => {
              setSelectedCourseId(id);
              setView('attendance');
            }}
            onEditCourse={(id) => {
              setSelectedCourseId(id);
              setView('editor');
            }}
            onViewReport={(id) => {
              setSelectedCourseId(id);
              setView('report');
            }}
            onCreateCourse={() => {
              setSelectedCourseId(null);
              setView('editor');
            }}
          />
        );
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-border/40 sticky top-0 z-10">
        <div className="container max-w-4xl mx-auto p-4 flex justify-between items-center">
          <div className="flex items-center">
            <h2 className="text-xl font-light">Control de Asistencia y Calificaciones</h2>
          </div>
          <div className="flex items-center gap-2">
            {view !== 'courses' && (
              <Button variant="ghost" size="sm" onClick={handleBack}>
                Volver
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="flex items-center gap-1"
            >
              <LogOut size={16} /> 
              <span className="hidden sm:inline">Cerrar sesión</span>
            </Button>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="py-8 animate-fade-in">
        {isLoading ? (
          <div className="min-h-[50vh] flex items-center justify-center">
            <div className="animate-pulse">Cargando...</div>
          </div>
        ) : (
          renderView()
        )}
      </main>
      
      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <div className="container max-w-4xl mx-auto px-4">
          Soluciones Digitales - 2025 - General Madariaga
        </div>
      </footer>
    </div>
  );
};

export default Index;
