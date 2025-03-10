import { useSelector } from "react-redux";

function LearningPath() {
  const { currentUser } = useSelector((state) => state.user);
  console.log(currentUser);

  return (
    <div>LearningPath</div>
  )
}

export default LearningPath