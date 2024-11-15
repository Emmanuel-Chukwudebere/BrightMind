// src/constants/topics.ts
import { Topic } from '../types/content';

type TopicsBySubject = {
  [key: string]: Topic[];
};

export const TOPICS: TopicsBySubject = {
  Math: [
    {
      id: '1',
      subject: 'Mathematics',
      title: 'Analytical Geometry',
      lessonCount: 3,
      quizCount: 3,
      imageUrl: require('../assets/images/analytical-geometry.png'),
      progress: 0,
      isDownloaded: false,
    },
    {
      id: '2',
      subject: 'Mathematics',
      title: 'Advanced Algebra',
      lessonCount: 3,
      quizCount: 3,
      imageUrl: require('../assets/images/advanced-algebra.png'),
      progress: 0,
      isDownloaded: false,
    },
    {
      id: '3',
      subject: 'Mathematics',
      title: 'Coordinate Geometry',
      lessonCount: 3,
      quizCount: 3,
      imageUrl: require('../assets/images/coordinate-geometry.png'),
      progress: 0,
      isDownloaded: false,
    },
    {
      id: '4',
      subject: 'Mathematics',
      title: 'Calculus',
      lessonCount: 3,
      quizCount: 3,
      imageUrl: require('../assets/images/calculus.png'),
      progress: 0,
      isDownloaded: false,
    },
  ],

  Physics: [
    {
      id: '5',
      subject: 'Physics',
      title: 'Gravitational Force',
      lessonCount: 3,
      quizCount: 3,
      imageUrl: require('../assets/images/gravitational-force.png'),
      progress: 0,
      isDownloaded: false,
    },
    {
      id: '6',
      subject: 'Physics',
      title: 'Laws of Motion',
      lessonCount: 3,
      quizCount: 3,
      imageUrl: require('../assets/images/laws-of-motion.png',)
      progress: 0,
      isDownloaded: false,
    },
    {
      id: '7',
      subject: 'Physics',
      title: 'Velocity',
      lessonCount: 3,
      quizCount: 3,
      imageUrl: require('../assets/images/velocity.png',)
      progress: 0,
      isDownloaded: false,
    },
  ],
  English: [
    {
      id: '8',
      subject: 'English',
      title: 'Figures of Speech',
      lessonCount: 3,
      quizCount: 3,
      imageUrl: require('../assets/images/figures-of-speech.png'),
      progress: 0,
      isDownloaded: false,
    },
    {
      id: '9',
      subject: 'English',
      title: 'Synonyms & Antonyms',
      lessonCount: 3,
      quizCount: 3,
      imageUrl: require('../assets/images/synonyms-and-antonyms.png'),
      progress: 0,
      isDownloaded: false,
    },
    {
      id: '10',
      subject: 'English',
      title: 'Parts of Speech',
      lessonCount: 3,
      quizCount: 3,
      imageUrl: require('../assets/images/parts-of-speech.png'),
      progress: 0,
      isDownloaded: false,
    },
  ],
};