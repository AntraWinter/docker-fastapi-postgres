from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
import psycopg2
from psycopg2.extras import RealDictCursor
import base64

app = FastAPI()
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Модель для строки таблицы
class TableRow(BaseModel):
    location: str
    defect_description: str
    defect_category: str
    elimination_method: str
    photo: Optional[str] = None  # Используем строку для Base64
    tag_link: Optional[str] = None

# Подключение к БД
def get_db_connection():
    conn = psycopg2.connect(
        host="127.0.0.1",
        port="5432",
        database="database",
        user="postgres",
        password="postgres"
    )
    return conn

@app.get("/", response_class=FileResponse)
def root():
    return FileResponse("app/templates/index.html")

@app.post("/save-table-data/")
async def save_table_data(rows: List[TableRow]):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        for row in rows:
            # Преобразование Base64 в байты
            
            photo_bytes = base64.b64decode(row.photo) if row.photo else None

            cursor.execute(
                """
                INSERT INTO defects (
                    location,
                    defect_description,
                    defect_category,
                    elimination_method,
                    photo,
                    tag_link
                ) VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (
                    row.location,
                    row.defect_description,
                    row.defect_category,
                    row.elimination_method,
                    photo_bytes,
                    row.tag_link
                )
            )
        conn.commit()
        return {"message": "Данные сохранены"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if conn:
            conn.close()

@app.get("/defects/", response_class=FileResponse)
def html_defects():
    return FileResponse("app/templates/display-table.html")

@app.get("/defects-table/", response_model=List[TableRow])
def get_all_defects():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)

        cursor.execute("SELECT * FROM defects")
        defects = cursor.fetchall()

        # Преобразование байтов изображения в Base64
        for defect in defects:
            if defect['photo']:
                defect['photo'] = base64.b64encode(defect['photo']).decode('utf-8')

        return defects

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if conn:
            conn.close()
