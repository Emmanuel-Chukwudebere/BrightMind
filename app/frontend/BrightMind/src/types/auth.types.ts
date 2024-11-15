// src/types/auth.types.ts
export interface AuthFormData {
    firstName?: string;
    email: string;
    password: string;
    confirmPassword?: string;
  }
  
  export interface ProfileImageData {
    uri: string;
    type: string;
    name: string;
  }

// src/types/auth.types.ts
export interface User {
    id: string;
    name: string;
    email: string;
    profileImage?: string;
    // Add other fields as per your API response
  }
  