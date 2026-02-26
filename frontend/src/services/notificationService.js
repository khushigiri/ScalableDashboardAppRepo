import api from "./api";

const getNotifications = async () => {
  const res = await api.get("/notifications");
  return res.data;
};

const markAsRead = async (id) => {
  const res = await api.put(`/notifications/${id}`);
  return res.data;
};

export default {
  getNotifications,
  markAsRead,
};