import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../services/taskService";

const Dashboard = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchProfile();
    fetchTasks();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/auth/profile");
      setUser(res.data);
    } catch (error) {
      logout();
      navigate("/login");
    }
  };

  const fetchTasks = async () => {
    const res = await getTasks();
    setTasks(res.data);
  };

  const handleCreateTask = async () => {
    if (!newTask.trim()) return;
    await createTask({ title: newTask });
    setNewTask("");
    fetchTasks();
  };

  const handleDelete = async (id) => {
    await deleteTask(id);
    fetchTasks();
  };

  const handleToggle = async (task) => {
    await updateTask(task._id, {
      completed: !task.completed,
    });
    fetchTasks();
  };

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-md flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome, {user?.name}
          </h1>
          <p className="text-gray-600">{user?.email}</p>
        </div>
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className="bg-red-500 text-white px-4 py-2 rounded-xl"
        >
          Logout
        </button>
      </div>

      {/* Create Task */}
      <div className="bg-white p-6 rounded-2xl shadow-md mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Enter task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-xl"
          />
          <button
            onClick={handleCreateTask}
            className="bg-black text-white px-4 py-2 rounded-xl"
          >
            Add
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border rounded-xl"
        />
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.map((task) => (
          <div
            key={task._id}
            className="bg-white p-4 rounded-xl shadow flex justify-between items-center"
          >
            <span
              onClick={() => handleToggle(task)}
              className={`cursor-pointer ${
                task.completed ? "line-through text-gray-500" : ""
              }`}
            >
              {task.title}
            </span>

            <button
              onClick={() => handleDelete(task._id)}
              className="bg-red-500 text-white px-3 py-1 rounded-lg"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;