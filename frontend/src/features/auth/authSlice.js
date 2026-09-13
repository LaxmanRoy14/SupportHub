import { createSlice } from "@reduxjs/toolkit";

function getStoredAuth() {
  if (typeof localStorage === "undefined") {
    return { user: null, token: null };
  }
  try {
    const token = localStorage.getItem("accessToken");
    const userStr = localStorage.getItem("currentUser");
    const user = userStr ? JSON.parse(userStr) : null;
    return { user: token && user ? user : null, token: token || null };
  } catch (e) {
    return { user: null, token: null };
  }
}

const initialAuth = getStoredAuth();

const initialState = {
  currentUser: initialAuth.user,
  accessToken: initialAuth.token,
  isLoading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, action) {
      state.currentUser = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isLoading = false;

      if (typeof localStorage !== "undefined") {
        try {
          if (action.payload.accessToken) {
            localStorage.setItem("accessToken", action.payload.accessToken);
          } else {
            localStorage.removeItem("accessToken");
          }
          if (action.payload.user) {
            localStorage.setItem("currentUser", JSON.stringify(action.payload.user));
          } else {
            localStorage.removeItem("currentUser");
          }
        } catch (e) {
          // ignore storage errors
        }
      }
    },
    setAccessToken(state, action) {
      state.accessToken = action.payload;

      if (typeof localStorage !== "undefined") {
        try {
          if (action.payload) {
            localStorage.setItem("accessToken", action.payload);
          } else {
            localStorage.removeItem("accessToken");
          }
        } catch (e) {
          // ignore storage errors
        }
      }
    },
    setAuthLoading(state, action) {
      state.isLoading = action.payload;
    },
    logout(state) {
      state.currentUser = null;
      state.accessToken = null;
      state.isLoading = false;

      if (typeof localStorage !== "undefined") {
        try {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("currentUser");
        } catch (e) {
          // ignore storage errors
        }
      }
    },
  },
});

export const { logout, setAccessToken, setAuthLoading, setCredentials } = authSlice.actions;
export default authSlice.reducer;
