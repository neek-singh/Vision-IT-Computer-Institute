/**
 * ════════════════════════════════════════════
 * courses.js — Vision IT Computer Institute
 * Logic for rendering courses on the courses page.
 * ════════════════════════════════════════════
 */

// NOTE: Ek real application mein, ye data database (jaise Firestore) se aayega.
// Abhi ke liye, hum ise yahan hardcode kar rahe hain.
// Apne sabhi courses ko is array mein add karein.
const courses = [
  {
    id: 'dca',
    title: 'Diploma in Computer Application (DCA)',
    category: 'basic',
    duration: '6 Months',
    description: 'A foundational course covering computer fundamentals, MS Office, internet usage, and more.',
    image: '/assets/images/courses/dca.jpg', // Make sure you have images at this path
    level: 'Beginner'
  },
  {
    id: 'pgdca',
    title: 'Post Graduate Diploma in Computer Application (PGDCA)',
    category: 'advanced',
    duration: '12 Months',
    description: 'An advanced course for graduates, covering programming, databases, and software development concepts.',
    image: '/assets/images/courses/pgdca.jpg',
    level: 'Advanced'
  },
  {
    id: 'tally',
    title: 'Tally Prime with GST',
    category: 'tally',
    duration: '3 Months',
    description: 'Master the leading accounting software, Tally Prime, including GST compliance and financial management.',
    image: '/assets/images/courses/tally.jpg',
    level: 'Intermediate'
  },
  {
    id: 'c-plus-plus',
    title: 'C & C++ Programming',
    category: 'programming',
    duration: '3 Months',
    description: 'Learn the fundamentals of programming with C and object-oriented concepts with C++.',
    image: '/assets/images/courses/c-plus-plus.jpg',
    level: 'Intermediate'
  },
  {
    id: 'web-design',
    title: 'Web Designing',
    category: 'webdesign',
    duration: '4 Months',
    description: 'Build beautiful and responsive websites using HTML, CSS, JavaScript, and modern frameworks.',
    image: '/assets/images/courses/web-design.jpg',
    level: 'Intermediate'
  },
  {
    id: 'dtp',
    title: 'Desktop Publishing (DTP)',
    category: 'dtp',
    duration: '3 Months',
    description: 'Create professional-quality publications with software like CorelDRAW and Photoshop.',
    image: '/assets/images/courses/dtp.jpg',
    level: 'Beginner'
  }
  // ... yahan apne baaki courses add karein
];

function createCourseCard(course) {
  return `
    <div class="course-card" data-category="${course.category}">
      <a href="/course-details.html?id=${course.id}" class="block no-underline">
        <img src="${course.image}" alt="${course.title}" class="w-full h-40 object-cover" loading="lazy">
        <div class="p-5">
          <div class="flex justify-between items-center mb-2">
            <span class="badge">${course.level}</span>
            <span class="th3 text-xs font-medium"><i class="far fa-clock mr-1"></i>${course.duration}</span>
          </div>
          <h3 class="text-lg font-bold th lc2 mb-2">${course.title}</h3>
          <p class="th2 text-sm lc3">${course.description}</p>
        </div>
      </a>
      <div class="p-5 pt-0">
        <a href="/admission.html?course=${course.id}" class="btn btn-sky w-full">Enroll Now</a>
      </div>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('courses-container');
  if (container) {
    container.innerHTML = courses.map(createCourseCard).join('');
  } else {
    console.error('Course container with ID "courses-container" not found!');
  }
});