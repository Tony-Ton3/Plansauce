import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function Home() {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  return (
    <div className="px-8 py-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-nerko text-4xl md:text-5xl font-bold text-white mb-6">
          Welcome to <span className="text-[#8e5fe7]">LearnStack</span>
        </h1>

        <p className="text-gray-300 text-xl mb-8">
          Your AI-powered tech stack recommendation platform
        </p>

        <div className="bg-[#1a1f29] rounded-lg shadow-lg p-8 mb-10">
          <h2 className="font-nerko text-3xl font-bold text-white mb-4">
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-[#252b38] p-4 rounded-lg">
              <div className="font-bold text-xl mb-2 text-[#8e5fe7]">1. Describe Your Project</div>
              <p className="text-gray-300">Tell us about your project idea and requirements</p>
            </div>

            <div className="bg-[#252b38] p-4 rounded-lg">
              <div className="font-bold text-xl mb-2 text-[#8e5fe7]">2. AI Analysis</div>
              <p className="text-gray-300">Our AI analyzes your needs and generates recommendations</p>
            </div>

            <div className="bg-[#252b38] p-4 rounded-lg">
              <div className="font-bold text-xl mb-2 text-[#8e5fe7]">3. Get Your Stack</div>
              <p className="text-gray-300">Receive a customized tech stack tailored to your project</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <button
            onClick={() => navigate('/projectinput')}
            className="px-8 py-3 rounded-lg text-lg font-medium bg-[#8e5fe7] hover:bg-opacity-90 text-white transition-colors mb-4"
          >
            {currentUser ? 'Start Your Project' : 'Sign In to Start'}
          </button>

          {!currentUser && (
            <p className="text-gray-400">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/sign-up')}
                className="text-[#8e5fe7] hover:underline"
              >
                Sign Up
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}