## Project Structure

```text
AcademicAppointment/
  backend/
    AcademicAppoinment/
    tests/
  frontend/
  .github/
  README.md
```

## Backend

Backend source code is in `backend/AcademicAppoinment/`.

Run tests:

```bash
dotnet test AcademicAppoinment.slnx
```

Run backend locally:

```bash
dotnet run --project backend/AcademicAppoinment/AcademicAppoinment.csproj
```

Publish backend:

```bash
dotnet publish backend/AcademicAppoinment/AcademicAppoinment.csproj -c Release -o ./publish
```

## Frontend

Frontend source code is in `frontend/`.

Run locally:

```bash
cd frontend
npm install
npm run dev
```

If backend uses a different API URL, create `frontend/.env`:

```bash
VITE_API_BASE_URL=http://localhost:xxxx
```

## Deployment

The GitHub Actions workflow deploys only the backend to MonsterASP. It publishes the backend project into `./publish` and uploads that folder to `/wwwroot/` via FTP.

Frontend deployment should use `frontend/` as the project/root directory, for example on Vercel.
