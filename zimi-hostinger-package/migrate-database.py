#!/usr/bin/env python3
"""
Script para migrar datos desde Emergent a Hostinger
Exporta datos existentes y los prepara para importación
"""

import os
import json
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime

async def export_data():
    # Conectar a la base de datos actual (Emergent)
    current_mongo_url = "mongodb://localhost:27017"  # Actualizar si es diferente
    client = AsyncIOMotorClient(current_mongo_url)
    db = client["test_database"]
    
    # Exportar colecciones
    collections_to_export = ["appointments", "patients", "messages", "flyers"]
    export_data = {}
    
    for collection_name in collections_to_export:
        collection = db[collection_name]
        documents = await collection.find().to_list(1000)
        export_data[collection_name] = documents
        print(f"Exported {len(documents)} documents from {collection_name}")
    
    # Guardar datos exportados
    with open("zimi_data_export.json", "w") as f:
        json.dump(export_data, f, indent=2, default=str)
    
    print("✅ Datos exportados a zimi_data_export.json")
    client.close()

if __name__ == "__main__":
    import asyncio
    asyncio.run(export_data())
