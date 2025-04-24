import { FaTimes } from "react-icons/fa";
import { useRef, useEffect } from "react";
import { FaSearch, FaBox, FaUser, FaDatabase, FaCode, FaRocket, FaWrench, FaGraduationCap, FaBook } from "react-icons/fa";

const TechnologyCard = ({ icon, name, description, docLink, category }) => {
    const getCategoryIcon = () => {
      switch (category) {
        // case 'planning':
        //   return <FaSearch className="text-blue-500" />;
        case 'setup':
          return <FaBox className="text-purple-500" />;
        case 'frontend':
          return <FaUser className="text-blue-400" />;
        case 'backend':
          return <FaDatabase className="text-indigo-500" />;
        case 'testing':
          return <FaCode className="text-amber-500" />;
        case 'deploy':
          return <FaRocket className="text-red-500" />;
        case 'maintain':
          return <FaWrench className="text-gray-500" />;
        
        default:
          return <FaGraduationCap className="text-gray-500" />;
      }
    };
  
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
            {icon || getCategoryIcon()}
          </div>
          <div className="flex-grow">
            <h4 className="text-base font-medium text-gray-900">{name}</h4>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
            
            <div className="mt-3 space-y-2">
              {docLink && (
                <a 
                  href={docLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700"
                >
                  <FaBook className="text-xs" />
                  <span>Helpful link</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

const ResourcesModal = ({ isOpen, onClose, techStackData, isLoading, currentProject }) => {
    const modalRef = useRef(null);
  
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (modalRef.current && !modalRef.current.contains(event.target)) {
          onClose();
        }
      };
  
      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        // console.log("TechStackModal opened with data:", techStackData);
      }
  
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen, onClose, techStackData]);
  
    if (!isOpen) return null;
  
    // const debugOutput = () => {
    //   if (!techStackData) {
    //     return (
    //       <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
    //         <p className="text-sm">Tech stack data is undefined or null</p>
    //       </div>
    //     );
    //   }
      
    //   if (typeof techStackData !== 'object') {
    //     return (
    //       <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
    //         <p className="text-sm">Tech stack data is not an object: {typeof techStackData}</p>
    //       </div>
    //     );
    //   }
      
    //   return null;
    // };
  
    const renderTechSection = (title, techs, category) => {
      if (!techs || techs.length === 0) return null;
  
      return (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
          <div className="space-y-4">
            {techs.map((tech, index) => (
              <TechnologyCard
                key={`${category}-${index}`}
                name={tech.name}
                
                description={tech.description}
                docLink={tech.documentationUrl || tech.docLink}
                category={category}
              />
            ))}
          </div>
        </div>
      );
    };
  
  
  
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div ref={modalRef} className="bg-white rounded-2xl shadow-xl w-full max-w-4xl animate-fadeIn overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Your Personalized Resources</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <p>
                  Curated resources for an {currentProject?.type || 'Task Management App'} with focus on {currentProject?.priority || 'Developer Productivity'}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Close modal"
            >
              <FaTimes />
            </button>
          </div>
          
          <div className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                {/* {debugOutput()} */}
                
                {techStackData && typeof techStackData === 'object' ? (
                  <div className="space-y-8">
                    {/* {renderTechSection('Planning', techStackData.planning, 'planning')} */}
                    {renderTechSection('Setup', techStackData.setup, 'setup')}
                    {renderTechSection('Frontend', techStackData.frontend, 'frontend')}
                    {renderTechSection('Backend', techStackData.backend, 'backend')}
                    {renderTechSection('Testing', techStackData.testing, 'testing')}
                    {renderTechSection('Deployment', techStackData.deploy, 'deploy')}
                    {renderTechSection('Maintenance', techStackData.maintain, 'maintain')}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <p>No resources available</p>
                    <p className="text-xs mt-2">Please create a new project to get resources</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

export default ResourcesModal;