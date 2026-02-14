/**
 * Project Tracker Route Configuration
 * 
 * Add this route to your App.tsx Switch component:
 * 
 * import ProjectTrackerDashboard from "./components/admin/ProjectTrackerDashboard";
 * 
 * Then add inside the <Switch> component, after other admin routes:
 * <Route path="/admin/project-tracker" component={ProjectTrackerDashboard} />
 * 
 * Access URL: https://www.rusingacademy.ca/admin/project-tracker
 */

import { Route } from "wouter";
import ProjectTrackerDashboard from "../components/admin/ProjectTrackerDashboard";

export const ProjectTrackerRoute = () => (
    <Route path="/admin/project-tracker" component={ProjectTrackerDashboard} />
  );

export default ProjectTrackerRoute;
