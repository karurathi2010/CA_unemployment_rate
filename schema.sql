-- Exported from QuickDBD: https://www.quickdatabasediagrams.com/
-- NOTE! If you have used non-SQL datatypes in your design, you will have to change these here.


CREATE TABLE "CA" (
    "Area_Type" varchar(5)   NOT NULL,
    "Area_Name" varchar(10)   NOT NULL,
    "Year" int   NOT NULL,
    "Industry_Title" varchar(120)   NOT NULL,
    "Industry_Current_Employment" int   NOT NULL,
    "Regional_Labor_Force" int   NOT NULL,
    "Regional_Employment" int   NOT NULL,
    "Regional_Unemployment" int   NOT NULL,
    "Regional_Unemployment_Rate" float   NOT NULL
);

CREATE TABLE "CA_Counties" (
    "Area_Name" varchar(80)   NOT NULL,
    "Year" int   NOT NULL,
    "Month" varchar(10)   NOT NULL,
    "Regional_Unemployment_Rate" float   NOT NULL
);

