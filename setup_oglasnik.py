import os
import subprocess
import sys
import time
import platform
import getpass
import shutil

def run_command(command, error_message, shell=None):
    """Run a shell command and handle errors. Use shell=True on Windows for PATH executables."""
    if shell is None:
        shell = (platform.system() == "Windows")
    print(f"Running: {' '.join(command) if isinstance(command, list) else command}")
    try:
        result = subprocess.run(command, shell=shell, check=True, text=True, capture_output=True)
        if result.stdout:
            print(result.stdout.strip())
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error: {error_message}")
        if e.stderr:
            print(e.stderr.strip())
        return False
    except FileNotFoundError:
        print(f"Error: Command not found - {error_message}")
        return False

def check_prerequisites():
    """Check if Python, Node.js, npm, and Git are installed using shutil.which."""
    print("Checking prerequisites...")
    commands = [
        ("python", "Python is not installed. Please install Python 3.8+ from https://www.python.org"),
        ("node", "Node.js is not installed. Please install Node.js 16+ from https://nodejs.org"),
        ("npm", "npm is not installed (comes with Node.js). Please reinstall Node.js from https://nodejs.org"),
        ("git", "Git is not installed. Please install Git from https://git-scm.com"),
    ]
    for cmd, err_msg in commands:
        if shutil.which(cmd) is None:
            print(f"Error: {err_msg}")
            sys.exit(1)
        else:
            version_cmd = [cmd, "--version"] if cmd != "python" else ["python", "--version"]
            if not run_command(version_cmd, f"Failed to run {cmd} --version."):
                sys.exit(1)
    print("All prerequisites are installed!\n")

def setup_backend():
    """Set up the Django backend."""
    print("Setting up Django backend...")
    os.chdir("backend")

    # Create and activate virtual environment
    print("Creating virtual environment...")
    is_windows = platform.system() == "Windows"
    venv_path = "venv"
    if not os.path.exists(venv_path):
        venv_cmd = ["python", "-m", "venv", venv_path]
        if not run_command(venv_cmd, "Failed to create virtual environment."):
            sys.exit(1)
    
    # Install dependencies
    print("Installing backend dependencies...")
    pip_cmd = [os.path.join(venv_path, "Scripts" if is_windows else "bin", "pip"), "install", "-r", "requirements.txt"]
    if not run_command(pip_cmd, "Failed to install backend dependencies."):
        sys.exit(1)
    
    # Ensure django-extensions is installed
    print("Ensuring django-extensions is installed...")
    if not run_command([pip_cmd[0], "install", "django-extensions"], "Failed to install django-extensions."):
        print("Error: django-extensions is required. Please install it manually with 'pip install django-extensions' and retry.")
        sys.exit(1)

    # Run migrations
    print("Applying database migrations...")
    python_cmd = [os.path.join(venv_path, "Scripts" if is_windows else "bin", "python")]
    manage_cmd_base = python_cmd + ["manage.py"]
    if not run_command(manage_cmd_base + ["makemigrations"], "Failed to create migrations."):
        sys.exit(1)
    if not run_command(manage_cmd_base + ["migrate"], "Failed to apply migrations."):
        sys.exit(1)

    # Create superuser interactively
    print("Creating Django superuser...")
    print("Note: This step is interactive. You will be prompted to enter:")
    print("1. Username (e.g., 'admin')")
    print("2. Email (optional, press Enter to skip)")
    print("3. Password (twice, hidden input)")
    if not run_command(manage_cmd_base + ["createsuperuser"], "Failed to create superuser. Run manually with 'python manage.py createsuperuser'."):
        print("Warning: Superuser creation failed. You can run 'python manage.py createsuperuser' manually later.")
    else:
        print("Superuser created successfully!")

    # Populate database
    print("Populating database with kategorije and lokacije...")
    # Set UTF-8 encoding for lokacije to avoid UnicodeEncodeError
    os.environ["PYTHONIOENCODING"] = "utf-8"
    if not run_command(manage_cmd_base + ["kategorije"], "Failed to run kategorije script. Ensure it's a management command."):
        print("Warning: kategorije script failed. Check if it's in management/commands/ or run manually.")
    if not run_command(manage_cmd_base + ["lokacije"], "Failed to run lokacije script. Ensure it's a management command."):
        print("Warning: lokacije script failed. It may contain special characters causing encoding issues on Windows.")
        print("Try running manually in the backend directory: 'venv\\Scripts\\python manage.py lokacije'")
        print("Or set PYTHONIOENCODING=utf-8 before running: 'set PYTHONIOENCODING=utf-8'")

    # Start Django server in the background
    print("Starting Django development server...")
    django_cmd = python_cmd + ["manage.py", "runserver"]
    django_process = subprocess.Popen(django_cmd, shell=is_windows)
    time.sleep(5)
    if django_process.poll() is not None:
        print("Error: Failed to start Django server. Check for errors above.")
        sys.exit(1)
    print("Django server running at http://127.0.0.1:8000/ (admin at /admin/)\n")
    os.chdir("..")
    return django_process

def setup_frontend():
    """Set up the React frontend."""
    print("Setting up React frontend...")
    os.chdir("frontend")

    # Install dependencies
    print("Installing frontend dependencies...")
    if not run_command(["npm", "install"], "Failed to install frontend dependencies."):
        sys.exit(1)

    # Address npm vulnerabilities and browserslist
    print("Checking for npm vulnerabilities and outdated browserslist...")
    run_command(["npm", "audit", "fix"], "Failed to fix npm vulnerabilities (non-critical, continuing).")
    run_command(["npx", "update-browserslist-db@latest"], "Failed to update browserslist (non-critical, continuing).")

    # Start React server in foreground
    print("Starting React development server...")
    print("The app will open at http://localhost:3000/ once ready.")
    react_process = subprocess.Popen(["npm", "start"], shell=(platform.system() == "Windows"))
    react_process.wait()

def main():
    print("=== Oglasnik Project Setup ===\n")
    check_prerequisites()

    # Navigate to inner oglasnik-main directory if needed
    current_dir = os.getcwd()
    base_name = os.path.basename(current_dir)
    inner_dir = "oglasnik-main"
    if base_name == inner_dir and os.path.exists(os.path.join(current_dir, inner_dir)):
        os.chdir(inner_dir)
        print(f"Navigated into inner '{inner_dir}' directory.")
    elif not (os.path.exists("backend") and os.path.exists("frontend")):
        print("Error: Could not find 'backend' and 'frontend' directories. Ensure you're in the correct project root (oglasnik-main/oglasnik-main).")
        sys.exit(1)
    else:
        print("Already in the correct project directory.")

    django_process = setup_backend()
    setup_frontend()

    try:
        django_process.wait()
    except KeyboardInterrupt:
        print("\nShutting down servers...")
        django_process.terminate()

if __name__ == "__main__":
    main()