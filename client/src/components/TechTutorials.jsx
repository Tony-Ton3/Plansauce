const TechTutorials = ({ tech, techTutorials }) => {
    return (
      <div className="mt-4">
        {/* YouTube videos */}
        <h3 className="text-xl font-semibold">{tech} YouTube Tutorials</h3>
        {Array.isArray(techTutorials) && techTutorials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            {techTutorials.map((video) => (
              <div key={video.id} className="border rounded-lg p-4">
                <img src={video.thumbnail} alt={video.title} className="w-full" />
                <h4 className="mt-2 font-medium">{video.title}</h4>
                <p className="text-sm text-gray-600">{video.channelTitle}</p>
                <a
                  href={`https://www.youtube.com/watch?v=${video.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block bg-red-600 text-white px-4 py-2 rounded"
                >
                  Watch
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-900"></div>
          </div>
        )}
      </div>
    );
  };
  
  export default TechTutorials;