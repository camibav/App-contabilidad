import { getDashboardElements } from "./src/ui/dashboard-ui.js";
import { initializeDashboardApp } from "./src/app/dashboard-app.js";
import { createDashboardState } from "./src/app/dashboard-state.js";

const elements = getDashboardElements();
const state = createDashboardState();

initializeDashboardApp({ elements, state });
