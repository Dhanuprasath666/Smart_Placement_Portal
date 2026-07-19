import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

// Auth APIs
export const registerUser = async (userData) => {
  const response = await axios.post(`${API_URL}/auth/register`, userData);
  return response.data;
};
export const registerAdmin = async (userData) => {
  const response = await axios.post(`${API_URL}/auth/register-admin`, userData);
  return response.data;
};

export const registerSuperAdmin = async (userData) => {
  const response = await axios.post(`${API_URL}/auth/register-superadmin`, userData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await axios.post(`${API_URL}/auth/login`, credentials);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await axios.get(`${API_URL}/auth/me`);
  return response.data;
};

export const updateCurrentUser = async (formData) => {
  const response = await axios.put(`${API_URL}/auth/me`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Placement APIs
export const submitPlacement = async (formData) => {
  const response = await axios.post(`${API_URL}/placements/submit`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getAllPlacements = async () => {
  const response = await axios.get(`${API_URL}/placements`);
  return response.data;
};

export const getMyPlacements = async () => {
  const response = await axios.get(`${API_URL}/placements/my`);
  return response.data;
};

// Admin APIs
export const getPendingPlacements = async () => {
  const response = await axios.get(`${API_URL}/admin/placements/pending`);
  return response.data;
};

export const getAllPlacementsAdmin = async () => {
  const response = await axios.get(`${API_URL}/admin/placements`);
  return response.data;
};

export const approvePlacement = async (id) => {
  const response = await axios.put(`${API_URL}/admin/placements/${id}/approve`);
  return response.data;
};

export const rejectPlacement = async (id) => {
  const response = await axios.put(`${API_URL}/admin/placements/${id}/reject`);
  return response.data;
};

// Company Visit APIs
export const addCompanyVisit = async (visitData) => {
  const response = await axios.post(`${API_URL}/company-visits`, visitData);
  return response.data;
};

export const getAllCompanyVisits = async () => {
  const response = await axios.get(`${API_URL}/company-visits`);
  return response.data;
};

export const getEligibleNotifications = async () => {
  const response = await axios.get(`${API_URL}/company-visits/eligible-notifications`);
  return response.data;
};

export const dismissNotification = async (notificationId) => {
  const response = await axios.put(`${API_URL}/company-visits/eligible-notifications/${notificationId}/dismiss`);
  return response.data;
};

export const applyForCompanyVisit = async (id) => {
  const response = await axios.post(`${API_URL}/company-visits/${id}/apply-interest`);
  return response.data;
};

export const getCompanyApplications = async () => {
  const response = await axios.get(`${API_URL}/company-visits/applications`);
  return response.data;
};

export const updateCompanyVisit = async (id, visitData) => {
  const response = await axios.put(`${API_URL}/company-visits/${id}`, visitData);
  return response.data;
};

export const deleteCompanyVisit = async (id) => {
  const response = await axios.delete(`${API_URL}/company-visits/${id}`);
  return response.data;
};

export const archiveCompanyVisit = async (id) => {
  const response = await axios.put(`${API_URL}/company-visits/${id}/archive`);
  return response.data;
};
// Super Admin APIs
export const getAllUsers = async () => {
  const response = await axios.get(`${API_URL}/superadmin/users`);
  return response.data;
};

export const getUserStats = async () => {
  const response = await axios.get(`${API_URL}/superadmin/stats`);
  return response.data;
};

export const getUserDetails = async (userId) => {
  const response = await axios.get(`${API_URL}/superadmin/users/${userId}`);
  return response.data;
};

export const makeAdmin = async (userId) => {
  const response = await axios.put(`${API_URL}/superadmin/users/${userId}/make-admin`);
  return response.data;
};

export const removeAdmin = async (userId) => {
  const response = await axios.put(`${API_URL}/superadmin/users/${userId}/remove-admin`);
  return response.data;
};

export const blockUser = async (userId) => {
  const response = await axios.put(`${API_URL}/superadmin/users/${userId}/block`);
  return response.data;
};

export const unblockUser = async (userId) => {
  const response = await axios.put(`${API_URL}/superadmin/users/${userId}/unblock`);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await axios.delete(`${API_URL}/superadmin/users/${userId}`);
  return response.data;
};

// Mentor APIs (Verified Alumni Referral & Mentorship Network)
export const getAllMentors = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });
  const query = params.toString();
  const response = await axios.get(`${API_URL}/mentors${query ? `?${query}` : ''}`);
  return response.data;
};

export const getMentorById = async (id) => {
  const response = await axios.get(`${API_URL}/mentors/${id}`);
  return response.data;
};

export const updateMentorProfile = async (data) => {
  const response = await axios.put(`${API_URL}/mentors/profile`, data);
  return response.data;
};

export const sendMentorRequest = async (data) => {
  const response = await axios.post(`${API_URL}/mentors/request`, data);
  return response.data;
};

export const getReceivedRequests = async () => {
  const response = await axios.get(`${API_URL}/mentors/requests/received`);
  return response.data;
};

export const getSentRequests = async () => {
  const response = await axios.get(`${API_URL}/mentors/requests/sent`);
  return response.data;
};

export const updateRequestStatus = async (id, status) => {
  const response = await axios.put(`${API_URL}/mentors/requests/${id}`, { status });
  return response.data;
};

export const getMentorRequestById = async (id) => {
  const response = await axios.get(`${API_URL}/mentors/requests/${id}`);
  return response.data;
};

export const getMessages = async (id) => {
  const response = await axios.get(`${API_URL}/mentors/requests/${id}/messages`);
  return response.data;
};

export const sendChatMessage = async (id, text) => {
  const response = await axios.post(`${API_URL}/mentors/requests/${id}/messages`, { text });
  return response.data;
};
