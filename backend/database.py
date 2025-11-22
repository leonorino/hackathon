import sqlite3
import json
from pathlib import Path
from datetime import datetime

DB_PATH = Path(__file__).parent / "experiments.db"

def init_db():
    """Initialize the database with the experiments table."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS experiments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            data TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

def save_experiment(data):
    """Save experiment data to the database.
    
    Args:
        data: The experiment data (dict or list) to save
    
    Returns:
        The ID of the inserted row
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    data_json = json.dumps(data)
    
    cursor.execute('''
        INSERT INTO experiments (data, created_at)
        VALUES (?, ?)
    ''', (data_json, datetime.now().isoformat()))
    
    conn.commit()
    experiment_id = cursor.lastrowid
    conn.close()
    
    return experiment_id

def get_experiment(experiment_id):
    """Retrieve an experiment by ID."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('SELECT data, created_at FROM experiments WHERE id = ?', (experiment_id,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return {
            "id": experiment_id,
            "data": json.loads(row[0]),
            "created_at": row[1]
        }
    return None

def get_all_experiments():
    """Retrieve all experiment IDs."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('SELECT id FROM experiments ORDER BY created_at DESC')
    rows = cursor.fetchall()
    conn.close()
    
    return [row[0] for row in rows]
