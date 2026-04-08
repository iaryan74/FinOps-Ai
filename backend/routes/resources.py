"""
Resources API Route — EC2 instance inventory and idle detection.
"""

from fastapi import APIRouter
from services.resource_service import get_idle_resources, get_all_resources

router = APIRouter(prefix="/resources", tags=["Resources"])


@router.get("/idle")
def idle_resources():
    """
    Get underutilized EC2 instances (CPU < 5%).
    Includes estimated monthly waste and suggested actions.
    """
    return get_idle_resources()


@router.get("/all")
def all_resources():
    """
    Get complete EC2 instance inventory.
    """
    return get_all_resources()
