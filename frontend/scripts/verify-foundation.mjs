import assert from "node:assert/strict";

import { apiClient } from "../src/api/client.js";
import { store } from "../src/app/store.js";
import { logout, setCredentials } from "../src/features/auth/authSlice.js";
import { hasRequiredRole, roleHomePath } from "../src/routing/access.js";

const customer = { id: 1, role: "CUSTOMER" };
const agent = { id: 2, role: "AGENT" };

assert.equal(hasRequiredRole(customer, ["CUSTOMER"]), true);
assert.equal(hasRequiredRole(customer, ["AGENT"]), false);
assert.equal(hasRequiredRole(agent, ["AGENT"]), true);
assert.equal(roleHomePath(customer), "/customer");
assert.equal(roleHomePath(agent), "/agent");

store.dispatch(setCredentials({ user: customer, accessToken: "test-token" }));
assert.equal(store.getState().auth.accessToken, "test-token");
assert.equal(store.getState().auth.currentUser.role, "CUSTOMER");

const requestInterceptor = apiClient.interceptors.request.handlers[0].fulfilled;
const requestConfig = requestInterceptor({ headers: {} });
assert.equal(requestConfig.headers.Authorization, "Bearer test-token");

store.dispatch(logout());
assert.equal(store.getState().auth.accessToken, null);
assert.equal(store.getState().auth.currentUser, null);

console.log("Frontend foundation verification passed.");
