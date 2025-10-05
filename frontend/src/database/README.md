# Database Configuration

This disaster management system has been migrated from Supabase to MongoDB.



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
