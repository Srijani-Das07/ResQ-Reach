# Database Configuration

This disaster management system has been migrated from Supabase to MongoDB.

## MongoDB Setup Instructions

1. **Install MongoDB**: Make sure MongoDB is installed on your system or use MongoDB Atlas for cloud deployment.

2. **Environment Variables**: Set up the following environment variables:
   ```bash
   MONGODB_URI=mongodb://localhost:27017/disaster-management
   MONGODB_DB_NAME=disaster-management
   MONGODB_SSL=false
   ```

3. **For MongoDB Atlas (Cloud)**:
   ```bash
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/disaster-management?retryWrites=true&w=majority
   MONGODB_SSL=true
   ```

4. **Database Schema**: The system will automatically create the required collections and indexes when first run.

## Collections Structure

- `users` - Citizen user accounts
- `rescueCenters` - Emergency shelter locations and information
- `guests` - People registered at rescue centers
- `governmentUsers` - Government official accounts
- `rescueCenterUsers` - Rescue center staff accounts
- `auditLogs` - System activity logs
- `notifications` - User notifications

## Migration from Supabase

The codebase has been updated to use MongoDB services with automatic fallback to localStorage for offline functionality. All Supabase dependencies have been removed.

## Development Mode

The system works in offline mode using localStorage when MongoDB is not available, making it perfect for development and testing.