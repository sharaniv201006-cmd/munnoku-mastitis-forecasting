import pandas as pd
import numpy as np

def create_temporal_features(df):
    """
    Creates temporal features focusing on individual deviations from baseline.
    Uses ONLY PAST information to prevent temporal leakage.
    """
    features_df = df.copy()
    
    signals = {
        'EC': 'Milk_EC_mS_cm',
        'Yield': 'Milk_Yield_L_Day',
        'Rumination': 'Rumination_Min_Day',
        'Activity': 'Activity_Index',
        'Temperature': 'Body_Temperature_C',
        'Milk_Temp': 'Milk_Temperature_C'
    }
    
    for prefix, col in signals.items():
        # Ensure data is sorted
        group = features_df.groupby('Animal_ID')[col]
        
        # Current Value (which is technically "past" for the future forecast)
        features_df[f'{prefix}_current'] = features_df[col]
        
        # Rolling Means (shift(1) is NOT necessary if we predict FUTURE events. The target is 7-14 days in the future.
        # So "today's" data is perfectly valid to use to predict "next week's" mastitis.
        # But we use rolling windows including current day.)
        features_df[f'{prefix}_rolling_3d_mean'] = group.transform(lambda x: x.rolling(3, min_periods=1).mean())
        features_df[f'{prefix}_rolling_7d_mean'] = group.transform(lambda x: x.rolling(7, min_periods=1).mean())
        features_df[f'{prefix}_rolling_7d_std'] = group.transform(lambda x: x.rolling(7, min_periods=1).std().fillna(0))
        
        # Deviations
        features_df[f'{prefix}_deviation_7d'] = features_df[f'{prefix}_current'] - features_df[f'{prefix}_rolling_7d_mean']
        
        # Percentage Change (avoid division by zero)
        features_df[f'{prefix}_pct_change'] = np.where(
            features_df[f'{prefix}_rolling_7d_mean'] == 0, 0,
            features_df[f'{prefix}_deviation_7d'] / (features_df[f'{prefix}_rolling_7d_mean'] + 1e-9)
        )
        
        # Trend (Diff from yesterday)
        features_df[f'{prefix}_trend_1d'] = group.diff().fillna(0)

    # Multi-Signal Temporal Convergence Feature Group
    # Example logic: EC goes up, Yield goes down, Rumination goes down, Activity goes down, Temp goes up
    features_df['abnormal_EC'] = (features_df['EC_deviation_7d'] > features_df['EC_rolling_7d_std']).astype(int)
    features_df['abnormal_Yield'] = (features_df['Yield_deviation_7d'] < -features_df['Yield_rolling_7d_std']).astype(int)
    features_df['abnormal_Rumination'] = (features_df['Rumination_deviation_7d'] < -features_df['Rumination_rolling_7d_std']).astype(int)
    features_df['abnormal_Activity'] = (features_df['Activity_deviation_7d'] < -features_df['Activity_rolling_7d_std']).astype(int)
    features_df['abnormal_Temp'] = (features_df['Temperature_deviation_7d'] > features_df['Temperature_rolling_7d_std']).astype(int)

    features_df['number_of_abnormal_signals'] = (
        features_df['abnormal_EC'] + features_df['abnormal_Yield'] + 
        features_df['abnormal_Rumination'] + features_df['abnormal_Activity'] + 
        features_df['abnormal_Temp']
    )
    
    # Calculate a composite "convergence score"
    features_df['convergence_score'] = (
        features_df['EC_pct_change'] - 
        features_df['Yield_pct_change'] - 
        features_df['Rumination_pct_change'] - 
        features_df['Activity_pct_change'] + 
        features_df['Temperature_pct_change']
    )

    # Data Confidence
    features_df['history_length'] = features_df.groupby('Animal_ID').cumcount() + 1
    features_df['data_confidence'] = pd.cut(
        features_df['history_length'], 
        bins=[-np.inf, 3, 7, np.inf], 
        labels=["INSUFFICIENT", "LOW", "HIGH"]
    )
    
    return features_df
