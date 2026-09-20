import pandas as pd
import uuid

def generate_seed_sql(excel_path, output_sql_path):
    print("Loading dataset...")
    df = pd.read_excel(excel_path, sheet_name="Mastitis_Data")
    
    # Clean / Sort
    df['Date'] = pd.to_datetime(df['Date'])
    df = df.sort_values(by=['Animal_ID', 'Date'])
    
    with open(output_sql_path, 'w') as f:
        f.write("-- MUNNOKKU Seed Data (Auto-Generated)\n\n")
        
        # 1. Farm
        farm_id = str(uuid.uuid4())
        f.write(f"INSERT INTO farms (id, name, location, total_animals) VALUES ('{farm_id}', 'Prototype Dairy Farm', 'India', 100);\n\n")
        
        # 2. Animals
        animal_ids = df['Animal_ID'].unique()
        animal_uuid_map = {}
        
        for idx, acode in enumerate(animal_ids):
            a_id = str(uuid.uuid4())
            animal_uuid_map[acode] = a_id
            
            # get static traits from first row of this animal
            a_df = df[df['Animal_ID'] == acode].iloc[0]
            
            age = int(a_df['Age_Years'])
            parity = int(a_df['Parity'])
            dim = int(a_df['Days_in_Milk'])
            prev_mastitis = int(a_df['Previous_Mastitis'])
            
            f.write(f"INSERT INTO animals (id, animal_code, farm_id, breed, age_years, parity, days_in_milk, previous_mastitis) "
                    f"VALUES ('{a_id}', '{acode}', '{farm_id}', 'Holstein Cross', {age}, {parity}, {dim}, {prev_mastitis});\n")
        
        f.write("\n")
        
        # 3. Sensor Readings
        print("Generating sensor readings...")
        for _, row in df.iterrows():
            a_id = animal_uuid_map[row['Animal_ID']]
            timestamp = row['Date'].strftime('%Y-%m-%d %H:%M:%S')
            
            my = row['Milk_Yield_L_Day']
            mec = row['Milk_EC_mS_cm']
            mtemp = row['Milk_Temperature_C']
            act = row['Activity_Index']
            rum = row['Rumination_Min_Day']
            btemp = row['Body_Temperature_C']
            hum = row['Humidity_Percent']
            atemp = row['Ambient_Temperature_C']
            
            f.write(f"INSERT INTO sensor_readings (animal_id, timestamp, milk_yield, milk_ec, milk_temperature, "
                    f"activity, rumination, body_temperature, humidity, ambient_temperature) "
                    f"VALUES ('{a_id}', '{timestamp}', {my}, {mec}, {mtemp}, {act}, {rum}, {btemp}, {hum}, {atemp});\n")
            
    print(f"Seed SQL successfully written to {output_sql_path}")

if __name__ == "__main__":
    generate_seed_sql("../dataset/Dataset Mastitis.xlsx", "seed.sql")
