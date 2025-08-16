# Uporabimo uradno Python 3.11 osnovno sliko
FROM python:3.11-slim

# Nastavimo delovno mapo
WORKDIR /app

# Kopiramo requirements (če jih imaš)
COPY requirements.txt .

# Namestimo odvisnosti
RUN pip install --no-cache-dir -r requirements.txt

# Kopiramo celotno aplikacijo
COPY . .

# Nastavimo port, ki ga bo aplikacija poslušala
EXPOSE 8001

# Ukaz za zagon FastAPI aplikacije
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
