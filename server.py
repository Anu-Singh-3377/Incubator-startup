"""
==============================================================================
SERVER.PY - Lightweight Backend & SQLite Database for Incubation Center
==============================================================================
This script demonstrates how a real backend connects your Login page
to a Database using Python's BUILT-IN standard libraries (Zero installation!).

ARCHITECTURE:
  [HTML / JS Login Page]  <--HTTP/JSON-->  [Python Server]  <--SQL-->  [incubation.db]
  (Frontend in Browser)                    (server.py)                 (SQLite Database)
==============================================================================
"""

import http.server
import socketserver
import json
import sqlite3
import os
import sys

# Ensure UTF-8 output encoding on Windows terminals if possible
if sys.platform == "win32" and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

PORT = 5000
DB_FILE = "incubation.db"

# ----------------------------------------------------------------------------
# STEP 1: INITIALIZE THE SQLITE DATABASE
# ----------------------------------------------------------------------------
def init_database():
    """Creates the SQLite database file and 'learners' table if it doesn't exist."""
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    # Create the learners table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS learners (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'Student Innovator',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Insert a default demo learner so you can test logging in immediately
    cursor.execute("SELECT COUNT(*) FROM learners WHERE email = 'student@campus.edu'")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
            INSERT INTO learners (name, email, password, role)
            VALUES ('Demo Learner', 'student@campus.edu', 'incubate2026', 'Student Innovator')
        """)
        print("[DATABASE] Pre-populated default user: student@campus.edu / incubate2026")

    conn.commit()
    conn.close()
    print(f"[DATABASE] Connected to SQLite database: '{DB_FILE}'")


# ----------------------------------------------------------------------------
# STEP 2: HTTP REQUEST HANDLER (API & STATIC FILES)
# ----------------------------------------------------------------------------
class IncubationHandler(http.server.SimpleHTTPRequestHandler):

    def _set_headers(self, status=200, content_type="application/json"):
        """Sends HTTP response status and CORS headers so the browser can talk to it."""
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_OPTIONS(self):
        """Handles browser pre-flight checks for API requests."""
        self._set_headers(200)

    # ------------------------------------------------------------------------
    # GET REQUESTS (Static Webpages & Status Check)
    # ------------------------------------------------------------------------
    def do_GET(self):
        # 1. Health check: frontend uses this to see if the database server is running
        if self.path == "/api/health":
            self._set_headers(200)
            response = {
                "status": "connected",
                "database": "SQLite (incubation.db)",
                "port": PORT
            }
            self.wfile.write(json.dumps(response).encode("utf-8"))
            return

        # 2. View all learners currently stored in the database (Educational view)
        if self.path == "/api/learners":
            conn = sqlite3.connect(DB_FILE)
            cursor = conn.cursor()
            cursor.execute("SELECT id, name, email, role, created_at FROM learners")
            rows = cursor.fetchall()
            conn.close()

            learners = [
                {"id": r[0], "name": r[1], "email": r[2], "role": r[3], "created_at": r[4]}
                for r in rows
            ]
            self._set_headers(200)
            self.wfile.write(json.dumps({"learners": learners}).encode("utf-8"))
            return

        # Default: Serve frontend files (index.html, style.css, script.js)
        return super().do_GET()

    # ------------------------------------------------------------------------
    # POST REQUESTS (Login & Register)
    # ------------------------------------------------------------------------
    def do_POST(self):
        # Read the incoming JSON body sent by JavaScript's fetch()
        content_length = int(self.headers.get("Content-Length", 0))
        post_data = self.rfile.read(content_length)

        try:
            data = json.loads(post_data.decode("utf-8"))
        except Exception:
            self._set_headers(400)
            self.wfile.write(json.dumps({"success": False, "message": "Invalid JSON format"}).encode("utf-8"))
            return

        # API ROUTE: /api/login
        if self.path == "/api/login":
            email = data.get("email", "").strip().lower()
            password = data.get("password", "").strip()

            print(f"[LOGIN ATTEMPT] Received email: '{email}'")

            conn = sqlite3.connect(DB_FILE)
            cursor = conn.cursor()

            # Query the database to find matching user
            cursor.execute(
                "SELECT id, name, email, role FROM learners WHERE LOWER(email) = ? AND password = ?",
                (email, password)
            )
            user_record = cursor.fetchone()
            conn.close()

            if user_record:
                print(f"[SUCCESS] User '{user_record[1]}' authenticated successfully!")
                self._set_headers(200)
                response = {
                    "success": True,
                    "message": f"Welcome back, {user_record[1]}!",
                    "user": {
                        "id": user_record[0],
                        "name": user_record[1],
                        "email": user_record[2],
                        "role": user_record[3]
                    }
                }
            else:
                print(f"[FAILED] Invalid email or password for '{email}'")
                self._set_headers(401)
                response = {
                    "success": False,
                    "message": "Invalid email or password. Please try again or register."
                }

            self.wfile.write(json.dumps(response).encode("utf-8"))
            return

        # API ROUTE: /api/register
        if self.path == "/api/register":
            name = data.get("name", "").strip()
            email = data.get("email", "").strip().lower()
            password = data.get("password", "").strip()
            role = data.get("role", "Student Innovator")

            if not name or not email or not password:
                self._set_headers(400)
                self.wfile.write(json.dumps({"success": False, "message": "All fields are required"}).encode("utf-8"))
                return

            conn = sqlite3.connect(DB_FILE)
            cursor = conn.cursor()

            try:
                # Insert the new learner record into the database
                cursor.execute(
                    "INSERT INTO learners (name, email, password, role) VALUES (?, ?, ?, ?)",
                    (name, email, password, role)
                )
                conn.commit()
                print(f"[REGISTERED] New learner added to database: {name} ({email})")
                self._set_headers(201)
                response = {
                    "success": True,
                    "message": f"Account created for {name}! You can now sign in with your email and password."
                }
            except sqlite3.IntegrityError:
                print(f"[REGISTER ERROR] Email '{email}' already registered.")
                self._set_headers(409)
                response = {
                    "success": False,
                    "message": "An account with this email already exists. Please sign in instead."
                }
            finally:
                conn.close()

            self.wfile.write(json.dumps(response).encode("utf-8"))
            return

        # 404 for unknown API routes
        self._set_headers(404)
        self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode("utf-8"))


# ----------------------------------------------------------------------------
# STEP 3: RUN THE SERVER
# ----------------------------------------------------------------------------
def run():
    # Make sure we're serving files from the script's directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    init_database()

    with socketserver.TCPServer(("", PORT), IncubationHandler) as httpd:
        print("=" * 65)
        print(">> Incubation Center Web & Database Server is RUNNING!")
        print(f">> Open in your browser: http://localhost:{PORT}")
        print(f">> Database File:       {os.path.abspath(DB_FILE)}")
        print(">> Default Account:     student@campus.edu  |  incubate2026")
        print("=" * 65)
        print("Press Ctrl+C to stop the server anytime.\n")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n[STOPPED] Server stopped gracefully.")


if __name__ == "__main__":
    run()

