# Oglasnik Project

Welcome to the Oglasnik project! This is a web application built with a **Django** backend (serving as an API) and a **React** frontend styled with **Tailwind CSS**. This README provides step-by-step instructions to set up and run the project locally.

## Prerequisites

Before you begin, ensure you have the following installed:
- **Python 3.8+** (check with `python --version` or `python3 --version`)
- **Node.js 16+ and npm** (check with `node -v` and `npm -v`; download from [nodejs.org](https://nodejs.org))
- **Git** (to clone the repository)
- A code editor (e.g., VS Code)

## Project Structure
- `backend/`: Contains the Django backend (API, models, database scripts).
- `frontend/`: Contains the React frontend with Tailwind CSS.

## Setup and Installation

Follow these steps to get the project running locally.

### 1. Clone the Repository
Clone the project from GitHub to your local machine:
```bash
git clone https://github.com/<your-username>/oglasnik.git
cd oglasnik
```

### 2. Set Up the Django Backend
The backend is a Django application located in the `backend` directory.

#### a. Navigate to the Backend Directory
```bash
cd backend
```

#### b. Create and Activate a Virtual Environment
Create a Python virtual environment to isolate dependencies:
- On **Windows**:
  ```bash
  python -m venv venv
  .\venv\Scripts\activate
  ```
- On **macOS/Linux**:
  ```bash
  python3 -m venv venv
  source venv/bin/activate
  ```
You should see `(venv)` in your terminal prompt.

#### c. Install Backend Dependencies
Install the required Python packages listed in `requirements.txt`:
```bash
pip install -r requirements.txt
```
If you encounter a `ModuleNotFoundError` for `django-extensions` or other packages, install them manually (e.g., `pip install django-extensions`) and update `requirements.txt` with `pip freeze > requirements.txt`.

#### d. Apply Database Migrations
Set up the database by running migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

#### e. Create a Superuser
Create an admin account to access the Django admin interface:
```bash
python manage.py createsuperuser
```
Follow the prompts to set a username, email (optional), and password. This account will allow you to log in at `http://127.0.0.1:8000/admin/`.

#### f. Populate the Database
The project includes two scripts (`kategorije.py` and `lokacije.py`) to populate the database with initial data (categories and locations).

Assuming these are management commands (check if they’re in an app’s `management/commands/` directory), run:
```bash
python manage.py kategorije
python manage.py lokacije
```
If they’re standalone scripts, run:
```bash
python kategorije.py
python lokacije.py
```
If they’re fixtures (e.g., JSON files), use:
```bash
python manage.py loaddata kategorije
python manage.py loaddata lokacije
```
Check your project’s app structure or script content to confirm the correct method. If errors occur, ensure migrations are applied and dependencies are installed.

#### g. Start the Django Development Server
Launch the backend server:
```bash
python manage.py runserver
```
The server will run at `http://127.0.0.1:8000/`. Keep this terminal running.

### 3. Set Up the React Frontend
The frontend is a React application located in the `frontend` directory.

#### a. Open a New Terminal
Leave the Django server running and open a new terminal window.

#### b. Navigate to the Frontend Directory
```bash
cd frontend
```

#### c. Install Frontend Dependencies
Install the required Node.js packages (including React and Tailwind CSS dependencies):
```bash
npm install
```

#### d. Start the React Development Server
Launch the frontend server:
```bash
npm start
```
The React app will run at `http://localhost:3000/`. It should automatically open in your default browser. The frontend will communicate with the Django backend (e.g., via API calls to `http://127.0.0.1:8000/`).

### 4. Access the Application
- **Frontend**: Visit `http://localhost:3000/` to interact with the React app.
- **Django Admin**: Visit `http://127.0.0.1:8000/admin/` and log in with your superuser credentials to manage data (e.g., view categories and locations).
- **API**: If your project exposes API endpoints, test them at `http://127.0.0.1:8000/api/` (check your `urls.py` for specific routes).

## Troubleshooting
- **Backend Errors**:
  - If `ModuleNotFoundError` occurs, install missing packages (e.g., `pip install <package>`).
  - If migrations fail, check `settings.py` for correct `INSTALLED_APPS` and database configuration.
  - Ensure `django.contrib.admin` is in `INSTALLED_APPS` for admin access.
- **Frontend Errors**:
  - If `npm install` fails, delete `node_modules/` and `package-lock.json`, then retry.
  - If the frontend can’t connect to the backend, check for CORS setup (e.g., `django-cors-headers` in `settings.py`) or proxy settings in `frontend/package.json` (e.g., `"proxy": "http://127.0.0.1:8000"`).
- **Database Scripts**: If `kategorije.py` or `lokacije.py` fail, verify they’re in the correct directory and match your model structure. Share error messages for help.

## Additional Notes
- **Environment Variables**: If your project uses a `.env` file (e.g., for `SECRET_KEY` or database settings), create one in the `backend` directory and populate it as needed (check project documentation).
- **Production**: For deployment, build the React app (`npm run build` in `frontend`) and configure Django to serve the static files (see Django’s `collectstatic` command).

## Contributing
Feel free to fork this repository, submit issues, or create pull requests to improve the project!

## License
[Specify your license, e.g., MIT License]
