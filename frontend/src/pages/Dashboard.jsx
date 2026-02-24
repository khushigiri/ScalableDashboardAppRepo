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
import toast from "react-hot-toast";

const Dashboard = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [priority, setPriority] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
    fetchTasks();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/auth/profile");
      setUser(res.data);
    } catch {
      logout();
      navigate("/login");
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await getTasks();
      setTasks(res.data);
    } catch {
      toast.error("Failed to fetch tasks");
    } finally {
      setPageLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!newTask.trim() || !priority) {
      toast.error("Title and Priority required");
      return;
    }

    try {
      setLoading(true);

      if (editingTaskId) {
        await updateTask(editingTaskId, {
          title: newTask,
          priority,
          dueDate,
        });
        toast.success("Task updated");
        setEditingTaskId(null);
      } else {
        await createTask({
          title: newTask,
          priority,
          dueDate,
        });
        toast.success("Task added");
      }

      setNewTask("");
      setPriority("");
      setDueDate("");
      fetchTasks();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (task) => {
    setNewTask(task.title);
    setPriority(task.priority);
    setDueDate(task.dueDate ? task.dueDate.slice(0, 16) : "");
    setEditingTaskId(task._id);
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setNewTask("");
    setPriority("");
    setDueDate("");
  };

  const handleDelete = async (id) => {
    await deleteTask(id);
    toast.success("Task deleted");
    fetchTasks();
  };

  const handleToggleStatus = async (task) => {
    const newStatus =
      task.status === "completed" ? "pending" : "completed";

    await updateTask(task._id, { status: newStatus });
    toast.success("Status updated");
    fetchTasks();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-600";
      case "medium":
        return "bg-yellow-100 text-yellow-600";
      case "low":
        return "bg-green-100 text-green-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // 🔥 Advanced Filtering
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const isOverdue =
      task.status === "pending" &&
      task.dueDate &&
      new Date(task.dueDate).getTime() < Date.now();

    if (statusFilter === "all") return matchesSearch;
    if (statusFilter === "pending")
      return matchesSearch && task.status === "pending";
    if (statusFilter === "completed")
      return matchesSearch && task.status === "completed";
    if (statusFilter === "overdue")
      return matchesSearch && isOverdue;

    return matchesSearch;
  });

  const completedCount = tasks.filter(
    (task) => task.status === "completed"
  ).length;

  const pendingCount = tasks.filter(
    (task) => task.status === "pending"
  ).length;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-md flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome, {user?.name}
          </h1>
          <p className="text-gray-600">{user?.email}</p>
          <p className="text-sm text-gray-500 mt-2">
            {completedCount} Completed • {pendingCount} Pending
          </p>
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
        <div className="flex gap-4 flex-wrap">
          <input
            type="text"
            placeholder="Enter task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-xl"
          />

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="px-4 py-2 border rounded-xl"
          >
            <option value="">Select Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <input
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="px-4 py-2 border rounded-xl"
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-black text-white px-4 py-2 rounded-xl disabled:opacity-50"
          >
            {loading
              ? "Processing..."
              : editingTaskId
                ? "Update"
                : "Add"}
          </button>

          {editingTaskId && (
            <button
              onClick={handleCancelEdit}
              className="bg-gray-400 text-white px-4 py-2 rounded-xl"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Search + Status Filter */}
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-xl"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-xl"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {/* Task List */}
      {pageLoading ? (
        <p>Loading...</p>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl shadow text-center text-gray-500">
          No tasks found 🚀
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const isOverdue =
              task.status === "pending" &&
              task.dueDate &&
              new Date(task.dueDate).getTime() < Date.now();

            return (
              <div
                key={task._id}
                className={`p-4 rounded-xl shadow flex justify-between items-center ${isOverdue
                  ? "bg-red-300 border border-red-600"
                  : "bg-white"
                  }`}
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`${task.status === "completed"
                        ? "line-through text-gray-400"
                        : ""
                        }`}
                    >
                      {task.title}
                    </span>

                    {task.priority && (
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {task.priority}
                      </span>
                    )}

                    {isOverdue && (
                      <span className="text-xs px-2 py-1 rounded-full bg-red-700 text-white">
                        Overdue
                      </span>
                    )}
                  </div>

                  {task.dueDate && (
                    <p
                      className={`text-xs mt-1 ${isOverdue
                        ? "text-red-900 font-semibold"
                        : "text-gray-500"
                        }`}
                    >
                      Due: {new Date(task.dueDate).toLocaleString()}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleStatus(task)}
                    className="bg-green-500 text-white px-3 py-1 rounded-lg"
                  >
                    {task.status === "completed"
                      ? "Mark Pending"
                      : "Complete"}
                  </button>

                  <button
                    onClick={() => handleEdit(task)}
                    className="bg-blue-500 text-white px-3 py-1 rounded-lg"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(task._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-lg"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;