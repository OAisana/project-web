# Recipe Book API

This is the backend API for the Recipe Book application built with Django REST Framework.

## Setup

0. python -m venv venv => CTRL + SHIFT + P => Python:select Interprener and choose python.exe in venv folder

1. Install dependencies:

   ```
   pip install -r requirements.txt
   ```

2. Run migrations:

   ```
   python manage.py makemigrations
   python manage.py makemigrations recipes
   python manage.py migrate
   ```

3. Create a superuser (optional):

   ```
   python manage.py createsuperuser
   ```

4. Start the development server:
   ```
   python manage.py runserver
   ```

## API Endpoints

### Authentication

- POST `/api/auth/register/` - Register a new user
- POST `/api/auth/login/` - Log in and get an authentication token

### Recipes

- GET `/api/recipes/` - List all recipes
- POST `/api/recipes/` - Create a new recipe
- GET `/api/recipes/<id>/` - Retrieve a specific recipe
- PUT `/api/recipes/<id>/` - Update a specific recipe
- DELETE `/api/recipes/<id>/` - Delete a specific recipe
