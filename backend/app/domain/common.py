from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
from typing import Annotated, Any
from pydantic import PlainSerializer, BeforeValidator


def parse_decimal(v: Any) -> Decimal:
    if isinstance(v, Decimal):
        return v
    if isinstance(v, (int, float, str)):
        return Decimal(str(v)).quantize(Decimal("0.0001"), rounding=ROUND_HALF_UP)
    raise ValueError(f"Cannot convert {v} to Decimal")


Money = Annotated[
    Decimal,
    BeforeValidator(parse_decimal),
    PlainSerializer(lambda x: str(x), return_type=str)
]


class Currency(str, Enum):
    USD = "USD"
    EUR = "EUR"
    GBP = "GBP"


class SourceType(str, Enum):
    FIXTURE = "FIXTURE"
    SIMULATED = "SIMULATED"
    VERIFIED_LIVE = "VERIFIED_LIVE"
