import { useState, useRef, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import {
  UploadCloud,
  X,
  CheckCircle2,
  Film,
  Image,
  Clock,
  FileText,
  Lock,
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';

// Types
type VideoCategory = 'introduction' | 'product' | 'safety' | 'compliance' | 'soft-skills';
type VideoFormData = {
  title: string;
  description: string;
  category: VideoCategory;
  duration: string; // HH:MM:SS format
  required: boolean;
  order: number;
  quiz_required: boolean;
};
const AdminVideoUpload = () => {
  const [formData, setFormData] = useState<VideoFormData>({
    title: '',
    description: '',
    category: 'introduction',
    duration: '00:10:00', // Default 10 minutes
    required: true,
    order: 1,
    quiz_required: true
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [existingVideos, setExistingVideos] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Fetch existing videos to determine next order number
  useEffect(() => {
    const fetchVideos = async () => {
      const { data, error } = await supabase
        .from('training_videos')
        .select('*')
        .order('order', { ascending: true });

      if (error) {
        console.error('Error fetching videos:', error);
        toast.error('Failed to load existing videos');
      } else {
        setExistingVideos(data || []);
        // Set default order to next available number
        const maxOrder = data?.length > 0 ? Math.max(...data.map(v => v.order)) : 0;
        setFormData(prev => ({ ...prev, order: maxOrder + 1 }));
      }
    };

    fetchVideos();
  }, []);

  // Handle file selection
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate video file (under 500MB and MP4/WebM)
      if (file.size > 500 * 1024 * 1024) {
        toast.error('Video file must be less than 500MB');
        return;
      }
      
      if (!['video/mp4', 'video/webm'].includes(file.type)) {
        toast.error('Only MP4 and WebM videos are supported');
        return;
      }

      setVideoFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Attempt to extract duration
      extractVideoDuration(file);
    }
  };

  // Extract video duration using HTML5 video element
  const extractVideoDuration = (file: File) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      const duration = video.duration;
      const hours = Math.floor(duration / 3600);
      const minutes = Math.floor((duration % 3600) / 60);
      const seconds = Math.floor(duration % 60);
      
      setFormData(prev => ({
        ...prev,
        duration: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      }));
    };
    
    video.src = URL.createObjectURL(file);
  };

  // Handle thumbnail selection
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate image file (under 5MB and JPG/PNG)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Thumbnail must be less than 5MB');
        return;
      }
      
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error('Only JPG, PNG, and WebP images are supported');
        return;
      }

      setThumbnailFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setThumbnailPreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  // Calculate duration in seconds
  const calculateDurationInSeconds = (durationString: string) => {
    const [hours, minutes, seconds] = durationString.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!videoFile) {
    toast.error('Please select a video file');
    return;
  }
  
  if (!formData.title) {
    toast.error('Please enter a title');
    return;
  }

  try {
    setIsUploading(true);
    setUploadProgress(0);
    
    // Generate unique filenames
    const videoId = uuidv4();
    const videoExt = videoFile.name.split('.').pop();
    const videoPath = `${formData.category}/${videoId}.${videoExt}`;
    
    let thumbnailPath = '';
    if (thumbnailFile) {
      const thumbExt = thumbnailFile.name.split('.').pop();
      thumbnailPath = `thumbnails/${videoId}.${thumbExt}`;
    }

    // Create a custom upload function with progress tracking
    const uploadWithProgress = async (file: File, path: string, bucket = 'training-videos') => {
      return new Promise<{ data: { path: string } | null; error: Error | null }>(async (resolve) => {
        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(path, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type
          });
        
        resolve({ data, error });
      });
    };

    // Upload video file (no progress tracking available in current Supabase)
    const videoUpload = uploadWithProgress(videoFile, videoPath);
    
    // For better UX, simulate progress since we can't track it directly
    const simulateProgress = () => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 90) clearInterval(interval);
        setUploadProgress(Math.min(progress, 90)); // Cap at 90% until actual upload completes
      }, 300);
      return interval;
    };

    const progressInterval = simulateProgress();
    
    // Wait for upload to complete
    const videoResult = await videoUpload;
    clearInterval(progressInterval);
    setUploadProgress(100);
    
    if (videoResult.error) throw videoResult.error;

    // Upload thumbnail if provided
    const thumbnailUpload = thumbnailFile 
      ? uploadWithProgress(thumbnailFile, thumbnailPath)
      : Promise.resolve({ data: null, error: null });

    const thumbnailResult = await thumbnailUpload;
    if (thumbnailResult.error) throw thumbnailResult.error;

    // Get public URLs
    const { data: videoUrlData } = supabase
      .storage
      .from('training-videos')
      .getPublicUrl(videoPath);
    
    const thumbnailUrl = thumbnailFile 
      ? supabase.storage
          .from('training-videos')
          .getPublicUrl(thumbnailPath).data.publicUrl
      : null;

    // Insert video record into database
    const { error: dbError } = await supabase
      .from('training_videos')
      .insert([{
        id: videoId,
        title: formData.title,
        description: formData.description,
        url: videoUrlData.publicUrl,
        duration: calculateDurationInSeconds(formData.duration),
        required: formData.required,
        order: formData.order,
        category: formData.category,
        thumbnail_url: thumbnailUrl,
        quiz_required: formData.quiz_required
      }]);

    if (dbError) throw dbError;

    toast.success('Video uploaded successfully!');
    navigate('/admin/training');

  } catch (error) {
    console.error('Upload error:', error);
    toast.error('Failed to upload video');
  } finally {
    setIsUploading(false);
  }
};

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'introduction',
      duration: '00:10:00',
      required: true,
      order: existingVideos.length > 0 ? Math.max(...existingVideos.map(v => v.order)) + 1 : 1,
      quiz_required: true
    });
    setVideoFile(null);
    setThumbnailFile(null);
    setPreviewUrl(null);
    setThumbnailPreview(null);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h1 className="text-xl font-medium text-gray-900 flex items-center">
            <Film className="h-5 w-5 mr-2 text-blue-500" />
            Upload Training Video
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Add new training content to the staff portal
          </p>
        </div>

        {/* Main form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Video Upload Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Video File <span className="text-red-500">*</span>
              </label>
              
              {!videoFile ? (
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                        <span>Upload a video file</span>
                        <input
                          ref={fileInputRef}
                          id="video-upload"
                          name="video-upload"
                          type="file"
                          accept="video/mp4,video/webm"
                          className="sr-only"
                          onChange={handleVideoChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      MP4 or WebM up to 500MB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-1 rounded-md border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <Film className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                          {videoFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setVideoFile(null);
                        setPreviewUrl(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  {previewUrl && (
                    <div className="mt-4">
                      <div className="aspect-w-16 aspect-h-9 bg-black rounded-md overflow-hidden">
                        <video
                          src={previewUrl}
                          controls
                          className="w-full h-48 object-contain bg-black"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Thumbnail Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thumbnail Image (Optional)
              </label>
              
              {!thumbnailFile ? (
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                        <span>Upload a thumbnail</span>
                        <input
                          ref={thumbnailInputRef}
                          id="thumbnail-upload"
                          name="thumbnail-upload"
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="sr-only"
                          onChange={handleThumbnailChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      JPG, PNG, or WebP up to 5MB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-1 rounded-md border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <Image className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                          {thumbnailFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(thumbnailFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setThumbnailFile(null);
                        setThumbnailPreview(null);
                        if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
                      }}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  {thumbnailPreview && (
                    <div className="mt-4">
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        className="h-32 object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Progress bar */}
          {isUploading && (
            <div>
              <div className="flex justify-between text-sm text-gray-500 mb-1">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Video Details Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="introduction">Introduction</option>
                <option value="product">Product Training</option>
                <option value="safety">Safety Procedures</option>
                <option value="compliance">Compliance</option>
                <option value="soft-skills">Soft Skills</option>
              </select>
            </div>

            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                Duration (HH:MM:SS)
              </label>
              <input
                type="text"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                pattern="^([0-1][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="00:10:00"
              />
            </div>

            <div>
              <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-1">
                Display Order
              </label>
              <input
                type="number"
                id="order"
                name="order"
                min="1"
                value={formData.order}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  id="required"
                  name="required"
                  type="checkbox"
                  checked={formData.required}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="required" className="ml-2 block text-sm text-gray-700">
                  Required Training
                </label>
              </div>

              <div className="flex items-center">
                <input
                  id="quiz_required"
                  name="quiz_required"
                  type="checkbox"
                  checked={formData.quiz_required}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="quiz_required" className="ml-2 block text-sm text-gray-700">
                  Include Quiz
                </label>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Form actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={isUploading || !videoFile}
              className={`px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 ${
                isUploading || !videoFile ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isUploading ? 'Uploading...' : 'Upload Video'}
            </button>
          </div>
        </form>
      </div>

      {/* Existing videos reference */}
      <div className="mt-8 bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-gray-500" />
            Existing Videos Reference
          </h2>
        </div>
        <div className="p-6">
          {existingVideos.length === 0 ? (
            <p className="text-sm text-gray-500">No videos uploaded yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Required
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {existingVideos.map((video) => (
                    <tr key={video.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {video.order}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {video.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                        {video.category.replace('-', ' ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {Math.floor(video.duration / 3600)}h {Math.floor((video.duration % 3600) / 60)}m
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {video.required ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            No
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; export default AdminVideoUpload;