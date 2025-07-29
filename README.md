# 🗂 English-Malayalam Dictionary + Flashcard App

A simple and responsive open-source Django web app that provides English-to-Malayalam word lookup and builds spaced repetition-based flashcards from the same.

---

## 🚀 Features

- 🔍 Search for Malayalam meanings of English words
- 🧠 Flashcard view for memory retention (Active Recall)
- ✅ Open-source, beginner-friendly project

---

## 📦 Tech Stack

- Python 3.x
- Django 5.x
- HTML/CSS + Bootstrap 5
- Olam open dictionary dataset

---

## 📖 How to Run Locally

```bash
git clone https://github.com/YOUR-USERNAME/english-malayalam-dictionary.git
cd english-malayalam-dictionary/dictionary
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
