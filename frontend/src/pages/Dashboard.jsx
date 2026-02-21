import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const Dashboard = () => {
    const { token, logout } = useContext(AuthContext);

    const [user, setUser] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState("");
    const [search, setSearch] = useState("");

    // 🔹 Fetch Profile
    useEffect(() => {
        const fetchProfile = async () => {
            const res = await axios.get(
                "http://localhost:5000/api/auth/profile",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setUser(res.data);
        };

        fetchProfile();
    }, [token]);

    // 🔹 Fetch Tasks
    useEffect(() => {
        const fetchTasks = async () => {
            const res = await axios.get(
                "http://localhost:5000/api/tasks",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setTasks(res.data);
        };

        fetchTasks();
    }, [token]);

    // 🔹 Add Task
    const addTask = async () => {
        if (!newTask) return;

        const res = await axios.post(
            "http://localhost:5000/api/tasks",
            { title: newTask },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        setTasks([...tasks, res.data]);
        setNewTask("");
    };

    // 🔹 Delete Task
    const deleteTask = async (id) => {
        await axios.delete(
            `http://localhost:5000/api/tasks/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        setTasks(tasks.filter((task) => task._id !== id));
    };

    // 🔍 Search Filter
    const filteredTasks = tasks.filter((task) =>
        task.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <button
                    onClick={logout}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                >
                    Logout
                </button>
            </div>

            {/* Profile */}
            {user && (
                <div className="bg-white p-4 rounded shadow mb-6">
                    <h2 className="text-xl font-bold">{user.name}</h2>
                    <p className="text-gray-600">{user.email}</p>
                </div>
            )}

            {/* Add Task */}
            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    placeholder="New task..."
                    className="flex-1 p-2 border rounded"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                />
                <button
                    onClick={addTask}
                    className="bg-blue-500 text-white px-4 rounded"
                >
                    Add
                </button>
            </div>

            {/* Search */}
            <input
                type="text"
                placeholder="Search tasks..."
                className="w-full p-2 mb-4 border rounded"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            {/* Task List */}
            <div className="space-y-2">
                {filteredTasks.map((task) => (
                    <div
                        key={task._id}
                        className="flex justify-between bg-white p-3 rounded shadow"
                    >
                        <span>{task.title}</span>
                        <button
                            onClick={() => deleteTask(task._id)}
                            className="text-red-500"
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