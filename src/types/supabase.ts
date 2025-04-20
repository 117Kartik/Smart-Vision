export interface Database {
  public: {
    Tables: {
      detection_logs: {
        Row: {
          id: string;
          user_id: string;
          timestamp: string;
          objects_detected: string[];
          distance_warnings: string[];
        };
        Insert: {
          id?: string;
          user_id: string;
          timestamp?: string;
          objects_detected: string[];
          distance_warnings: string[];
        };
        Update: {
          id?: string;
          user_id?: string;
          timestamp?: string;
          objects_detected?: string[];
          distance_warnings?: string[];
        };
      };
    };
  };
}