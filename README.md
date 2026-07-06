1. Your Name
2. Email ID (with @ validation "Valid email ID verification)
3. Date

Ask user "MTA" OR "MTO" OR "MTA and MTO"

NOTE: Wherever there is Convert to million written (divide that number by a million)
-----------------------------------------------------------------------------------------------------------------------------------------

If User inputs "MTA" then show them the following form:

1. (Field1)Number of FG SKUs/WIP (NUMERIC, >=0)
2. (Field2)Number of RM SKUs (NUMERIC, >=0)
3. (Field3)Number of Plants/CWH/Depots (NUMERIC, >0)
4. (Field4)Total Number of SKUs = Field 1 + Field 2 (Calculated, no inputs allowed in this field)
5. (Field5)Total Number of SKU-Loc (Write in the subscript, calculated as #Total SKUs * #Plants) (Calculated, no inputs allowed in this field)
6. (Field6)Total records that will be processed daily (Write in the subscript, calculated as  #SKU-Loc * 90 because in BTR we preserve 90 days data)
7. (Field7)Number of Supplier/Vender count (Numeric, >0)
8. (Field8)Number of SKUs per vendor (Numeric, >0)
9. (Field9)Vendor data volume = Field 7 * Field 8 (Write in subscript the formula, Calculated, no inputs allowed in this field)
10.(Field10) Total Vendor data volume = Field9 * 90 (Write in subscript the formula, calculated, no inputs allowed in this field)

SomeVariable  = Field6(Convert to million) + Field10(convert to million)
Total Data VectorFLOW will process daily = SomeVariable



--------------------------------------------------------------------------------------------------------------------------------------------

If Only "MTO" then show them the following form:

1. (Field11)Total MTO Orders-Line Items per Day (Numeric, >0)
2. (Field12)Count of CCRs (Numeric, >0)
3. (Field13)Item-CCR Combo = Field11 * Field12 (Calculated, no inputs allowed)
4. (Field14)Trend Data for 90 days = Field13 * 90 (calculated, no inputs allowed)

If only "MTO" AND "BOM" is included under "MTO"

1. (Field15)Number of RM SKUs (Numeric, >0)
1. (Field16)Add only if need to consider (MTA BOR Orders (TOR+TOB+TOG) per Day RM Total BOR Line items) = Field15 * 3   (Calculated, no inputs allowed)
2. (Field17)Total MTO Orders-Line Items per Day = Field11 (Calculated, no inputs allowed)
3. (Field18)Total Explosion Line Items for BOM = Field 16 + Field 17 

--------------------Sub-form Title "Expected BOM Level" --------------------

1. (Field19)AVG number of items present in each BOM level (Numeric, >0)
2. (Field20)Levels Present in the BOM (Numeric, >0)
3. (Field21)Total Items in the BOM Levels = Field19 * Field20
4. (Field22)Line Items for the Total Orders = Field18 * Field21 (calculated, no inputs allowed)
5. (Field23)If Procurement Present : Fullkit for last 90 days = Field22 * 90

SomeVariable1 = Field14 (convert to million) + Field23 (convert to million)
-----------------------------------------------------------------------------------------------------------------------------------------
If "MTA and MTO"

Ask everything sequentially 

In the end calculate Somevariable2 =  Field6(Convert to million) + Field10(convert to million)+ Field14 (convert to million) + Field23 (convert to million)


