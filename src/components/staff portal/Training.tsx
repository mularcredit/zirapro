import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// Icons
import {
  PlayCircle,
  CheckCircle2,
  Lock,
  ChevronRight,
  ChevronLeft,
  Bookmark,
  Award,
  Clock,
  FileText,
  Users,
  BarChart2,
  HelpCircle,
  User,
  Box,
  Shield,
  X
} from 'lucide-react';

// Types
type TrainingVideo = {
  id: string;
  title: string;
  description: string;
  url: string;
  duration: number; // in seconds
  required: boolean;
  order: number;
  category: 'introduction' | 'product' | 'safety' | 'compliance' | 'soft-skills';
  thumbnail_url?: string;
};

type UserProgress = {
  video_id: string;
  completed: boolean;
  progress: number; // 0-100
  last_watched: string;
  quiz_score?: number;
};

type TrainingCategory = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
};

const TrainingModule = () => {
  const [videos, setVideos] = useState<TrainingVideo[]>([]);
  const [progress, setProgress] = useState<Record<string, UserProgress>>({});
  const [loading, setLoading] = useState(true);
  const [currentVideo, setCurrentVideo] = useState<TrainingVideo | null>(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  const navigate = useNavigate();

  // Categories with icons and colors
  const categories: TrainingCategory[] = [
    {
      id: 'introduction',
      name: 'Introductions',
      description: 'Welcome messages and company overview',
      icon: <User size={18} className="text-blue-600" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'product',
      name: 'Product Training',
      description: 'Detailed product knowledge',
      icon: <Box size={18} className="text-emerald-600" />,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      id: 'safety',
      name: 'Safety Procedures',
      description: 'Workplace safety guidelines',
      icon: <Shield size={18} className="text-amber-600" />,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    },
    {
      id: 'compliance',
      name: 'Compliance',
      description: 'Legal and regulatory training',
      icon: <FileText size={18} className="text-violet-600" />,
      color: 'text-violet-600',
      bgColor: 'bg-violet-50'
    },
    {
      id: 'soft-skills',
      name: 'Soft Skills',
      description: 'Communication and teamwork',
      icon: <Users size={18} className="text-rose-600" />,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50'
    }
  ];

  // Sample quiz questions (in a real app, these would come from Supabase)
  const quizQuestions = currentVideo ? [
    {
      id: '1',
      question: `What was the main point of "${currentVideo.title}"?`,
      options: [
        'Option A',
        'Option B',
        'Option C (Correct)',
        'Option D'
      ],
      correctAnswer: 'Option C (Correct)'
    },
    {
      id: '2',
      question: 'Which of these was NOT mentioned in the video?',
      options: [
        'First concept',
        'Second concept',
        'Third concept (Correct)',
        'All were mentioned'
      ],
      correctAnswer: 'Third concept (Correct)'
    },
    {
      id: '3',
      question: 'How should you apply this knowledge?',
      options: [
        'In specific situations only',
        'Never',
        'In all relevant work (Correct)',
        'Only when supervised'
      ],
      correctAnswer: 'In all relevant work (Correct)'
    }
  ] : [];

  // Fetch training videos from Supabase
  useEffect(() => {
  const fetchTrainingData = async () => {
    try {
      setLoading(true);
      
      // Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error(authError?.message || 'User not authenticated');
      }

      // Fetch videos with error handling
      const { data: videosData, error: videosError } = await supabase
        .from('training_videos')
        .select('*')
        .order('order', { ascending: true });

      if (videosError) throw videosError;
      if (!videosData) throw new Error('No videos found');

      // Fetch user progress
      const { data: progressData, error: progressError } = await supabase
        .from('training_progress')
        .select('*')
        .eq('user_id', user.id);

      if (progressError) throw progressError;

      // Convert progress array to object
      const progressObj = (progressData || []).reduce((acc, item) => {
        acc[item.video_id] = item;
        return acc;
      }, {} as Record<string, UserProgress>);

      setVideos(videosData);
      setProgress(progressObj);
      
    } catch (error) {
      console.error('Error fetching training data:', error);
      toast.error('Failed to load training content');
      // Optionally redirect to login if auth fails
      if (error instanceof Error && error.message.includes('authentication')) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  fetchTrainingData();
}, [navigate]); // Add navigate to dependencies

  // Handle video progress updates
  const updateVideoProgress = async (videoId: string, newProgress: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update local state first for immediate feedback
      setProgress(prev => ({
        ...prev,
        [videoId]: {
          ...prev[videoId],
          progress: newProgress,
          completed: newProgress >= 95, // Consider 95% as completed
          last_watched: new Date().toISOString()
        }
      }));

      // Upsert to Supabase
      const { error } = await supabase
        .from('training_progress')
        .upsert({
          user_id: user.id,
          video_id: videoId,
          progress: newProgress,
          completed: newProgress >= 95,
          last_watched: new Date().toISOString()
        });

      if (error) throw error;

    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  // Handle video selection
  const handleSelectVideo = (video: TrainingVideo) => {
    // Check if previous required videos are completed
    if (video.required) {
      const previousRequiredVideos = videos
        .filter(v => v.required && v.order < video.order)
        .sort((a, b) => a.order - b.order);

      for (const prevVideo of previousRequiredVideos) {
        if (!progress[prevVideo.id]?.completed) {
          toast.error(`Please complete "${prevVideo.title}" first`);
          return;
        }
      }
    }

    setCurrentVideo(video);
    setVideoProgress(progress[video.id]?.progress || 0);
    setShowQuiz(false);
    setQuizSubmitted(false);
    setQuizScore(null);
  };

  // Handle video completion
  const handleVideoComplete = () => {
    if (!currentVideo) return;
    
    updateVideoProgress(currentVideo.id, 100);
    
    // For required videos, show quiz
    if (currentVideo.required) {
      setShowQuiz(true);
    } else {
      toast.success(`Completed: ${currentVideo.title}`);
    }
  };

  // Handle quiz submission
  const handleQuizSubmit = () => {
    if (!currentVideo) return;

    // Calculate score
    const correctAnswers = quizQuestions.filter(q => 
      quizAnswers[q.id] === q.correctAnswer
    ).length;

    const score = Math.round((correctAnswers / quizQuestions.length) * 100);
    setQuizScore(score);
    setQuizSubmitted(true);

    // Update progress with quiz score
    if (score >= 80) { // Passing score
      updateVideoProgress(currentVideo.id, 100);
      toast.success(`Quiz passed! Score: ${score}%`);
    } else {
      toast.error(`Quiz score ${score}% - please review and try again`);
    }
  };

  // Get next/previous videos
  const getAdjacentVideos = () => {
    if (!currentVideo || videos.length === 0) return { prev: null, next: null };

    const currentIndex = videos.findIndex(v => v.id === currentVideo.id);
    const prevVideo = currentIndex > 0 ? videos[currentIndex - 1] : null;
    const nextVideo = currentIndex < videos.length - 1 ? videos[currentIndex + 1] : null;

    return {
      prev: prevVideo,
      next: nextVideo
    };
  };

  // Filter videos by category
  const filteredVideos = activeCategory 
    ? videos.filter(v => v.category === activeCategory)
    : videos;

  // Calculate overall progress
  const overallProgress = videos.length > 0
    ? Math.round(
        (Object.values(progress).filter(p => p.completed).length / 
        videos.filter(v => v.required).length) * 100
      )
    : 0;

  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  // Render video player view
  if (currentVideo) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        {/* Video header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
          <button
            onClick={() => setCurrentVideo(null)}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 mr-2" />
            <span className="font-medium">Back to training</span>
          </button>
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-500">
              {currentVideo.category.charAt(0).toUpperCase() + currentVideo.category.slice(1)} Training
            </span>
            {currentVideo.required && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                Required
              </span>
            )}
          </div>
        </div>

        {/* Video player area */}
       <div className="p-6">
  <div className="aspect-w-16 aspect-h-9 bg-black rounded-xl overflow-hidden mb-6 shadow-md">
    {/* Conditional rendering for video player or thumbnail */}
    {isPlaying ? (
      // Video player when playing
      <video
        controls
        autoPlay
        className="w-full h-[480px] object-contain bg-black"
        onEnded={() => setIsPlaying(false)}
      >
        <source src={currentVideo.url} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    ) : (
      // Thumbnail with play button when paused
      <div className="w-full h-[480px] bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center relative">
        {currentVideo.thumbnail_url ? (
          <>
            <img 
              src={currentVideo.thumbnail_url} 
              alt={currentVideo.title}
              className="w-full h-full object-cover opacity-70"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <button 
                onClick={() => setIsPlaying(true)}
                className="p-4 bg-white bg-opacity-20 backdrop-blur-sm rounded-full hover:bg-opacity-30 transition-all"
              >
                <PlayCircle className="h-16 w-16 text-white" strokeWidth={1.5} />
              </button>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <button 
              onClick={() => setIsPlaying(true)}
              className="p-4 bg-white bg-opacity-20 backdrop-blur-sm rounded-full hover:bg-opacity-30 transition-all"
            >
              <PlayCircle className="h-16 w-16 text-white" strokeWidth={1.5} />
            </button>
          </div>
        )}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-emerald-500 h-2 rounded-full" 
              style={{ width: `${videoProgress}%` }}
            ></div>
          </div>
        </div>
      </div>
    )}
  </div>


          <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6">
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-gray-900">{currentVideo.title}</h2>
              <p className="text-gray-600 mt-2">{currentVideo.description}</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                <Clock className="h-4 w-4 mr-1.5" />
                {Math.floor(currentVideo.duration / 60)}m {currentVideo.duration % 60}s
              </span>
              {progress[currentVideo.id]?.completed && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                  Completed
                </span>
              )}
            </div>
          </div>

          {/* Progress controls */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="w-full">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span className="font-medium">Your progress</span>
                  <span className="font-semibold">{videoProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-emerald-600 h-3 rounded-full" 
                    style={{ width: `${videoProgress}%` }}
                  ></div>
                </div>
              </div>
              <button
                onClick={() => {
                  const newProgress = videoProgress >= 95 ? 100 : videoProgress + 5;
                  setVideoProgress(newProgress);
                  updateVideoProgress(currentVideo.id, newProgress);
                  if (newProgress === 100) handleVideoComplete();
                }}
                className="px-6 py-3 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm whitespace-nowrap"
              >
                {videoProgress >= 95 ? 'Mark Complete' : 'Add Progress +5%'}
              </button>
            </div>
          </div>

          {/* Quiz section */}
          {showQuiz && (
            <div className="border-t border-gray-200 pt-8 mt-8">
              <div className="flex items-center mb-6">
                <div className="p-3 rounded-lg bg-blue-100 text-blue-600 mr-4">
                  <HelpCircle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Knowledge Check</h3>
                  <p className="text-gray-600">{quizQuestions.length} questions to test your understanding</p>
                </div>
              </div>

              {!quizSubmitted ? (
                <div className="space-y-6">
                  {quizQuestions.map((q) => (
                    <div key={q.id} className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">{q.question}</h4>
                      <div className="space-y-3">
                        {q.options.map((opt) => (
                          <label key={opt} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                            <input
                              type="radio"
                              name={`question-${q.id}`}
                              checked={quizAnswers[q.id] === opt}
                              onChange={() => setQuizAnswers(prev => ({
                                ...prev,
                                [q.id]: opt
                              }))}
                              className="h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                            />
                            <span className="text-gray-700">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={handleQuizSubmit}
                      disabled={Object.keys(quizAnswers).length < quizQuestions.length}
                      className={`px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm ${
                        Object.keys(quizAnswers).length < quizQuestions.length 
                          ? 'opacity-50 cursor-not-allowed' 
                          : ''
                      }`}
                    >
                      Submit Quiz
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${
                    quizScore && quizScore >= 80 ? 'bg-emerald-100' : 'bg-red-100'
                  } mb-6`}>
                    {quizScore && quizScore >= 80 ? (
                      <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                    ) : (
                      <X className="h-8 w-8 text-red-600" />
                    )}
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                    {quizScore && quizScore >= 80 ? 'Quiz Passed!' : 'Quiz Not Passed'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Your score: <span className={`font-semibold ${
                      quizScore && quizScore >= 80 ? 'text-emerald-600' : 'text-red-600'
                    }`}>{quizScore}%</span> {quizScore && quizScore >= 80 ? 
                    '— Well done!' : '— Minimum passing score is 80%'}
                  </p>
                  <div className="flex justify-center gap-4">
                    {quizScore && quizScore < 80 ? (
                      <button
                        onClick={() => {
                          setQuizSubmitted(false);
                          setQuizAnswers({});
                        }}
                        className="px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                      >
                        Try Again
                      </button>
                    ) : (
                      <button
                        onClick={() => setCurrentVideo(null)}
                        className="px-6 py-3 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                      >
                        Continue Training
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation between videos */}
          <div className="flex flex-col md:flex-row justify-between gap-4 border-t border-gray-200 pt-8 mt-8">
            {getAdjacentVideos().prev ? (
              <button
                onClick={() => handleSelectVideo(getAdjacentVideos().prev!)}
                className="flex-1 flex items-center justify-start px-6 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="h-5 w-5 mr-2" />
                <div className="text-left">
                  <div className="text-xs text-gray-500">Previous</div>
                  <div className="font-medium truncate max-w-xs">{getAdjacentVideos().prev?.title}</div>
                </div>
              </button>
            ) : (
              <div className="flex-1"></div>
            )}

            {getAdjacentVideos().next ? (
              <button
                onClick={() => handleSelectVideo(getAdjacentVideos().next!)}
                className="flex-1 flex items-center justify-end px-6 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="text-right">
                  <div className="text-xs text-gray-500">Next</div>
                  <div className="font-medium truncate max-w-xs">{getAdjacentVideos().next?.title}</div>
                </div>
                <ChevronRight className="h-5 w-5 ml-2" />
              </button>
            ) : (
              <button
                onClick={() => setCurrentVideo(null)}
                className="flex-1 flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 transition-colors"
              >
                Finish Section
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Render main training dashboard
  return (
    <div className="space-y-8">
      {/* Progress overview */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Training Progress</h2>
            <p className="text-gray-600 mt-1">
              Complete all required training modules to advance
            </p>
          </div>
          <div className="w-full md:w-80">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span className="font-medium">Overall completion</span>
              <span className="font-semibold">{overallProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-emerald-600 h-3 rounded-full" 
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mt-8">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100 text-blue-600 mr-4">
                <Bookmark className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Modules</p>
                <p className="text-2xl font-semibold text-gray-900">{videos.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-emerald-100 text-emerald-600 mr-4">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {Object.values(progress).filter(p => p.completed).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-amber-100 text-amber-600 mr-4">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">In Progress</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {Object.values(progress).filter(p => p.progress > 0 && !p.completed).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-gray-100 text-gray-600 mr-4">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Locked</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {videos.filter(v => v.required && !progress[v.id]?.completed).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px overflow-x-auto">
            <button
              onClick={() => setActiveCategory(null)}
              className={`whitespace-nowrap py-5 px-6 border-b-2 font-medium text-sm flex items-center ${
                !activeCategory
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart2 className="h-5 w-5 mr-2" />
              All Training
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`whitespace-nowrap py-5 px-6 border-b-2 font-medium text-sm flex items-center transition-colors ${
                  activeCategory === cat.id
                    ? `${cat.color} border-${cat.color.split('-')[1]}-500`
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {cat.icon}
                <span className="ml-2">{cat.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Training modules list */}
      {filteredVideos.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
              <div className="p-6">
                <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg mb-4 overflow-hidden">
                  <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <PlayCircle className="h-12 w-12 text-gray-400" />
                  </div>
                </div>
                <div className="animate-pulse">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6 mb-4"></div>
                  <div className="flex space-x-3">
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => {
            const isCompleted = progress[video.id]?.completed;
            const isLocked = video.required && 
              videos.some(v => v.required && v.order < video.order && !progress[v.id]?.completed);
            const category = categories.find(c => c.id === video.category);

            return (
              <motion.div 
                key={video.id}
                whileHover={{ y: -4 }}
                className={`bg-white rounded-xl shadow-sm overflow-hidden border ${
                  isCompleted ? 'border-emerald-200' : 'border-gray-200'
                } hover:shadow-md transition-shadow`}
              >
                <div className="p-6">
                  <div className="flex items-start">
                    <div className={`p-3 rounded-lg mr-4 ${
                      isCompleted 
                        ? 'bg-emerald-100 text-emerald-600' 
                        : isLocked
                          ? 'bg-gray-100 text-gray-400'
                          : category?.bgColor + ' ' + category?.color
                    }`}>
                      {isLocked ? (
                        <Lock className="h-5 w-5" />
                      ) : (
                        <PlayCircle className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold ${
                        isCompleted ? 'text-emerald-800' : 'text-gray-900'
                      }`}>
                        {video.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{video.description}</p>
                      <div className="flex items-center mt-3 space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <Clock className="h-3 w-3 mr-1" />
                          {Math.floor(video.duration / 60)}m
                        </span>
                        {video.required && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            Required
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="flex justify-between text-xs text-gray-600 mb-1.5">
                      <span>Progress</span>
                      <span className="font-medium">{progress[video.id]?.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${
                          isCompleted ? 'bg-emerald-600' : 'bg-blue-600'
                        }`} 
                        style={{ width: `${progress[video.id]?.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <button
                      onClick={() => !isLocked && handleSelectVideo(video)}
                      disabled={isLocked}
                      className={`w-full flex justify-center items-center px-4 py-2.5 border ${
                        isLocked
                          ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                          : isCompleted
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
                      } rounded-lg text-sm font-medium transition-colors`}
                    >
                      {isLocked ? (
                        <>
                          <Lock className="h-4 w-4 mr-2" />
                          Complete previous modules
                        </>
                      ) : isCompleted ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          View Again
                        </>
                      ) : (
                        <>
                          <PlayCircle className="h-4 w-4 mr-2" />
                          {progress[video.id]?.progress ? 'Continue' : 'Start'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Completion certificate (visible when all required videos are done) */}
      {videos.length > 0 && 
       videos.filter(v => v.required).length === 
       Object.values(progress).filter(p => p.completed).length && (
        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl shadow-lg p-8 border border-emerald-200">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Training Complete! 🎉</h2>
              <p className="text-gray-600">
                Congratulations on completing all required training modules. Download your certificate below.
              </p>
            </div>
            <div>
              <button className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 transition-colors">
                <Award className="h-5 w-5 mr-2" />
                Download Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingModule;