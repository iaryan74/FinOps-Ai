"""
Export API Route — CSV data export.
"""

import csv
import io
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from services.cost_service import get_daily_costs

router = APIRouter(tags=["Export"])


@router.get("/export/csv")
def export_csv():
    """
    Export daily cost data as a downloadable CSV file.
    """
    cost_data = get_daily_costs()
    daily = cost_data["daily_costs"]

    output = io.StringIO()
    writer = csv.writer(output)

    # Header
    services = set()
    for day in daily:
        if day.get("services"):
            services.update(day["services"].keys())
    services = sorted(services)

    writer.writerow(["Date", "Total Cost"] + services)

    # Data rows
    for day in daily:
        row = [day["date"], day["amount"]]
        for service in services:
            row.append(day.get("services", {}).get(service, 0))
        writer.writerow(row)

    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=cloud_costs_report.csv"},
    )
