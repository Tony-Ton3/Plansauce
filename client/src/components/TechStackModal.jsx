import { useState, useRef, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

const TechStackModal = ({ isOpen, onClose, techStack }) => {
  const [isVisible, setIsVisible] = useState(false);
  const modalRef = useRef(null);

  // Mock data for development
  const mockTechStack = {
    recommendedStack: {
      technologies: [
        {
          name: "React",
          description: "A JavaScript library for building user interfaces with a focus on component-based architecture and efficient DOM manipulation.",
          documentationUrl: "https://reactjs.org"
        },
        {
          name: "Three.js",
          description: "A powerful 3D graphics library that makes WebGL accessible, perfect for creating interactive 3D visualizations and game environments.",
          documentationUrl: "https://threejs.org"
        },
        {
          name: "Node.js",
          description: "A JavaScript runtime built on Chrome's V8 JavaScript engine, ideal for building scalable network applications.",
          documentationUrl: "https://nodejs.org"
        },
        {
          name: "MongoDB",
          description: "A document database with the scalability and flexibility that you want with the querying and indexing that you need.",
          documentationUrl: "https://www.mongodb.com"
        },
        {
          name: "TailwindCSS",
          description: "A utility-first CSS framework packed with classes that can be composed to build any design, directly in your markup.",
          documentationUrl: "https://tailwindcss.com"
        },
        {
          name: "Redux Toolkit",
          description: "The official, opinionated, batteries-included toolset for efficient Redux development.",
          documentationUrl: "https://redux-toolkit.js.org"
        }
      ],
      reasoning: "This tech stack is chosen for its perfect balance of performance and developer experience. React provides a robust foundation for the UI, while Three.js enables sophisticated 3D graphics. Node.js and MongoDB offer scalability for future growth, and TailwindCSS ensures rapid UI development. Redux Toolkit manages complex state efficiently.",
      gettingStarted: `To get started with this project:

1. Clone the repository and install dependencies:
   npm install

2. Set up your development environment:
   - Install Node.js 18+ and MongoDB
   - Configure your IDE with ESLint and Prettier
   - Install React and Redux DevTools

3. Key development commands:
   - npm run dev: Start development server
   - npm run build: Build for production
   - npm run test: Run test suite

4. Recommended learning resources:
   - React Official Tutorial
   - Three.js Fundamentals
   - MongoDB University (free courses)
   - TailwindCSS Documentation`
    }
  };

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation to complete
  };

  if (!isOpen) return null;

  // Use mock data if no tech stack is provided
  const displayStack = techStack || mockTechStack;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        ref={modalRef}
        className={`bg-white rounded-lg max-w-3xl w-full mx-auto relative transform transition-all duration-300 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        <div className="p-6">
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes size={24} />
          </button>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">Project Technologies</h2>

          <div className="space-y-6">
            {/* Recommended Stack */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Recommended Stack</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayStack?.recommendedStack?.technologies?.map((tech) => (
                  <div key={tech.name} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900">{tech.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{tech.description}</p>
                    <a
                      href={tech.documentationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 mt-2 inline-block"
                    >
                      View Documentation
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Reasoning */}
            {displayStack?.recommendedStack?.reasoning && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Why These Technologies?</h3>
                <p className="text-gray-600">{displayStack.recommendedStack.reasoning}</p>
              </div>
            )}

            {/* Getting Started */}
            {displayStack?.gettingStarted && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Getting Started</h3>
                <p className="text-gray-600 whitespace-pre-line">{displayStack.gettingStarted}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechStackModal; 