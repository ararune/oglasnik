# Oglasnik Project

Welcome to the Oglasnik project! This is a web application built with a **Django** backend (serving as an API) and a **React** frontend styled with **Tailwind CSS**. This README provides step-by-step instructions to set up and run the project locally.

## Prerequisites

Before you begin, ensure you have the following installed:
- **Python (check with `python --version` or `python3 --version`)
- **Node.js and npm** (check with `node -v` and `npm -v`; download from [nodejs.org](https://nodejs.org))
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
git clone https://github.com/ararune/oglasnik.git
cd oglasnik-main
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

Run:
```bash
python manage.py kategorije
python manage.py lokacije
```
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
- **API**: The project exposes API endpoints, test them at `http://127.0.0.1:8000/api/` (check `urls.py` for specific routes).






