# 1. Izberi osnovni image s Python 3.11
FROM python:3.11-slim

# 2. Nastavi delovno mapo
WORKDIR /app

# 3. Kopiraj datoteke requirements (če jih še nimaš, jih lahko ustvarimo)
COPY requirements.txt .

# 4. Namesti Python pakete
RUN pip install --no-cache-dir -r requirements.txt

# 5. Kopiraj celotno aplikacijo v image
COPY . .

# 6. Nastavi okoljske spremenljivke (če želiš, lahko tudi iz .env)
ENV PYTHONUNBUFFERED=1

# 7. Odpri port 8000
EXPOSE 8000

# 8. Zaženi aplikacijo z uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
