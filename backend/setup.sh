#!/bin/bash
# Первый запуск бэкенда Catflix
echo "=== Catflix Backend Setup ==="

cd "$(dirname "$0")"

# Устанавливаем зависимости (если нет venv)
if [ ! -d "venv" ]; then
  echo "Creating virtual environment..."
  python -m venv venv
fi

source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null

echo "Installing dependencies..."
pip install -r requirements.txt -q

echo "Running migrations..."
python manage.py migrate

echo "Loading initial movie data..."
python manage.py loaddata api/fixtures/initial_data.json

echo "Creating superuser (admin panel)..."
echo "You can skip this and do it later with: python manage.py createsuperuser"
python manage.py createsuperuser --noinput --username admin --email admin@catflix.com 2>/dev/null || true

echo ""
echo "=== Done! Starting server... ==="
python manage.py runserver
