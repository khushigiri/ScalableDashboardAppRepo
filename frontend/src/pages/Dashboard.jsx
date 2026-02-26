import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FaTasks, FaCheckCircle, FaClock, FaExclamationTriangle, FaEdit, FaTrash } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../services/taskService";
import toast from "react-hot-toast";
import TaskSkeleton from "../components/TaskSkeleton";

const Dashboard = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [priority, setPriority] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [search, setSearch] = useState("");
  const [prioritySort, setPrioritySort] = useState("none");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);
  useEffect(() => {
    fetchProfile();
    fetchTasks();
  }, []);

  useEffect(() => {
    subscribeUser();
  }, []);

  function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  //Push Notifications
  const subscribeUser = async () => {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.register("/sw.js");

      const permission = await Notification.requestPermission();

      if (permission !== "granted") return;

      // 🔥 Check if already subscribed
      const existingSubscription =
        await registration.pushManager.getSubscription();

      if (existingSubscription) {
        console.log("Already subscribed");
        return;
      }

      const vapidPublicKey =
        "BI9DOF7w0laIpRdbp5y7Ic1fvvV-LHagWUW_4T96fyAIouXvPnpCE-evFYv7MLTuZXCb-vk4TpYOadDVmxjl0K4";

      const convertedKey = urlBase64ToUint8Array(vapidPublicKey);

      const newSubscription =
        await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedKey,
        });

      await api.post("/push/subscribe", newSubscription);

      console.log("Push subscription successful");
    }
  };

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
    try {
      setDeletingId(id);

      await deleteTask(id);
      toast.success("Task deleted");

      fetchTasks();
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (task) => {
    const newStatus =
      task.status === "completed" ? "pending" : "completed";

    try {
      setUpdatingId(task._id);

      await updateTask(task._id, { status: newStatus });

      setTasks(prev =>
        prev.map(t =>
          t._id === task._id
            ? { ...t, status: newStatus }
            : t
        )
      );

      toast.success("Status updated");
    } catch (error) {
      console.error(error);
      toast.error("Status update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400";
      case "medium":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400";
      case "low":
        return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  // 🔥 Advanced Filtering

  const priorityOrder = {
    high: 3,
    medium: 2,
    low: 1,
  };

  const filteredTasks = tasks
    .filter((task) => {
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
    })
    .sort((a, b) => {
      if (prioritySort === "highToLow") {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      if (prioritySort === "lowToHigh") {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return 0;
    });

  const completedCount = tasks.filter(
    (task) => task.status === "completed"
  ).length;

  const pendingCount = tasks.filter(
    (task) => task.status === "pending"
  ).length;

  const totalCount = tasks.length;

  const overdueCount = tasks.filter(
    (task) =>
      task.status === "pending" &&
      task.dueDate &&
      new Date(task.dueDate).getTime() < Date.now()
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 transition-colors duration-300">

      {/* Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-lg flex justify-between items-center mb-6 transition-all duration-300">

        {/* Left Section */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
            Welcome, {user?.name}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-200 mt-1">
            {user?.email}
          </p>
        </div>

        {/* Right Section */}

        <div className="flex gap-3 items-center">

          {/* Dark Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl 
             bg-gray-200 hover:bg-gray-300 text-gray-700
             dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white
             transition-all duration-200 shadow-sm hover:shadow-md"
          >
            {darkMode ? "☀ Light" : "🌙 Dark"}
          </button>
          {/* Logout Button */}
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Logout

          </button>


        </div>


      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

        {/* Total */}
        <div className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-800 dark:hover:bg-blue-700 
                  text-white p-5 rounded-2xl shadow-md hover:shadow-lg 
                  transition-all duration-200 flex items-center gap-4">
          <FaTasks className="text-2xl opacity-90" />
          <div>
            <p className="text-sm opacity-80">Total Tasks</p>
            <h2 className="text-2xl font-bold">{totalCount}</h2>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-green-500 hover:bg-green-600 dark:bg-green-800 dark:hover:bg-green-700 
                  text-white p-5 rounded-2xl shadow-md hover:shadow-lg 
                  transition-all duration-200 flex items-center gap-4">
          <FaCheckCircle className="text-2xl opacity-90" />
          <div>
            <p className="text-sm opacity-80">Completed</p>
            <h2 className="text-2xl font-bold">{completedCount}</h2>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-700 dark:hover:bg-yellow-600 
                  text-white p-5 rounded-2xl shadow-md hover:shadow-lg 
                  transition-all duration-200 flex items-center gap-4">
          <FaClock className="text-2xl opacity-90" />
          <div>
            <p className="text-sm opacity-80">Pending</p>
            <h2 className="text-2xl font-bold">{pendingCount}</h2>
          </div>
        </div>

        {/* Overdue */}
        <div className="bg-red-500 hover:bg-red-600 dark:bg-red-800 dark:hover:bg-red-700 
                  text-white p-5 rounded-2xl shadow-md hover:shadow-lg 
                  transition-all duration-200 flex items-center gap-4">
          <FaExclamationTriangle className="text-2xl opacity-90" />
          <div>
            <p className="text-sm opacity-80">Overdue</p>
            <h2 className="text-2xl font-bold">{overdueCount}</h2>
          </div>
        </div>

      </div>


      {/* Create Task */}
      <div className="bg-white dark:bg-gray-800/80 backdrop-blur-md p-6 rounded-2xl shadow-md mb-6">
        <div className="flex gap-4 flex-wrap">
          <input
            type="text"
            placeholder="Enter task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-xl bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
            className="bg-black text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}

            {editingTaskId ? "Update" : "Add"}
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
      {/* <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-xl bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
      </div> */}

      <div className="flex gap-4 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-xl bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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

        {/* 🔥 Priority Sort */}
        <select
          value={prioritySort}
          onChange={(e) => setPrioritySort(e.target.value)}
          className="px-4 py-2 border rounded-xl"
        >
          <option value="none">Sort by Priority</option>
          <option value="highToLow">High → Low</option>
          <option value="lowToHigh">Low → High</option>
        </select>
      </div>

      {/* Task List */}
      {pageLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, index) => (
            <TaskSkeleton key={index} />
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-10 rounded-2xl shadow text-center text-gray-500 dark:text-gray-400">
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
                className="
  p-4 rounded-2xl
  flex justify-between items-center
  border border-gray-200
  dark:bg-gray-800 dark:border-gray-700
  bg-white
  shadow-sm hover:shadow-md
  transition-all duration-200
"
              >
                <div>

                  <div className="flex items-start gap-3">

                    {/* Checkbox */}
                    <button
                      onClick={() => handleToggleStatus(task)}
                      disabled={updatingId === task._id}
                      className="mt-1"
                    >
                      {updatingId === task._id ? (
                        <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <div
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200
          ${task.status === "completed"
                              ? "bg-green-500 border-green-500"
                              : "border-gray-400 dark:border-gray-500"
                            }`}
                        >
                          {task.status === "completed" && (
                            <span className="text-white text-xs">✓</span>
                          )}
                        </div>
                      )}
                    </button>

                    {/* Task Info */}
                    <div>
                      {/* <div className="flex items-center gap-2">
                        <span
                          className={`text-lg font-semibold 
      ${task.status === "completed"
                              ? "line-through text-gray-400 dark:text-gray-500"
                              : "text-gray-800 dark:text-gray-100"
                            }`}
                        >
                          {task.title}
                        </span>

                        {isOverdue && (
                          <FaExclamationTriangle className="text-red-500 dark:text-red-400 text-sm" />

                        )}
                      </div> */}

                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-lg font-semibold 
      ${task.status === "completed"
                              ? "line-through text-gray-400 dark:text-gray-500"
                              : "text-gray-800 dark:text-gray-100"
                            }`}
                        >
                          {task.title}
                        </span>

                        {/* Priority Badge */}
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>


                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Added: {new Date(task.createdAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}

                      </p>
                      {/* {task.dueDate && (
                        <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                          Due: {new Date(task.dueDate).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </p>
                      )} */}

                      {task.dueDate && (
                        <p
                          className={`text-xs mt-1 ${isOverdue
                            ? "text-red-600 dark:text-red-400 font-medium"
                            : "text-gray-500 dark:text-gray-400"
                            }`}
                        >
                          Due:{" "}
                          {new Date(task.dueDate).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </p>
                      )}
                    </div>

                  </div>
                </div>


                <div className="flex items-center gap-4">

                  {/* Edit Icon */}
                  <button
                    onClick={() => handleEdit(task)}
                    className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition text-lg"
                  >
                    <FaEdit />
                  </button>

                  {/* Delete Icon */}
                  <button
                    onClick={() => {
                      setTaskToDelete(task._id);
                      setShowDeleteModal(true);
                    }}
                    disabled={deletingId === task._id}
                    className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition text-lg disabled:opacity-50"
                  >
                    {deletingId === task._id ? (
                      <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FaTrash />
                    )}
                  </button>

                </div>
              </div>

            );

          })},
          {showDeleteModal && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">

              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl w-[90%] max-w-md">

                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                  Confirm Deletion
                </h2>

                <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                  Are you sure you want to delete this task? This action cannot be undone.
                </p>

                <div className="flex justify-end gap-3">

                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setTaskToDelete(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={async () => {
                      await handleDelete(taskToDelete);
                      setShowDeleteModal(false);
                      setTaskToDelete(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white transition"
                  >
                    Delete
                  </button>

                </div>
              </div>

            </div>
          )}
        </div>
      )
      }
    </div >

  );
};

export default Dashboard;