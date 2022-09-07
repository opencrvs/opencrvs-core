#!/bin/bash

echo 'Calling VSExport end-point in metrics...'
curl "http://localhost:1050/annualVSExport?startDate=2022-09-01&endDate=2022-09-02"