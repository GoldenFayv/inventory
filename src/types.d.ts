// Declaring it globally means it is automatically available in all files
declare global {
  type Id = string | number;
}

// This empty export turns the file into a module, which is required 
// if your tsconfig has strict module isolation settings
export {};
