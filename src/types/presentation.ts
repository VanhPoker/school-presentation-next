// Core types for Presentation Module

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'teacher' | 'student' | 'admin';
  school?: string;
}

export interface Presentation {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  slides: Slide[];
  ownerId: string;
  owner?: User;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  tags: string[];
  viewCount: number;
  presentCount: number;
  sourceType: 'upload' | 'create' | 'import';
  aspectRatio: '16:9' | '4:3' | '1:1';
  status: 'draft' | 'published' | 'archived';
}

export interface Slide {
  id: string;
  presentationId: string;
  orderIndex: number;
  title?: string;
  thumbnail?: string;
  backgroundImage?: string;
  backgroundColor?: string;
  elements: SlideElement[];
  notes?: string;
  transition: SlideTransition;
  activities: Activity[];
}

export interface SlideElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  content: ElementContent;
  style: ElementStyle;
  animations: Animation[];
  isLocked: boolean;
  layerIndex: number;
}

export type ElementType = 
  | 'text' 
  | 'image' 
  | 'shape' 
  | 'video' 
  | 'audio' 
  | '3d-model'
  | 'chart'
  | 'table'
  | 'embed'
  | 'quiz'
  | 'poll'
  | 'timer'
  | 'whiteboard-link';

export interface ElementContent {
  text?: string;
  src?: string;
  embedUrl?: string;
  quizData?: QuizData;
  pollData?: PollData;
  chartData?: ChartData;
  model3dUrl?: string;
}

export interface ElementStyle {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  backgroundColor?: string;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  opacity?: number;
  shadow?: string;
}

export interface Animation {
  type: 'fadeIn' | 'slideIn' | 'zoomIn' | 'bounce' | 'rotate';
  direction?: 'left' | 'right' | 'top' | 'bottom';
  duration: number;
  delay: number;
  trigger: 'onLoad' | 'onClick' | 'afterPrevious';
}

export interface SlideTransition {
  type: 'fade' | 'slide' | 'zoom' | 'flip' | 'none';
  duration: number;
  direction?: 'left' | 'right' | 'top' | 'bottom';
}

// Activities (Quiz, Poll, etc.)
export interface Activity {
  id: string;
  type: 'quiz' | 'poll' | 'open-question';
  title: string;
  isActive: boolean;
  responses: ActivityResponse[];
}

export interface QuizData {
  question: string;
  options: QuizOption[];
  correctOptionIds: string[];
  timeLimit?: number;
  points: number;
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface PollData {
  question: string;
  options: PollOption[];
  allowMultiple: boolean;
  showResults: boolean;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  percentage?: number;
}

export interface ChartData {
  type: 'bar' | 'line' | 'pie' | 'donut';
  data: Array<{ label: string; value: number }>;
}

export interface ActivityResponse {
  id: string;
  activityId: string;
  userId: string;
  user?: User;
  answer: string | string[];
  isCorrect?: boolean;
  points?: number;
  timestamp: Date;
}

// Analytics
export interface PresentationSession {
  id: string;
  presentationId: string;
  presenterId: string;
  startedAt: Date;
  endedAt?: Date;
  attendees: SessionAttendee[];
  slideViews: SlideView[];
  interactions: Interaction[];
  status: 'live' | 'ended';
}

export interface SessionAttendee {
  userId: string;
  user?: User;
  joinedAt: Date;
  leftAt?: Date;
  isOnline: boolean;
  currentSlideIndex: number;
}

export interface SlideView {
  slideId: string;
  slideIndex: number;
  viewedAt: Date;
  duration: number;
}

export interface Interaction {
  id: string;
  type: 'quiz_answer' | 'poll_vote' | 'reaction' | 'question' | 'annotation';
  userId: string;
  slideId: string;
  data: Record<string, unknown>;
  timestamp: Date;
}

export interface LiveAnalytics {
  totalAttendees: number;
  onlineAttendees: number;
  averageEngagement: number;
  currentSlideIndex: number;
  quizResults: QuizResults[];
  pollResults: PollResults[];
  recentInteractions: Interaction[];
}

export interface QuizResults {
  quizId: string;
  question: string;
  totalResponses: number;
  correctResponses: number;
  averageTime: number;
  optionBreakdown: { optionId: string; count: number; percentage: number }[];
}

export interface PollResults {
  pollId: string;
  question: string;
  totalVotes: number;
  options: { optionId: string; text: string; votes: number; percentage: number }[];
}

// Integration types
export interface LMSIntegration {
  type: 'scorm' | 'xapi';
  courseId?: string;
  lessonId?: string;
  syncEnabled: boolean;
}

export interface WhiteboardLink {
  smartClassId: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

// Sharing
export interface ShareSettings {
  isPublic: boolean;
  allowCopy: boolean;
  allowDownload: boolean;
  sharedWith: SharePermission[];
  shareLink?: string;
  embedCode?: string;
}

export interface SharePermission {
  userId?: string;
  email?: string;
  role: 'viewer' | 'editor' | 'presenter';
  grantedAt: Date;
}

// Resource Library
export interface ResourceItem {
  id: string;
  type: 'image' | 'video' | '3d' | 'audio' | 'template' | 'element';
  name: string;
  thumbnail: string;
  url: string;
  category: string;
  tags: string[];
  isFromLibrary: boolean;
}
