# Oglasnik Project 🚀

[![Django](https://img.shields.io/badge/Django-5.0.6-blue.svg)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-18.x-green.svg)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Welcome to the **Oglasnik project**! This is a full-stack web application for classified ads, built with a **Django** backend (serving as a RESTful API) and a **React** frontend styled with **Tailwind CSS**. It supports features like user authentication, categories, locations, images, and more.

This README provides clear, step-by-step instructions to set up and run the project locally—either using an automated script or manually.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Quick Setup (Automated)](#quick-setup-automated)
- [Manual Setup](#manual-setup)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Set Up the Django Backend](#2-set-up-the-django-backend)
  - [3. Set Up the React Frontend](#3-set-up-the-react-frontend)
  - [4. Access the Application](#4-access-the-application)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Prerequisites

Before you begin, ensure you have the following installed:

| Tool              | Minimum Version | Check Command                  | Download Link (if needed)                  |
|-------------------|-----------------|-------------------------------|--------------------------------------------|
| **Python**        | 3.8+           | `python --version`            | [python.org](https://www.python.org)       |
| **Node.js & npm** | 16+            | `node -v` & `npm -v`          | [nodejs.org](https://nodejs.org)           |
| **Git**           | Latest         | `git --version`               | [git-scm.com](https://git-scm.com)         |

- A code editor (e.g., [VS Code](https://code.visualstudio.com/)) is recommended.

## Project Structure

The cloned repository creates a nested folder structure:

```
oglasnik-main/          # Outer folder from GitHub zip/clone
└── oglasnik-main/      # Inner project root (cd here for setup)
    ├── backend/        # Django backend (API, models, database scripts)
    ├── frontend/       # React frontend with Tailwind CSS
    ├── setup_oglasnik.py # Automation script
    └── README.md
```

## Quick Setup (Automated) 🛠️

The easiest way to set up and run the project is with the `setup_oglasnik.py` script, which automates all steps: prerequisite checks, virtual environment setup, dependency installation, database migrations, superuser creation, database population, and starting both servers.

### Steps

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/ararune/oglasnik.git
   cd oglasnik-main/oglasnik-main
   ```

2. **Run the Automation Script**:
   ```bash
   python setup_oglasnik.py
   ```
   - The script will:
     - Check for **Python**, **Node.js**, **npm**, and **Git**.
     - Set up the Django backend (virtual environment, dependencies like `django-extensions`, migrations, superuser, database population).
     - Start the Django server at `http://127.0.0.1:8000/`.
     - Set up and start the React frontend at `http://localhost:3000/`.
   - **Interactive Step**: When prompted for superuser credentials, enter:
     - Username (e.g., `admin`)
     - Email (optional: press Enter to skip)
     - Password (twice, hidden input)
   - The script provides feedback for each step and stops if critical errors occur (e.g., missing `django-extensions`).

3. **Access the Application**:
   - **Frontend**: Auto-opens at `http://localhost:3000/`.
   - **Django Admin**: Visit `http://127.0.0.1:8000/admin/` (use superuser credentials).
   - **API**: Test endpoints at `http://127.0.0.1:8000/api/` (see `backend/urls.py` for routes).

4. **Stop Servers**:
   - Press `Ctrl+C` in the terminal to stop both servers.

If issues arise, check [Troubleshooting](#troubleshooting) or try the [Manual Setup](#manual-setup).

## Manual Setup 🔧

For custom control or debugging, follow these steps.

### 1. Clone the Repository

```bash
git clone https://github.com/ararune/oglasnik.git
cd oglasnik-main/oglasnik-main
```

### 2. Set Up the Django Backend

#### a. Navigate to Backend
```bash
cd backend
```

#### b. Create & Activate Virtual Environment
- **Windows**:
  ```bash
  python -m venv venv
  .\venv\Scripts\activate
  ```
- **macOS/Linux**:
  ```bash
  python3 -m venv venv
  source venv/bin/activate
  ```
You’ll see `(venv)` in the terminal prompt.

#### c. Install Dependencies
```bash
pip install -r requirements.txt
```
- If you see `ModuleNotFoundError: No module named 'django_extensions'`:
  ```bash
  pip install django-extensions
  pip freeze > requirements.txt  # Update requirements
  ```

#### d. Apply Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

#### e. Create Superuser
```bash
python manage.py createsuperuser
```
Follow prompts: username → email (optional) → password (twice).

#### f. Populate Database
```bash
python manage.py kategorije
```
For `lokacije` on Windows, set UTF-8 encoding to avoid errors:
```bash
set PYTHONIOENCODING=utf-8
python manage.py lokacije
```
On macOS/Linux:
```bash
python manage.py lokacije
```

#### g. Start Django Server
```bash
python manage.py runserver
```
Server runs at `http://127.0.0.1:8000/`. Keep terminal open.

### 3. Set Up the React Frontend

#### a. New Terminal
Open a new terminal (keep Django server running).

#### b. Navigate to Frontend
```bash
cd frontend  # From project root (oglasnik-main/oglasnik-main)
```

#### c. Install Dependencies
```bash
npm install
```

#### d. Start React Server
```bash
npm start
```
Auto-opens at `http://localhost:3000/`.

### 4. Access the Application

| Component       | URL                          | Notes                              |
|-----------------|------------------------------|------------------------------------|
| **Frontend**   | `http://localhost:3000/`    | Main app interface                 |
| **Admin**      | `http://127.0.0.1:8000/admin/` | Manage data (superuser login)     |
| **API**        | `http://127.0.0.1:8000/api/` | REST endpoints (check `urls.py`)  |

## Troubleshooting 🐛

| Issue                          | Solution                                                                 |
|--------------------------------|--------------------------------------------------------------------------|
| **Prerequisites not found**    | Add to PATH; restart terminal. Reinstall Node.js/Git with "Add to PATH". |
| **django-extensions missing**  | `pip install django-extensions` in venv; add to `requirements.txt`.     |
| **Superuser prompts unclear**  | Interactive: Enter username → email → password (hidden, twice).          |
| **lokacije UnicodeEncodeError**| Windows: `set PYTHONIOENCODING=utf-8 && python manage.py lokacije`.      |
| **Migrations fail**            | Check `INSTALLED_APPS` in `backend/settings.py` for apps/`django_extensions`. |
| **npm vulnerabilities**        | `npm audit fix` (or `--force`); update browserslist: `npx update-browserslist-db@latest`. |
| **Frontend can't connect**     | Verify CORS in `settings.py`; proxy in `frontend/package.json`: `"proxy": "http://127.0.0.1:8000"`. |
| **npm install fails**          | Delete `node_modules/` & `package-lock.json`; retry.                     |

- **Database Scripts**: Ensure `kategorije` and `lokacije` are in `backend/oglasnik/management/commands/` and `oglasnik` is in `INSTALLED_APPS`.
- **Pip Upgrade**: If you see a pip upgrade notice, run:
  ```bash
  .\backend\venv\Scripts\python.exe -m pip install --upgrade pip
  ```

## Contributing 🤝

1. Fork the repo.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Commit changes (`git commit -m 'Add amazing feature'`).
4. Push to branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

## License 📄

This project is licensed under the [MIT License](LICENSE).
