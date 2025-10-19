# Oglasnik Project

[![Django](https://img.shields.io/badge/Django-5.0.6-blue.svg)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-18.x-green.svg)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC.svg)](https://tailwindcss.com/)

This is a full-stack web application for classified ads, built with a **Django** backend (RESTful API) and a **React** frontend styled with **Tailwind CSS**. It supports user authentication, categories, locations, images, and more.

<img src="/oglasnik-main/oglasnik-main/slika.png" alt="Oglasnik App Screenshot" width="250"/>

## Table of Contents

- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Manual Setup](#manual-setup)


## Prerequisites

Ensure you have the following installed:

| Tool              | Check Command                  | Download Link                             |
|-------------------|-------------------------------|--------------------------------------------|
| **Python**        | `python --version`            | [python.org](https://www.python.org)       |
| **Node.js & npm** | `node -v` & `npm -v`          | [nodejs.org](https://nodejs.org)           |
| **Git**           | `git --version`               | [git-scm.com](https://git-scm.com)         |

- A code editor (e.g., [VS Code](https://code.visualstudio.com/)) is recommended.

## Project Structure

The repository has a nested folder structure:

```
oglasnik-main/          # Outer folder from GitHub
└── oglasnik-main/      # Project root
    ├── backend/        # Django backend (API, models, scripts)
    ├── frontend/       # React frontend with Tailwind CSS
    ├── setup_oglasnik.py # Automation script
    └── README.md
```

## Installation

The `setup_oglasnik.py` script automates setup, including prerequisites, dependencies, migrations, superuser creation, database population, and server startup.

1. Clone the repository:
   ```bash
   git clone https://github.com/ararune/oglasnik.git
   cd oglasnik-main/oglasnik-main
   ```

2. Run the automation script:
   ```bash
   python setup_oglasnik.py
   ```
   - Checks for **Python**, **Node.js**, **npm**, and **Git**.
   - Sets up Django backend (virtual environment, `django-extensions`, migrations, superuser, data).
   - Starts Django server at `http://127.0.0.1:8000/`.
   - Sets up and starts React frontend at `http://localhost:3000/`.
   - **Superuser Prompts**: Enter username (e.g., `admin`), email (optional), password (twice, hidden).

3. Access the application:
   - **Frontend**: `http://localhost:3000/`
   - **Admin**: `http://127.0.0.1:8000/admin/` (use superuser credentials)
   - **API**: `http://127.0.0.1:8000/api/` (check `backend/urls.py`)

4. Stop servers:
   - Press `Ctrl+C` in the terminal.

If the script fails, see [Troubleshooting](#troubleshooting) or try [Manual Setup](#manual-setup).

## Manual Setup

For custom setup or debugging:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/ararune/oglasnik.git
   cd oglasnik-main/oglasnik-main
   ```

2. **Set Up Django Backend**:
   - Navigate to backend:
     ```bash
     cd backend
     ```
   - Create virtual environment:
     - Windows:
       ```bash
       python -m venv venv
       .\venv\Scripts\activate
       ```
     - macOS/Linux:
       ```bash
       python3 -m venv venv
       source venv/bin/activate
       ```
   - Install dependencies:
     ```bash
     pip install -r requirements.txt
     ```
     - If `django-extensions` is missing:
       ```bash
       pip install django-extensions
       pip freeze > requirements.txt
       ```
   - Apply migrations:
     ```bash
     python manage.py makemigrations
     python manage.py migrate
     ```
   - Create superuser:
     ```bash
     python manage.py createsuperuser
     ```
     Follow prompts: username → email (optional) → password (twice).
   - Populate database:
     ```bash
     python manage.py kategorije
     ```
     For `lokacije` on Windows:
     ```bash
     set PYTHONIOENCODING=utf-8
     python manage.py lokacije
     ```
     On macOS/Linux:
     ```bash
     python manage.py lokacije
     ```
   - Start Django server:
     ```bash
     python manage.py runserver
     ```

3. **Set Up React Frontend**:
   - Open a new terminal, navigate to frontend:
     ```bash
     cd frontend
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Start React server:
     ```bash
     npm start
     ```

4. **Access the Application**:
   | Component       | URL                          | Notes                              |
   |-----------------|------------------------------|------------------------------------|
   | **Frontend**   | `http://localhost:3000/`    | Main app interface                 |
   | **Admin**      | `http://127.0.0.1:8000/admin/` | Superuser login                    |
   | **API**        | `http://127.0.0.1:8000/api/` | REST endpoints (check `urls.py`)  |


