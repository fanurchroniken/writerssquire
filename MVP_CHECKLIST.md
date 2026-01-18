# ✅ MVP Setup Checklist

Use this checklist to verify your MVP is fully set up and working.

## Pre-Setup

- [ ] Node.js 20.x installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Supabase account created
- [ ] Supabase project created

## Configuration

### Supabase Setup
- [ ] Project URL copied from Supabase Dashboard
- [ ] Anon/public API key copied
- [ ] PostgreSQL connection string copied (URI format)

### Environment Variables
- [ ] `backend/.env` file exists
- [ ] `DATABASE_URL` set in `backend/.env`
- [ ] `SUPABASE_URL` set in `backend/.env`
- [ ] `SUPABASE_API_KEY` set in `backend/.env`
- [ ] `frontend/.env` file exists
- [ ] `VITE_SUPABASE_URL` set in `frontend/.env`
- [ ] `VITE_SUPABASE_ANON_KEY` set in `frontend/.env`
- [ ] `VITE_API_URL` set in `frontend/.env`

## Installation

- [ ] Backend dependencies installed (`cd backend && npm install`)
- [ ] Frontend dependencies installed (`cd frontend && npm install`)
- [ ] Prisma Client generated (`cd backend && npx prisma generate`)
- [ ] Database migrations run (`cd backend && npx prisma migrate dev --name init`)

## Testing

### Backend
- [ ] Backend starts without errors (`cd backend && npm run dev`)
- [ ] Health check works: http://localhost:3001/api/health
- [ ] No TypeScript errors (`cd backend && npm run build`)
- [ ] Database connection successful (check console)

### Frontend
- [ ] Frontend starts without errors (`cd frontend && npm run dev`)
- [ ] Can access http://localhost:5173
- [ ] Login page loads
- [ ] Register page loads
- [ ] No console errors in browser

### Authentication
- [ ] Can register new account
- [ ] Registration redirects to home page
- [ ] Can sign in with created account
- [ ] Sign out works
- [ ] Protected routes redirect to login when not authenticated
- [ ] User appears in database (check Prisma Studio)

### Database
- [ ] Prisma Studio opens (`cd backend && npx prisma studio`)
- [ ] Can see `users` table
- [ ] Registered user appears in database
- [ ] User data is correct (email, username, etc.)

## MVP Features Working

- [x] ✅ Authentication system
- [x] ✅ User registration
- [x] ✅ User login
- [x] ✅ Session management
- [x] ✅ Protected routes
- [x] ✅ Database integration
- [x] ✅ User data sync

## Next Features to Build

- [ ] World creation (UC-001)
- [ ] Character creation (UC-003)
- [ ] Document creation (UC-101)
- [ ] Spell checking (UC-103)

## Troubleshooting

If any item is unchecked:

1. **Backend won't start**
   - Check `backend/.env` has all required variables
   - Verify `DATABASE_URL` is correct
   - Check console for specific errors

2. **Frontend won't start**
   - Check `frontend/.env` has all required variables
   - Verify Supabase keys match backend
   - Check browser console for errors

3. **Database errors**
   - Verify PostgreSQL connection string
   - Run migrations: `npx prisma migrate dev`
   - Check Prisma Studio to verify tables exist

4. **Authentication errors**
   - Verify Supabase keys are correct
   - Check both `.env` files have matching values
   - Verify Supabase project is active

## Success Criteria

✅ **MVP is working when:**
- Backend starts without errors
- Frontend starts without errors
- Can register a new user
- Can sign in
- User data appears in database
- Protected routes work correctly

---

**Once all items are checked, your MVP is ready!** 🎉
