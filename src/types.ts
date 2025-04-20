export interface UserSession {
  id: string;
  email: string;
}

export interface DetectionLog {
  id: string;
  user_id: string;
  timestamp: string;
  objects_detected: string[];
  distance_warnings: string[];
}