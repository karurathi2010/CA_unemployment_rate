from sqlalchemy import create_engine
import pandas as pd

engine=create_engine('postgresql://postgres:postgres@localhost:5432/employment_data')
conn=engine.connect()

CA_Counties = pd.read_csv('data/CA_Counties.csv')
CA_Counties.to_sql('CA_Counties', con=conn, if_exists='replace', index=False)
CA_data = pd.read_csv('data/CA_data.csv')
CA_data.to_sql('CA', con=conn, if_exists='replace', index=False)

# Import Other Data

# df=pd.read_csv('data/updated_employment_data.csv')
# df.to_sql('employment_data', con=conn, if_exists='replace', index=False)
# county_df = pd.read_csv('data/county_employment_data.csv')
# metro_df = pd.read_csv('data/metropolitan_area_data.csv')
# state_df = pd.read_csv('data/state_employment_data.csv')
# html_chart_df = pd.read_csv('data/html_chart.csv')
# employment_summary_df = pd.read_csv('data/employment_summary_df.csv')
# CA_Counties_df = pd.read_csv('data/CA_Counties')
# county_df.to_sql('county_data', con=conn, if_exists='replace', index=False)
# metro_df.to_sql('metropolitan_data', con=conn, if_exists='replace', index=False)
# state_df.to_sql('state_data', con=conn, if_exists='replace', index=False)
# html_chart_df.to_sql('bar_charts', con = conn, if_exists='replace',index=False)
# employment_summary_df.to_sql('employment_summary',con = conn, if_exists='replace',index = False)

conn.close()