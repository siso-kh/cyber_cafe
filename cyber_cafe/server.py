from firebase_admin import credentials,db
import firebase_admin
import random
import time
import os

try:
  cred = credentials.Certificate("cyber-cafe-dc8d1-firebase-adminsdk-fbsvc-569d78fd07.json")
  database_url = "https://cyber-cafe-dc8d1-default-rtdb.europe-west1.firebasedatabase.app/"
  firebase_admin.initialize_app(cred, {'databaseURL': database_url})
  print("✅ Firebase app initialized successfully.")
except FileNotFoundError:
    print(f"❌ Error: Service account key not found . Check the path.")
except Exception as e:
    print(f"❌ An unexpected error occurred during initialization: {e}")
ref = db.reference()

def simulate_pc():
    pc_id = random.randint(1, 9)
    temp = random.uniform(45, 80)
    internet_speed = random.uniform(10, 170)
    usage_time = random.uniform(10, 120)
    cost = round(usage_time * 0.1, 2)
    activities = ["anime", "film", "web", "gaming"]
    activity = random.choice(activities)
    timestamp = time.time()
    timestamp_str = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(timestamp))
    return {
        "pc_id": f"{pc_id}",
        "temp": round(temp, 2),
        "internet": round(internet_speed, 2),
        "usage": round(usage_time, 2),
        "cost": cost,
        "activity": activity,
        "timestamp": timestamp_str
    }


while True:

        data = simulate_pc()
        ref.push(data)
        print(f"✅ Envoyé vers Firebase : {data}")
        time.sleep(10)