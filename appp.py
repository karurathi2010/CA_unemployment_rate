from flask import Flask, render_template, jsonify, request
from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import Session
import psycopg2

app = Flask(__name__)

# Create the SQLAlchemy engine
engine = create_engine('postgresql://postgres:postgres@localhost:5432/employment_data')

# Reflect existing database into new model
metadata = MetaData()
metadata.reflect(bind=engine)

# Save references to each table
CA_data_table = metadata.tables['CA'] 
CA_Counties_data_table = metadata.tables['CA_Counties']

# Create our session (link) from Python to the DB
session = Session(engine)

@app.route('/')
def project3():
    # Connect to the PostgreSQL database using psycopg2
    conn = psycopg2.connect(
        dbname='employment_data',
        user='postgres',
        password='postgres',
        host='localhost',
        port='5432'
    )
    cur = conn.cursor()

    # Query distinct industry titles and years
    cur.execute('SELECT DISTINCT "Industry Title" FROM "CA";')
    industries = [row[0] for row in cur.fetchall()]

    cur.execute('SELECT DISTINCT "Year" FROM "CA_Counties";')
    years = [row[0] for row in cur.fetchall()]

    # Close the cursor and connection
    cur.close()
    conn.close()

    return render_template('project3.html', industries=industries, years=years)

@app.route('/dropdown_data')
def get_dropdown_data():
    results = session.query(CA_Counties_data_table).all()
    session.close()

    areas = set()
    years = set()

    for row in results:
        areas.add(row[0])
        years.add(row.Year)

    return jsonify({
        'areas': sorted(list(areas)),
        'years': sorted(list(years))
    })

@app.route('/industry_data')
def get_data(): 
    # Query all rows from the CA_data_table
    results = session.query(CA_data_table).all()
    session.close()

    # Extract column names from the table
    column_names = CA_data_table.columns.keys()

    # Prepare data for California
    caldata = []
    for row in results:
        # Convert each row into a dictionary with column names as keys
        row_dict = {column: getattr(row, column) for column in column_names}
        caldata.append(row_dict)

    return jsonify(caldata)

# Add a new route for the CA counties only
@app.route('/county_data')
def get_county_data(): 
    year = request.args.get('year', type=int)
    area = request.args.get('area', type=str)

    # Query the filtered rows from the CA_Counties_data_table
    query = session.query(CA_Counties_data_table)
    if year:
        query = query.filter(CA_Counties_data_table.c.Year == year)
    if area:
        query = query.filter(CA_Counties_data_table.c["Area Name"] == area)

    results = query.all()
    session.close()

    # Extract column names from the table
    column_names = CA_Counties_data_table.columns.keys()

    # Prepare data for California
    county_data = []
    for row in results:
        # Convert each row into a dictionary with column names as keys
        row_dict = {column: getattr(row, column) for column in column_names}
        county_data.append(row_dict)

    return jsonify(county_data)

# Route to serve CA JSON data 
@app.route('/ca_data')
def ca_data():
    results = session.query(CA_data_table).all()
    session.close()

    # Convert results to a list of dictionaries
    ca_data = [{column: getattr(row, column) for column in CA_data_table.columns.keys()} for row in results]
    
    return jsonify(ca_data)

# Route to serve CA Counties JSON data 
@app.route('/ca_counties_data')
def ca_counties_data():
    results = session.query(CA_Counties_data_table).all()
    session.close()

    # Convert results to a list of dictionaries
    ca_counties_data = [{column: getattr(row, column) for column in CA_Counties_data_table.columns.keys()} for row in results]
    
    return jsonify(ca_counties_data)

if __name__ == '__main__':
    app.run(debug=True)
