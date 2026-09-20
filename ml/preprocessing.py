import pandas as pd
import numpy as np

def load_and_preprocess(file_path):
    """Loads the mastitis dataset and performs basic preprocessing."""
    df = pd.read_excel(file_path, sheet_name="Mastitis_Data")
    
    # Convert dates
    df['Date'] = pd.to_datetime(df['Date'])
    
    # Sort chronologically by Animal_ID and Date to prevent temporal leakage
    df = df.sort_values(by=['Animal_ID', 'Date']).reset_index(drop=True)
    
    # Analyze distribution (for metadata/logging)
    distribution = {
        "unique_animals": int(df['Animal_ID'].nunique()),
        "total_observations": len(df),
        "obs_per_animal": df.groupby('Animal_ID').size().describe().to_dict(),
        "date_range": [str(df['Date'].min()), str(df['Date'].max())],
        "positive_events": int(df['Future_Mastitis_Event_7_14_Days'].sum()),
        "negative_events": int(len(df) - df['Future_Mastitis_Event_7_14_Days'].sum())
    }
    
    return df, distribution
