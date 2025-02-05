import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { projectQuestions } from "../constants/questions";
import { IoIosArrowDropdown, IoMdAdd, IoMdCheckmark } from "react-icons/io";

function ProjectInput() {
  const [form, setForm] = useState(() => {
    const savedForm = localStorage.getItem("projectForm");

    return savedForm
      ? JSON.parse(savedForm)
      : {
          description: "", //an descrioption of what the user wants to build
          projectType: "", //web, mobile, etc
          scale: "", //personal, startup, enterprise
          features: [], //an array of must have features for the project
          timeline: "", //development timeline
          experience: "", //expereince level of the user
          knownTechnologies: [], //getting more info about user experinece for more catered recommendation
        };
  });

  const resetForm = () => {
    //clear local storage if user wants another recommendation
    const emptyForm = {
      description: "",
      projectType: "",
      scale: "",
      features: [],
      timeline: "",
      experience: "",
      knownTechnologies: [],
    };
    setForm(emptyForm);
    localStorage.removeItem("projectForm");
  };

  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    localStorage.setItem("projectForm", JSON.stringify(form));
  }, [form]);

  //handles text box changes
  const handleInputChange = (id, value) => {
    setForm((prev) => {
      const newForm = { ...prev, [id]: value };
      localStorage.setItem("projectForm", JSON.stringify(newForm));
      return newForm;
    });
  };

  //handles check box changes
  const handleMultiSelectChange = (id, value, isChecked) => {
    setForm((prev) => {
      const newForm = {
        ...prev,
        [id]: isChecked ? [...prev[id], value] : prev[id].filter((item) => item !== value),
      };
      localStorage.setItem("projectForm", JSON.stringify(newForm));
      return newForm;
    });
  };

  //navigates to the next page of the form
  const handleNext = () => {
    if (currentPage < projectQuestions.length - 1) {
      setCurrentPage((prev) => prev + 1);
    } else {
      //sends userinput to server to get recommendations
      handleRecommendation();
    }
  };

  //navigate to the previosu page of the form
  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const renderQuestion = (question) => {
    switch (question.type) {
      case "text":
        return (
          <textarea
            id={question.id}
            value={form[question.id] || ""}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className="border-2 border-gray-500 rounded w-full h-24 py-2 px-3 bg-gray-100 leading-tight focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent "
            placeholder="Describe your project idea here..."
          />
        );
      case "select":
        return (
          <div className="relative">
            <select
              id={question.id}
              value={form[question.id] || ""}
              onChange={(e) => handleInputChange(question.id, e.target.value)}
              className="block appearance-none w-full bg-gray-100 py-2 px-3 pr-8 rounded border-2 border-gray-500 leading-tight focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            >

              <option value="" disabled>
                Select an option
              </option>
              {question.options.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        );
      case "multiselect":
        return (
          <div className="flex flex-wrap gap-1 justify-start">
            {question.options.map((option, index) => {
              const isChecked = form[question.id]?.includes(option) || false;
              return (
                <button
                  key={index}
                  onClick={() =>
                    handleMultiSelectChange(question.id, option, !isChecked)
                  }
                  className={`inline-flex items-center px-3 py-1 rounded-full text-md font-medium transition-colors duration-200 ${
                    isChecked
                      ? "bg-accent text-background"
                      : "text-accent border-2 border-accent"
                  }`}
                >
                  {option}
                  <span className="ml-1">
                    {isChecked ? (
                      <IoMdCheckmark className="h-5 w-5" />
                    ) : (
                      <IoMdAdd className="h-5 w-5" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        );
      default:
        return null;
    }
  };

  const currentPageQuestions = projectQuestions[currentPage];

  return (
    <div className="bg-gradient-to-b from-gray-900 to-black min-h-screen flex flex-col justify-center items-center pt-20">
      <div className="w-full max-w-3xl mx-auto px-4">
        <div className="bg-background rounded-lg shadow-lg p-6">
          <h2 className="font-nerko text-3xl font-bold text-gray-600 mb-4 text-center">
            {currentPageQuestions.title}
          </h2>
          <div className="mt-4 space-y-4">
            {currentPageQuestions.questions.map((question) => (
              <div key={question.id}>
                <label className="block text-sm font-medium mb-1">
                  {question.question}
                </label>
                {renderQuestion(question)}
              </div>
            ))}
          </div>

          <div
            className={`flex ${
              !currentPage ? "justify-end" : "justify-between"
            } mt-6 gap-2`}
          >
            {currentPage > 0 && (
              <button
                onClick={handlePrevious}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-secondary to-accent text-background transition-all shadow-[2px_2px_0px_black] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] focus:outline-none"
              >
                Previous
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-secondary to-accent text-background transition-all shadow-[2px_2px_0px_black] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] focus:outline-none"
            >
              {currentPage === projectQuestions.length - 1
                ? "Create Stack"
                : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ProjectInput;